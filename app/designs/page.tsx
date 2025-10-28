"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DesignsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/ecommerce")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
}