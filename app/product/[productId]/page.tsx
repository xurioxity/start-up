"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface ProductPageProps {
  params: {
    productId: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter()

  useEffect(() => {
    // For now, redirect to seller store page
    // This will be replaced with actual product UI later
    router.push(`/store/seller/${params.productId}`)
  }, [params.productId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Store...</h1>
        <p className="text-muted-foreground">This will show the product page in the future.</p>
      </div>
    </div>
  )
}
