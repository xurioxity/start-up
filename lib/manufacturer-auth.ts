import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function withManufacturerAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "MANUFACTURER") {
      return NextResponse.json({ message: "Forbidden - Manufacturer access required" }, { status: 403 })
    }

    return await handler(request)
  } catch (error) {
    console.error("Manufacturer auth error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export function requireManufacturerAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    return withManufacturerAuth(request, (req) => handler(req, context))
  }
}
