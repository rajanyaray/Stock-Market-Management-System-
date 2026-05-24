import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { stockId, quantity, pricePerShare } = await request.json()

    // Validation
    if (!stockId || !quantity || !pricePerShare) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (quantity <= 0 || pricePerShare <= 0) {
      return NextResponse.json(
        { error: 'Invalid quantity or price' },
        { status: 400 }
      )
    }

    const userId = parseInt(user.userId)
    const totalAmount = quantity * pricePerShare

    // Get current balance
    const balanceResult = await query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    )

    if (balanceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentBalance = balanceResult.rows[0].balance

    if (currentBalance < totalAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Get existing portfolio entry
    const portfolioResult = await query(
      'SELECT quantity FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    )

    let newQuantity = quantity

    if (portfolioResult.rows.length > 0) {
      // Update existing portfolio entry
      newQuantity = portfolioResult.rows[0].quantity + quantity
      await query(
        'UPDATE portfolio SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND stock_id = $3',
        [newQuantity, userId, stockId]
      )
    } else {
      // Create new portfolio entry
      await query(
        'INSERT INTO portfolio (user_id, stock_id, quantity) VALUES ($1, $2, $3)',
        [userId, stockId, quantity]
      )
    }

    // Create transaction record
    await query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price) VALUES ($1, $2, $3, $4, $5)',
      [userId, stockId, 'BUY', quantity, pricePerShare]
    )

    // Update balance
    const newBalance = currentBalance - totalAmount
    await query(
      'UPDATE users SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newBalance, userId]
    )

    return NextResponse.json({
      success: true,
      message: `Bought ${quantity} shares at ₹${pricePerShare}`,
      newBalance,
    })
  } catch (error) {
    console.error('Buy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
