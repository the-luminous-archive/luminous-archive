"use server"

import { z } from "zod"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

// Schema for creating a story
const createStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
})

// Schema for saving draft
const saveDraftSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  content: z.any().optional(),
})

// Schema for submitting for review
const submitForReviewSchema = z.object({
  id: z.string(),
})

export async function createStory(input: z.infer<typeof createStorySchema>) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      throw new Error("Unauthorized")
    }

    const { title } = createStorySchema.parse(input)

    const story = await db.post.create({
      data: {
        title,
        authorId: user.id,
        status: "DRAFT",
        published: false,
      },
      select: {
        id: true,
      },
    })

    return { success: true, storyId: story.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to create story" }
  }
}

export async function saveDraft(input: z.infer<typeof saveDraftSchema>) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      throw new Error("Unauthorized")
    }

    const { id, title, content } = saveDraftSchema.parse(input)

    // Verify ownership
    const story = await db.post.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!story || story.authorId !== user.id) {
      throw new Error("Unauthorized")
    }

    await db.post.update({
      where: { id },
      data: {
        title,
        content,
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to save draft" }
  }
}

export async function submitForReview(
  input: z.infer<typeof submitForReviewSchema>
) {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      throw new Error("Unauthorized")
    }

    const { id } = submitForReviewSchema.parse(input)

    // Verify ownership and validate story has required content
    const story = await db.post.findUnique({
      where: { id },
      select: {
        authorId: true,
        title: true,
        content: true,
      },
    })

    if (!story || story.authorId !== user.id) {
      throw new Error("Unauthorized")
    }

    if (!story.title || !story.content) {
      return {
        success: false,
        error: "Story must have a title and content before submission",
      }
    }

    await db.post.update({
      where: { id },
      data: {
        status: "IN_REVIEW",
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to submit story for review" }
  }
}

export async function exportMyData() {
  try {
    const user = await getCurrentUser()

    if (!user?.id) {
      throw new Error("Unauthorized")
    }

    const stories = await db.post.findMany({
      where: {
        authorId: user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        anonymityMode: true,
        licenseType: true,
        consentResearch: true,
        consentLLM: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      stories,
      metadata: {
        totalStories: stories.length,
        drafts: stories.filter((s) => s.status === "DRAFT").length,
        inReview: stories.filter((s) => s.status === "IN_REVIEW").length,
        published: stories.filter((s) => s.status === "PUBLISHED").length,
      },
    }

    return { success: true, data: exportData }
  } catch (error) {
    return { success: false, error: "Failed to export data" }
  }
}
