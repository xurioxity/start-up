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

    const { searchParams } = new URL(request.url)
    const userId = session.user.id

    // Get orders updated in the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const recentUpdates = await prisma.order.findMany({
      where: {
        userId,
        lastStatusChange: {
          gte: yesterday
        }
      },
      include: {
        tracking: {
          where: {
            timestamp: {
              gte: yesterday
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        lastStatusChange: 'desc'
      }
    })

    const notifications = recentUpdates.map(order => ({
      orderId: order.id,
      orderNumber: order.id.slice(-8),
      status: order.status,
      lastStatusChange: order.lastStatusChange,
      statusUpdatedBy: order.statusUpdatedBy,
      recentTracking: order.tracking.slice(0, 3) // Last 3 tracking entries
    }))

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error("Notifications API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
