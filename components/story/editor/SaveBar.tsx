"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface SaveBarProps {
  isSaving: boolean
  lastSavedAt: Date | null
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED"
  onPublish: () => void
  onUnpublish: () => void
  onPreview: () => void
  onDelete?: () => void
  isPublishing: boolean
  className?: string
}

export function SaveBar({
  isSaving,
  lastSavedAt,
  status,
  onPublish,
  onUnpublish,
  onPreview,
  onDelete,
  isPublishing,
  className,
}: SaveBarProps) {
  const getSaveStatus = () => {
    if (isSaving) {
      return (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icons.spinner className="h-3 w-3 animate-spin" />
          Saving...
        </span>
      )
    }

    if (lastSavedAt) {
      return (
        <span className="text-sm text-muted-foreground">
          Last saved {format(lastSavedAt, "h:mm a")}
        </span>
      )
    }

    return (
      <span className="text-sm text-muted-foreground">
        Not saved yet
      </span>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {getSaveStatus()}
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              status === "PUBLISHED" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
              status === "DRAFT" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
              status === "IN_REVIEW" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
            )}
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                status === "PUBLISHED" && "bg-green-500",
                status === "DRAFT" && "bg-yellow-500",
                status === "IN_REVIEW" && "bg-blue-500"
              )}
            />
            {status === "PUBLISHED" && "Published"}
            {status === "DRAFT" && "Draft"}
            {status === "IN_REVIEW" && "In Review"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && status === "DRAFT" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isSaving || isPublishing}
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            disabled={isSaving || isPublishing}
          >
            <Icons.eye className="mr-2 h-4 w-4" />
            Preview
          </Button>

          {status === "PUBLISHED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onUnpublish}
              disabled={isSaving || isPublishing}
            >
              {isPublishing ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.arrowDown className="mr-2 h-4 w-4" />
              )}
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onPublish}
              disabled={isSaving || isPublishing}
            >
              {isPublishing ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.check className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
