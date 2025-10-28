import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const messageId = params.messageId

    if (!messageId) {
      return NextResponse.json({ message: "Message ID is required" }, { status: 400 })
    }

    // Get the message to check ownership and timing
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, name: true }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 })
    }

    // Check if user is the sender
    if (message.senderId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to delete this message" }, { status: 403 })
    }

    // Check if message is within 3 hours (3 * 60 * 60 * 1000 milliseconds)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    if (message.createdAt < threeHoursAgo) {
      return NextResponse.json({ 
        message: "Cannot delete messages older than 3 hours" 
      }, { status: 400 })
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Message deleted successfully" 
    })

  } catch (error) {
    console.error("Delete message error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
