import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await query(
      `SELECT 
        t.id,
        t.user_id,
        t.stock_id,
        t.type,
        t.quantity,
        t.price,
        t.created_at,
        s.symbol,
        s.name,
        s.current_price
      FROM transactions t
      JOIN stocks s ON t.stock_id = s.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC`,
      [parseInt(user.userId)]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
