import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare,
  Download,
  Copy,
  Power,
  PowerOff,
  Eye,
  Share2
} from "lucide-react"
import { ManufacturingBadge } from "./manufacturing-badge"

interface OrderActionsProps {
  orderId: string
  status: string
  manufacturingType: "AT_HOME" | "ON_DEMAND"
  isActive: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggleActive?: () => void
  onMessage?: () => void
  onDownload?: () => void
  onDuplicate?: () => void
  onViewDetails?: () => void
  onShare?: () => void
  className?: string
}

export function OrderActions({
  orderId,
  status,
  manufacturingType,
  isActive,
  onEdit,
  onDelete,
  onToggleActive,
  onMessage,
  onDownload,
  onDuplicate,
  onViewDetails,
  onShare,
  className
}: OrderActionsProps) {
  const canEdit = status === "PENDING"
  const canDelete = true // Allow delete for all orders
  const canToggleActive = manufacturingType === "ON_DEMAND"

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Manufacturing Type Badge */}
      <ManufacturingBadge type={manufacturingType} />
      
      {/* Active Status Badge (for ON_DEMAND) */}
      {manufacturingType === "ON_DEMAND" && (
        <Badge 
          variant="outline" 
          className={isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}
        >
          {isActive ? "Active" : "Paused"}
        </Badge>
      )}

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Share Product (ON_DEMAND only) */}
          {manufacturingType === "ON_DEMAND" && onShare && (
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Product
            </DropdownMenuItem>
          )}

          {/* View Details */}
          {onViewDetails && (
            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
          )}

          {/* Edit (PENDING only) */}
          {canEdit && onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Order
            </DropdownMenuItem>
          )}

          {/* Delete (PENDING AT_HOME only) */}
          {canDelete && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Order
              </DropdownMenuItem>
            </>
          )}

          {/* Toggle Active (ON_DEMAND only) */}
          {canToggleActive && onToggleActive && (
            <DropdownMenuItem onClick={onToggleActive}>
              {isActive ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Pause Listing
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Activate Listing
                </>
              )}
            </DropdownMenuItem>
          )}

          {/* Message Manufacturer */}
          {onMessage && (
            <DropdownMenuItem onClick={onMessage}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Manufacturer
            </DropdownMenuItem>
          )}

          {/* Download STL */}
          {onDownload && (
            <DropdownMenuItem onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download STL
            </DropdownMenuItem>
          )}

          {/* Duplicate Order (AT_HOME only) */}
          {manufacturingType === "AT_HOME" && onDuplicate && (
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Order
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
