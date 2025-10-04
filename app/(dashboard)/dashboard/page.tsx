import Link from "next/link"
import { redirect } from "next/navigation"
import { FileText, BookOpen, HelpCircle } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardShell } from "@/components/shell"
import { StoryCard } from "@/components/dashboard/story-card"
import { ExportButton } from "@/components/dashboard/export-button"
import { PostCreateButton } from "@/components/post-create-button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  const stories = await db.post.findMany({
    where: {
      authorId: user.id,
    },
    select: {
      id: true,
      title: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
  })

  // Map published to status for display
  const storiesWithStatus = stories.map(s => ({
    ...s,
    status: s.published ? "PUBLISHED" : "DRAFT"
  }))

  const latestDraft = storiesWithStatus.find((s) => s.status === "DRAFT")
  const draftCount = storiesWithStatus.filter((s) => s.status === "DRAFT").length
  const inReviewCount = 0 // No in-review status without migration

  return (
    <DashboardShell>
      <div className="grid gap-8">
        {/* Welcome Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome back, {user.name || "Contributor"}
            </CardTitle>
            <CardDescription>
              Your contributions help preserve first-person visionary experiences
              for future generations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="secondary">Contributor</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Total Stories:
                </span>
                <span className="font-medium">{stories.length}</span>
              </div>
              <Link
                href="/dashboard/settings"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                Manage preferences
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Stories Snapshot */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-semibold tracking-tight">
                My Stories
              </h2>
              <p className="text-sm text-muted-foreground">
                {draftCount} draft{draftCount !== 1 ? "s" : ""},{" "}
                {inReviewCount} in review
              </p>
            </div>
            <Link
              href="/dashboard/stories"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View All
            </Link>
          </div>

          {stories.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[200px] flex-col items-center justify-center space-y-4 p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">No stories yet</p>
                  <p className="text-sm text-muted-foreground">
                    Begin a draft — every journey starts in honesty.
                  </p>
                </div>
                <PostCreateButton />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {storiesWithStatus.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to help you contribute and preserve your experiences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <PostCreateButton className="justify-start" />
              {latestDraft && (
                <Link
                  href={`/editor/${latestDraft.id}`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Continue Writing
                </Link>
              )}
              <ExportButton />
            </div>
          </CardContent>
        </Card>

        {/* Guidance Links */}
        <Card>
          <CardHeader>
            <CardTitle>Resources & Guidance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link
                href="/docs"
                className="flex items-center gap-2 rounded-md p-3 text-sm hover:bg-accent"
              >
                <BookOpen className="h-4 w-4" />
                Submission Guidelines
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-2 rounded-md p-3 text-sm hover:bg-accent"
              >
                <FileText className="h-4 w-4" />
                Taxonomy Browser
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-2 rounded-md p-3 text-sm hover:bg-accent"
              >
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
