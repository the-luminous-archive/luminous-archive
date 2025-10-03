import { DashboardShell } from "@/components/shell"

export const metadata = {
  title: "Our Mission",
  description: "The mission and values of The Luminous Archive",
}

export default function MissionPage() {
  return (
    <DashboardShell className="max-w-3xl">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl">
            Our Mission
          </h1>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground">
            The Luminous Archive exists to preserve and honor first-person
            accounts of visionary experiences — near-death experiences (NDEs)
            and psychedelic journeys — as sacred testimony deserving of
            reverence, not mere data points or content.
          </p>

          <h2>Reverence</h2>
          <p>
            Every story submitted to this archive represents a profound moment
            in someone&apos;s life. We approach these narratives with deep
            respect, treating them as windows into the mystery of consciousness
            and human experience. Our taxonomy and curation processes are
            designed to honor the integrity and meaning of each account.
          </p>

          <h2>Preservation</h2>
          <p>
            These experiences matter not just today, but for generations to
            come. We&apos;re building infrastructure for long-term digital
            preservation: checksummed exports, mirroring to institutional
            archives like Zenodo and the Internet Archive, and open formats
            that will remain accessible decades from now. This archive is
            designed to outlast any single organization or platform.
          </p>

          <h2>Contributor Dignity</h2>
          <p>
            Contributors maintain control over their stories. We enforce
            explicit consent, respect anonymity preferences, and provide clear
            licensing options. Stories can be withdrawn or updated at any time.
            We will never commodify these experiences or treat contributors as
            mere data sources. Their voices, their agency, their dignity —
            these are non-negotiable.
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}
