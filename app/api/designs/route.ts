import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeSTLFile } from "@/lib/stl-calculator"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build where clause
    const where: any = { userId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get designs with pagination
    const [designs, totalCount] = await Promise.all([
      prisma.savedDesign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.savedDesign.count({ where })
    ])

    return NextResponse.json({
      designs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("Designs API error:", error)
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

    const userId = session.user.id
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const material = formData.get('material') as string

    if (!file || !name) {
      return NextResponse.json({
        message: "File and name are required"
      }, { status: 400 })
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        message: "File size too large. Maximum size is 10MB."
      }, { status: 400 })
    }

    // Convert file to base64 for storage
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    // Analyze STL file
    let stlAnalysis = null
    try {
      stlAnalysis = await analyzeSTLFile(file, material || 'pla')
    } catch (error) {
      console.warn("STL analysis failed:", error)
    }

    // Create saved design
    const design = await prisma.savedDesign.create({
      data: {
        userId,
        name,
        description: description || null,
        stlFile: file.name,
        stlFileData: base64Data,
        material: material || null,
        weight: stlAnalysis?.weight || null,
        volume: stlAnalysis?.volume || null
      }
    })

    return NextResponse.json({
      success: true,
      design
    })

  } catch (error) {
    console.error("Create design error:", error)
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

    const { designIds } = await request.json()
    
    if (!designIds || !Array.isArray(designIds)) {
      return NextResponse.json({
        message: "designIds array is required"
      }, { status: 400 })
    }

    // Delete designs
    await prisma.savedDesign.deleteMany({
      where: {
        id: { in: designIds },
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: designIds.length
    })

  } catch (error) {
    console.error("Delete designs error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
