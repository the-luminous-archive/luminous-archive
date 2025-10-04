import { getCurrentUser } from "@/lib/session"
import { ContributeForm } from "./contribute-form"

export const metadata = {
  title: "Contribute a Story",
  description: "Share your visionary experience with The Luminous Archive.",
}

export default async function ContributePage() {
  const user = await getCurrentUser()

  return (
    <div className="container max-w-[64rem] py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-start gap-4">
        <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Contribute a Story
        </h1>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Share your first-person visionary experience with The Luminous Archive.
          Your story will be saved as a draft and you can continue editing it from your dashboard.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-[58rem]">
        <ContributeForm isAuthenticated={!!user} />
      </div>
    </div>
  )
}
