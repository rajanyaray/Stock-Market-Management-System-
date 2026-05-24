'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        setIsAuthenticated(response.ok)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </main>
    )
  }

  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navbar showLinks={false} />
        <div className="flex-1 bg-background p-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Welcome back!</h2>
              <p className="mt-2 text-muted-foreground">Manage your stock portfolio and make informed trading decisions.</p>
              <Link href="/dashboard" className="mt-6 inline-block">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar showLinks={false} />

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Welcome to Stock Market Manager</h2>
            <p className="mt-4 text-muted-foreground">
              Start trading Indian stocks with a virtual portfolio of ₹100,000. Buy, sell, and track your investments.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/auth/sign-up" className="block">
              <Button className="w-full" size="lg">
                Create Account
              </Button>
            </Link>
            <Link href="/auth/login" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">₹100K</div>
              <p className="text-sm text-muted-foreground">Starting Balance</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10</div>
              <p className="text-sm text-muted-foreground">Indian Stocks</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Real-time</div>
              <p className="text-sm text-muted-foreground">Trading</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
