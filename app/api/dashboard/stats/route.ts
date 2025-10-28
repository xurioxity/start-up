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

    const userId = session.user.id

    // Get order statistics
    const [
      totalOrders, 
      pendingOrders, 
      completedOrders, 
      totalRevenue,
      atHomeOrders,
      onDemandOrders,
      activeOnDemandListings,
      totalProfit
    ] = await Promise.all([
      prisma.order.count({
        where: { userId }
      }),
      prisma.order.count({
        where: { 
          userId,
          status: { in: ["PENDING", "CONFIRMED", "IN_PRODUCTION", "QUALITY_CHECK"] }
        }
      }),
      prisma.order.count({
        where: { 
          userId,
          status: "DELIVERED"
        }
      }),
      prisma.order.aggregate({
        where: { 
          userId,
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.count({
        where: { 
          userId,
          manufacturingType: "AT_HOME"
        }
      }),
      prisma.order.count({
        where: { 
          userId,
          manufacturingType: "ON_DEMAND"
        }
      }),
      prisma.order.count({
        where: { 
          userId,
          manufacturingType: "ON_DEMAND",
          isActive: true
        }
      }),
      prisma.order.aggregate({
        where: { 
          userId,
          manufacturingType: "ON_DEMAND",
          status: "DELIVERED"
        },
        _sum: {
          profitPerUnit: true
        }
      })
    ])

    // Get recent orders
    console.log("Dashboard Stats - User ID:", userId)
    const recentOrders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })
    console.log("Dashboard Stats - Recent orders found:", recentOrders.length)

    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      productName: order.orderItems[0]?.product?.name || "Unknown Product"
    }))

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        atHomeOrders,
        onDemandOrders,
        activeOnDemandListings,
        totalProfit: totalProfit._sum.profitPerUnit || 0
      },
      recentOrders: formattedOrders
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
