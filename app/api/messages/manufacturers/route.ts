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

    // Get unique manufacturers that user has messaged with
    const manufacturers = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      select: {
        sender: {
          select: { id: true, name: true, email: true, role: true }
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      distinct: ['senderId', 'receiverId']
    })

    // Filter to get only manufacturers (role = "MANUFACTURER")
    const manufacturerList = manufacturers
      .map(msg => [msg.sender, msg.receiver])
      .flat()
      .filter(user => user.role === "MANUFACTURER" && user.id !== userId)
      .reduce((acc, manufacturer) => {
        if (!acc.find(m => m.id === manufacturer.id)) {
          acc.push(manufacturer)
        }
        return acc
      }, [] as any[])

    // Get unread counts for each manufacturer
    const manufacturersWithUnread = await Promise.all(
      manufacturerList.map(async (manufacturer) => {
        const unreadCount = await prisma.message.count({
          where: {
            senderId: manufacturer.id,
            receiverId: userId,
            isRead: false
          }
        })

        return {
          ...manufacturer,
          unreadCount
        }
      })
    )

    return NextResponse.json({ manufacturers: manufacturersWithUnread })

  } catch (error) {
    console.error("Manufacturers API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
