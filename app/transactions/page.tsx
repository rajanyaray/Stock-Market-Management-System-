'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Navbar from '@/components/Navbar'

interface Transaction {
  id: string
  user_id: string
  stock_id: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  created_at: string
  symbol: string
  name: string
  current_price: number
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/auth/login')
        } else {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user) return

    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions')
        if (res.ok) {
          const data = await res.json()
          setTransactions(data)
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={user?.email} showLinks={true} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Transaction History</h2>

        {transactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No transactions yet.</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Browse Stocks</Button>
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Quantity</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const date = new Date(transaction.created_at)
                  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const isBuy = transaction.type === 'BUY'
                  const totalAmount = transaction.quantity * transaction.price

                  return (
                    <tr key={transaction.id} className="border-b border-border hover:bg-secondary">
                      <td className="px-4 py-3 text-foreground">{formattedDate}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{transaction.symbol}</p>
                          <p className="text-xs text-muted-foreground">{transaction.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          isBuy ? 'bg-blue-500 bg-opacity-10 text-blue-700' : 'bg-green-500 bg-opacity-10 text-green-700'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {transaction.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        ₹{transaction.price.toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        isBuy ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isBuy ? '-' : '+'}₹{totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
              <tbody>
                {transactions.map((transaction) => {
                  const date = new Date(transaction.created_at)
                  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const isBuy = transaction.type === 'BUY'

                  return (
                    <tr key={transaction.id} className="border-b border-border hover:bg-secondary">
                      <td className="px-4 py-3 text-foreground">{formattedDate}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{transaction.stocks.symbol}</p>
                          <p className="text-xs text-muted-foreground">{transaction.stocks.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          isBuy ? 'bg-blue-500 bg-opacity-10 text-blue-700' : 'bg-green-500 bg-opacity-10 text-green-700'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {transaction.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        ₹{transaction.price_per_share.toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        isBuy ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {isBuy ? '-' : '+'}₹{transaction.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
