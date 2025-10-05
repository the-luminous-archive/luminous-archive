import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { buttonVariants } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/story/common/Breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export const metadata = {
  title: "Preview Story",
  description: "Preview your story before publishing",
}

interface PreviewStoryPageProps {
  params: {
    id: string
  }
}

export default async function PreviewStoryPage({ params }: PreviewStoryPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?from=/stories/${params.id}/preview`)
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
      publishedAt: true,
      revision: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!story) {
    notFound()
  }

  // Only author can preview
  if (story.authorId !== user.id) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You can only preview your own stories.
          </p>
        </div>
      </div>
    )
  }

  // Render EditorJS content blocks (simplified)
  const renderContent = () => {
    if (!story.content) return null
    
    const content = story.content as any
    if (!content.blocks || !Array.isArray(content.blocks)) return null

    return content.blocks.map((block: any, index: number) => {
      switch (block.type) {
        case "header":
          const level = block.data.level || 2
          const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements
          return <HeaderTag key={index} className="font-bold mt-6 mb-2">{block.data.text}</HeaderTag>
        
        case "paragraph":
          return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />
        
        case "list":
          const ListTag = block.data.style === "ordered" ? "ol" : "ul"
          return (
            <ListTag key={index} className="mb-4 ml-6">
              {block.data.items.map((item: string, i: number) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ListTag>
          )
        
        case "code":
          return (
            <pre key={index} className="mb-4 p-4 bg-muted rounded-md overflow-x-auto">
              <code>{block.data.code}</code>
            </pre>
          )
        
        default:
          return null
      }
    })
  }

  return (
    <div className="min-h-screen">
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Stories", href: "/dashboard/stories" },
            { label: "Preview" },
          ]}
        />
      </div>

      <div className="container max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Preview</h1>
            <p className="text-sm text-muted-foreground">
              This is how your story will appear when published
            </p>
          </div>
          <Link 
            href={`/stories/${story.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Icons.chevronLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Link>
        </div>

        <Separator className="mb-8" />

        {/* Story Content */}
        <article className="prose prose-stone dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">{story.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span>Created {format(new Date(story.createdAt), "MMM d, yyyy")}</span>
            {story.publishedAt && (
              <span>• Published {format(new Date(story.publishedAt), "MMM d, yyyy")}</span>
            )}
            {story.revision > 1 && <span>• v{story.revision}</span>}
          </div>

          <div className="mb-8">
            {renderContent()}
          </div>
        </article>

        <Separator className="my-8" />

        {/* Metadata */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold mb-3">Taxonomy</h3>
            <div className="space-y-3">
              {story.layers.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Layers</div>
                  <div className="flex flex-wrap gap-1">
                    {story.layers.map((layer) => (
                      <Badge key={layer} variant="secondary">{layer}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {story.motifs.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Motifs</div>
                  <div className="flex flex-wrap gap-1">
                    {story.motifs.map((motif) => (
                      <Badge key={motif} variant="secondary">{motif}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {story.feelings.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Feelings</div>
                  <div className="flex flex-wrap gap-1">
                    {story.feelings.map((feeling) => (
                      <Badge key={feeling} variant="secondary">{feeling}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Privacy & Licensing</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Anonymity:</span>{" "}
                <span className="font-medium">{story.anonymityMode || "Not set"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">License:</span>{" "}
                <span className="font-medium">{story.licenseType?.replace(/_/g, " ") || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
