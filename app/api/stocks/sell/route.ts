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

    // Get portfolio entry
    const portfolioResult = await query(
      'SELECT quantity FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    )

    if (portfolioResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Stock not found in portfolio' },
        { status: 400 }
      )
    }

    const currentQuantity = portfolioResult.rows[0].quantity

    if (currentQuantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient shares to sell' },
        { status: 400 }
      )
    }

    const newQuantity = currentQuantity - quantity

    // Update or delete portfolio entry
    if (newQuantity === 0) {
      await query(
        'DELETE FROM portfolio WHERE user_id = $1 AND stock_id = $2',
        [userId, stockId]
      )
    } else {
      await query(
        'UPDATE portfolio SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND stock_id = $3',
        [newQuantity, userId, stockId]
      )
    }

    // Create transaction record
    await query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price) VALUES ($1, $2, $3, $4, $5)',
      [userId, stockId, 'SELL', quantity, pricePerShare]
    )

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

    // Update balance
    const newBalance = balanceResult.rows[0].balance + totalAmount
    await query(
      'UPDATE users SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newBalance, userId]
    )

    return NextResponse.json({
      success: true,
      message: `Sold ${quantity} shares at ₹${pricePerShare}`,
      newBalance,
    })
  } catch (error) {
    console.error('Sell error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
