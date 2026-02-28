'use client'

/**
 * TasksCard — renders the result of getCurrentProjectTasks tool.
 *
 * Customise the columns, badges, or layout here without touching the
 * registry or the API route.
 */

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react'

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
  version_id: number | null
  assignee: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

interface TasksResult {
  projectId: string
  total: number
  tasks: Task[]
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

function priorityVariant(priority: string | null) {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'destructive' as const
    case 'medium':
      return 'secondary' as const
    default:
      return 'outline' as const
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TasksCard({ data }: { data: TasksResult }) {
  const { total, tasks } = data
  const completed = tasks.filter((t) => t.is_completed).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ListTodo className="size-4 text-primary" />
          <span className="text-sm font-semibold">Project Tasks</span>
        </div>
        <Badge variant="secondary" className="text-xs tabular-nums">
          {completed}/{total} done
        </Badge>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-1">
        <Progress value={pct} className="h-1.5" />
        <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{pct}% complete</p>
      </div>

      {/* Task list */}
      <ul className="divide-y max-h-72 overflow-y-auto">
        {tasks.map((task) => {
          const meta = statusMeta(task.status)
          const StatusIcon = meta.icon
          return (
            <li key={task.nanoid} className="flex items-start gap-2.5 px-4 py-2.5 text-sm">
              <StatusIcon className={`mt-0.5 size-4 shrink-0 ${meta.colorClass}`} />
              <div className="flex-1 min-w-0">
                <p className={`leading-snug ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {task.priority && (
                    <Badge variant={priorityVariant(task.priority)} className="text-[10px] px-1.5 py-0">
                      {task.priority}
                    </Badge>
                  )}
                  {task.category && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {task.category}
                    </Badge>
                  )}
                  {task.assignee && (
                    <span className="text-[10px] text-muted-foreground">@{task.assignee}</span>
                  )}
                  {task.due_date && (
                    <span className="text-[10px] text-muted-foreground">{task.due_date}</span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Footer */}
      {tasks.length < total && (
        <div className="border-t px-4 py-2 text-center text-[11px] text-muted-foreground">
          Showing {tasks.length} of {total} tasks
        </div>
      )}
    </div>
  )
}
