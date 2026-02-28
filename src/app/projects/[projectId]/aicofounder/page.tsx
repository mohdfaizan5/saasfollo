'use client'

import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AICofounderInput } from '@/components/ai-input'
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CubeIcon, GearFineIcon, PencilCircleIcon, SparkleIcon } from '@phosphor-icons/react/dist/ssr'

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
  { value: 'developer', label: 'Developer' },
  { value: 'cto', label: 'CTO' },
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
  const [quickChat, setQuickChat] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const suggestions = useMemo(
    () => [
      {
        prompt: 'What should I work on next for this project?',
        title: 'Build my roadmap',
        description: 'Find the next best task to ship now.',
        icon: CubeIcon,
        bgClass: 'bg-gradient-to-br from-primary/80 via-primary/65 to-primary/45',
        textClass: 'text-primary-foreground',
      },
      {
        prompt: 'Review current versions and suggest priorities.',
        title: 'Set priorities',
        description: 'Review scope and rank what matters most.',
        icon: GearFineIcon,
        bgClass: 'bg-gradient-to-br from-secondary via-secondary/85 to-accent',
        textClass: 'text-secondary-foreground',
      },
      {
        prompt: 'Act as copywriter and improve this feature pitch.',
        title: 'Polish my pitch',
        description: 'Rewrite this feature to convert better.',
        icon: PencilCircleIcon,
        bgClass: 'bg-gradient-to-br from-accent via-primary/40 to-secondary/75',
        textClass: 'text-accent-foreground',
      },
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
          quickChat,
        },
      }),
    [projectId, persona, quickChat]
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
    async (textToSend: string) => {
      if (!textToSend.trim() || !projectId || isLoading) return
      const trimmed = textToSend.trim()
      setText('')
      try {
        await sendMessage({ text: trimmed })
      } catch (err) {
        console.error('[aicofounder] sendMessage failed', err)
      }
    },
    [isLoading, projectId, sendMessage]
  )

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      await handleSubmit(suggestion)
    },
    [handleSubmit]
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isLoading])

  return (
    <div className="relative flex h-[calc(90svh-72px)] w-full max-w-5xl mx-auto flex-col">
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-3 p-3 md:p-4">
          {normalizedMessages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 mt-10">
              <SparkleIcon size={48} weight="duotone" className='animate-pulse' />
              <p className='text-center'>
                How's it going?
              </p>
              <h1 className="text-5xl text-center font-serif">

                I'm your AI CoFounder!
              </h1>
              <div className="grid w-full max-w-3xl gap-2 sm:grid-cols-3">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon
                  const isSuggestionDisabled = isLoading || !projectId

                  return (
                    <Card
                      key={suggestion.prompt}
                      onClick={() => {
                        if (!isSuggestionDisabled) {
                          handleSuggestionClick(suggestion.prompt)
                        }
                      }}
                      className={`group relative overflow-hidden border-0 px-3 py-3 transition-transform duration-200 ${isSuggestionDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-0.5'} ${suggestion.bgClass} ${suggestion.textClass}`}
                      aria-disabled={isSuggestionDisabled}
                    >
                      <CardTitle className="text-sm font-medium leading-tight">{suggestion.title}</CardTitle>
                      <CardDescription className="mt-1 max-w-[85%] text-xs/5 text-inherit/85">{suggestion.description}</CardDescription>

                      <div className="pointer-events-none absolute -bottom-5 opacity-80 -right-5 rounded-2xl  p-2  transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105">
                        <Icon size={58} weight="duotone" className="opacity-90" />
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

          ): ( <div className="flex flex-col items-center gap-4 mt-10">
              <SparkleIcon size={48} weight="duotone" className='animate-pulse' />
              <p className='text-center'>
                How's it going?
              </p>
              <h1 className="text-5xl text-center font-serif">

                I'm your AI CoFounder!
              </h1>
             
            </div>
)}

          {normalizedMessages.map(({ versions, ...message }) => (
            <div key={message.key} className="flex flex-col gap-2">
              {versions.map((version) =>
                message.from === 'user' ? (
                  <div
                    key={`${message.key}-${version.id}`}
                    className="rounded-lg px-3 py-2 text-sm whitespace-pre-wrap max-w-[90%] bg-primary text-primary-foreground ml-auto"
                  >
                    {version.content}
                  </div>
                ) : (
                  <div
                    key={`${message.key}-${version.id}`}
                    className="text- text-foreground mr-auto max-w-[90%]"
                  >
                    <Streamdown
                      plugins={{ code }}
                      isAnimating={isLoading}
                    >
                      {version.content}
                    </Streamdown>
                  </div>
                )
              )}
            </div>
          ))}

          {isLoading && <div className="text-sm text-muted-foreground">Thinking...</div>}
          {error && <div className="text-sm text-red-500">{error.message}</div>}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="shrink-0 z-20 px-3 pb-3 md:px-4 md:pb-4">
        <AICofounderInput
          value={text}
          onValueChange={setText}
          onSubmit={() => handleSubmit(text)}
          isLoading={isLoading}
          disabled={!projectId}
          placeholder="Ask your AI cofounder anything about this project..."
          personas={personas}
          selectedPersona={persona}
          onPersonaChange={setPersona}
          quickChat={quickChat}
          onQuickChatChange={setQuickChat}
        />
      </div>
    </div>
  )
}