import Link from "next/link"

import { Icons } from "@/components/icons"

interface EditorProps {
  children?: React.ReactNode
}

export default function EditorLayout({ children }: EditorProps) {
  return (
    <div className="container mx-auto grid items-start gap-10 py-8 px-8">
      {children}
    </div>
  )
}
