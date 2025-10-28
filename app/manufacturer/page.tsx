"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  user: {
    name: string
    email: string
  }
  orderItems: {
    product: {
      name: string
      material: string
    }
    quantity: number
    stlFile: string
    stlFileData?: string
    notes?: string
  }[]
}

export default function ManufacturerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProduction: 0,
    completedToday: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user?.role !== "MANUFACTURER") {
      router.push("/dashboard")
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/manufacturer/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/manufacturer/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== "MANUFACTURER") {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'IN_PRODUCTION':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'QUALITY_CHECK':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'SHIPPED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getNextAction = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Start Production', action: 'CONFIRMED', icon: Play }
      case 'CONFIRMED':
        return { label: 'Begin Printing', action: 'IN_PRODUCTION', icon: Play }
      case 'IN_PRODUCTION':
        return { label: 'Quality Check', action: 'QUALITY_CHECK', icon: CheckCircle }
      case 'QUALITY_CHECK':
        return { label: 'Ship Order', action: 'SHIPPED', icon: Package }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manufacturer Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your production orders and track progress
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {session.user.role}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting production
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Production</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.inProduction}</div>
              <p className="text-xs text-muted-foreground">
                Currently printing
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                Finished today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Production Queue</h2>
          
          <div className="space-y-4">
            {orders.map((order, index) => {
              const nextAction = getNextAction(order.status)
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div>
                              <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.user.name} • ₹{order.totalAmount}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {order.orderItems.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Package className="w-4 h-4 text-primary" />
                                  <span className="font-medium text-sm">{item.product.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p>Material: {item.product.material}</p>
                                  <p>Quantity: {item.quantity}</p>
                                  <p>File: {item.stlFile}</p>
                                  {item.notes && (
                                    <p className="text-blue-600 font-medium">Notes: {item.notes}</p>
                                  )}
                                </div>
                                <div className="mt-3 flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      if (item.stlFileData) {
                                        // Create download link for STL file
                                        const blob = new Blob([Buffer.from(item.stlFileData, 'base64')], { type: 'application/octet-stream' })
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = item.stlFile || 'design.stl'
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                        URL.revokeObjectURL(url)
                                      }
                                    }}
                                  >
                                    Download STL
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          {nextAction && (
                            <Button
                              onClick={() => updateOrderStatus(order.id, nextAction.action)}
                              className="whitespace-nowrap"
                            >
                              <nextAction.icon className="w-4 h-4 mr-2" />
                              {nextAction.label}
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders in queue</h3>
              <p className="text-muted-foreground">
                New orders will appear here when they're assigned to you
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
