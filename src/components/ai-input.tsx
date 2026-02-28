'use client'

import { cn } from '@/lib/utils'
import { m, LazyMotion, domMax, AnimatePresence } from 'motion/react'
import React, { useState, useRef, createContext, useContext } from 'react'
import {
  ArrowUp,
  Sparkles,
  ChevronDown,
  X,
  Plus,
  Check,
  Zap,
  Paperclip,
  File as FileIcon,
  Video,
  type LucideIcon,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

type IconComponent = React.ComponentType<{ className?: string }>

interface AIInputContextType {
  activeDropdown: 'plus' | 'tools' | 'persona' | null
  setActiveDropdown: (dropdown: 'plus' | 'tools' | 'persona' | null) => void
}

export interface PersonaOption {
  value: string
  label: string
  icon?: LucideIcon
}

interface MenuItem {
  id: string
  icon: LucideIcon
  label: string
}

interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'file' | 'video'
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_PLUS_MENU: MenuItem[] = [
  { id: 'files', icon: Paperclip, label: 'Upload photos & files' },
  { id: 'videos', icon: Video, label: 'Upload Videos' },
]

// =============================================================================
// CONTEXT
// =============================================================================

const AIInputContext = createContext<AIInputContextType | undefined>(undefined)

// =============================================================================
// DROPDOWN
// =============================================================================

interface DropdownItem {
  icon?: IconComponent
  label: string
  onClick?: () => void
}

interface AIInputDropdownProps<T> {
  isOpen: boolean
  onClose: () => void
  items: T[]
  renderItem?: (item: T, index: number) => React.ReactNode
  className?: string
}

function AIInputDropdown<T extends DropdownItem>({
  isOpen,
  onClose,
  items,
  renderItem,
  className,
}: AIInputDropdownProps<T>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            role="button"
            tabIndex={-1}
            aria-label="Dismiss"
            className="fixed inset-0 z-40 bg-transparent"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
            }}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className={cn(
              'absolute bottom-full left-0 mb-2 bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5',
              className
            )}
          >
            <div className="flex flex-col gap-0.5">
              {items.map((item, index) =>
                renderItem ? (
                  <div key={item.label} role="presentation" onClick={onClose}>
                    {renderItem(item, index)}
                  </div>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick?.()
                      onClose()
                    }}
                    className="flex items-center gap-2 px-2 py-2.5 w-full text-left text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-2xl transition-colors group"
                  >
                    {item.icon && (
                      <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" />
                    )}
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// PILL BUTTON
// =============================================================================

interface AIInputPillButtonProps {
  children: React.ReactNode
  isActive?: boolean
  showChevron?: boolean
  chevronRotated?: boolean
  showClose?: boolean
  onClose?: () => void
  onClick?: () => void
  layoutId?: string
  className?: string
  icon?: IconComponent
}

function AIInputPillButton({
  children,
  isActive = false,
  showChevron = false,
  chevronRotated = false,
  showClose = false,
  onClose,
  onClick,
  layoutId,
  className,
  icon: Icon,
}: AIInputPillButtonProps) {
  const baseStyles =
    'flex items-center gap-2 px-3 py-2 rounded-full transition-colors border cursor-pointer'
  const activeStyles =
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-black/10 dark:border-white/10'
  const inactiveStyles =
    'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-black/5 dark:border-white/5'

  const pillContent = (
    <>
      {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
      {children}
      {showChevron && (
        <ChevronDown
          className={cn(
            'w-4 h-4 text-zinc-400 transition-transform',
            chevronRotated && 'rotate-180'
          )}
        />
      )}
    </>
  )

  if (showClose) {
    return (
      <m.div
        layoutId={layoutId}
        layout
        transition={{ duration: 0.3 }}
        className={cn(baseStyles, isActive ? activeStyles : inactiveStyles, className)}
      >
        <button onClick={onClick} className="flex items-center gap-2 cursor-pointer">
          {pillContent}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className="ml-1 p-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-600 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </m.div>
    )
  }

  return (
    <m.button
      layoutId={layoutId}
      layout
      onClick={onClick}
      transition={{ duration: 0.3 }}
      className={cn(baseStyles, isActive ? activeStyles : inactiveStyles, className)}
    >
      {pillContent}
    </m.button>
  )
}

// =============================================================================
// FILE PREVIEW
// =============================================================================

interface AIInputFilePreviewProps {
  files: UploadedFile[]
  onRemove: (id: string) => void
}

function AIInputFilePreview({ files, onRemove }: AIInputFilePreviewProps) {
  return (
    <AnimatePresence>
      {files.length > 0 && (
        <m.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto', transition: { ease: 'easeInOut' } }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeInOut' } }}
          className="overflow-hidden"
        >
          <div className="px-4 pt-4 pb-2 flex flex-wrap gap-2">
            {files.map((file) => (
              <m.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="relative group/file"
              >
                {file.type === 'image' ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : file.type === 'video' ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <video src={file.preview} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-1 p-1">
                    <FileIcon className="w-5 h-5 text-zinc-500" />
                    <span className="text-[8px] text-zinc-500 truncate w-full text-center">
                      {file.file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => onRemove(file.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full dark:bg-zinc-800 bg-zinc-100 text-zinc-500 dark:text-zinc-400 flex items-center justify-center border border-black/5 dark:border-white/10 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </m.div>
            ))}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export interface AICofounderInputProps {
  value: string
  onValueChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  personas: PersonaOption[]
  selectedPersona: string
  onPersonaChange: (value: string) => void
  quickChat?: boolean
  onQuickChatChange?: (value: boolean) => void
  className?: string
}

export function AICofounderInput({
  value,
  onValueChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = 'Ask anything...',
  personas,
  selectedPersona,
  onPersonaChange,
  quickChat = false,
  onQuickChatChange,
  className,
}: AICofounderInputProps) {
  const [activeDropdown, setActiveDropdown] = useState<'plus' | 'tools' | 'persona' | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const hasText = value.trim().length > 0
  const canSubmit = hasText && !isLoading && !disabled

  const currentPersona = personas.find((p) => p.value === selectedPersona) ?? personas[0]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: isImage || isVideo ? URL.createObjectURL(file) : '',
        type: isVideo ? 'video' : isImage ? 'image' : 'file',
      }
    })

    setUploadedFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const handlePlusMenuClick = (itemId: string) => {
    setActiveDropdown(null)
    if (itemId === 'files') fileInputRef.current?.click()
    else if (itemId === 'videos') videoInputRef.current?.click()
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit()
    setUploadedFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <LazyMotion features={domMax}>
      <AIInputContext.Provider value={{ activeDropdown, setActiveDropdown }}>
        <div className={cn('w-full relative group', className)}>
          <m.div
            layoutId="ai-input-container"
            layout
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative bg-white dark:bg-[#09090b] rounded-[32px] border border-black/5 dark:border-white/5"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.md"
              className="hidden"
              onChange={handleFileSelect}
            />
            <input
              ref={videoInputRef}
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <AIInputFilePreview files={uploadedFiles} onRemove={removeFile} />

            <div className="p-4 pb-14">
              <m.textarea
                layout
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={isLoading ? 'Thinking...' : placeholder}
                className="w-full bg-transparent text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none outline-none min-h-10 max-h-50"
                rows={1}
                style={{ minHeight: '44px', height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${target.scrollHeight}px`
                }}
              />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
              {/* Left Side */}
              <div className="flex items-center gap-2">
                {/* Plus / Attach */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(activeDropdown === 'plus' ? null : 'plus')
                    }
                    className={cn(
                      'p-2.5 rounded-full transition-colors border',
                      activeDropdown === 'plus'
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-black/10 dark:border-white/10'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-black/5 dark:border-white/5'
                    )}
                  >
                    <Plus
                      className={cn(
                        'w-5 h-5 transition-transform',
                        activeDropdown === 'plus' && 'rotate-45'
                      )}
                    />
                  </button>
                  <AIInputDropdown
                    isOpen={activeDropdown === 'plus'}
                    onClose={() => setActiveDropdown(null)}
                    items={DEFAULT_PLUS_MENU}
                    className="w-56 bottom-full left-0 mb-2"
                    renderItem={(item) => (
                      <button
                        onClick={() => handlePlusMenuClick(item.id)}
                        className="flex items-center gap-2 px-4 py-3 w-full text-left text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-2xl transition-colors group"
                      >
                        <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    )}
                  />
                </div>

                {/* Quick Chat toggle */}
                {onQuickChatChange && (
                  <div className="hidden sm:block">
                    <AIInputPillButton
                      layoutId="quick-chat-pill"
                      icon={Zap}
                      isActive={quickChat}
                      showClose={quickChat}
                      onClick={() => onQuickChatChange(!quickChat)}
                      onClose={() => onQuickChatChange(false)}
                    >
                      <span className="text-sm font-medium">Quick Chat</span>
                    </AIInputPillButton>
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-2">
                {/* Persona selector */}
                <div className="relative">
                  <AIInputPillButton
                    layoutId="persona-pill"
                    icon={currentPersona?.icon ?? Sparkles}
                    isActive={activeDropdown === 'persona'}
                    showChevron
                    chevronRotated={activeDropdown === 'persona'}
                    onClick={() =>
                      setActiveDropdown(activeDropdown === 'persona' ? null : 'persona')
                    }
                  >
                    <span className="text-sm font-medium">
                      {currentPersona?.label ?? 'Persona'}
                    </span>
                  </AIInputPillButton>

                  <AIInputDropdown
                    isOpen={activeDropdown === 'persona'}
                    onClose={() => setActiveDropdown(null)}
                    items={personas.map((p) => ({
                      icon: p.icon ?? Sparkles,
                      label: p.label,
                    }))}
                    className="w-52 bottom-full right-0 mb-2 p-1"
                    renderItem={(item) => {
                      const persona = personas.find((p) => p.label === item.label)
                      const isSelected = persona?.value === selectedPersona
                      return (
                        <button
                          onClick={() => {
                            if (persona) onPersonaChange(persona.value)
                            setActiveDropdown(null)
                          }}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 w-full text-left text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-2xl transition-colors group',
                            isSelected && 'bg-zinc-100 dark:bg-zinc-800'
                          )}
                        >
                          {item.icon && (
                            <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors" />
                          )}
                          <span className="text-sm font-medium">{item.label}</span>
                          {isSelected && <Check className="w-4 h-4 ml-auto text-zinc-500" />}
                        </button>
                      )
                    }}
                  />
                </div>

                {/* Send / Clear */}
                <div className="flex justify-end">
                  <AnimatePresence mode="wait" initial={false}>
                    {hasText ? (
                      <m.div
                        key="active-controls"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => onValueChange('')}
                          className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!canSubmit}
                          className="p-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          <ArrowUp className="w-5 h-5" />
                        </button>
                      </m.div>
                    ) : (
                      <m.div
                        key="inactive-controls"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          disabled
                          className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </AIInputContext.Provider>
    </LazyMotion>
  )
}
