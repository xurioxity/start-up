import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "MANUFACTURER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()
    const { orderId } = params

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    // Create tracking entry
    const statusMessages = {
      "CONFIRMED": "Order confirmed and production started",
      "IN_PRODUCTION": "Order is now in production",
      "QUALITY_CHECK": "Order completed, undergoing quality check",
      "SHIPPED": "Order has been shipped to customer"
    }

    await prisma.tracking.create({
      data: {
        orderId,
        status: status.replace('_', ' '),
        description: statusMessages[status as keyof typeof statusMessages] || "Order status updated"
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Order status update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
