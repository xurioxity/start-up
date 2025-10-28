"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  ExternalLink,
  Package,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Store,
  Globe,
  Smartphone
} from "lucide-react"
import Link from "next/link"

interface EcommerceProduct {
  id: string
  name: string
  description?: string
  stlFile: string
  material?: string
  weight?: number
  volume?: number
  createdAt: string
  platforms: string[]
  status: 'ready' | 'syncing' | 'live'
}

export default function EcommercePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<EcommerceProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchEcommerceProducts()
  }, [session, status, router])

  const fetchEcommerceProducts = async () => {
    try {
      setIsLoading(true)
      // For now, we'll fetch from the designs API and transform them
      const response = await fetch('/api/designs')
      if (response.ok) {
        const data = await response.json()
        const ecommerceProducts = (data.designs || []).map((design: any) => ({
          ...design,
          platforms: ['amazon', 'meesho', 'flipkart'],
          status: 'ready' as const
        }))
        setProducts(ecommerceProducts)
      }
    } catch (error) {
      console.error("Failed to fetch ecommerce products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const platformInfo = {
    amazon: {
      name: "Amazon",
      icon: "🛒",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      description: "Reach millions of customers worldwide"
    },
    meesho: {
      name: "Meesho",
      icon: "📱",
      color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      description: "India's leading social commerce platform"
    },
    flipkart: {
      name: "Flipkart",
      icon: "🛍️",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      description: "India's largest e-commerce marketplace"
    }
  }

  const steps = [
    {
      icon: <Store className="w-6 h-6" />,
      title: "Connect Your Store",
      description: "Link your Vivelith account with e-commerce platforms",
      status: "coming-soon"
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Sync Products",
      description: "Automatically sync your 3D designs as sellable products",
      status: "coming-soon"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Manage Listings",
      description: "Optimize product listings, pricing, and inventory",
      status: "coming-soon"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Track Sales",
      description: "Monitor performance and customer feedback",
      status: "coming-soon"
    }
  ]

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
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <ShoppingCart className="w-8 h-8" />
                <span>E-Commerce</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Expand your reach with multi-platform selling
              </p>
            </div>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              <Zap className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>How E-Commerce Integration Works</span>
              </CardTitle>
              <CardDescription>
                Transform your 3D designs into sellable products across multiple platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {step.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                      Coming Soon
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Platform Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(platformInfo).map(([key, platform]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{platform.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <CardDescription className="text-sm">{platform.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={platform.color}>
                        Coming Soon
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        API Integration Ready
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Product Sync Capability
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        Order Management
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      disabled
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect {platform.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* E-Commerce Ready Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your E-Commerce Ready Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          E-Commerce Ready
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">File:</span>
                          <span className="font-medium">{product.stlFile}</span>
                        </div>
                        {product.material && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Material:</span>
                            <Badge variant="outline">{product.material.toUpperCase()}</Badge>
                          </div>
                        )}
                        {product.weight && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-medium">{product.weight.toFixed(1)}g</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Platforms:</div>
                        <div className="flex flex-wrap gap-1">
                          {product.platforms.map((platform) => (
                            <Badge 
                              key={platform} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {platformInfo[platform as keyof typeof platformInfo]?.name || platform}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Sync to Platforms
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement quick order
                            console.log('Quick order for product:', product.id)
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
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
              <h3 className="text-xl font-semibold mb-2">No E-Commerce products yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first product to start selling across platforms
              </p>
              <Link href="/upload">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Scale Your Business?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join the waitlist to be the first to know when our e-commerce integrations go live. 
                Get early access to Amazon, Meesho, and Flipkart integrations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" disabled>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/upload">
                    <Package className="w-4 h-4 mr-2" />
                    Create Your First Product
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
