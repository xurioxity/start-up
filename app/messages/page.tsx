"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  orderId?: string
  isRead: boolean
  createdAt: string
  sender: {
    name: string
    email: string
  }
  order?: {
    id: string
    status: string
    manufacturingType: string
    totalAmount: number
  }
}

function MessagesContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    const orderId = searchParams.get('order')
    if (orderId) {
      setSelectedOrderId(orderId)
    }

    fetchMessages()
  }, [session, status, router, searchParams])

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setIsSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          orderId: selectedOrderId
        })
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const unsendMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        // Refresh messages after successful deletion
        fetchMessages()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to delete message")
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
      alert("Failed to delete message")
    }
  }

  const canUnsend = (message: Message) => {
    if (message.senderId !== session?.user?.id) return false
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    return new Date(message.createdAt) > threeHoursAgo
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "CONFIRMED": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "IN_PRODUCTION": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "QUALITY_CHECK": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "DELIVERED": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-3 h-3" />
      case "CONFIRMED": return <CheckCircle className="w-3 h-3" />
      case "IN_PRODUCTION": return <Package className="w-3 h-3" />
      case "QUALITY_CHECK": return <AlertCircle className="w-3 h-3" />
      case "DELIVERED": return <CheckCircle className="w-3 h-3" />
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

  if (!session) {
    return null
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
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-2">
                  <MessageSquare className="w-8 h-8" />
                  <span>Messages</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Chat with the manufacturer
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {messages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground text-center">
                  Start a conversation with the manufacturer about your orders.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.senderId === session.user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.senderId === session.user.id ? 'ml-auto' : 'mr-auto'}`}>
                    <Card className={`${message.senderId === session.user.id ? 'bg-primary text-primary-foreground' : ''}`}>
                      <CardContent className="p-4">
                        {/* Order Context */}
                        {message.order && (
                          <div className="mb-3 p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Link 
                                href={`/orders?order=${message.order.id}`}
                                className="text-sm font-medium text-blue-500 hover:text-blue-600 underline cursor-pointer"
                              >
                                Order #{message.order.id.slice(-8)}
                              </Link>
                              <Badge className={getStatusColor(message.order.status)}>
                                {getStatusIcon(message.order.status)}
                                <span className="ml-1">{message.order.status}</span>
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.order.manufacturingType} • ₹{message.order.totalAmount}
                            </div>
                          </div>
                        )}
                        
                        {/* Message Content */}
                        <div className="flex items-start justify-between">
                          <p className="text-sm flex-1">{message.content}</p>
                          {canUnsend(message) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unsendMessage(message.id)}
                              className="ml-2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <div className="text-xs opacity-70 mt-2">
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isSending}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedOrderId && (
                <div className="mt-2 text-xs text-muted-foreground">
                  💡 This message will be linked to your order
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}