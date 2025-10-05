import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { storyPublishActionSchema } from "@/lib/validations/story"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = storyPublishActionSchema.parse(body)

    // Verify ownership
    const existing = await db.post.findUnique({
      where: { id: params.id },
      select: {
        authorId: true,
        title: true,
        content: true,
        anonymityMode: true,
        licenseType: true,
        revision: true,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      )
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only publish your own stories" },
        { status: 403 }
      )
    }

    if (action === "publish") {
      // Validate required fields for publishing
      if (!existing.anonymityMode || !existing.licenseType) {
        return NextResponse.json(
          { error: "Anonymity mode and license are required for publishing" },
          { status: 400 }
        )
      }

      if (!existing.content) {
        return NextResponse.json(
          { error: "Story content is required for publishing" },
          { status: 400 }
        )
      }

      // Generate slug if not exists
      let slug = generateSlug(existing.title)
      
      // Ensure slug uniqueness
      let slugExists = await db.post.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })

      let counter = 1
      while (slugExists) {
        slug = `${generateSlug(existing.title)}-${counter}`
        slugExists = await db.post.findFirst({
          where: {
            slug,
            id: { not: params.id },
          },
        })
        counter++
      }

      const updated = await db.post.update({
        where: { id: params.id },
        data: {
          status: "PUBLISHED",
          published: true,
          publishedAt: new Date(),
          slug,
          revision: existing.revision + 1,
        },
      })

      return NextResponse.json({
        success: true,
        id: updated.id,
        slug: updated.slug,
      })
    } else if (action === "unpublish") {
      const updated = await db.post.update({
        where: { id: params.id },
        data: {
          status: "DRAFT",
          published: false,
          // Keep publishedAt and slug for history
        },
      })

      return NextResponse.json({
        success: true,
        id: updated.id,
      })
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation error: ${error.errors[0].message}` },
        { status: 400 }
      )
    }

    console.error('[stories-publish-api] Error:', error)
    return NextResponse.json(
      { error: "Failed to publish/unpublish story" },
      { status: 500 }
    )
  }
}
