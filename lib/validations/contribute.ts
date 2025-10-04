import * as z from "zod"

export const contributeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(128, "Title must be less than 128 characters"),
  content: z.string().min(10, "Story must be at least 10 characters"),
})

export type ContributeFormData = z.infer<typeof contributeSchema>
