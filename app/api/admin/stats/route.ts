import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get all stats
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      activeUsers,
      completedOrders
    ] = await Promise.all([
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

    // Get recent activity (simplified for MVP)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    const recentActivity = recentOrders.map(order => ({
      id: order.id,
      type: "order",
      description: `New order created by ${order.user.name}`,
      timestamp: order.createdAt.toISOString(),
      user: order.user.name || "Unknown"
    }))

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingOrders,
        activeUsers,
        completedOrders
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
