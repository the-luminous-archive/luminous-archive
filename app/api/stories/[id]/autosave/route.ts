import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { storyAutosaveSchema } from "@/lib/validations/story"

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
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = storyAutosaveSchema.parse(body)

    await db.post.update({
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

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation error: ${error.errors[0].message}` },
        { status: 400 }
      )
    }

    console.error('[stories-autosave-api] Error:', error)
    return NextResponse.json(
      { error: "Autosave failed" },
      { status: 500 }
    )
  }
}
