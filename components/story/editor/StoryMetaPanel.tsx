"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface StoryMetaPanelProps {
  layers: string[]
  motifs: string[]
  feelings: string[]
  anonymityMode?: "IDENTIFIED" | "PSEUDONYMOUS" | "ANONYMOUS"
  licenseType?: "CC0" | "CC_BY" | "CC_BY_SA" | "CC_BY_NC" | "CC_BY_NC_SA"
  consentResearch: boolean
  consentLLM: boolean
  onLayersChange: (layers: string[]) => void
  onMotifsChange: (motifs: string[]) => void
  onFeelingsChange: (feelings: string[]) => void
  onAnonymityModeChange: (mode: "IDENTIFIED" | "PSEUDONYMOUS" | "ANONYMOUS") => void
  onLicenseTypeChange: (license: "CC0" | "CC_BY" | "CC_BY_SA" | "CC_BY_NC" | "CC_BY_NC_SA") => void
  onConsentResearchChange: (checked: boolean) => void
  onConsentLLMChange: (checked: boolean) => void
}

// Placeholder taxonomy options (will be replaced by SSOT when available)
const LAYER_OPTIONS = [
  "physical", "emotional", "cognitive", "spiritual", "relational", "environmental"
]

const MOTIF_OPTIONS = [
  "transformation", "connection", "insight", "healing", "mystery", "transcendence"
]

const FEELING_OPTIONS = [
  "awe", "peace", "fear", "joy", "confusion", "clarity", "wonder", "grief"
]

export function StoryMetaPanel({
  layers,
  motifs,
  feelings,
  anonymityMode,
  licenseType,
  consentResearch,
  consentLLM,
  onLayersChange,
  onMotifsChange,
  onFeelingsChange,
  onAnonymityModeChange,
  onLicenseTypeChange,
  onConsentResearchChange,
  onConsentLLMChange,
}: StoryMetaPanelProps) {
  const addTag = (current: string[], value: string, onChange: (arr: string[]) => void) => {
    if (!current.includes(value)) {
      onChange([...current, value])
    }
  }

  const removeTag = (current: string[], value: string, onChange: (arr: string[]) => void) => {
    onChange(current.filter(item => item !== value))
  }

  return (
    <div className="space-y-6">
      {/* Taxonomy Section */}
      <Card>
        <CardHeader>
          <CardTitle>Taxonomy</CardTitle>
          <CardDescription>
            Describe the layers, motifs, and feelings present in your story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Layers */}
          <div className="space-y-2">
            <Label>Layers</Label>
            <Select onValueChange={(value) => addTag(layers, value, onLayersChange)}>
              <SelectTrigger>
                <SelectValue placeholder="Add a layer..." />
              </SelectTrigger>
              <SelectContent>
                {LAYER_OPTIONS.filter(opt => !layers.includes(opt)).map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {layers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {layers.map(layer => (
                  <Badge key={layer} variant="secondary" className="gap-1">
                    {layer}
                    <button
                      type="button"
                      onClick={() => removeTag(layers, layer, onLayersChange)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Motifs */}
          <div className="space-y-2">
            <Label>Motifs</Label>
            <Select onValueChange={(value) => addTag(motifs, value, onMotifsChange)}>
              <SelectTrigger>
                <SelectValue placeholder="Add a motif..." />
              </SelectTrigger>
              <SelectContent>
                {MOTIF_OPTIONS.filter(opt => !motifs.includes(opt)).map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {motifs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {motifs.map(motif => (
                  <Badge key={motif} variant="secondary" className="gap-1">
                    {motif}
                    <button
                      type="button"
                      onClick={() => removeTag(motifs, motif, onMotifsChange)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Feelings */}
          <div className="space-y-2">
            <Label>Feelings</Label>
            <Select onValueChange={(value) => addTag(feelings, value, onFeelingsChange)}>
              <SelectTrigger>
                <SelectValue placeholder="Add a feeling..." />
              </SelectTrigger>
              <SelectContent>
                {FEELING_OPTIONS.filter(opt => !feelings.includes(opt)).map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {feelings.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {feelings.map(feeling => (
                  <Badge key={feeling} variant="secondary" className="gap-1">
                    {feeling}
                    <button
                      type="button"
                      onClick={() => removeTag(feelings, feeling, onFeelingsChange)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Privacy & Licensing */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Licensing</CardTitle>
          <CardDescription>
            Control how your story is shared and attributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Anonymity Mode */}
          <div className="space-y-2">
            <Label htmlFor="anonymity">Anonymity Mode *</Label>
            <Select
              value={anonymityMode}
              onValueChange={(value: any) => onAnonymityModeChange(value)}
            >
              <SelectTrigger id="anonymity">
                <SelectValue placeholder="Select anonymity preference..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDENTIFIED">Identified (use my name)</SelectItem>
                <SelectItem value="PSEUDONYMOUS">Pseudonymous (use a pseudonym)</SelectItem>
                <SelectItem value="ANONYMOUS">Anonymous (no attribution)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* License Type */}
          <div className="space-y-2">
            <Label htmlFor="license">License *</Label>
            <Select
              value={licenseType}
              onValueChange={(value: any) => onLicenseTypeChange(value)}
            >
              <SelectTrigger id="license">
                <SelectValue placeholder="Select a license..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC0">CC0 (Public Domain)</SelectItem>
                <SelectItem value="CC_BY">CC BY (Attribution)</SelectItem>
                <SelectItem value="CC_BY_SA">CC BY-SA (Attribution-ShareAlike)</SelectItem>
                <SelectItem value="CC_BY_NC">CC BY-NC (Attribution-NonCommercial)</SelectItem>
                <SelectItem value="CC_BY_NC_SA">CC BY-NC-SA (Attribution-NonCommercial-ShareAlike)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Consent Flags */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent-research"
                checked={consentResearch}
                onCheckedChange={onConsentResearchChange}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consent-research"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Research Use
                </label>
                <p className="text-sm text-muted-foreground">
                  Allow this story to be used in academic research
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent-llm"
                checked={consentLLM}
                onCheckedChange={onConsentLLMChange}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consent-llm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  AI Training
                </label>
                <p className="text-sm text-muted-foreground">
                  Allow this story to be used for AI model training
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
