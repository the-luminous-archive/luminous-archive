import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { storyCreateSchema } from "@/lib/validations/story"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to create a story." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = storyCreateSchema.parse(body)

    const post = await db.post.create({
      data: {
        title: validated.title || "Untitled Story",
        content: validated.content || null,
        status: "DRAFT",
        published: false,
        authorId: user.id,
        // Initialize with defaults or provided values
        layers: body.layers || [],
        motifs: body.motifs || [],
        feelings: body.feelings || [],
        anonymityMode: body.anonymityMode || null,
        licenseType: body.licenseType || null,
        consentResearch: body.consentResearch ?? false,
        consentLLM: body.consentLLM ?? false,
      },
    })

    return NextResponse.json({ id: post.id, success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Validation error: ${error.errors[0].message}` },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[stories-api] Error:', errorMessage, error)

    return NextResponse.json(
      { error: `Failed to create story: ${errorMessage}` },
      { status: 500 }
    )
  }
}
