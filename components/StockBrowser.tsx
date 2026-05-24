'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useStocks } from '@/hooks/useStocks'

interface StockBrowserProps {
  balance: number
  onBuy: () => void
}

export default function StockBrowser({ balance, onBuy }: StockBrowserProps) {
  const { stocks, isLoading } = useStocks()
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [isBuying, setIsBuying] = useState(false)

  const handleBuyClick = (stock: any) => {
    setSelectedStock(stock)
    setQuantity('1')
    setIsOpen(true)
  }

  const handleBuy = async () => {
    if (!selectedStock || !quantity || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    const totalCost = parseInt(quantity) * selectedStock.current_price

    if (totalCost > balance) {
      alert('Insufficient balance')
      return
    }

    setIsBuying(true)
    try {
      const res = await fetch('/api/stocks/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockId: selectedStock.id,
          quantity: parseInt(quantity),
          pricePerShare: selectedStock.current_price,
        }),
      })

      if (res.ok) {
        alert('Stock purchased successfully!')
        setIsOpen(false)
        setQuantity('1')
        onBuy()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to buy stock')
      }
    } catch (error) {
      alert('Error buying stock')
    } finally {
      setIsBuying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stocks.map((stock) => (
        <Card key={stock.id} className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Price</span>
              <span className="font-bold text-foreground">₹{stock.current_price.toFixed(2)}</span>
            </div>
          </div>

          <Dialog open={isOpen && selectedStock?.id === stock.id} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                onClick={() => handleBuyClick(stock)}
              >
                Buy
              </Button>
            </DialogTrigger>
            {selectedStock?.id === stock.id && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buy {selectedStock.symbol}</DialogTitle>
                  <DialogDescription>
                    Price per share: ₹{selectedStock.current_price.toFixed(2)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="rounded bg-secondary p-3 text-sm">
                    <div className="mb-2 flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-bold">₹{(parseInt(quantity || '0') * selectedStock.current_price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Balance:</span>
                      <span className={parseInt(quantity || '0') * selectedStock.current_price > balance ? 'font-bold text-red-600' : 'font-bold'}>
                        ₹{balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleBuy}
                    disabled={isBuying || (parseInt(quantity || '0') * selectedStock.current_price) > balance}
                    className="w-full"
                  >
                    {isBuying ? 'Buying...' : 'Confirm Purchase'}
                  </Button>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </Card>
      ))}
    </div>
  )
}
