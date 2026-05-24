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

    // Get portfolio entry
    const portfolioResult = await query(
      'SELECT quantity FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, parsedStockId]
    )

    if (portfolioResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Stock not found in portfolio' },
        { status: 400 }
      )
    }

    const currentQuantity = portfolioResult.rows[0].quantity

    if (currentQuantity < parsedQuantity) {
      return NextResponse.json(
        { error: 'Insufficient shares to sell' },
        { status: 400 }
      )
    }

    const newQuantity = currentQuantity - parsedQuantity

    // Update or delete portfolio entry
    if (newQuantity === 0) {
      await query(
        'DELETE FROM portfolio WHERE user_id = $1 AND stock_id = $2',
        [userId, parsedStockId]
      )
    } else {
      await query(
        'UPDATE portfolio SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND stock_id = $3',
        [newQuantity, userId, parsedStockId]
      )
    }

    // Create transaction record
    await query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price) VALUES ($1, $2, $3, $4, $5)',
      [userId, parsedStockId, 'SELL', parsedQuantity, currentPrice]
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
    const currentBalance = Number.parseFloat(String(balanceResult.rows[0].balance))
    const newBalance = currentBalance + totalAmount
    await query(
      'UPDATE users SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newBalance, userId]
    )

    return NextResponse.json({
      success: true,
      message: `Sold ${parsedQuantity} shares at ₹${currentPrice}`,
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
