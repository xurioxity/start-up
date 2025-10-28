import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManufacturerAuth } from "@/lib/manufacturer-auth"

export const GET = requireManufacturerAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const priority = searchParams.get('priority') || ''
    const status = searchParams.get('status') || ''
    const sellerId = searchParams.get('sellerId') || ''
    const manufacturingType = searchParams.get('manufacturingType') || ''
    const material = searchParams.get('material') || ''
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (priority && priority !== 'ALL') {
      where.priority = priority
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (sellerId) {
      where.userId = sellerId
    }

    if (manufacturingType && manufacturingType !== 'ALL') {
      where.manufacturingType = manufacturingType
    }

    if (material) {
      where.orderItems = {
        some: {
          product: {
            material: {
              contains: material,
              mode: 'insensitive'
            }
          }
        }
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { orderItems: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } }
      ]
    }

    // Fetch orders with all related data
    const orders = await prisma.order.findMany({
      where,
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
        },
        tracking: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: [
        { priority: 'desc' }, // HIGH, MEDIUM, LOW
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.order.count({ where })

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Manufacturer orders API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})

export const PATCH = requireManufacturerAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { orderIds, updates } = body

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { message: "Order IDs array is required" },
        { status: 400 }
      )
    }

    // Update multiple orders
    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        ...updates,
        lastStatusChange: new Date(),
        statusUpdatedBy: 'MANUFACTURER'
      }
    })

    // Create tracking entries for status changes
    if (updates.status) {
      await prisma.tracking.createMany({
        data: orderIds.map(orderId => ({
          orderId,
          status: updates.status,
          description: `Status updated to ${updates.status} by manufacturer`,
          timestamp: new Date()
        }))
      })
    }

    return NextResponse.json({
      message: `${updatedOrders.count} orders updated successfully`,
      updatedCount: updatedOrders.count
    })

  } catch (error) {
    console.error("Bulk update orders API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})
