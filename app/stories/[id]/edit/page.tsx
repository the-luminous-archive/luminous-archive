import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { StoryEditor } from "@/components/story/editor/StoryEditor"

export const metadata = {
  title: "Edit Story",
  description: "Edit your story",
}

interface EditStoryPageProps {
  params: {
    id: string
  }
}

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?from=/stories/${params.id}/edit`)
  }

  const story = await db.post.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      layers: true,
      motifs: true,
      feelings: true,
      anonymityMode: true,
      licenseType: true,
      consentResearch: true,
      consentLLM: true,
      publishedAt: true,
      authorId: true,
    },
  })

  if (!story) {
    notFound()
  }

  // Only author can edit
  if (story.authorId !== user.id) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You can only edit your own stories.
          </p>
        </div>
      </div>
    )
  }

  return <StoryEditor mode="edit" story={story} userId={user.id} />
}
