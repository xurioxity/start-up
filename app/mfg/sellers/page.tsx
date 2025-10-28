"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  Users,
  Eye,
  MessageSquare,
  Package,
  TrendingUp,
  Calendar,
  ArrowRight,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react"
import Link from "next/link"

interface SellerStats {
  id: string
  name: string
  email: string
  createdAt: string
  totalOrders: number
  activeOrders: number
  completedOrders: number
  pendingOrders: number
  totalRevenue: number
  preferredMaterial: string
  lastOrderDate: string | null
}

interface Order {
  id: string
  status: string
  priority: string
  totalAmount: number
  createdAt: string
  manufacturingType: string
}

interface SellerDetails extends SellerStats {
  orders: Order[]
}

export default function SellersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sellers, setSellers] = useState<SellerStats[]>([])
  const [selectedSeller, setSelectedSeller] = useState<SellerDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")

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

    fetchSellers()
  }, [session, status, router])

  const fetchSellers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/mfg/sellers")
      if (response.ok) {
        const data = await response.json()
        setSellers(data.sellers || [])
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSellerDetails = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/mfg/sellers?sellerId=${sellerId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedSeller(data.seller)
      }
    } catch (error) {
      console.error("Failed to fetch seller details:", error)
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

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchValue.toLowerCase())
  )

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
                <Users className="w-8 h-8" />
                <span>Sellers Management</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor all sellers
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{sellers.length} sellers</Badge>
              <Link href="/mfg/dashboard">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sellers by name or email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sellers List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {filteredSellers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSellers.map((seller, index) => (
                    <motion.div
                      key={seller.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => fetchSellerDetails(seller.id)}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{seller.name}</CardTitle>
                                <CardDescription className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{seller.email}</span>
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline">{seller.totalOrders} orders</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Active Orders:</span>
                              <div className="font-medium">{seller.activeOrders}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Completed:</span>
                              <div className="font-medium text-green-400">{seller.completedOrders}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pending:</span>
                              <div className="font-medium text-yellow-400">{seller.pendingOrders}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <div className="font-medium">₹{seller.totalRevenue.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Preferred Material:</span>
                            <Badge variant="outline" className="ml-2">
                              {seller.preferredMaterial.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Member since: {new Date(seller.createdAt).toLocaleDateString()}
                          </div>
                          {seller.lastOrderDate && (
                            <div className="text-xs text-muted-foreground">
                              Last order: {new Date(seller.lastOrderDate).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                fetchSellerDetails(seller.id)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Link href={`/mfg/messages?seller=${seller.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </Link>
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
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No sellers found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchValue 
                      ? "Try adjusting your search" 
                      : "No sellers have placed orders yet"
                    }
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Seller Details Sidebar */}
          <div>
            {selectedSeller ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="sticky top-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>{selectedSeller.name}</span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSeller(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Seller Info */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <div className="text-sm flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedSeller.email}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Member Since</Label>
                        <div className="text-sm">
                          {new Date(selectedSeller.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Preferred Material</Label>
                        <Badge variant="outline">{selectedSeller.preferredMaterial.toUpperCase()}</Badge>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Order Statistics</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium">{selectedSeller.totalOrders}</div>
                          <div className="text-muted-foreground">Total Orders</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium text-green-400">{selectedSeller.completedOrders}</div>
                          <div className="text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium text-yellow-400">{selectedSeller.pendingOrders}</div>
                          <div className="text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-medium text-blue-400">{selectedSeller.activeOrders}</div>
                          <div className="text-muted-foreground">Active</div>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-primary/10 rounded">
                        <div className="font-medium text-lg">₹{selectedSeller.totalRevenue.toLocaleString()}</div>
                        <div className="text-muted-foreground">Total Revenue</div>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Recent Orders</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedSeller.orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="text-sm border rounded p-2">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">#{order.id.slice(-8)}</span>
                              <span className="text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                              <span className="font-medium">₹{order.totalAmount}</span>
                            </div>
                          </div>
                        ))}
                        {selectedSeller.orders.length > 5 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{selectedSeller.orders.length - 5} more orders
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link href={`/mfg/orders?seller=${selectedSeller.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View All Orders
                        </Button>
                      </Link>
                      <Link href={`/mfg/messages?seller=${selectedSeller.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="sticky top-8">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Select a Seller</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on a seller card to view their details and order history
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
