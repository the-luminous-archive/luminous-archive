"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { cn } from "@/lib/utils"
import { contributeSchema, type ContributeFormData } from "@/lib/validations/contribute"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface ContributeFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isAuthenticated: boolean
}

export function ContributeForm({ isAuthenticated, className, ...props }: ContributeFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(data: ContributeFormData) {
    if (!isAuthenticated) {
      return toast({
        title: "Sign in required",
        description: "You must be signed in to contribute a story.",
        variant: "destructive",
      })
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        return toast({
          title: "Something went wrong.",
          description: result.error,
          variant: "destructive",
        })
      }

      toast({
        title: "Story saved as draft",
        description: "Your story has been saved. You can continue editing it from your dashboard.",
      })

      reset()
      router.refresh()
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Your story could not be saved. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={cn("rounded-lg border bg-muted p-8 text-center", className)} {...props}>
        <div className="mx-auto flex max-w-[420px] flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted-foreground/10">
            <Icons.user className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-2xl">Sign in to contribute</h3>
            <p className="text-sm text-muted-foreground">
              You must be signed in to share your story with The Luminous Archive.
            </p>
          </div>
          <a
            href="/login?from=/contribute"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your story"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register("title")}
            />
            {errors?.title && (
              <p className="px-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Your Story</Label>
            <Textarea
              id="content"
              placeholder="Share your experience..."
              className="min-h-[300px] resize-none"
              disabled={isLoading}
              {...register("content")}
            />
            {errors?.content && (
              <p className="px-1 text-xs text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>
          <button
            className={cn(buttonVariants({ size: "lg" }))}
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  )
}
