import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"

interface PricingBreakdownProps {
  manufacturerCost: number
  sellingPrice?: number
  profitPerUnit?: number
  quantity?: number
  manufacturingType: "AT_HOME" | "ON_DEMAND"
  onSellingPriceChange?: (price: number) => void
  editable?: boolean
  className?: string
}

export function PricingBreakdown({
  manufacturerCost,
  sellingPrice = 0,
  profitPerUnit = 0,
  quantity = 1,
  manufacturingType,
  onSellingPriceChange,
  editable = false,
  className
}: PricingBreakdownProps) {
  const [localSellingPrice, setLocalSellingPrice] = useState(sellingPrice)
  const [localProfitPerUnit, setLocalProfitPerUnit] = useState(profitPerUnit)

  useEffect(() => {
    if (editable && onSellingPriceChange) {
      const newProfit = localSellingPrice - manufacturerCost
      setLocalProfitPerUnit(newProfit)
      onSellingPriceChange(localSellingPrice)
    }
  }, [localSellingPrice, manufacturerCost, editable, onSellingPriceChange])

  const totalProfit = localProfitPerUnit * quantity
  const totalCost = manufacturerCost * quantity
  const totalRevenue = localSellingPrice * quantity

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Calculator className="w-5 h-5" />
          <span>Pricing Breakdown</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manufacturer Cost */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Manufacturer Cost</span>
          </div>
          <span className="font-bold text-blue-900">₹{manufacturerCost.toFixed(2)}</span>
        </div>

        {/* Selling Price (only for ON_DEMAND) */}
        {manufacturingType === "ON_DEMAND" && (
          <div className="space-y-2">
            <Label htmlFor="selling-price" className="text-sm font-medium">
              Your Selling Price
            </Label>
            {editable ? (
              <Input
                id="selling-price"
                type="number"
                value={localSellingPrice}
                onChange={(e) => setLocalSellingPrice(parseFloat(e.target.value) || 0)}
                placeholder="Enter your selling price"
                className="text-right"
              />
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Your Price</span>
                </div>
                <span className="font-bold text-green-900">₹{localSellingPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Profit Display */}
        {manufacturingType === "ON_DEMAND" && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Profit per Unit</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`font-bold ${
                localProfitPerUnit >= 0 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {localProfitPerUnit >= 0 ? '+' : ''}₹{localProfitPerUnit.toFixed(2)}
            </Badge>
          </div>
        )}

        {/* Quantity and Totals (for AT_HOME) */}
        {manufacturingType === "AT_HOME" && quantity > 1 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span>Quantity:</span>
              <span className="font-medium">{quantity} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Cost:</span>
              <span className="font-bold">₹{totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Total Revenue and Profit (for ON_DEMAND with quantity) */}
        {manufacturingType === "ON_DEMAND" && quantity > 1 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span>Total Revenue:</span>
              <span className="font-medium">₹{totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Profit:</span>
              <span className={`font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Warning for negative profit */}
        {localProfitPerUnit < 0 && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            ⚠️ Your selling price is below manufacturer cost. You'll lose money on this order.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
