import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManufacturerAuth } from "@/lib/manufacturer-auth"

export const GET = requireManufacturerAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const viewMode = searchParams.get('view') || 'stats'

    // Get all orders from all sellers
    const orders = await prisma.order.findMany({
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
          },
          take: 1
        }
      },
      orderBy: [
        { priority: 'desc' }, // HIGH, MEDIUM, LOW
        { createdAt: 'desc' }
      ]
    })

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      confirmedOrders: orders.filter(o => o.status === 'CONFIRMED').length,
      inProductionOrders: orders.filter(o => o.status === 'IN_PRODUCTION').length,
      qualityCheckOrders: orders.filter(o => o.status === 'QUALITY_CHECK').length,
      deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
      cancelledOrders: orders.filter(o => o.status === 'CANCELLED').length,
      highPriorityOrders: orders.filter(o => o.priority === 'HIGH').length,
      mediumPriorityOrders: orders.filter(o => o.priority === 'MEDIUM').length,
      lowPriorityOrders: orders.filter(o => o.priority === 'LOW').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      atHomeOrders: orders.filter(o => o.manufacturingType === 'AT_HOME').length,
      onDemandOrders: orders.filter(o => o.manufacturingType === 'ON_DEMAND').length,
      activeOrders: orders.filter(o => o.isActive).length
    }

    // Get unique sellers
    const sellers = await prisma.user.findMany({
      where: {
        role: 'SELLER',
        orders: {
          some: {}
        }
      },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    material: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Calculate seller statistics
    const sellerStats = sellers.map(seller => {
      const sellerOrders = seller.orders
      const materialCounts = sellerOrders.reduce((acc, order) => {
        order.orderItems.forEach(item => {
          const material = item.product.material
          acc[material] = (acc[material] || 0) + item.quantity
        })
        return acc
      }, {} as Record<string, number>)

      const preferredMaterial = Object.entries(materialCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

      return {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        totalOrders: sellerOrders.length,
        activeOrders: sellerOrders.filter(o => o.isActive).length,
        completedOrders: sellerOrders.filter(o => o.status === 'DELIVERED').length,
        totalRevenue: sellerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        preferredMaterial,
        lastOrderDate: sellerOrders.length > 0 
          ? sellerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
          : null,
        pendingOrders: sellerOrders.filter(o => o.status === 'PENDING').length
      }
    })

    // Group orders by seller for seller view
    const ordersBySeller = sellers.map(seller => ({
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email
      },
      orders: orders.filter(order => order.userId === seller.id),
      orderCount: orders.filter(order => order.userId === seller.id).length,
      pendingCount: orders.filter(order => order.userId === seller.id && order.status === 'PENDING').length
    }))

    // Group orders by status for status view
    const ordersByStatus = {
      PENDING: orders.filter(o => o.status === 'PENDING'),
      CONFIRMED: orders.filter(o => o.status === 'CONFIRMED'),
      IN_PRODUCTION: orders.filter(o => o.status === 'IN_PRODUCTION'),
      QUALITY_CHECK: orders.filter(o => o.status === 'QUALITY_CHECK'),
      SHIPPED: orders.filter(o => o.status === 'SHIPPED'),
      DELIVERED: orders.filter(o => o.status === 'DELIVERED'),
      CANCELLED: orders.filter(o => o.status === 'CANCELLED')
    }

    return NextResponse.json({
      stats,
      sellerStats,
      ordersBySeller,
      ordersByStatus,
      recentOrders: orders.slice(0, 10) // Last 10 orders
    })

  } catch (error) {
    console.error("Manufacturer dashboard API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})
