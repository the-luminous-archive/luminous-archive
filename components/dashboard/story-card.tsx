import Link from "next/link"
import { formatDistance } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StoryCardProps {
  story: {
    id: string
    title: string
    status: string
    updatedAt: Date
    createdAt: Date
  }
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "outline" {
  switch (status) {
    case "PUBLISHED":
      return "default"
    case "IN_REVIEW":
      return "secondary"
    case "DRAFT":
    default:
      return "outline"
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "Published"
    case "IN_REVIEW":
      return "In Review"
    case "DRAFT":
    default:
      return "Draft"
  }
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="line-clamp-1">
              <Link
                href={`/editor/${story.id}`}
                className="hover:underline"
              >
                {story.title}
              </Link>
            </CardTitle>
            <CardDescription>
              Last edited{" "}
              {formatDistance(new Date(story.updatedAt), new Date(), {
                addSuffix: true,
              })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(story.status)}>
              {getStatusLabel(story.status)}
            </Badge>
            <Link
              href={`/editor/${story.id}`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Edit
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
