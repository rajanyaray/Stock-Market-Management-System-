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
    const parsedStockId = Number.parseInt(String(stockId), 10)
    const parsedQuantity = Number.parseInt(String(quantity), 10)
    const parsedPricePerShare = Number.parseFloat(String(pricePerShare))

    // Validation
    if (!parsedStockId || !parsedQuantity || !parsedPricePerShare) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Number.isInteger(parsedStockId) || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0 || parsedPricePerShare <= 0 || !Number.isFinite(parsedPricePerShare)) {
      return NextResponse.json(
        { error: 'Invalid quantity or price' },
        { status: 400 }
      )
    }

    const userId = parseInt(user.userId)
    const stockResult = await query(
      'SELECT current_price::float AS current_price FROM stocks WHERE id = $1',
      [parsedStockId]
    )

    if (stockResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      )
    }

    const currentPrice = Number.parseFloat(String(stockResult.rows[0].current_price))
    const totalAmount = parsedQuantity * currentPrice

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

    const currentBalance = Number.parseFloat(String(balanceResult.rows[0].balance))

    if (currentBalance < totalAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Get existing portfolio entry
    const portfolioResult = await query(
      'SELECT quantity FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, parsedStockId]
    )

    let newQuantity = parsedQuantity

    if (portfolioResult.rows.length > 0) {
      // Update existing portfolio entry
      newQuantity = portfolioResult.rows[0].quantity + parsedQuantity
      await query(
        'UPDATE portfolio SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND stock_id = $3',
        [newQuantity, userId, parsedStockId]
      )
    } else {
      // Create new portfolio entry
      await query(
        'INSERT INTO portfolio (user_id, stock_id, quantity) VALUES ($1, $2, $3)',
        [userId, parsedStockId, parsedQuantity]
      )
    }

    // Create transaction record
    await query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price) VALUES ($1, $2, $3, $4, $5)',
      [userId, parsedStockId, 'BUY', parsedQuantity, currentPrice]
    )

    // Update balance
    const newBalance = currentBalance - totalAmount
    await query(
      'UPDATE users SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newBalance, userId]
    )

    return NextResponse.json({
      success: true,
      message: `Bought ${parsedQuantity} shares at ₹${currentPrice}`,
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
