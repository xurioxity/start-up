import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeSTLFile, calculateCost } from "@/lib/stl-calculator"

export async function POST(request: NextRequest) {
  try {
    console.log("=== ORDER CREATION STARTED ===")
    
    // Get session
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Found" : "Not found")
    
    if (!session || !session.user?.id) {
      console.log("No valid session found")
      return NextResponse.json({ 
        message: "Please sign in to create an order" 
      }, { status: 401 })
    }

    console.log("User authenticated:", session.user.email)

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const material = formData.get('material') as string
    const quantity = parseInt(formData.get('quantity') as string) || 1
    const notes = formData.get('notes') as string
    const manufacturingType = formData.get('manufacturingType') as string || "ON_DEMAND"
    const sellingPrice = parseFloat(formData.get('sellingPrice') as string) || 0
    const saveDesign = formData.get('saveDesign') === 'true'
    const designName = formData.get('designName') as string

    console.log("Form data:", {
      fileName: file?.name,
      fileSize: file?.size,
      material,
      quantity,
      notes,
      manufacturingType,
      sellingPrice,
      saveDesign,
      designName
    })

    // Validate required fields
    if (!file || !material) {
      return NextResponse.json({
        message: "Missing required fields: file and material are required"
      }, { status: 400 })
    }

    // Validate manufacturing type specific requirements
    if (manufacturingType === "AT_HOME" && !quantity) {
      return NextResponse.json({
        message: "Quantity is required for At Home Manufacturing"
      }, { status: 400 })
    }

    if (manufacturingType === "ON_DEMAND" && sellingPrice <= 0) {
      return NextResponse.json({
        message: "Selling price is required for On Demand Manufacturing"
      }, { status: 400 })
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        message: "File size too large. Maximum size is 10MB."
      }, { status: 400 })
    }

    // Convert file to base64 for storage
    console.log("Converting file to base64...")
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    console.log("File converted, size:", base64Data.length)

    // Analyze STL file to get accurate pricing
    console.log("Analyzing STL file for pricing...")
    let calculatedPrice = 50 // Default fallback price
    let stlAnalysis = null
    
    try {
      stlAnalysis = await analyzeSTLFile(file, material)
      calculatedPrice = calculateCost(stlAnalysis.weight, material, quantity)
      console.log("STL analysis completed:", {
        weight: stlAnalysis.weight,
        volume: stlAnalysis.volume,
        calculatedPrice: calculatedPrice
      })
    } catch (analysisError) {
      console.warn("STL analysis failed, using default pricing:", analysisError)
    }

    // Create product
    console.log("Creating product...")
    const product = await prisma.product.create({
      data: {
        name: `Custom Design - ${file.name}`,
        description: `Custom 3D printed design from ${file.name}`,
        category: "Custom",
        material: material,
        price: calculatedPrice,
        image: null
      }
    })
    console.log("Product created:", product.id)

    // Calculate profit per unit for ON_DEMAND orders
    const profitPerUnit = manufacturingType === "ON_DEMAND" ? sellingPrice - calculatedPrice : null
    
    // Calculate total amount based on manufacturing type
    const totalAmount = manufacturingType === "AT_HOME" 
      ? calculatedPrice * quantity 
      : sellingPrice // For ON_DEMAND, totalAmount is the selling price

    // Create order
    console.log("Creating order...")
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        totalAmount: totalAmount,
        notes: notes || null,
        manufacturerCost: calculatedPrice,
        sellingPrice: manufacturingType === "ON_DEMAND" ? sellingPrice : null,
        profitPerUnit: profitPerUnit,
        isActive: true,
        estimatedDelivery: manufacturingType === "AT_HOME" 
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          : null,
        orderItems: {
          create: {
            productId: product.id,
            quantity: quantity,
            price: manufacturingType === "AT_HOME" ? calculatedPrice : sellingPrice,
            stlFile: file.name,
            stlFileData: base64Data,
            notes: notes || null
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })
    console.log("Order created:", order.id)

    // Create tracking entry
    console.log("Creating tracking entry...")
    await prisma.tracking.create({
      data: {
        orderId: order.id,
        status: "Order Received",
        description: "Your order has been received and is being reviewed"
      }
    })
    console.log("Tracking entry created")

    // Save design to library if requested
    if (saveDesign) {
      console.log("Saving design to library...")
      try {
        await prisma.savedDesign.create({
          data: {
            userId: session.user.id,
            name: designName || `Design from ${file.name}`,
            description: notes || null,
            stlFile: file.name,
            stlFileData: base64Data,
            material: material,
            weight: stlAnalysis?.weight || null,
            volume: stlAnalysis?.volume || null
          }
        })
        console.log("Design saved to library")
      } catch (error) {
        console.warn("Failed to save design to library:", error)
        // Don't fail the order creation if design saving fails
      }
    }

    console.log("=== ORDER CREATION COMPLETED SUCCESSFULLY ===")
    return NextResponse.json({
      success: true,
      order: order
    })

  } catch (error) {
    console.error("=== ORDER CREATION ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({
      message: "Failed to create order",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}