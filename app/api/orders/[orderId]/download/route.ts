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

    // Get order with STL file data
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
        }
      }
    })

    if (!order) {
      return NextResponse.json({ 
        message: "Order not found" 
      }, { status: 404 })
    }

    // Get STL file data from order items
    const stlFileData = order.orderItems[0]?.stlFileData
    const stlFileName = order.orderItems[0]?.stlFile || `${order.orderItems[0]?.product?.name || 'design'}.stl`

    if (!stlFileData) {
      return NextResponse.json({ 
        message: "STL file not found" 
      }, { status: 404 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(stlFileData, 'base64')

    // Return file as download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${stlFileName}"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error("Download STL error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
