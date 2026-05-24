import { Pool, PoolClient } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect()
}

export { pool }
