"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  user_id: string;
  stock_id: string;
  quantity: number;
  symbol: string;
  name: string;
  current_price: number;
  total_value: number;
  created_at: string;
}

interface PortfolioCardProps {
  item: PortfolioItem;
  onSell: () => void;
}

export default function PortfolioCard({ item, onSell }: PortfolioCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const currentValue = item.quantity * item.current_price;

  const handleSell = async () => {
    const parsedQuantity = Number(quantity);
    if (
      !Number.isFinite(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      toast.error("Enter a valid whole number quantity");
      return;
    }

    if (parsedQuantity > item.quantity) {
      toast.error("Cannot sell more than you own");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/stocks/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockId: item.stock_id,
          quantity: parseInt(quantity),
          pricePerShare: item.current_price,
        }),
      });

      if (res.ok) {
        toast.success("Stock sold successfully");
        setIsOpen(false);
        setQuantity("1");
        onSell();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to sell stock");
      }
    } catch (error) {
      toast.error("Error selling stock");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="portfolio-card">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <span className="stock-symbol">{item.symbol.slice(0, 4)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground leading-tight">
            {item.symbol}
          </h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.name}
          </p>
        </div>
      </div>

      {/* Data rows */}
      <div className="space-y-0 mb-4">
        <div className="data-row">
          <span className="data-label">Quantity</span>
          <span className="data-value">{item.quantity}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Price / Share</span>
          <span className="data-value">₹{item.current_price.toFixed(2)}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Current Value</span>
          <span className="data-value highlight">₹{currentValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Sell dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="sell-btn">Sell</button>
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
                step="1"
                inputMode="numeric"
                max={item.quantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <div className="flex justify-between">
                <span>Total Sale Amount:</span>
                <span className="font-bold">
                  ₹{(Number(quantity || 0) * item.current_price).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={handleSell}
              disabled={isLoading}
              className="sell-btn"
            >
              {isLoading ? "Selling..." : "Confirm Sell"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
