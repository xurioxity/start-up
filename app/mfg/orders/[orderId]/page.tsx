"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  Package,
  User,
  MessageSquare,
  Download,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  X,
  Factory,
  Mail,
  Phone
} from "lucide-react"
import Link from "next/link"

interface OrderDetails {
  id: string
  status: string
  priority: string
  manufacturingType: string
  totalAmount: number
  manufacturerCost: number
  sellingPrice?: number
  profitPerUnit?: number
  notes?: string
  estimatedDelivery?: string
  createdAt: string
  lastStatusChange?: string
  statusUpdatedBy?: string
  user: {
    id: string
    name: string
    email: string
    createdAt: string
  }
  orderItems: {
    id: string
    quantity: number
    price: number
    stlFile?: string
    notes?: string
    product: {
      name: string
      description: string
      material: string
      price: number
    }
  }[]
  tracking: {
    id: string
    status: string
    description?: string
    timestamp: string
  }[]
  messages: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      email: string
    }
    receiver: {
      id: string
      name: string
      email: string
    }
  }[]
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    notes: '',
    estimatedDelivery: ''
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

    fetchOrderDetails()
  }, [session, status, router, orderId])

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/mfg/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        setEditForm({
          status: data.order.status,
          priority: data.order.priority,
          notes: data.order.notes || '',
          estimatedDelivery: data.order.estimatedDelivery ? new Date(data.order.estimatedDelivery).toISOString().split('T')[0] : ''
        })
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateOrder = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/mfg/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        setIsEditing(false)
        fetchOrderDetails() // Refresh data
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    } finally {
      setIsUpdating(false)
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
      case "HIGH": return <AlertTriangle className="w-4 h-4" />
      case "MEDIUM": return <Clock className="w-4 h-4" />
      case "LOW": return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "MANUFACTURER" || !order) {
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
            <div className="flex items-center space-x-4">
              <Link href="/mfg/orders">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Order Details</h1>
                <p className="text-muted-foreground mt-1">
                  Order #{order.id.slice(-8)}
                </p>
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Order Information</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      {isEditing ? (
                        <Select
                          value={editForm.status}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                            <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      {isEditing ? (
                        <Select
                          value={editForm.priority}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HIGH">High Priority</SelectItem>
                            <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                            <SelectItem value="LOW">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getPriorityColor(order.priority)}>
                          {getPriorityIcon(order.priority)}
                          <span className="ml-1">{order.priority}</span>
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Manufacturing Type</Label>
                      <Badge variant="outline">
                        {order.manufacturingType === "AT_HOME" ? "At Home" : "On Demand"}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Estimated Delivery</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editForm.estimatedDelivery}
                          onChange={(e) => setEditForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                        />
                      ) : (
                        <div className="text-sm">
                          {order.estimatedDelivery 
                            ? new Date(order.estimatedDelivery).toLocaleDateString()
                            : 'Not set'
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add production notes..."
                        rows={3}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {order.notes || 'No notes added'}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleUpdateOrder} disabled={isUpdating}>
                        <Save className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Product Name</Label>
                            <div className="text-sm">{item.product.name}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Material</Label>
                            <Badge variant="outline">{item.product.material.toUpperCase()}</Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Quantity</Label>
                            <div className="text-sm">{item.quantity}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Unit Price</Label>
                            <div className="text-sm">₹{item.price}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">STL File</Label>
                            <div className="text-sm">{item.stlFile || 'No file'}</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Total</Label>
                            <div className="text-sm font-medium">₹{item.price * item.quantity}</div>
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-2">
                            <Label className="text-sm font-medium">Item Notes</Label>
                            <div className="text-sm text-muted-foreground">{item.notes}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tracking History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Tracking History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.tracking.map((track, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(track.status)}>{track.status}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(track.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {track.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {track.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Seller Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <div className="text-sm">{order.user.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="text-sm flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{order.user.email}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <div className="text-sm">
                      {new Date(order.user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Link href={`/mfg/messages?seller=${order.user.id}&order=${order.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
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

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Manufacturing Cost:</span>
                    <span className="text-sm font-medium">₹{order.manufacturerCost}</span>
                  </div>
                  {order.sellingPrice && (
                    <div className="flex justify-between">
                      <span className="text-sm">Selling Price:</span>
                      <span className="text-sm font-medium">₹{order.sellingPrice}</span>
                    </div>
                  )}
                  {order.profitPerUnit && (
                    <div className="flex justify-between">
                      <span className="text-sm">Profit per Unit:</span>
                      <span className="text-sm font-medium text-green-400">₹{order.profitPerUnit}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Amount:</span>
                      <span className="font-medium">₹{order.totalAmount}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(order.createdAt).toLocaleString()}
                  </div>
                  {order.lastStatusChange && (
                    <div className="text-xs text-muted-foreground">
                      Last Updated: {new Date(order.lastStatusChange).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Recent Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.messages.length > 0 ? (
                      order.messages.map((message, index) => (
                        <div key={index} className="text-sm border rounded p-2">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{message.sender.name}</span>
                            <span className="text-muted-foreground">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-muted-foreground">{message.content}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No messages yet
                      </div>
                    )}
                    <Link href={`/mfg/messages?seller=${order.user.id}&order=${order.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View All Messages
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
