import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManufacturerAuth } from "@/lib/manufacturer-auth"

export const GET = requireManufacturerAuth(async (request: NextRequest, { params }: { params: { orderId: string } }) => {
  try {
    const { orderId } = params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
                material: true,
                price: true
              }
            }
          }
        },
        tracking: {
          orderBy: {
            timestamp: 'desc'
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error("Get order details API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})

export const PATCH = requireManufacturerAuth(async (request: NextRequest, { params }: { params: { orderId: string } }) => {
  try {
    const { orderId } = params
    const body = await request.json()
    const { status, priority, notes, estimatedDelivery } = body

    // Get current order to track status changes
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    })

    if (!currentOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(notes && { notes }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        lastStatusChange: new Date(),
        statusUpdatedBy: 'MANUFACTURER'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                material: true
              }
            }
          }
        }
      }
    })

    // Create tracking entry if status changed
    if (status && status !== currentOrder.status) {
      await prisma.tracking.create({
        data: {
          orderId,
          status,
          description: `Status updated from ${currentOrder.status} to ${status} by manufacturer`,
          timestamp: new Date()
        }
      })
    }

    return NextResponse.json({ 
      message: "Order updated successfully",
      order: updatedOrder
    })

  } catch (error) {
    console.error("Update order API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})
