"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CheckCircle, Factory, AlertCircle, Package, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface Notification {
  orderId: string
  orderNumber: string
  status: string
  lastStatusChange: string
  statusUpdatedBy?: string
  recentTracking: {
    id: string
    status: string
    description?: string
    timestamp: string
  }[]
}

interface NotificationButtonProps {
  userId: string
}

export function NotificationButton({ userId }: NotificationButtonProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if user has seen notifications before
  const hasSeenNotifications = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`notifications_seen_${userId}`) === 'true'
  }

  // Mark notifications as seen
  const markNotificationsAsSeen = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`notifications_seen_${userId}`, 'true')
    setUnreadCount(0)
  }

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        const fetchedNotifications = data.notifications || []
        setNotifications(fetchedNotifications)
        
        // Only show unread count if user hasn't seen notifications before
        if (!hasSeenNotifications() && fetchedNotifications.length > 0) {
          setUnreadCount(fetchedNotifications.length)
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissNotification = (orderId: string) => {
    setNotifications(prev => prev.filter(n => n.orderId !== orderId))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const dismissAllNotifications = () => {
    setNotifications([])
    markNotificationsAsSeen()
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds (less frequent than before)
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

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
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (open) {
        markNotificationsAsSeen()
      }
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissAllNotifications}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.orderId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="border-l-4 border-l-primary/50">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1">
                            {getStatusIcon(notification.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className={getStatusColor(notification.status)}>
                                  {notification.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Order #{notification.orderNumber}
                                </span>
                              </div>
                              
                              <p className="text-sm font-medium mb-1">
                                {getStatusMessage(notification.status)}
                              </p>
                              
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(notification.lastStatusChange).toLocaleString()}
                              </p>

                              {notification.recentTracking.length > 0 && (
                                <div className="text-xs">
                                  <div className="font-medium mb-1">Recent Updates:</div>
                                  <div className="space-y-1">
                                    {notification.recentTracking.slice(0, 2).map((track, idx) => (
                                      <div key={idx} className="flex items-center space-x-2">
                                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                                        <span className="text-muted-foreground">
                                          {track.description || `${track.status} status update`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.orderId)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <Link href={`/store`}>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            View Order Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-6">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll see order updates here
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
