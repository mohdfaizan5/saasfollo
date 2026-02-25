'use client'

import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { CheckIcon, GlobeIcon, MicIcon, PaperclipIcon, XIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type PromptInputMessage = {
  text?: string
  files?: File[]
}

type MessageType = {
  key: string
  from: 'user' | 'assistant'
  versions: { id: string; content: string }[]
}

// const models = [
//   { chef: 'OpenAI', id: 'gpt-4o', name: 'GPT-4o' },
//   { chef: 'OpenAI', id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
//   { chef: 'Anthropic', id: 'claude-sonnet-4-5', name: 'Claude 4.5 Sonnet' },
// ]

const personas = [
  { value: 'seo', label: 'SEO Expert' },
  { value: 'cto', label: 'CTO' },
  { value: 'developer', label: 'Developer' },
  { value: 'customer', label: 'Customer' },
  { value: 'copywriter', label: 'Copywriter' },
  { value: 'content_creator', label: 'Content Creator' },
]

export default function Chat() {
  const params = useParams<{ projectId: string }>()
  const projectId = params?.projectId
  const [persona, setPersona] = useState('developer')
  // const [model, setModel] = useState(models[2].id)
  const [text, setText] = useState('')
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const suggestions = useMemo(
    () => [
      'What should I work on next for this project?',
      'Review current versions and suggest priorities.',
      'Give me a CTO-level risk assessment for this sprint.',
      'Act as copywriter and improve this feature pitch.',
    ],
    []
  )

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/aicofounder',
        body: {
          projectId,
          persona,
          // model,
          webSearch: useWebSearch,
        },
      }),
    [projectId, persona, useWebSearch]
  )

  const { messages, sendMessage, status, error } = useChat({
    transport,
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  const normalizedMessages = useMemo<MessageType[]>(() => {
    return messages.map((message) => {
      const textParts = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('\n')

      return {
        key: message.id,
        from: message.role === 'user' ? 'user' : 'assistant',
        versions: [
          {
            id: message.id,
            content: textParts,
          },
        ],
      }
    })
  }, [messages])

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim())
      const hasFiles = Boolean(message.files?.length)

      if (!(hasText || hasFiles) || !projectId || isLoading) {
        return
      }

      const textToSend = hasText ? message.text!.trim() : `Sent with ${message.files!.length} attachment(s)`
      await sendMessage({ text: textToSend })
      setText('')
      setFiles([])
    },
    [isLoading, projectId, sendMessage]
  )

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      await handleSubmit({ text: suggestion })
    },
    [handleSubmit]
  )

  const isSubmitDisabled = !(text.trim() || files.length > 0) || isLoading || !projectId

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isLoading])

  return (
    <div className="relative flex h-[calc(90svh-72px)] w-full max-w-5xl mx-auto flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-3 md:p-4">
          {normalizedMessages.length === 0 && (
            <div className="">
              <h1 className="text-5xl text-center font-serif">

                I'm your AI CoFounder!
              </h1>
              <p className='text-center'>

                How's it going?
              </p>
            </div>
          )}

          {normalizedMessages.map(({ versions, ...message }) => (
            <div key={message.key} className="flex flex-col gap-2">
              {versions.map((version) => (
                <div
                  key={`${message.key}-${version.id}`}
                  className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap max-w-[90%] ${message.from === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted text-foreground mr-auto'
                    }`}
                >
                  {version.content}
                </div>
              ))}
            </div>
          ))}

          {isLoading && <div className="text-sm text-muted-foreground">Thinking...</div>}
          {error && <div className="text-sm text-red-500">{error.message}</div>}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="grid shrink-0 gap-2 px-3 py-3 md:px-4 md:py-4">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="xs"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading || !projectId}
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <div className="w-full border rounded-lg bg-card">
            {files.length > 0 && (
              <div className="p-2 border-b flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                    <span className="truncate max-w-44">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                await handleSubmit({ text, files })
              }}
            >
              <div className="p-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ask your AI cofounder anything about this project..."
                  className="min-h-20"
                />
              </div>

              <div className="px-2 pb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const selected = Array.from(e.target.files ?? [])
                      if (selected.length > 0) {
                        setFiles((prev) => [...prev, ...selected])
                      }
                      e.currentTarget.value = ''
                    }}
                  />
                  {/* <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <PaperclipIcon className="size-4" />
                  Attach
                </Button>

                <Button type="button" variant={useWebSearch ? 'default' : 'ghost'} size="sm" onClick={() => setUseWebSearch((prev) => !prev)}>
                  <GlobeIcon className="size-4" />
                  Search
                </Button> */}

                  {/* <Button type="button" variant="ghost" size="sm" disabled>
                  <MicIcon className="size-4" />
                  Voice
                </Button> */}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                  >
                    {personas.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  {/* <select
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.chef} · {m.name}
                    </option>
                  ))}
                </select> */}

                  <Button type="submit" size="sm" disabled={isSubmitDisabled}>
                    {isLoading ? 'Thinking...' : 'Send'}
                    {!isLoading && <CheckIcon className="size-4" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}