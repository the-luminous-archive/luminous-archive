import { redirect } from "next/navigation"

export const metadata = {
  title: "Contribute a Story",
  description: "Share your visionary experience with The Luminous Archive.",
}

export default function ContributePage() {
  // Redirect to unified story editor
  redirect("/stories/new")
}
