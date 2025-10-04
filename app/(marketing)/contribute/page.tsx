import { DashboardShell } from "@/components/shell"

export const metadata = {
  title: "Contribute a Story",
  description: "Submit your visionary experience to The Luminous Archive",
}

export default function ContributePage() {
  return (
    <DashboardShell className="max-w-3xl">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl">
            Contribute a Story
          </h1>
        </div>
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <p className="text-lg text-muted-foreground">
            We are honored that you are considering sharing your visionary
            experience with The Luminous Archive.
          </p>

          <h2>Submissions Coming Soon</h2>
          <p>
            We are currently building the submission system with great care to
            ensure it properly honors contributor dignity, consent, and
            anonymity preferences. The submission portal will be available soon.
          </p>

          <h2>In the Meantime</h2>
          <p>
            If you would like to express interest in contributing or have
            questions about the submission process, please reach out to us at:
          </p>
          <p>
            <a
              href="mailto:luminous-archive@tuta.com"
              className="font-medium underline underline-offset-4"
            >
              luminous-archive@tuta.com
            </a>
          </p>

          <h2>What We&apos;re Building</h2>
          <p>The upcoming submission system will include:</p>
          <ul>
            <li>
              <strong>Consent verification:</strong> Clear attestation that your
              story is your own first-person experience
            </li>
            <li>
              <strong>Anonymity options:</strong> Choose to remain anonymous or
              use a pseudonym
            </li>
            <li>
              <strong>License selection:</strong> Select how you want your story
              to be shared (Creative Commons, etc.)
            </li>
            <li>
              <strong>Guided taxonomy:</strong> Help us understand your
              experience using our reverent classification system
            </li>
            <li>
              <strong>Story control:</strong> Update or withdraw your submission
              at any time
            </li>
          </ul>

          <p>
            Thank you for your patience as we build this with the care these
            experiences deserve.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}
