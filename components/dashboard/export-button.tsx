"use client"

import { useState } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { exportMyData } from "@/lib/actions/stories"

export function ExportButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleExport() {
    setIsLoading(true)

    try {
      const result = await exportMyData()

      if (result.success && result.data) {
        // Create a downloadable JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `luminous-archive-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Export successful",
          description: "Your data has been downloaded as a JSON file.",
        })
      } else {
        toast({
          title: "Export failed",
          description: result.error || "Unable to export your data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isLoading} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? "Exporting..." : "Export My Data"}
    </Button>
  )
}
