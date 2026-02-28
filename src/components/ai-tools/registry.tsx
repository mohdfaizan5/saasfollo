'use client'

/**
 * AI Tool Component Registry
 *
 * Maps tool names (from API route) → React components that render tool results.
 *
 * HOW TO ADD A NEW TOOL CARD:
 * 1. Create a new component in src/components/ai-tools/  (e.g. my-card.tsx)
 *    - Export a default component that accepts { data: YourResultType }
 * 2. Import it here and add an entry to TOOL_COMPONENTS below.
 * 3. Define the corresponding tool in src/app/api/aicofounder/route.ts
 *
 * That's it — the page will automatically render your card when the tool is invoked.
 */

import type { ComponentType } from 'react'
import { TasksCard } from './tasks-card'
import { VersionsCard } from './versions-card'

// ---------------------------------------------------------------------------
// Registry — add new tool→component mappings here
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOL_COMPONENTS: Record<string, ComponentType<{ data: any }>> = {
  getCurrentProjectTasks: TasksCard,
  getCurrentProjectVersionsWithTasks: VersionsCard,
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

interface ToolRendererProps {
  toolName: string
  state: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any
}

export function ToolRenderer({ toolName, state, result }: ToolRendererProps) {
  // Still executing — show a subtle loading state
  if (state !== 'output-available') {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground animate-pulse">
        <span className="size-2 rounded-full bg-primary/60 animate-ping" />
        Fetching data…
      </div>
    )
  }

  const Component = TOOL_COMPONENTS[toolName]

  if (!Component) {
    // Unknown tool — render raw JSON so nothing is silently lost
    return (
      <pre className="rounded-lg border bg-muted/40 p-3 text-xs overflow-x-auto max-w-full">
        {JSON.stringify(result, null, 2)}
      </pre>
    )
  }

  return <Component data={result} />
}
