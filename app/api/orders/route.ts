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
    console.log("Orders API - Session user:", session.user)
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const manufacturingType = searchParams.get('manufacturingType')
    const status = searchParams.get('status')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = { userId }

    if (manufacturingType) {
      where.manufacturingType = manufacturingType
    }

    if (status) {
      where.status = status
    }

    if (isActive && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { orderItems: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } },
        { orderItems: { some: { stlFile: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    console.log("Orders API - Where clause:", where)
    console.log("Orders API - User ID:", userId)
    
    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where })
    ])
    
    console.log("Orders API - Found orders:", orders.length)
    console.log("Orders API - Total count:", totalCount)

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      manufacturingType: order.manufacturingType,
      manufacturerCost: order.manufacturerCost,
      sellingPrice: order.sellingPrice,
      profitPerUnit: order.profitPerUnit,
      isActive: order.isActive,
      totalAmount: order.totalAmount,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      productName: order.orderItems[0]?.product?.name || "Unknown Product",
      quantity: order.orderItems[0]?.quantity || 1,
      material: order.orderItems[0]?.product?.material || "Unknown"
    }))

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderIds } = await request.json()
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({
        message: "orderIds array is required"
      }, { status: 400 })
    }

    // Only allow deletion of PENDING AT_HOME orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        userId: session.user.id,
        status: "PENDING",
        manufacturingType: "AT_HOME"
      }
    })

    if (orders.length === 0) {
      return NextResponse.json({
        message: "No eligible orders found for deletion"
      }, { status: 404 })
    }

    // Delete orders
    await prisma.order.deleteMany({
      where: {
        id: { in: orders.map(o => o.id) }
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: orders.length
    })

  } catch (error) {
    console.error("Delete orders error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderIds, isActive } = await request.json()
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({
        message: "orderIds array is required"
      }, { status: 400 })
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({
        message: "isActive boolean is required"
      }, { status: 400 })
    }

    // Only allow toggling ON_DEMAND orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        userId: session.user.id,
        manufacturingType: "ON_DEMAND"
      }
    })

    if (orders.length === 0) {
      return NextResponse.json({
        message: "No eligible orders found for toggle"
      }, { status: 404 })
    }

    // Update orders
    await prisma.order.updateMany({
      where: {
        id: { in: orders.map(o => o.id) }
      },
      data: {
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount: orders.length
    })

  } catch (error) {
    console.error("Toggle orders error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
