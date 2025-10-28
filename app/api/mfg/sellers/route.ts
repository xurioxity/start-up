import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireManufacturerAuth } from "@/lib/manufacturer-auth"

export const GET = requireManufacturerAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    if (sellerId) {
      // Get specific seller details
      const seller = await prisma.user.findUnique({
        where: { 
          id: sellerId,
          role: 'SELLER'
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
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      if (!seller) {
        return NextResponse.json({ message: "Seller not found" }, { status: 404 })
      }

      // Calculate seller statistics
      const materialCounts = seller.orders.reduce((acc, order) => {
        order.orderItems.forEach(item => {
          const material = item.product.material
          acc[material] = (acc[material] || 0) + item.quantity
        })
        return acc
      }, {} as Record<string, number>)

      const preferredMaterial = Object.entries(materialCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

      const sellerStats = {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        createdAt: seller.createdAt,
        totalOrders: seller.orders.length,
        activeOrders: seller.orders.filter(o => o.isActive).length,
        completedOrders: seller.orders.filter(o => o.status === 'DELIVERED').length,
        pendingOrders: seller.orders.filter(o => o.status === 'PENDING').length,
        totalRevenue: seller.orders.reduce((sum, order) => sum + order.totalAmount, 0),
        preferredMaterial,
        lastOrderDate: seller.orders.length > 0 
          ? seller.orders[0].createdAt
          : null,
        orders: seller.orders
      }

      return NextResponse.json({ seller: sellerStats })
    }

    // Get all sellers with statistics
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

    const sellerStats = sellers.map(seller => {
      const materialCounts = seller.orders.reduce((acc, order) => {
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
        createdAt: seller.createdAt,
        totalOrders: seller.orders.length,
        activeOrders: seller.orders.filter(o => o.isActive).length,
        completedOrders: seller.orders.filter(o => o.status === 'DELIVERED').length,
        pendingOrders: seller.orders.filter(o => o.status === 'PENDING').length,
        totalRevenue: seller.orders.reduce((sum, order) => sum + order.totalAmount, 0),
        preferredMaterial,
        lastOrderDate: seller.orders.length > 0 
          ? seller.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
          : null
      }
    })

    return NextResponse.json({ sellers: sellerStats })

  } catch (error) {
    console.error("Sellers API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})
