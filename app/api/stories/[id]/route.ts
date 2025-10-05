import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { storyUpdateSchema } from "@/lib/validations/story"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const story = await db.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      )
    }

    // Only allow author to view drafts
    if (story.status === "DRAFT") {
      const user = await getCurrentUser()
      if (!user || user.id !== story.authorId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error('[stories-api-get] Error:', error)
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Verify ownership
    const existing = await db.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      )
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own stories" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = storyUpdateSchema.parse(body)

    const updated = await db.post.update({
      where: { id: params.id },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.content !== undefined && { content: validated.content }),
        ...(validated.layers !== undefined && { layers: validated.layers }),
        ...(validated.motifs !== undefined && { motifs: validated.motifs }),
        ...(validated.feelings !== undefined && { feelings: validated.feelings }),
        ...(validated.anonymityMode !== undefined && { anonymityMode: validated.anonymityMode }),
        ...(validated.licenseType !== undefined && { licenseType: validated.licenseType }),
        ...(validated.consentResearch !== undefined && { consentResearch: validated.consentResearch }),
        ...(validated.consentLLM !== undefined && { consentLLM: validated.consentLLM }),
        lastAutosaveAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, id: updated.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation error: ${error.errors[0].message}` },
        { status: 400 }
      )
    }

    console.error('[stories-api-patch] Error:', error)
    return NextResponse.json(
      { error: "Failed to update story" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verify ownership
    const existing = await db.post.findUnique({
      where: { id: params.id },
      select: { authorId: true, status: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      )
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own stories" },
        { status: 403 }
      )
    }

    // Only allow deleting drafts
    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft stories can be deleted" },
        { status: 400 }
      )
    }

    await db.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[stories-api-delete] Error:', error)
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    )
  }
}
