import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { StoryCard } from "@/components/dashboard/story-card"
import { PostCreateButton } from "@/components/post-create-button"
import { EmptyPlaceholder } from "@/components/empty-placeholder"

export const metadata = {
  title: "My Stories",
  description: "View and manage your story submissions.",
}

export default async function StoriesPage() {
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
  })

  // Map published to status for display
  const storiesWithStatus = stories.map(s => ({
    ...s,
    status: s.published ? "PUBLISHED" : "DRAFT"
  }))

  const drafts = storiesWithStatus.filter((s) => s.status === "DRAFT")
  const inReview: typeof storiesWithStatus = [] // No in-review status without migration
  const published = storiesWithStatus.filter((s) => s.status === "PUBLISHED")

  return (
    <DashboardShell>
      <DashboardHeader
        heading="My Stories"
        text="Create and manage your story submissions."
      >
        <PostCreateButton />
      </DashboardHeader>
      <div className="space-y-8">
        {stories.length === 0 ? (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No stories yet</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Begin a draft — every journey starts in honesty.
            </EmptyPlaceholder.Description>
            <PostCreateButton variant="outline" />
          </EmptyPlaceholder>
        ) : (
          <>
            {drafts.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Drafts ({drafts.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Stories you&apos;re working on
                  </p>
                </div>
                <div className="space-y-3">
                  {drafts.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </div>
            )}

            {inReview.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    In Review ({inReview.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Stories awaiting curator review
                  </p>
                </div>
                <div className="space-y-3">
                  {inReview.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </div>
            )}

            {published.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Published ({published.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Stories preserved in the archive
                  </p>
                </div>
                <div className="space-y-3">
                  {published.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}
