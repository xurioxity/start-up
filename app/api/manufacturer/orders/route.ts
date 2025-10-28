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

    if (session.user.role !== "MANUFACTURER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get orders assigned to this manufacturer
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "IN_PRODUCTION", "QUALITY_CHECK"]
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    // Get stats
    const [totalOrders, pendingOrders, inProduction, completedToday] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      prisma.order.count({
        where: { status: "IN_PRODUCTION" }
      }),
      prisma.order.count({
        where: {
          status: "DELIVERED",
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    return NextResponse.json({
      orders,
      stats: {
        totalOrders,
        pendingOrders,
        inProduction,
        completedToday
      }
    })
  } catch (error) {
    console.error("Manufacturer orders error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
