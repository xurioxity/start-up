"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PricingBreakdown } from "@/components/pricing-breakdown"
import { ManufacturingBadge } from "@/components/manufacturing-badge"
import Link from "next/link"
import { 
  ArrowLeft,
  Package,
  Edit,
  Save,
  X,
  Download,
  MessageSquare,
  Trash2,
  Power,
  PowerOff,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface Order {
  id: string
  status: string
  manufacturingType: "AT_HOME" | "ON_DEMAND"
  manufacturerCost: number
  sellingPrice?: number
  profitPerUnit?: number
  isActive: boolean
  totalAmount: number
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
  notes?: string
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    stlFile: string
    notes?: string
    product: {
      id: string
      name: string
      material: string
    }
  }>
  tracking: Array<{
    id: string
    status: string
    description: string
    timestamp: string
  }>
  messages: Array<{
    id: string
    content: string
    createdAt: string
    sender: {
      name: string
      email: string
    }
    receiver: {
      name: string
      email: string
    }
  }>
}

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Edit form state
  const [editData, setEditData] = useState({
    quantity: 1,
    material: "",
    sellingPrice: 0
  })

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    const editMode = searchParams.get('edit') === 'true'
    setIsEditing(editMode)
    
    fetchOrder()
  }, [session, status, router, params.orderId])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders/${params.orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        
        // Initialize edit form
        if (data.order) {
          setEditData({
            quantity: data.order.orderItems[0]?.quantity || 1,
            material: data.order.orderItems[0]?.product?.material || "",
            sellingPrice: data.order.sellingPrice || 0
          })
        }
      } else {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
      router.push("/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      
      if (response.ok) {
        setIsEditing(false)
        fetchOrder()
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order?")) return
    
    try {
      const response = await fetch(`/api/orders/${params.orderId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Failed to delete order:", error)
    }
  }

  const handleToggleActive = async () => {
    if (!order) return
    
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderIds: [order.id], 
          isActive: !order.isActive 
        })
      })
      
      if (response.ok) {
        fetchOrder()
      }
    } catch (error) {
      console.error("Failed to toggle order:", error)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!session || !order) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-200"
      case "IN_PRODUCTION": return "bg-purple-100 text-purple-800 border-purple-200"
      case "QUALITY_CHECK": return "bg-orange-100 text-orange-800 border-orange-200"
      case "DELIVERED": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4" />
      case "CONFIRMED": return <CheckCircle className="w-4 h-4" />
      case "IN_PRODUCTION": return <Package className="w-4 h-4" />
      case "QUALITY_CHECK": return <AlertCircle className="w-4 h-4" />
      case "DELIVERED": return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/orders">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
                <p className="text-muted-foreground mt-1">
                  {order.orderItems[0]?.product?.name || 'Product'} • Created {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ManufacturingBadge type={order.manufacturingType} />
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Information</CardTitle>
                  {order.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Product Name</Label>
                    <p className="text-sm">{order.orderItems[0]?.product?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Material</Label>
                    {isEditing ? (
                      <Input
                        value={editData.material}
                        onChange={(e) => setEditData(prev => ({ ...prev, material: e.target.value }))}
                        placeholder="Material"
                      />
                    ) : (
                      <p className="text-sm">{order.orderItems[0]?.product?.material}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    {isEditing && order.manufacturingType === "AT_HOME" ? (
                      <Input
                        type="number"
                        value={editData.quantity}
                        onChange={(e) => setEditData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        min="1"
                      />
                    ) : (
                      <p className="text-sm">{order.orderItems[0]?.quantity}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">STL File</Label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm">{order.orderItems[0]?.stlFile}</p>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm bg-muted p-3 rounded-lg">{order.notes}</p>
                  </div>
                )}

                {isEditing && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.tracking.map((track, index) => (
                    <div key={track.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(track.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium">{track.status}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(track.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{track.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Breakdown */}
            <PricingBreakdown
              manufacturerCost={order.manufacturerCost}
              sellingPrice={order.sellingPrice}
              profitPerUnit={order.profitPerUnit}
              quantity={order.orderItems[0]?.quantity || 1}
              manufacturingType={order.manufacturingType}
              onSellingPriceChange={(price) => setEditData(prev => ({ ...prev, sellingPrice: price }))}
              editable={isEditing && order.manufacturingType === "ON_DEMAND"}
            />

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/messages?order=${order.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Manufacturer
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Implement STL download
                    console.log('Download STL for order:', order.id)
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download STL
                </Button>

                {order.manufacturingType === "ON_DEMAND" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleToggleActive}
                  >
                    {order.isActive ? (
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
                  </Button>
                )}

                {order.status === "PENDING" && order.manufacturingType === "AT_HOME" && (
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Order
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order ID:</span>
                  <span className="text-sm font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated:</span>
                  <span className="text-sm">{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Est. Delivery:</span>
                    <span className="text-sm">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Manufacturer Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="fixed bottom-6 right-6"
        >
          <Link href={`/messages?order=${order.id}`}>
            <Button size="lg" className="rounded-full shadow-lg">
              <MessageSquare className="w-5 h-5 mr-2" />
              Message Manufacturer
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
