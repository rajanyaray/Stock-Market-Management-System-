'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  userEmail?: string
  showLinks?: boolean
}

export default function Navbar({ userEmail, showLinks = false }: NavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={userEmail ? '/dashboard' : '/'}>
          <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            Stock Market Manager
          </h1>
        </Link>
        
        {showLinks && (
          <div className="flex items-center gap-4">
            {userEmail && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/transactions">
                  <Button variant="ghost" size="sm">
                    Transactions
                  </Button>
                </Link>
              </>
            )}
            {userEmail && (
              <>
                <span className="text-sm text-muted-foreground">{userEmail}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
