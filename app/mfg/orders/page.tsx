"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter,
  Package,
  Eye,
  MessageSquare,
  Download,
  Edit,
  Trash2,
  ArrowRight,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  status: string
  priority: string
  manufacturingType: string
  totalAmount: number
  manufacturerCost: number
  createdAt: string
  lastStatusChange?: string
  user: {
    id: string
    name: string
    email: string
  }
  orderItems: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      material: string
    }
  }[]
  tracking: {
    id: string
    status: string
    description?: string
    timestamp: string
  }[]
}

function ManufacturerOrdersContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [filters, setFilters] = useState({
    priority: searchParams.get('priority') || 'ALL',
    status: searchParams.get('status') || 'ALL',
    sellerId: searchParams.get('sellerId') || '',
    manufacturingType: 'ALL',
    material: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

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

    fetchOrders()
  }, [session, status, router, filters, pagination.page])

  const fetchOrders = async (searchTerm?: string) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        priority: filters.priority,
        status: filters.status,
        sellerId: filters.sellerId,
        manufacturingType: filters.manufacturingType,
        material: filters.material,
        search: searchTerm || searchValue
      })

      const response = await fetch(`/api/mfg/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }))
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchOrders(searchValue)
  }

  const handleBulkUpdate = async (updates: any) => {
    if (selectedOrders.length === 0) return

    try {
      const response = await fetch('/api/mfg/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrders, updates })
      })

      if (response.ok) {
        setSelectedOrders([])
        fetchOrders()
      }
    } catch (error) {
      console.error("Bulk update failed:", error)
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH": return <AlertTriangle className="w-3 h-3" />
      case "MEDIUM": return <Clock className="w-3 h-3" />
      case "LOW": return <CheckCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
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
              <h1 className="text-3xl font-bold">All Orders</h1>
              <p className="text-muted-foreground mt-1">
                Manage orders from all sellers
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{pagination.total} total orders</Badge>
              <Link href="/mfg/dashboard">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, seller name, or product..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button 
                onClick={() => {
                  setSearchValue("")
                  fetchOrders("")
                }} 
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="HIGH">High Priority</SelectItem>
                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                <SelectItem value="LOW">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.manufacturingType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, manufacturingType: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Manufacturing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="AT_HOME">At Home</SelectItem>
                <SelectItem value="ON_DEMAND">On Demand</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Material filter..."
              value={filters.material}
              onChange={(e) => setFilters(prev => ({ ...prev, material: e.target.value }))}
              className="w-48"
            />
          </div>
        </motion.div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedOrders.length} order(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <Select onValueChange={(value) => handleBulkUpdate({ status: value })}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">Confirm</SelectItem>
                        <SelectItem value="IN_PRODUCTION">Start Production</SelectItem>
                        <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                        <SelectItem value="SHIPPED">Ship</SelectItem>
                        <SelectItem value="DELIVERED">Deliver</SelectItem>
                        <SelectItem value="CANCELLED">Cancel</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => handleBulkUpdate({ priority: value })}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Set Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">High Priority</SelectItem>
                        <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                        <SelectItem value="LOW">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Orders Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders(prev => [...prev, order.id])
                              } else {
                                setSelectedOrders(prev => prev.filter(id => id !== order.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {getPriorityIcon(order.priority)}
                            <span className="ml-1">{order.priority}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h3 className="font-medium text-lg mb-1">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {order.user.name} ({order.user.email})
                        </p>
                      </div>

                      <div className="space-y-2">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Product:</span>
                              <span className="font-medium">{item.product.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Material:</span>
                              <Badge variant="outline" className="text-xs">
                                {item.product.material.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="outline">
                            {order.manufacturingType === "AT_HOME" ? "At Home" : "On Demand"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Manufacturing Cost:</span>
                          <span className="font-medium">₹{order.manufacturerCost}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Link href={`/mfg/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/mfg/messages?seller=${order.user.id}&order=${order.id}`}>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement STL download
                            console.log('Download STL for order:', order.id)
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchValue || Object.values(filters).some(f => f !== 'ALL' && f !== '')
                  ? "Try adjusting your search or filters" 
                  : "No orders have been placed yet"
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center space-x-2"
          >
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function ManufacturerOrders() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <ManufacturerOrdersContent />
    </Suspense>
  )
}
