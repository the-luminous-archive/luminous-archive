"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Post } from "@prisma/client"
import { useForm } from "react-hook-form"
import TextareaAutosize from "react-textarea-autosize"
import * as z from "zod"

import "@/styles/editor.css"
import { cn } from "@/lib/utils"
import { postPatchSchema } from "@/lib/validations/post"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface EditorProps {
  post: Pick<Post, "id" | "title" | "content" | "published">
}

type FormData = z.infer<typeof postPatchSchema>

export function Editor({ post }: EditorProps) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(postPatchSchema),
  })
  const ref = React.useRef<any>()
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [isMounted, setIsMounted] = React.useState<boolean>(false)
  const [isEditorReady, setIsEditorReady] = React.useState<boolean>(false)

  const initializeEditor = React.useCallback(async () => {
    try {
      const body = postPatchSchema.parse(post)

      // Convert plain text content to EditorJS format if needed
      let editorData = body.content
      
      // If content is a string (from contribute form), convert to EditorJS blocks
      if (typeof body.content === 'string' && body.content.length > 0) {
        editorData = {
          time: Date.now(),
          blocks: [
            {
              type: "paragraph",
              data: {
                text: body.content.replace(/\n/g, '<br>')
              }
            }
          ],
          version: "2.26.5"
        }
      } else if (!body.content) {
        // Empty content
        editorData = {
          time: Date.now(),
          blocks: [],
          version: "2.26.5"
        }
      }

      // Dynamically import EditorJS and tools
      const [
        EditorJSModule,
        HeaderModule,
        EmbedModule,
        TableModule,
        ListModule,
        CodeModule,
        LinkToolModule,
        InlineCodeModule,
      ] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/embed"),
        import("@editorjs/table"),
        import("@editorjs/list"),
        import("@editorjs/code"),
        import("@editorjs/link"),
        import("@editorjs/inline-code"),
      ])

      const EditorJS = EditorJSModule.default
      const Header = HeaderModule.default
      const Embed = EmbedModule.default
      const Table = TableModule.default
      const List = ListModule.default
      const Code = CodeModule.default
      const LinkTool = LinkToolModule.default
      const InlineCode = InlineCodeModule.default

      if (!ref.current) {
        const editor = new EditorJS({
          holder: "editor",
          onReady() {
            ref.current = editor
            setIsEditorReady(true)
          },
          placeholder: "Share your visionary experience here...",
          inlineToolbar: true,
          data: editorData,
          tools: {
            header: {
              class: Header,
              config: {
                placeholder: "Enter a heading",
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            linkTool: {
              class: LinkTool,
              config: {
                endpoint: "/api/link",
              },
            },
            list: {
              class: List,
              inlineToolbar: true,
            },
            code: {
              class: Code,
            },
            inlineCode: {
              class: InlineCode,
            },
            table: {
              class: Table,
              inlineToolbar: true,
            },
            embed: {
              class: Embed,
            },
          },
        })
      }
    } catch (error) {
      console.error("Error initializing editor:", error)
      toast({
        title: "Editor initialization failed",
        description: "There was an error loading the editor. Please refresh the page.",
        variant: "destructive",
      })
    }
  }, [post])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true)
    }
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      initializeEditor()

      return () => {
        ref.current?.destroy()
        ref.current = undefined
      }
    }
  }, [isMounted, initializeEditor])

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    try {
      const blocks = await ref.current?.save()

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          content: blocks,
        }),
      })

      setIsSaving(false)

      if (!response?.ok) {
        return toast({
          title: "Something went wrong.",
          description: "Your story was not saved. Please try again.",
          variant: "destructive",
        })
      }

      router.refresh()

      return toast({
        description: "Your story has been saved.",
      })
    } catch (error) {
      setIsSaving(false)
      return toast({
        title: "Something went wrong.",
        description: "Your story was not saved. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid w-full gap-10">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link
              href="/dashboard/stories"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              <Icons.chevronLeft className="mr-2 h-4 w-4" />
              Back to Stories
            </Link>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  post.published ? "bg-green-500" : "bg-yellow-500"
                )}
              />
              <p className="text-sm text-muted-foreground">
                {post.published ? "Published" : "Draft"}
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSaving || !isEditorReady}
            className={cn(buttonVariants())}
          >
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
        </div>
        <div className="prose prose-stone mx-auto w-full max-w-[800px] dark:prose-invert">
          <TextareaAutosize
            autoFocus
            id="title"
            defaultValue={post.title}
            placeholder="Untitled Story"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
            {...register("title")}
          />
          <hr className="my-4" />
          {!isEditorReady && (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading editor...</p>
              </div>
            </div>
          )}
          <div id="editor" className="min-h-[500px]" />
          <p className="text-sm text-muted-foreground">
            Use{" "}
            <kbd className="rounded-md border bg-muted px-1 text-xs uppercase">
              Tab
            </kbd>{" "}
            to open the command menu.
          </p>
        </div>
      </div>
    </form>
  )
}
