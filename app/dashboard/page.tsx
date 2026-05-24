'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useBalance } from '@/hooks/useBalance'
import { useStocks } from '@/hooks/useStocks'
import PortfolioCard from '@/components/PortfolioCard'
import StockBrowser from '@/components/StockBrowser'
import Navbar from '@/components/Navbar'

interface PortfolioItem {
  id: string
  user_id: string
  stock_id: string
  quantity: number
  symbol: string
  name: string
  current_price: number
  total_value: number
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { balance, mutate: mutateBalance } = useBalance()
  const { stocks } = useStocks()
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'stocks' | 'transactions'>('overview')

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
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user) return

    const fetchPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio')
        if (res.ok) {
          const data = await res.json()
          setPortfolio(data)
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
      }
    }

    fetchPortfolio()
  }, [user])

  const portfolioValue = portfolio.reduce(
    (total, item) => total + (item.total_value || item.quantity * item.current_price),
    0
  )

  const totalValue = balance + portfolioValue

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
        {/* Header Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Cash Balance</p>
            <p className="text-2xl font-bold text-foreground">₹{balance.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            <p className="text-2xl font-bold text-foreground">₹{portfolioValue.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-primary">₹{totalValue.toFixed(2)}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'stocks'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Browse Stocks
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'transactions'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Your Portfolio</h2>
            {portfolio.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No stocks in your portfolio yet.</p>
                <Button onClick={() => setActiveTab('stocks')} className="mt-4">
                  Browse Stocks
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((item) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    onSell={() => {
                      mutateBalance()
                      setPortfolio(portfolio.filter((p) => p.id !== item.id))
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stocks' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Available Stocks</h2>
            <StockBrowser
              balance={balance}
              onBuy={() => {
                mutateBalance()
              }}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Transaction History</h2>
            <Link href="/transactions">
              <Button>View Full History</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
            <p className="text-2xl font-bold text-foreground">₹{portfolioValue.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-primary">₹{totalValue.toFixed(2)}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'stocks'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Browse Stocks
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'transactions'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Your Portfolio</h2>
            {portfolio.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No stocks in your portfolio yet.</p>
                <Button onClick={() => setActiveTab('stocks')} className="mt-4">
                  Browse Stocks
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((item) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    onSell={() => {
                      mutateBalance()
                      setPortfolio(portfolio.filter((p) => p.id !== item.id))
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stocks' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Available Stocks</h2>
            <StockBrowser
              balance={balance}
              onBuy={() => {
                mutateBalance()
              }}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Transaction History</h2>
            <Link href="/transactions">
              <Button>View Full History</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
