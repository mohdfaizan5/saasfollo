'use client'

/**
 * VersionsCard — renders the result of getCurrentProjectVersionsWithTasks tool.
 *
 * Customise columns, badges, or collapsible sections here without touching the
 * registry or the API route.
 */

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Clock, Layers, ChevronDown } from 'lucide-react'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Types (mirrors the shape returned by the tool in route.ts)
// ---------------------------------------------------------------------------

interface Task {
  id: number
  nanoid: string
  title: string
  status: string
  priority: string | null
  category: string | null
  due_date: string | null
  assignee: string | null
  is_completed: boolean
}

interface Version {
  id: number
  nanoid: string
  name: string | null
  description: string | null
  status: string | null
  deadline: string | null
  is_active: boolean
  task_count: number
  tasks: Task[]
}

interface VersionsResult {
  projectId: string
  total_versions: number
  total_tasks: number
  versions: Version[]
  unversioned_tasks?: Task[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_META: Record<string, { icon: typeof Circle; colorClass: string }> = {
  done: { icon: CheckCircle2, colorClass: 'text-emerald-500' },
  completed: { icon: CheckCircle2, colorClass: 'text-emerald-500' },
  'in-progress': { icon: Clock, colorClass: 'text-amber-500' },
  in_progress: { icon: Clock, colorClass: 'text-amber-500' },
  todo: { icon: Circle, colorClass: 'text-zinc-400' },
}

function statusMeta(status: string) {
  return STATUS_META[status.toLowerCase()] ?? { icon: Circle, colorClass: 'text-zinc-400' }
}

// ---------------------------------------------------------------------------
// Sub-component: collapsible version section
// ---------------------------------------------------------------------------

function VersionSection({ version }: { version: Version }) {
  const [open, setOpen] = useState(version.is_active)
  const completed = version.tasks.filter((t) => t.is_completed).length
  const pct = version.task_count > 0 ? Math.round((completed / version.task_count) * 100) : 0

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="size-4 shrink-0 text-primary" />
          <span className="text-sm font-medium truncate">{version.name ?? `Version #${version.id}`}</span>
          {version.is_active && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {completed}/{version.task_count}
          </span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3">
          {version.description && (
            <p className="mb-2 text-xs text-muted-foreground">{version.description}</p>
          )}

          <Progress value={pct} className="h-1 mb-2" />

          {version.tasks.length > 0 ? (
            <ul className="space-y-1">
              {version.tasks.map((task) => {
                const meta = statusMeta(task.status)
                const StatusIcon = meta.icon
                return (
                  <li key={task.nanoid} className="flex items-center gap-2 text-sm">
                    <StatusIcon className={`size-3.5 shrink-0 ${meta.colorClass}`} />
                    <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No tasks in this version.</p>
          )}

          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            {version.status && <span>Status: {version.status}</span>}
            {version.deadline && <span>Deadline: {version.deadline}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function VersionsCard({ data }: { data: VersionsResult }) {
  const { total_versions, total_tasks, versions, unversioned_tasks } = data
  const allCompleted = versions.reduce(
    (sum, v) => sum + v.tasks.filter((t) => t.is_completed).length,
    0
  )
  const globalPct = total_tasks > 0 ? Math.round((allCompleted / total_tasks) * 100) : 0

  return (
    <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          <span className="text-sm font-semibold">Versions Overview</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs tabular-nums">
            {total_versions} versions
          </Badge>
          <Badge variant="outline" className="text-xs tabular-nums">
            {total_tasks} tasks
          </Badge>
        </div>
      </div>

      {/* Global progress */}
      <div className="px-4 pt-3 pb-1">
        <Progress value={globalPct} className="h-1.5" />
        <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
          {globalPct}% overall · {allCompleted} of {total_tasks} tasks done
        </p>
      </div>

      {/* Version sections */}
      <div className="max-h-96 overflow-y-auto">
        {versions.map((version) => (
          <VersionSection key={version.nanoid} version={version} />
        ))}

        {/* Unversioned tasks */}
        {unversioned_tasks && unversioned_tasks.length > 0 && (
          <div className="border-t px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Unversioned Tasks</p>
            <ul className="space-y-1">
              {unversioned_tasks.map((task) => {
                const meta = statusMeta(task.status)
                const StatusIcon = meta.icon
                return (
                  <li key={task.nanoid} className="flex items-center gap-2 text-sm">
                    <StatusIcon className={`size-3.5 shrink-0 ${meta.colorClass}`} />
                    <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
