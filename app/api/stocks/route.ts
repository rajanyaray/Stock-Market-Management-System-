import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await query(
      'SELECT id, symbol, name, current_price, created_at FROM stocks ORDER BY name ASC'
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Stocks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    )
  }
}
