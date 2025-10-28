"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Users,
  AlertTriangle,
  BarChart3,
  Eye,
  MessageSquare,
  ArrowRight,
  Zap,
  Factory
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  inProductionOrders: number
  qualityCheckOrders: number
  deliveredOrders: number
  cancelledOrders: number
  highPriorityOrders: number
  mediumPriorityOrders: number
  lowPriorityOrders: number
  totalRevenue: number
  atHomeOrders: number
  onDemandOrders: number
  activeOrders: number
}

interface SellerStats {
  id: string
  name: string
  email: string
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalRevenue: number
  preferredMaterial: string
  lastOrderDate: string | null
  pendingOrders: number
}

interface Order {
  id: string
  status: string
  priority: string
  manufacturingType: string
  totalAmount: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  orderItems: {
    product: {
      name: string
      material: string
    }
  }[]
}

export default function ManufacturerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [sellerStats, setSellerStats] = useState<SellerStats[]>([])
  const [ordersBySeller, setOrdersBySeller] = useState<any[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<any>({})
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [viewMode, setViewMode] = useState<'stats' | 'sellers' | 'status'>('stats')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "MANUFACTURER") {
      router.push("/dashboard")
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/mfg/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setSellerStats(data.sellerStats)
        setOrdersBySeller(data.ordersBySeller)
        setOrdersByStatus(data.ordersByStatus)
        setRecentOrders(data.recentOrders)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "CONFIRMED": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "IN_PRODUCTION": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "QUALITY_CHECK": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "SHIPPED": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
      case "DELIVERED": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "CANCELLED": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "LOW": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "MANUFACTURER") {
    return null
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
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <Factory className="w-8 h-8" />
                <span>Manufacturer Dashboard</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage orders from all sellers
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'stats' ? 'default' : 'outline'}
                onClick={() => setViewMode('stats')}
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </Button>
              <Button
                variant={viewMode === 'sellers' ? 'default' : 'outline'}
                onClick={() => setViewMode('sellers')}
                size="sm"
              >
                <Users className="w-4 h-4 mr-2" />
                By Sellers
              </Button>
              <Button
                variant={viewMode === 'status' ? 'default' : 'outline'}
                onClick={() => setViewMode('status')}
                size="sm"
              >
                <Package className="w-4 h-4 mr-2" />
                By Status
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {viewMode === 'stats' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all sellers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{stats.highPriorityOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Urgent orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    From all orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Confirmed</span>
                    <Badge className={getStatusColor("CONFIRMED")}>{stats.confirmedOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">In Production</span>
                    <Badge className={getStatusColor("IN_PRODUCTION")}>{stats.inProductionOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Check</span>
                    <Badge className={getStatusColor("QUALITY_CHECK")}>{stats.qualityCheckOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Delivered</span>
                    <Badge className={getStatusColor("DELIVERED")}>{stats.deliveredOrders}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Priority Levels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">High Priority</span>
                    <Badge className={getPriorityColor("HIGH")}>{stats.highPriorityOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <Badge className={getPriorityColor("MEDIUM")}>{stats.mediumPriorityOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Low Priority</span>
                    <Badge className={getPriorityColor("LOW")}>{stats.lowPriorityOrders}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manufacturing Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">At Home</span>
                    <Badge variant="outline">{stats.atHomeOrders}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">On Demand</span>
                    <Badge variant="outline">{stats.onDemandOrders}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/mfg/orders">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Orders
                    </Button>
                  </Link>
                  <Link href="/mfg/sellers">
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Sellers
                    </Button>
                  </Link>
                  <Link href="/mfg/messages">
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Sellers View */}
        {viewMode === 'sellers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-6">Orders by Seller</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ordersBySeller.map((sellerGroup, index) => (
                <motion.div
                  key={sellerGroup.seller.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{sellerGroup.seller.name}</CardTitle>
                          <CardDescription>{sellerGroup.seller.email}</CardDescription>
                        </div>
                        <Badge variant="outline">{sellerGroup.orderCount} orders</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Orders:</span>
                          <div className="font-medium">{sellerGroup.orderCount}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pending:</span>
                          <div className="font-medium text-yellow-400">{sellerGroup.pendingCount}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/mfg/orders?seller=${sellerGroup.seller.id}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Orders
                          </Button>
                        </Link>
                        <Link href={`/mfg/messages?seller=${sellerGroup.seller.id}`}>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Status View */}
        {viewMode === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-6">Orders by Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(ordersByStatus).map(([status, orders]: [string, any]) => (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{status.replace('_', ' ')}</CardTitle>
                        <Badge className={getStatusColor(status)}>{orders.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {orders.slice(0, 3).map((order: Order) => (
                          <div key={order.id} className="text-sm p-2 bg-muted/30 rounded">
                            <div className="font-medium">#{order.id.slice(-8)}</div>
                            <div className="text-muted-foreground">{order.user.name}</div>
                            <div className="flex justify-between">
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                              <span className="text-xs">₹{order.totalAmount}</span>
                            </div>
                          </div>
                        ))}
                        {orders.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{orders.length - 3} more orders
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">#{order.id.slice(-8)}</div>
                        <div className="text-sm text-muted-foreground">{order.user.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                      <div className="text-sm font-medium">₹{order.totalAmount}</div>
                      <Link href={`/mfg/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
