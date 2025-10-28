import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.orderId

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        tracking: {
          orderBy: { timestamp: 'desc' }
        },
        messages: {
          include: {
            sender: {
              select: { name: true, email: true }
            },
            receiver: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.orderId
    const { quantity, material, sellingPrice } = await request.json()

    // Check if order exists and is PENDING
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: "PENDING"
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!existingOrder) {
      return NextResponse.json({ 
        message: "Order not found or not editable" 
      }, { status: 404 })
    }

    // Update order based on manufacturing type
    const updateData: any = {}

    if (quantity && existingOrder.manufacturingType === "AT_HOME") {
      updateData.totalAmount = existingOrder.manufacturerCost * quantity
    }

    if (sellingPrice && existingOrder.manufacturingType === "ON_DEMAND") {
      updateData.sellingPrice = sellingPrice
      updateData.profitPerUnit = sellingPrice - existingOrder.manufacturerCost
      updateData.totalAmount = sellingPrice
    }

    if (material) {
      // Update the product material
      await prisma.product.update({
        where: { id: existingOrder.orderItems[0]?.productId },
        data: { material }
      })
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // Update order item quantity if provided
    if (quantity) {
      await prisma.orderItem.updateMany({
        where: { orderId },
        data: { quantity }
      })
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    })

  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.orderId

    // Check if order exists (allow delete for any status)
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id
      }
    })

    console.log("Delete order - Found order:", existingOrder)
    console.log("Delete order - Order type:", existingOrder?.manufacturingType)

    if (!existingOrder) {
      return NextResponse.json({ 
        message: "Order not found or not deletable" 
      }, { status: 404 })
    }

    // Delete order (cascade will handle related records)
    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Order deleted successfully" 
    })

  } catch (error) {
    console.error("Delete order error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
