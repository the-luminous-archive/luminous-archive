"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Post } from "@prisma/client"
import TextareaAutosize from "react-textarea-autosize"
import "@/styles/editor.css"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Breadcrumbs } from "../common/Breadcrumbs"
import { StoryMetaPanel } from "./StoryMetaPanel"
import { SaveBar } from "./SaveBar"
import { useAutosave } from "@/lib/hooks/use-autosave"

type EditorMode = "create" | "edit"

interface StoryEditorProps {
  mode: EditorMode
  story?: any // Post with new fields
  userId: string
}

export function StoryEditor({ mode, story, userId }: StoryEditorProps) {
  const router = useRouter()
  const ref = React.useRef<any>()
  
  // Local state
  const [isMounted, setIsMounted] = React.useState(false)
  const [isEditorReady, setIsEditorReady] = React.useState(false)
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [storyId, setStoryId] = React.useState<string | undefined>(story?.id)
  
  // Form state
  const [title, setTitle] = React.useState(story?.title || "Untitled Story")
  const [layers, setLayers] = React.useState<string[]>(story?.layers || [])
  const [motifs, setMotifs] = React.useState<string[]>(story?.motifs || [])
  const [feelings, setFeelings] = React.useState<string[]>(story?.feelings || [])
  const [anonymityMode, setAnonymityMode] = React.useState<"IDENTIFIED" | "PSEUDONYMOUS" | "ANONYMOUS" | undefined>(
    story?.anonymityMode as any
  )
  const [licenseType, setLicenseType] = React.useState<"CC0" | "CC_BY" | "CC_BY_SA" | "CC_BY_NC" | "CC_BY_NC_SA" | undefined>(
    story?.licenseType as any
  )
  const [consentResearch, setConsentResearch] = React.useState(story?.consentResearch ?? false)
  const [consentLLM, setConsentLLM] = React.useState(story?.consentLLM ?? false)
  const [status, setStatus] = React.useState<"DRAFT" | "IN_REVIEW" | "PUBLISHED">(
    (story?.status as any) || "DRAFT"
  )

  // Dirty tracking
  const [isDirty, setIsDirty] = React.useState(false)

  // Save function for autosave
  const handleSave = React.useCallback(async () => {
    if (!isDirty && storyId) return // Skip if no changes
    
    const blocks = await ref.current?.save()
    
    const payload = {
      title,
      content: blocks,
      layers,
      motifs,
      feelings,
      anonymityMode,
      licenseType,
      consentResearch,
      consentLLM,
    }

    if (!storyId) {
      // Create new story
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create story")
      }

      const data = await response.json()
      setStoryId(data.id)
      
      // Update URL to edit mode
      router.replace(`/stories/${data.id}/edit`)
      
      toast({
        description: "Story created as draft",
      })
    } else {
      // Update existing story
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save story")
      }
    }

    setIsDirty(false)
  }, [storyId, title, layers, motifs, feelings, anonymityMode, licenseType, consentResearch, consentLLM, isDirty, router])

  // Autosave hook
  const { isSaving, lastSavedAt, triggerSave } = useAutosave({
    onSave: handleSave,
    debounceMs: 1500,
    enabled: isDirty || mode === "create",
  })

  // Initialize editor
  const initializeEditor = React.useCallback(async () => {
    try {
      let editorData = story?.content

      // Convert plain text content to EditorJS format if needed
      if (typeof story?.content === 'string' && story.content.length > 0) {
        editorData = {
          time: Date.now(),
          blocks: [{
            type: "paragraph",
            data: { text: story.content.replace(/\n/g, '<br>') }
          }],
          version: "2.26.5"
        } as any
      } else if (!story?.content) {
        editorData = {
          time: Date.now(),
          blocks: [],
          version: "2.26.5"
        } as any
      }

      // Dynamically import EditorJS and tools
      const [
        EditorJSModule,
        HeaderModule,
        ListModule,
        CodeModule,
        InlineCodeModule,
      ] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/list"),
        import("@editorjs/code"),
        import("@editorjs/inline-code"),
      ])

      const EditorJS = EditorJSModule.default
      const Header = HeaderModule.default
      const List = ListModule.default
      const Code = CodeModule.default
      const InlineCode = InlineCodeModule.default

      if (!ref.current) {
        const editor = new EditorJS({
          holder: "editor",
          onReady() {
            ref.current = editor
            setIsEditorReady(true)
          },
          onChange() {
            setIsDirty(true)
            triggerSave()
          },
          placeholder: "Share your visionary experience here...",
          inlineToolbar: true,
          data: editorData as any,
          tools: {
            header: {
              class: Header,
              config: {
                placeholder: "Enter a heading",
                levels: [2, 3, 4],
                defaultLevel: 2,
              },
            },
            list: {
              class: List as any,
              inlineToolbar: true,
            },
            code: {
              class: Code,
            },
            inlineCode: {
              class: InlineCode,
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
  }, [story, triggerSave])

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

  // Handle publish/unpublish
  const handlePublish = async () => {
    if (!storyId) {
      toast({
        title: "Save first",
        description: "Please save your story before publishing.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!anonymityMode || !licenseType) {
      toast({
        title: "Missing required fields",
        description: "Please select anonymity mode and license before publishing.",
        variant: "destructive",
      })
      return
    }

    const blocks = await ref.current?.save()
    if (!blocks || !blocks.blocks || blocks.blocks.length === 0) {
      toast({
        title: "Empty content",
        description: "Please add some content before publishing.",
        variant: "destructive",
      })
      return
    }

    setIsPublishing(true)

    try {
      const response = await fetch(`/api/stories/${storyId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to publish story")
      }

      setStatus("PUBLISHED")
      router.refresh()

      toast({
        title: "Story published",
        description: "Your story is now live in the archive.",
      })
    } catch (error) {
      toast({
        title: "Publishing failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!storyId) return

    setIsPublishing(true)

    try {
      const response = await fetch(`/api/stories/${storyId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to unpublish story")
      }

      setStatus("DRAFT")
      router.refresh()

      toast({
        description: "Story unpublished and returned to drafts.",
      })
    } catch (error) {
      toast({
        title: "Unpublishing failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePreview = () => {
    if (!storyId) {
      toast({
        title: "Save first",
        description: "Please save your story before previewing.",
        variant: "destructive",
      })
      return
    }
    router.push(`/stories/${storyId}/preview`)
  }

  const handleDelete = async () => {
    if (!storyId || status !== "DRAFT") return

    if (!confirm("Are you sure you want to delete this draft? This cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete story")
      }

      toast({
        description: "Draft deleted successfully.",
      })

      router.push("/dashboard/stories")
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Breadcrumbs */}
      <div className="container py-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Stories", href: "/dashboard/stories" },
            { label: mode === "create" ? "New Story" : "Edit Story" },
          ]}
        />
      </div>

      {/* Two-column layout */}
      <div className="container grid gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px]">
        {/* Left: Editor */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "create" ? "Start a new story" : "Edit story"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "create" 
                ? "Begin a draft. You can publish when it's ready."
                : "Keep refining. Your changes autosave."}
            </p>
          </div>

          <div className="prose prose-stone mx-auto w-full dark:prose-invert">
            <TextareaAutosize
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setIsDirty(true)
                triggerSave()
              }}
              placeholder="Untitled Story"
              className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
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
          </div>
        </div>

        {/* Right: Meta Panel */}
        <div className="md:sticky md:top-6 md:h-fit">
          <StoryMetaPanel
            layers={layers}
            motifs={motifs}
            feelings={feelings}
            anonymityMode={anonymityMode}
            licenseType={licenseType}
            consentResearch={consentResearch}
            consentLLM={consentLLM}
            onLayersChange={(val) => {
              setLayers(val)
              setIsDirty(true)
              triggerSave()
            }}
            onMotifsChange={(val) => {
              setMotifs(val)
              setIsDirty(true)
              triggerSave()
            }}
            onFeelingsChange={(val) => {
              setFeelings(val)
              setIsDirty(true)
              triggerSave()
            }}
            onAnonymityModeChange={(val) => {
              setAnonymityMode(val)
              setIsDirty(true)
              triggerSave()
            }}
            onLicenseTypeChange={(val) => {
              setLicenseType(val)
              setIsDirty(true)
              triggerSave()
            }}
            onConsentResearchChange={(val) => {
              setConsentResearch(val)
              setIsDirty(true)
              triggerSave()
            }}
            onConsentLLMChange={(val) => {
              setConsentLLM(val)
              setIsDirty(true)
              triggerSave()
            }}
          />
        </div>
      </div>

      {/* Save Bar */}
      <SaveBar
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        status={status}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onPreview={handlePreview}
        onDelete={status === "DRAFT" ? handleDelete : undefined}
        isPublishing={isPublishing}
      />
    </div>
  )
}
