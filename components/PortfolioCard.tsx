'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

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

interface PortfolioCardProps {
  item: PortfolioItem
  onSell: () => void
}

export default function PortfolioCard({ item, onSell }: PortfolioCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [isLoading, setIsLoading] = useState(false)

  const currentValue = item.quantity * item.current_price

  const handleSell = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    if (parseInt(quantity) > item.quantity) {
      alert('Cannot sell more than you own')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/stocks/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: item.stock_id,
          quantity: parseInt(quantity),
          pricePerShare: item.current_price,
        }),
      })

      if (res.ok) {
        alert('Stock sold successfully!')
        setIsOpen(false)
        setQuantity('1')
        onSell()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to sell stock')
      }
    } catch (error) {
      alert('Error selling stock')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{item.symbol}</h3>
        <p className="text-sm text-muted-foreground">{item.name}</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Quantity</span>
          <span className="font-medium text-foreground">{item.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Price</span>
          <span className="font-medium text-foreground">₹{item.current_price.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Value</span>
            <span className="font-bold text-foreground">₹{currentValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4 w-full" variant="outline">
            Sell
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell {item.symbol}</DialogTitle>
            <DialogDescription>
              Current price: ₹{item.current_price.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">
                Quantity to Sell (Max: {item.quantity})
              </label>
              <Input
                type="number"
                min="1"
                max={item.quantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="rounded bg-secondary p-3 text-sm">
              <div className="flex justify-between">
                <span>Total Sale Amount:</span>
                <span className="font-bold">₹{(parseInt(quantity || '0') * item.current_price).toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleSell}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Selling...' : 'Confirm Sell'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
