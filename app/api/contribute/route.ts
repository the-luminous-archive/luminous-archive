import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { contributeSchema } from "@/lib/validations/contribute"

const debug = process.env.NODE_ENV !== 'production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (debug) {
      console.log('[contribute-api] incoming data:', {
        title: body.title?.slice(0, 80),
        contentLength: body.content?.length,
      })
    }

    // getCurrentUser works fine in API routes
    const user = await getCurrentUser()

    if (!user?.id) {
      if (debug) console.error('[contribute-api] AUTH_REQUIRED: no user.id')
      return NextResponse.json(
        { success: false, error: "AUTH_REQUIRED: You must be signed in to contribute a story." },
        { status: 401 }
      )
    }

    if (debug) {
      console.log('[contribute-api] user authenticated:', { userId: user.id })
    }

    const validated = contributeSchema.parse(body)

    if (debug) {
      console.log('[contribute-api] validation passed, creating post...')
    }

    const post = await db.post.create({
      data: {
        title: validated.title,
        content: validated.content,
        published: false,
        authorId: user.id,
      },
    })

    if (debug) {
      console.log('[contribute-api] post created successfully:', { postId: post.id })
    }

    return NextResponse.json({
      success: true,
      postId: post.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0].message
      if (debug) console.error('[contribute-api] VALIDATION_ERROR:', error.flatten())
      return NextResponse.json(
        { success: false, error: `VALIDATION_ERROR: ${message}` },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (debug) {
      console.error('[contribute-api] DB_ERROR:', errorMessage, error)
    }

    return NextResponse.json(
      { success: false, error: `DB_ERROR: ${errorMessage}` },
      { status: 500 }
    )
  }
}
