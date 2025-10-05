"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseAutosaveOptions {
  onSave: () => Promise<void>
  debounceMs?: number
  enabled?: boolean
}

interface UseAutosaveReturn {
  isSaving: boolean
  lastSavedAt: Date | null
  triggerSave: () => void
  error: Error | null
}

/**
 * Custom hook for autosaving with debouncing
 * 
 * Usage:
 * const { isSaving, lastSavedAt, triggerSave } = useAutosave({
 *   onSave: async () => { await saveStory() },
 *   debounceMs: 1500,
 *   enabled: isDirty
 * })
 */
export function useAutosave({
  onSave,
  debounceMs = 1500,
  enabled = true,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()
  const savePendingRef = useRef(false)

  const triggerSave = useCallback(async () => {
    // Cancel any pending save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (!enabled) return

    setIsSaving(true)
    setError(null)
    abortControllerRef.current = new AbortController()

    try {
      await onSave()
      setLastSavedAt(new Date())
      savePendingRef.current = false
    } catch (err) {
      // Only set error if not aborted
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
        console.error('Autosave failed:', err)
      }
    } finally {
      setIsSaving(false)
      abortControllerRef.current = undefined
    }
  }, [onSave, enabled])

  const debouncedSave = useCallback(() => {
    if (!enabled) return

    savePendingRef.current = true

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      triggerSave()
    }, debounceMs)
  }, [triggerSave, debounceMs, enabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    isSaving,
    lastSavedAt,
    triggerSave: debouncedSave,
    error,
  }
}
