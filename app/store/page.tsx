"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderActions } from "@/components/order-actions"
import { 
  Search, 
  Plus,
  Package,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Upload,
  File,
  X,
  Save,
  ShoppingCart,
  TrendingUp,
  Users
} from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  status: string
  manufacturingType: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  orderItems?: {
    id: string
    stlFile: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

export default function StorePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [filters, setFilters] = useState({
    manufacturingType: "ALL",
    status: "ALL",
    isActive: "ALL"
  })

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchOrders()
  }, [session, status, router, filters])

  const fetchOrders = async (searchTerm?: string) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        search: searchTerm || "",
        manufacturingType: filters.manufacturingType === "ALL" ? "" : filters.manufacturingType,
        status: filters.status === "ALL" ? "" : filters.status,
        isActive: filters.isActive === "ALL" ? "" : filters.isActive,
        sortBy: "createdAt",
        sortOrder: "desc"
      })

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
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

  const handleOrderAction = async (orderId: string, action: string) => {
    switch (action) {
      case 'delete':
        try {
          const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            setOrders(orders.filter(order => order.id !== orderId))
          }
        } catch (error) {
          console.error("Delete failed:", error)
        }
        break
      case 'download':
        try {
          const response = await fetch(`/api/orders/${orderId}/download`)
          if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `order-${orderId}.stl`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }
        } catch (error) {
          console.error("Download failed:", error)
        }
        break
      case 'share':
        const productUrl = `${window.location.origin}/product/${orderId}`
        try {
          await navigator.clipboard.writeText(productUrl)
          alert("Product link copied to clipboard!")
        } catch (error) {
          console.error("Failed to copy link:", error)
        }
        break
      case 'toggle':
        try {
          const order = orders.find(o => o.id === orderId)
          if (order) {
            const response = await fetch(`/api/orders/${orderId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: !order.isActive })
            })
            if (response.ok) {
              setOrders(orders.map(o => 
                o.id === orderId ? { ...o, isActive: !o.isActive } : o
              ))
            }
          }
        } catch (error) {
          console.error("Toggle failed:", error)
        }
        break
      case 'message':
        // Navigate to messages page with order context
        router.push(`/messages?order=${orderId}`)
        break
    }
  }

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return

    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrders })
      })

      if (response.ok) {
        setSelectedOrders([])
        fetchOrders()
      }
    } catch (error) {
      console.error("Bulk delete failed:", error)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session) {
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
              <h1 className="text-3xl font-bold">My Store</h1>
              <p className="text-muted-foreground mt-1">
                Manage your product listings and track performance
              </p>
            </div>
            <Link href="/upload">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Product
              </Button>
            </Link>
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
                  placeholder="Product name, material, ID..."
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
              value={filters.manufacturingType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, manufacturingType: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="AT_HOME">At Home</SelectItem>
                <SelectItem value="ON_DEMAND">On Demand</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isActive}
              onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All listings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All listings</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
                    {selectedOrders.length} product(s) selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
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
                          <Badge variant={order.isActive ? "default" : "secondary"}>
                            {order.isActive ? "Active" : "Inactive"}
                          </Badge>
                            <OrderActions
                              orderId={order.id}
                              status={order.status}
                              manufacturingType={order.manufacturingType as "AT_HOME" | "ON_DEMAND"}
                              isActive={order.isActive}
                              onDelete={() => handleOrderAction(order.id, 'delete')}
                              onDownload={() => handleOrderAction(order.id, 'download')}
                              onShare={() => handleOrderAction(order.id, 'share')}
                              onToggleActive={() => handleOrderAction(order.id, 'toggle')}
                              onMessage={() => handleOrderAction(order.id, 'message')}
                            />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h3 className="font-medium text-lg mb-1">
                          Product #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {order.orderItems && order.orderItems.length > 0 
                            ? order.orderItems[0]?.product?.name || "Unnamed Product"
                            : "Unnamed Product"
                          }
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="outline">
                            {order.manufacturingType === "AT_HOME" ? "At Home" : "On Demand"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOrderAction(order.id, 'share')}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderAction(order.id, 'download')}
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
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchValue 
                  ? "Try adjusting your search" 
                  : "Create your first product to get started"
                }
              </p>
              <Link href="/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

    </div>
  )
}
