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
        p.id,
        p.user_id,
        p.stock_id,
        p.quantity,
        s.symbol,
        s.name,
        s.current_price::float AS current_price,
        (p.quantity * s.current_price)::float as total_value,
        p.created_at
      FROM portfolio p
      JOIN stocks s ON p.stock_id = s.id
      WHERE p.user_id = $1 AND p.quantity > 0
      ORDER BY s.name`,
      [parseInt(user.userId)]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Portfolio error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}
