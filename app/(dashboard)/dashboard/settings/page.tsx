import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { UserNameForm } from "@/components/user-name-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Settings",
  description: "Manage account and contributor preferences.",
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and contributor preferences."
      />
      <div className="grid gap-10">
        {/* Account Settings */}
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />

        {/* Anonymity Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Anonymity & Attribution</CardTitle>
            <CardDescription>
              Control how your identity is displayed with your stories. This is
              your default preference; you can override it for individual
              stories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anonymity-mode">Default Anonymity Mode</Label>
              <Select defaultValue="pseudonymous" disabled>
                <SelectTrigger id="anonymity-mode">
                  <SelectValue placeholder="Select anonymity mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identified">
                    Identified (Full name displayed)
                  </SelectItem>
                  <SelectItem value="pseudonymous">
                    Pseudonymous (Display name only)
                  </SelectItem>
                  <SelectItem value="anonymous">
                    Anonymous (No attribution)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Current mode:{" "}
                <Badge variant="secondary">Pseudonymous</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Note: Backend implementation pending. This will be functional
                after migration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* License Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Default License</CardTitle>
            <CardDescription>
              Choose how others may use your stories. All options ensure proper
              attribution and preserve your work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license-type">Default License Type</Label>
              <Select defaultValue="cc-by" disabled>
                <SelectTrigger id="license-type">
                  <SelectValue placeholder="Select license" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cc0">
                    CC0 (Public Domain)
                  </SelectItem>
                  <SelectItem value="cc-by">
                    CC BY (Attribution Required)
                  </SelectItem>
                  <SelectItem value="cc-by-sa">
                    CC BY-SA (Attribution + ShareAlike)
                  </SelectItem>
                  <SelectItem value="cc-by-nc">
                    CC BY-NC (Attribution + Non-Commercial)
                  </SelectItem>
                  <SelectItem value="cc-by-nc-sa">
                    CC BY-NC-SA (Attribution + Non-Commercial + ShareAlike)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Current license:{" "}
                <Badge variant="secondary">CC BY</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Note: Backend implementation pending. This will be functional
                after migration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consent & Data Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Consent & Data Usage</CardTitle>
            <CardDescription>
              Control how your stories may be used beyond the public archive.
              You can change these settings at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-1 flex-1">
                <Label>Research Use</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anonymized data from your stories to be used in academic
                  research and studies on consciousness and visionary
                  experiences.
                </p>
              </div>
              <Badge variant="outline" className="mt-1">
                Disabled
              </Badge>
            </div>

            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-1 flex-1">
                <Label>AI Training</Label>
                <p className="text-sm text-muted-foreground">
                  Allow your stories to be included in datasets for training
                  language models focused on consciousness research (always with
                  proper attribution).
                </p>
              </div>
              <Badge variant="outline" className="mt-1">
                Disabled
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground pt-4 border-t">
              Note: Consent toggles require backend implementation. For now,
              these settings are display-only and will be functional after the
              database migration is complete.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
