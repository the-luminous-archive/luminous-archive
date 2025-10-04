"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function DashboardLink() {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[DashboardLink] Button clicked")
    console.log("[DashboardLink] Current URL:", window.location.href)
    console.log("[DashboardLink] Attempting to navigate to /dashboard")
    
    try {
      router.push("/dashboard")
      console.log("[DashboardLink] router.push() called successfully")
    } catch (error) {
      console.error("[DashboardLink] Error during navigation:", error)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "px-4"
      )}
      type="button"
    >
      Dashboard
    </button>
  )
}
