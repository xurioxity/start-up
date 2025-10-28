import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireManufacturerAuth } from "@/lib/manufacturer-auth"

export const GET = requireManufacturerAuth(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    const manufacturerId = session?.user?.id
    
    if (!manufacturerId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const orderId = searchParams.get('orderId')

    if (sellerId) {
      // Get messages with specific seller
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: sellerId, receiverId: manufacturerId },
            { senderId: manufacturerId, receiverId: sellerId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          order: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: sellerId,
          receiverId: manufacturerId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({ messages })
    }

    // Get all conversations for manufacturer
    const conversations = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        OR: [
          { senderId: { not: manufacturerId } },
          { receiverId: { not: manufacturerId } }
        ]
      },
      _count: {
        id: true
      },
      _max: {
        createdAt: true
      }
    })

    // Get unread counts
    const unreadCounts = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        senderId: { not: manufacturerId },
        receiverId: manufacturerId,
        isRead: false
      },
      _count: {
        id: true
      }
    })

    // Get seller details for each conversation
    const sellerIds = conversations.map(c => c.senderId).filter(id => id !== manufacturerId)
    const sellers = await prisma.user.findMany({
      where: {
        id: { in: sellerIds },
        role: 'SELLER'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    const conversationList = conversations.map(conv => {
      const seller = sellers.find(s => s.id === conv.senderId)
      const unreadCount = unreadCounts.find(u => u.senderId === conv.senderId)?._count.id || 0

      return {
        sellerId: conv.senderId,
        seller: seller || { id: conv.senderId, name: 'Unknown', email: 'N/A' },
        messageCount: conv._count.id,
        lastMessageAt: conv._max.createdAt,
        unreadCount
      }
    })

    return NextResponse.json({ conversations: conversationList })

  } catch (error) {
    console.error("Manufacturer Messages API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})

export const POST = requireManufacturerAuth(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    const manufacturerId = session?.user?.id
    
    if (!manufacturerId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { content, receiverId, orderId } = await request.json()

    if (!content || !receiverId) {
      return NextResponse.json(
        { message: "Content and receiver ID are required" },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: manufacturerId,
        receiverId,
        orderId: orderId || null,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        order: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({ message })

  } catch (error) {
    console.error("Send message API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
})
