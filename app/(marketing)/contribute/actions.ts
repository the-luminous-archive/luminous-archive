"use server"

import { z } from "zod"

import { db } from "@/lib/db"
import { getUserForAction } from "@/lib/auth-action"
import { contributeSchema } from "@/lib/validations/contribute"

const debug = process.env.NODE_ENV !== 'production'

export async function createDraftStory(formData: z.infer<typeof contributeSchema>) {
  try {
    if (debug) {
      console.log('[contribute] incoming data:', {
        title: formData.title?.slice(0, 80),
        contentLength: formData.content?.length,
      })
    }

    const user = await getUserForAction()

    if (!user?.id) {
      if (debug) console.error('[contribute] AUTH_REQUIRED: no user.id')
      return {
        success: false,
        error: "AUTH_REQUIRED: You must be signed in to contribute a story.",
      }
    }

    if (debug) {
      console.log('[contribute] user authenticated:', { userId: user.id })
    }

    const validated = contributeSchema.parse(formData)

    if (debug) {
      console.log('[contribute] validation passed, creating post...')
    }

    const post = await db.post.create({
      data: {
        title: validated.title,
        content: validated.content, // String is valid for JSON column
        published: false,
        authorId: user.id,
      },
    })

    if (debug) {
      console.log('[contribute] post created successfully:', { postId: post.id })
    }

    return {
      success: true,
      postId: post.id,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0].message
      if (debug) console.error('[contribute] VALIDATION_ERROR:', error.flatten())
      return {
        success: false,
        error: `VALIDATION_ERROR: ${message}`,
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (debug) {
      console.error('[contribute] DB_ERROR:', errorMessage, error)
    }

    return {
      success: false,
      error: `DB_ERROR: ${errorMessage}`,
    }
  }
}
