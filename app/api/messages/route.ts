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
    const { searchParams } = new URL(request.url)
    const manufacturerId = searchParams.get('manufacturerId')
    const orderId = searchParams.get('orderId')

    // Build where clause
    const where: any = {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }

    if (manufacturerId) {
      where.AND = [
        {
          OR: [
            { senderId: userId, receiverId: manufacturerId },
            { senderId: manufacturerId, receiverId: userId }
          ]
        }
      ]
    }

    if (orderId) {
      where.orderId = orderId
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { name: true, email: true }
        },
        receiver: {
          select: { name: true, email: true }
        },
        order: {
          select: { id: true, manufacturingType: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })

  } catch (error) {
    console.error("Messages API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find the manufacturer user - now there's only one (Aavi 3D)
    const { content, orderId, receiverId } = await request.json()
    
    if (!content) {
      return NextResponse.json({
        message: "Content is required"
      }, { status: 400 })
    }

    let manufacturer
    if (receiverId) {
      // If specific receiver is provided, use that
      manufacturer = await prisma.user.findUnique({
        where: { id: receiverId }
      })
    } else {
      // Find the only manufacturer (Aavi 3D)
      manufacturer = await prisma.user.findFirst({
        where: {
          role: 'MANUFACTURER'
        }
      })
    }

    if (!manufacturer) {
      return NextResponse.json({
        message: "Manufacturer not found"
      }, { status: 404 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: manufacturer.id,
        content,
        orderId: orderId || null
      },
      include: {
        sender: {
          select: { name: true, email: true }
        },
        receiver: {
          select: { name: true, email: true }
        },
        order: {
          select: {
            id: true,
            status: true,
            manufacturingType: true,
            totalAmount: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error("Create message error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
