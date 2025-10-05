import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { StoryEditor } from "@/components/story/editor/StoryEditor"

export const metadata = {
  title: "New Story",
  description: "Create a new story for The Luminous Archive",
}

export default async function NewStoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?from=/stories/new")
  }

  return <StoryEditor mode="create" userId={user.id} />
}
