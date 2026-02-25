import { streamText, UIMessage, convertToModelMessages, stepCountIs, tool } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { buildSystemPrompt, type Persona } from '@/lib/aicofounder'
import { getTasks } from '@/lib/actions/tasks'
import { getVersions } from '@/lib/actions/versions'
import { z } from 'zod'

export const maxDuration = 30

function summarizeTasks(tasks: { title: string; status: string; version_id: number | null }[], limit = 20) {
  const slice = tasks.slice(0, limit)
  if (slice.length === 0) return 'Tasks: none found.'
  return `Tasks (latest ${slice.length}): ` +
    slice
      .map((t, idx) => `${idx + 1}. ${t.title} [${t.status}]${t.version_id ? ` v${t.version_id}` : ''}`)
      .join(' | ')
}

function summarizeVersions(versions: { id: number; title: string | null; nanoid: string; position?: number | null; active?: boolean; }[], limit = 10) {
  const slice = versions.slice(0, limit)
  if (slice.length === 0) return 'Versions: none found.'
  return `Versions (first ${slice.length}): ` +
    slice
      .map((v, idx) => `${idx + 1}. ${v.title ?? 'Untitled'} (#${v.id})${v.active ? ' [active]' : ''}`)
      .join(' | ')
}

function buildProjectSummary(tasks: any[], versions: any[]) {
  const taskSummary = summarizeTasks(tasks)
  const versionSummary = summarizeVersions(versions)
  return `${taskSummary}\n${versionSummary}`
}

function normalizePersona(raw?: string): Persona {
  const value = (raw || '').toLowerCase()
  if (value === 'seo') return 'seo'
  if (value === 'cto') return 'cto'
  if (value === 'developer') return 'developer'
  if (value === 'customer') return 'customer'
  if (value === 'copywriter') return 'copywriter'
  if (value === 'contentcreator' || value === 'content_creator' || value === 'content-creator') return 'content_creator'
  return 'developer'
}

export async function POST(req: Request) {
  try {
    const {
      messages = [],
      projectId,
      persona,
      model,
      webSearch,
    }: {
      messages?: UIMessage[]
      projectId?: string
      persona?: string
      model?: string
      webSearch?: boolean
    } = await req.json()

    if (!projectId) {
      const fallback = streamText({
        model: anthropic('claude-sonnet-4-5'),
        messages: await convertToModelMessages([
          { role: 'system', parts: [{ type: 'text', text: 'You are an AI cofounder. projectId was missing.' }] },
          { role: 'assistant', parts: [{ type: 'text', text: 'I could not find a project. Please refresh and try again.' }] },
        ]),
        stopWhen: stepCountIs(2),
      })
      return fallback.toUIMessageStreamResponse()
    }

    const personaValue = normalizePersona(persona)

    // Future: enforce permissions based on user/session role. (Left commented per request)
    // const userRole = await getUserRole(projectId)
    // if (!userRole) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })

    let tasks: any[] = []
    let versions: any[] = []
    try {
      tasks = await getTasks(projectId)
      versions = await getVersions(projectId)
    } catch (fetchErr) {
      console.error('[aicofounder] context fetch failed', fetchErr)
      const fallback = streamText({
        model: anthropic('claude-sonnet-4-5'),
        messages: await convertToModelMessages([
          { role: 'system', parts: [{ type: 'text', text: 'You are an AI cofounder. Context is unavailable.' }] },
          { role: 'assistant', parts: [{ type: 'text', text: 'I could not load project tasks/versions (backend unreachable). Please retry or check connectivity.' }] },
        ]),
        stopWhen: stepCountIs(2),
      })
      return fallback.toUIMessageStreamResponse()
    }

    const projectSummary = buildProjectSummary(tasks, versions)
    const systemPrompt = buildSystemPrompt(personaValue, projectSummary)

    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model: anthropic(model === 'claude-opus-4-20250514' ? 'claude-opus-4-20250514' : 'claude-sonnet-4-5'),
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(8),
      tools: {
        getCurrentProjectTasks: tool({
          description:
            'Fetch tasks for the current project. Use this when you need accurate, up-to-date task data before giving prioritization advice.',
          inputSchema: z.object({
            limit: z.number().int().min(1).max(100).optional().describe('Maximum number of tasks to return. Defaults to 30.'),
          }),
          execute: async ({ limit }) => {
            const tasks = await getTasks(projectId)
            const max = limit ?? 30
            return {
              projectId,
              total: tasks.length,
              tasks: tasks.slice(0, max).map((task) => ({
                id: task.id,
                nanoid: task.nanoid,
                title: task.title,
                status: task.status,
                priority: task.priority,
                category: task.category,
                due_date: task.due_date,
                version_id: task.version_id,
                assignee: task.assignee,
                is_completed: task.is_completed,
                created_at: task.created_at,
                updated_at: task.updated_at,
              })),
            }
          },
        }),
        getCurrentProjectVersionsWithTasks: tool({
          description:
            'Fetch versions for the current project and include tasks inside each version. Use this when comparing scope/progress across versions.',
          inputSchema: z.object({
            versionLimit: z
              .number()
              .int()
              .min(1)
              .max(50)
              .optional()
              .describe('Maximum number of versions to return. Defaults to 20.'),
            tasksPerVersion: z
              .number()
              .int()
              .min(1)
              .max(100)
              .optional()
              .describe('Maximum tasks per version. Defaults to 50.'),
            includeUnversionedTasks: z
              .boolean()
              .optional()
              .describe('Whether to include tasks that are not assigned to any version.'),
          }),
          execute: async ({ versionLimit, tasksPerVersion, includeUnversionedTasks }) => {
            const [allVersions, allTasks] = await Promise.all([getVersions(projectId), getTasks(projectId)])

            const maxVersions = versionLimit ?? 20
            const maxTasksPerVersion = tasksPerVersion ?? 50

            const tasksByVersion = new Map<number, typeof allTasks>()
            for (const task of allTasks) {
              if (task.version_id == null) continue
              const current = tasksByVersion.get(task.version_id) ?? []
              current.push(task)
              tasksByVersion.set(task.version_id, current)
            }

            const versions = allVersions.slice(0, maxVersions).map((version) => {
              const versionTasks = (tasksByVersion.get(version.id) ?? []).slice(0, maxTasksPerVersion)
              return {
                id: version.id,
                nanoid: version.nanoid,
                name: version.name,
                description: version.description,
                status: version.status,
                deadline: version.deadline,
                is_active: version.is_active ?? false,
                task_count: tasksByVersion.get(version.id)?.length ?? 0,
                tasks: versionTasks.map((task) => ({
                  id: task.id,
                  nanoid: task.nanoid,
                  title: task.title,
                  status: task.status,
                  priority: task.priority,
                  category: task.category,
                  due_date: task.due_date,
                  assignee: task.assignee,
                  is_completed: task.is_completed,
                })),
              }
            })

            const unversionedTasks = includeUnversionedTasks
              ? allTasks
                  .filter((task) => task.version_id == null)
                  .slice(0, maxTasksPerVersion)
                  .map((task) => ({
                    id: task.id,
                    nanoid: task.nanoid,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    category: task.category,
                    due_date: task.due_date,
                    assignee: task.assignee,
                    is_completed: task.is_completed,
                  }))
              : undefined

            return {
              projectId,
              total_versions: allVersions.length,
              total_tasks: allTasks.length,
              versions,
              unversioned_tasks: unversionedTasks,
            }
          },
        }),
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('[aicofounder] unexpected error', err)
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500 })
  }
}
