import Link from "next/link"
import { formatDistance } from "date-fns"

import { db } from "@/lib/db"

export const metadata = {
  title: "Stories",
  description: "First-person visionary experiences shared with The Luminous Archive.",
}

export default async function StoriesPage() {
  const stories = await db.post.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Stories
          </h1>
          <p className="text-xl text-muted-foreground">
            First-person visionary experiences shared with The Luminous Archive.
          </p>
        </div>
      </div>
      <hr className="my-8" />
      {stories.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            No stories have been published yet.
          </p>
          <Link
            href="/contribute"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
          >
            Contribute a story
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {stories.map((story) => (
            <article key={story.id} className="py-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {story.title}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {story.author.name && (
                    <>
                      <span>{story.author.name}</span>
                      <span>·</span>
                    </>
                  )}
                  <time dateTime={story.createdAt.toISOString()}>
                    {formatDistance(new Date(story.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
