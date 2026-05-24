import { query } from '@/lib/db'
import { hashPassword, createJWT, setAuthCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await query(
      'INSERT INTO users (email, password, name, balance) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, name || 'User', 100000]
    )

    const userId = result.rows[0].id

    // Create JWT token
    const token = await createJWT(userId.toString())

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json(
      { message: 'User registered successfully', userId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
