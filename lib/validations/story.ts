import * as z from "zod"
import { AnonymityMode, LicenseType, PostStatus } from "@prisma/client"

/**
 * Story validation schemas for the unified editor
 * Supports both create and edit modes with mode-aware validation
 */

// Base story schema for drafts (permissive)
export const storyDraftSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be less than 120 characters"),
  content: z.any().optional(), // EditorJS JSON or null
  layers: z.array(z.string()).default([]),
  motifs: z.array(z.string()).default([]),
  feelings: z.array(z.string()).default([]),
  anonymityMode: z.nativeEnum(AnonymityMode).optional(),
  licenseType: z.nativeEnum(LicenseType).optional(),
  consentResearch: z.boolean().default(false),
  consentLLM: z.boolean().default(false),
})

// Stricter schema for publishing (enforces required fields)
export const storyPublishSchema = storyDraftSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title must be less than 120 characters"),
  content: z.any().refine((val) => {
    // Ensure content exists and has blocks
    if (!val) return false
    if (typeof val === 'object' && 'blocks' in val) {
      return Array.isArray(val.blocks) && val.blocks.length > 0
    }
    return false
  }, "Story content is required for publishing"),
  anonymityMode: z.nativeEnum(AnonymityMode, {
    errorMap: () => ({ message: "Please select an anonymity mode" })
  }),
  licenseType: z.nativeEnum(LicenseType, {
    errorMap: () => ({ message: "Please select a license" })
  }),
})

// API request schemas
export const storyCreateSchema = z.object({
  title: z.string().min(1).max(120).optional().default("Untitled Story"),
  content: z.any().optional(),
})

export const storyUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  content: z.any().optional(),
  layers: z.array(z.string()).optional(),
  motifs: z.array(z.string()).optional(),
  feelings: z.array(z.string()).optional(),
  anonymityMode: z.nativeEnum(AnonymityMode).optional(),
  licenseType: z.nativeEnum(LicenseType).optional(),
  consentResearch: z.boolean().optional(),
  consentLLM: z.boolean().optional(),
})

export const storyAutosaveSchema = storyUpdateSchema

export const storyPublishActionSchema = z.object({
  action: z.enum(["publish", "unpublish"]),
})

// Type exports
export type StoryDraft = z.infer<typeof storyDraftSchema>
export type StoryPublish = z.infer<typeof storyPublishSchema>
export type StoryCreate = z.infer<typeof storyCreateSchema>
export type StoryUpdate = z.infer<typeof storyUpdateSchema>
export type StoryAutosave = z.infer<typeof storyAutosaveSchema>
export type StoryPublishAction = z.infer<typeof storyPublishActionSchema>
