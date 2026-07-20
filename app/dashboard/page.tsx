'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useBalance } from '@/hooks/useBalance'
import { useStocks } from '@/hooks/useStocks'
import { usePortfolio } from '@/hooks/usePortfolio'
import PortfolioCard from '@/components/PortfolioCard'
import StockBrowser from '@/components/StockBrowser'
import Navbar from '@/components/Navbar'
import RadarLoader from '@/components/RadarLoader'

export default function DashboardPage() {
  const router = useRouter()
  const { balance, mutate: mutateBalance } = useBalance()
  const { stocks } = useStocks()
  const { portfolio, mutate: mutatePortfolio } = usePortfolio()
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

  const portfolioValue = portfolio.reduce(
    (total, item) => total + (item.total_value || item.quantity * item.current_price),
    0
  )

  const totalValue = balance + portfolioValue

  const handleAfterBuy = () => {
    mutateBalance()
    mutatePortfolio()
  }

  const handleAfterSell = () => {
    mutateBalance()
    mutatePortfolio()
  }

  if (isLoading) {
    return <RadarLoader />
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar userEmail={user?.email} showLinks={true} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Cash Balance — ripple glow effect */}
          <div className="stat-card stat-card-cash bg-card border border-border">
            <span className="stat-icon">💰</span>
            <p className="text-sm text-muted-foreground">Cash Balance</p>
            <p className="text-2xl font-bold text-foreground mt-1">₹{balance.toFixed(2)}</p>
          </div>

          {/* Portfolio Value — spinning conic border */}
          <div className="stat-card stat-card-portfolio border border-border">
            <span className="stat-icon">📈</span>
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            <p className="text-2xl font-bold text-foreground mt-1">₹{portfolioValue.toFixed(2)}</p>
          </div>

          {/* Total Value — shimmer sweep + glow text */}
          <div className="stat-card stat-card-total bg-card border border-border">
            <span className="stat-icon">✦</span>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="stat-value-total text-2xl font-bold text-primary mt-1">₹{totalValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`dashboard-tab ${activeTab === 'stocks' ? 'active' : ''}`}
          >
            Browse Stocks
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`dashboard-tab ${activeTab === 'transactions' ? 'active' : ''}`}
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
                    onSell={handleAfterSell}
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
              onBuy={handleAfterBuy}
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
