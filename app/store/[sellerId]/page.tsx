"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface StorePageProps {
  params: {
    sellerId: string
    productId?: string
  }
}

export default function StorePage({ params }: StorePageProps) {
  const router = useRouter()

  useEffect(() => {
    // For now, redirect to dashboard
    // This will be replaced with actual store UI later
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Store Coming Soon...</h1>
        <p className="text-muted-foreground">
          Seller: {params.sellerId}
          {params.productId && <><br />Product: {params.productId}</>}
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          This will show the seller's store and products in the future.
        </p>
      </div>
    </div>
  )
}
