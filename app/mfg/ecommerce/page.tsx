"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart,
  Factory,
  BarChart2,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

const upcomingFeatures = [
  {
    icon: Factory,
    title: "Bulk Order Management",
    description: "Process multiple orders simultaneously with automated workflows and batch processing capabilities.",
    status: "In Development",
    statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    icon: BarChart2,
    title: "Advanced Analytics",
    description: "Comprehensive reporting dashboard with sales trends, material usage analytics, and performance metrics.",
    status: "Planned",
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Real-time inventory tracking, automated reorder points, and material consumption monitoring.",
    status: "Planned",
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  },
  {
    icon: Users,
    title: "Seller Performance Tracking",
    description: "Monitor seller metrics, order completion rates, and customer satisfaction scores.",
    status: "Planned",
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  },
  {
    icon: TrendingUp,
    title: "Revenue Optimization",
    description: "Dynamic pricing suggestions, cost analysis tools, and profit margin optimization recommendations.",
    status: "Planned",
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  },
  {
    icon: CheckCircle,
    title: "Quality Control Automation",
    description: "Automated quality checks, defect tracking, and compliance monitoring systems.",
    status: "In Development",
    statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }
]

const currentStats = [
  {
    icon: Package,
    title: "Active Orders",
    value: "12",
    description: "Currently in production",
    color: "text-blue-400"
  },
  {
    icon: Users,
    title: "Active Sellers",
    value: "8",
    description: "Sellers with pending orders",
    color: "text-green-400"
  },
  {
    icon: TrendingUp,
    title: "Monthly Revenue",
    value: "₹45,230",
    description: "From all manufacturing",
    color: "text-purple-400"
  },
  {
    icon: Clock,
    title: "Avg. Processing Time",
    value: "3.2 days",
    description: "From order to delivery",
    color: "text-orange-400"
  }
]

export default function ManufacturerECommercePage() {
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
              <h1 className="text-4xl font-bold flex items-center space-x-3 gradient-text">
                <ShoppingCart className="w-10 h-10" />
                <span>Manufacturing Analytics</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Advanced manufacturing management and analytics platform
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                Coming Soon
              </Badge>
              <Link href="/mfg/dashboard">
                <Button variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Current Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Current Manufacturing Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentStats.map((stat, index) => (
              <Card key={index} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Advanced Manufacturing Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge className={feature.statusColor}>
                        {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center bg-card p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-4">Ready for Advanced Manufacturing?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            These advanced features will revolutionize your manufacturing workflow with automation, 
            analytics, and optimization tools designed specifically for 3D printing manufacturers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/mfg/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                <Factory className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Get Notified
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}