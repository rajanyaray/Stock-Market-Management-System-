"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStocks } from "@/hooks/useStocks";
import { toast } from "sonner";

interface StockBrowserProps {
  balance: number;
  onBuy: () => void;
}

export default function StockBrowser({ balance, onBuy }: StockBrowserProps) {
  const { stocks, isLoading } = useStocks();
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [isBuying, setIsBuying] = useState(false);

  const handleBuyClick = (stock: any) => {
    setSelectedStock(stock);
    setQuantity("1");
    setIsOpen(true);
  };

  const handleBuy = async () => {
    const parsedQuantity = Number(quantity);
    if (
      !selectedStock ||
      !Number.isFinite(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      toast.error("Enter a valid whole number quantity");
      return;
    }

    const totalCost = parsedQuantity * selectedStock.current_price;
    if (totalCost > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsBuying(true);
    try {
      const res = await fetch("/api/stocks/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId: selectedStock.id,
          quantity: parseInt(quantity),
          pricePerShare: selectedStock.current_price,
        }),
      });

      if (res.ok) {
        toast.success("Stock purchased successfully");
        setIsOpen(false);
        setQuantity("1");
        onBuy();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to buy stock");
      }
    } catch (error) {
      toast.error("Error buying stock");
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="radar-pattern">
          <div className="radar-center" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stocks.map((stock) => (
          <div key={stock.id} className="stock-card">
            {/* Top accent stripe */}
            <div className="stock-card-accent" />

            {/* Inner content (sits above ::after mask) */}
            <div className="stock-card-inner">
              {/* Symbol chip */}
              <span className="stock-symbol-chip">
                ◆ {stock.symbol}
              </span>

              {/* Name */}
              <p className="text-sm text-muted-foreground leading-snug">
                {stock.name}
              </p>

              {/* Price */}
              <p className="stock-price">₹{stock.current_price.toFixed(2)}</p>

              {/* Label under price */}
              <p className="text-xs text-muted-foreground mt-1 mb-0">
                Current Market Price
              </p>

              {/* Buy button triggers dialog */}
              <button
                className="buy-btn"
                onClick={() => handleBuyClick(stock)}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Single shared dialog */}
      {selectedStock && (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); }}>
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
                  step="1"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="rounded-lg bg-secondary p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="font-bold">
                    ₹{(Number(quantity || 0) * selectedStock.current_price).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Available Balance:</span>
                  <span
                    className={
                      Number(quantity || 0) * selectedStock.current_price > balance
                        ? "font-bold text-red-500"
                        : "font-bold"
                    }
                  >
                    ₹{balance.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                className="buy-btn"
                onClick={handleBuy}
                disabled={
                  isBuying ||
                  Number(quantity || 0) * selectedStock.current_price > balance
                }
              >
                {isBuying ? "Processing..." : "Confirm Purchase"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
