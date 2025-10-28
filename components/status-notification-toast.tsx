"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Clock, 
  Factory, 
  AlertCircle, 
  Package,
  X,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface Notification {
  orderId: string
  orderNumber: string
  status: string
  lastStatusChange: string
  statusUpdatedBy: string
  recentTracking: {
    id: string
    status: string
    description?: string
    timestamp: string
  }[]
}

interface StatusNotificationToastProps {
  notification: Notification
  onDismiss: () => void
}

export function StatusNotificationToast({ notification, onDismiss }: StatusNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 300) // Wait for animation to complete
    }, 8000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <CheckCircle className="w-4 h-4 text-blue-400" />
      case "IN_PRODUCTION": return <Factory className="w-4 h-4 text-purple-400" />
      case "QUALITY_CHECK": return <AlertCircle className="w-4 h-4 text-orange-400" />
      case "SHIPPED": return <Package className="w-4 h-4 text-indigo-400" />
      case "DELIVERED": return <CheckCircle className="w-4 h-4 text-green-400" />
      default: return <Clock className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "IN_PRODUCTION": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "QUALITY_CHECK": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "SHIPPED": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
      case "DELIVERED": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "Your order has been confirmed by the manufacturer"
      case "IN_PRODUCTION": return "Your order is now in production"
      case "QUALITY_CHECK": return "Your order is undergoing quality check"
      case "SHIPPED": return "Your order has been shipped"
      case "DELIVERED": return "Your order has been delivered"
      default: return "Your order status has been updated"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Card className="bg-card border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(notification.status)}
                  <div>
                    <div className="font-medium text-sm">Order #{notification.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {getStatusMessage(notification.status)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(onDismiss, 300)
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-2">
                <Badge className={getStatusColor(notification.status)}>
                  {notification.status}
                </Badge>
                
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(notification.lastStatusChange).toLocaleString()}
                </div>

                {notification.recentTracking.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium mb-1">Recent Updates:</div>
                    <div className="space-y-1">
                      {notification.recentTracking.slice(0, 2).map((track, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          <span>{track.description || `${track.status} status update`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link href={`/store`}>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Order Details
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to manage notifications
export function useStatusNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissNotification = (orderId: string) => {
    setNotifications(prev => prev.filter(n => n.orderId !== orderId))
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    isLoading,
    dismissNotification,
    fetchNotifications
  }
}
