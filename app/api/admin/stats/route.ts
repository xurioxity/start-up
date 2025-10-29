import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if we're in build mode or if database is not available
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({
        stats: {
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          activeUsers: 0,
          completedOrders: 0
        },
        recentActivity: []
      })
    }

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get all stats with error handling for each query
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      activeUsers,
      completedOrders
    ] = await Promise.allSettled([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.order.count({
        where: { status: "DELIVERED" }
      })
    ])

    // Handle potential failures in database queries
    const safeTotalUsers = totalUsers.status === 'fulfilled' ? totalUsers.value : 0
    const safeTotalOrders = totalOrders.status === 'fulfilled' ? totalOrders.value : 0
    const safeTotalRevenue = totalRevenue.status === 'fulfilled' ? (totalRevenue.value._sum.totalAmount || 0) : 0
    const safePendingOrders = pendingOrders.status === 'fulfilled' ? pendingOrders.value : 0
    const safeActiveUsers = activeUsers.status === 'fulfilled' ? activeUsers.value : 0
    const safeCompletedOrders = completedOrders.status === 'fulfilled' ? completedOrders.value : 0

    // Get recent activity with error handling
    let recentActivity: Array<{
      id: string
      type: string
      description: string
      timestamp: string
      user: string
    }> = []
    try {
      const recentOrders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true }
          }
        }
      })

      recentActivity = recentOrders.map(order => ({
        id: order.id,
        type: "order",
        description: `New order created by ${order.user.name}`,
        timestamp: order.createdAt.toISOString(),
        user: order.user.name || "Unknown"
      }))
    } catch (recentError) {
      console.error("Error fetching recent activity:", recentError)
      recentActivity = []
    }

    return NextResponse.json({
      stats: {
        totalUsers: safeTotalUsers,
        totalOrders: safeTotalOrders,
        totalRevenue: safeTotalRevenue,
        pendingOrders: safePendingOrders,
        activeUsers: safeActiveUsers,
        completedOrders: safeCompletedOrders
      },
      recentActivity
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
