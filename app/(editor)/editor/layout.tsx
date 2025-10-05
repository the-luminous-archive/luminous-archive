interface EditorProps {
  children?: React.ReactNode
}

export default function EditorLayout({ children }: EditorProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Story Editor</h2>
          </div>
        </div>
      </div>
      <div className="container py-6">
        {children}
      </div>
    </div>
  )
}
