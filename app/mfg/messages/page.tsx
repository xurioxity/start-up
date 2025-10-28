"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare,
  Send,
  Users,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Package,
  AlertCircle,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface Conversation {
  sellerId: string
  seller: {
    id: string
    name: string
    email: string
  }
  messageCount: number
  lastMessageAt: string | null
  unreadCount: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  sender: {
    id: string
    name: string
    email: string
    role: string
  }
  receiver: {
    id: string
    name: string
    email: string
    role: string
  }
  order?: {
    id: string
    status: string
  }
}

function ManufacturerMessagesContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedSeller, setSelectedSeller] = useState<string | null>(
    searchParams.get('seller') || null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [orderId, setOrderId] = useState(searchParams.get('order') || "")

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

    fetchConversations()
  }, [session, status, router])

  useEffect(() => {
    if (selectedSeller) {
      fetchMessages(selectedSeller)
    }
  }, [selectedSeller])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSeller) {
        fetchMessages(selectedSeller, true) // Silent refresh
      }
      fetchConversations(true) // Silent refresh
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [selectedSeller])

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const response = await fetch("/api/mfg/messages")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const fetchMessages = async (sellerId: string, silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const response = await fetch(`/api/mfg/messages?sellerId=${sellerId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        console.error('Failed to fetch messages:', response.status, response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSeller) return

    try {
      setIsSending(true)
      const response = await fetch("/api/mfg/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim(),
          receiverId: selectedSeller,
          orderId: orderId || null
        })
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages(selectedSeller) // Refresh messages
        fetchConversations() // Refresh conversations to update unread counts
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
        if (selectedSeller) {
          fetchMessages(selectedSeller)
          fetchConversations()
        }
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
    if (message.sender.role !== session?.user?.role) return false
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    return new Date(message.createdAt) > threeHoursAgo
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedConversation = conversations.find(c => c.sellerId === selectedSeller)

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
            <div className="flex items-center space-x-4">
              <Link href="/mfg/dashboard">
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
                  Communicate with sellers about their orders
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{conversations.length} conversations</Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Sellers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {conversations.length > 0 ? (
                    conversations.map((conversation, index) => (
                      <motion.div
                        key={conversation.sellerId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-2 ${
                            selectedSeller === conversation.sellerId
                              ? 'border-primary bg-primary/5'
                              : 'border-transparent'
                          }`}
                          onClick={() => setSelectedSeller(conversation.sellerId)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{conversation.seller.name}</div>
                                <div className="text-xs text-muted-foreground">{conversation.seller.email}</div>
                              </div>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {conversation.messageCount} messages
                            {conversation.lastMessageAt && (
                              <span className="ml-2">
                                • {new Date(conversation.lastMessageAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm">No conversations yet</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {selectedSeller && selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedConversation.seller.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{selectedConversation.seller.email}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{selectedConversation.messageCount} messages</Badge>
                      <Link href={`/mfg/orders?seller=${selectedSeller}`}>
                        <Button variant="outline" size="sm">
                          <Package className="w-4 h-4 mr-2" />
                          View Orders
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length > 0 ? (
                        messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`flex ${message.sender.role === 'MANUFACTURER' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender.role === 'MANUFACTURER'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="text-sm font-medium flex-1">{message.content}</div>
                                {canUnsend(message) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => unsendMessage(message.id)}
                                    className={`ml-2 h-6 w-6 p-0 ${
                                      message.sender.role === 'MANUFACTURER'
                                        ? 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/20'
                                    }`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                              <div className={`text-xs mt-1 ${
                                message.sender.role === 'MANUFACTURER'
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}>
                                {new Date(message.createdAt).toLocaleString()}
                                {message.order && (
                                  <Link 
                                    href={`/mfg/orders?order=${message.order.id}`}
                                    className="ml-2 text-blue-500 hover:text-blue-600 underline cursor-pointer"
                                  >
                                    • Order #{message.order.id.slice(-8)}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                          <div>No messages yet</div>
                          <div className="text-sm">Start a conversation with {selectedConversation.seller.name}</div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="space-y-3">
                        {orderId && (
                          <div className="text-xs text-muted-foreground">
                            Order context: #{orderId.slice(-8)}
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Message ${selectedConversation.seller.name}...`}
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || isSending}
                            size="sm"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Seller</h3>
                    <p>Choose a seller from the sidebar to start messaging</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ManufacturerMessages() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <ManufacturerMessagesContent />
    </Suspense>
  )
}
