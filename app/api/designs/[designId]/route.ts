import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { designId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, description, material } = await request.json()
    const designId = params.designId

    // Update the design
    const updatedDesign = await prisma.savedDesign.update({
      where: {
        id: designId,
        userId: session.user.id // Ensure user owns the design
      },
      data: {
        name,
        description,
        material
      }
    })

    return NextResponse.json({
      success: true,
      design: updatedDesign
    })

  } catch (error) {
    console.error("Update design error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { designId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const designId = params.designId

    // Delete the design
    await prisma.savedDesign.delete({
      where: {
        id: designId,
        userId: session.user.id // Ensure user owns the design
      }
    })

    return NextResponse.json({
      success: true,
      message: "Design deleted successfully"
    })

  } catch (error) {
    console.error("Delete design error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
