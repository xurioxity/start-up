import { Badge } from "@/components/ui/badge"
import { Home, Zap } from "lucide-react"

interface ManufacturingBadgeProps {
  type: "AT_HOME" | "ON_DEMAND"
  className?: string
}

export function ManufacturingBadge({ type, className }: ManufacturingBadgeProps) {
  if (type === "AT_HOME") {
    return (
      <Badge variant="secondary" className={`bg-orange-100 text-orange-800 border-orange-200 ${className}`}>
        <Home className="w-3 h-3 mr-1" />
        At Home
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className={`bg-blue-100 text-blue-800 border-blue-200 ${className}`}>
      <Zap className="w-3 h-3 mr-1" />
      On Demand
    </Badge>
  )
}
