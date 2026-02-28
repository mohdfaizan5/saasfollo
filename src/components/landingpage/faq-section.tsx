"use client"

import { SealQuestionIcon } from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"
import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is SaaSFollo and who is it for?",
    answer:
      "SaaSFollo is the all-in-one operating system for solo SaaS founders — with a built-in AI cofounder. If you're tired of juggling Notion, Trello, spreadsheets, and a dozen other tools just to plan, build, and grow your SaaS — this is built for you.",
  },
  {
    question: "What does the AI cofounder actually do?",
    answer:
      "It's an AI that knows your entire project — your tasks, versions, notes, growth data. You can ask it anything and switch its persona: get architecture advice as a CTO, keyword strategy as an SEO expert, landing page copy as a copywriter, or brutally honest feedback as a customer. It's context-aware, not a generic chatbot.",
  },
  {
    question: "How is this different from Notion or Trello?",
    answer:
      "Notion and Trello are general-purpose tools you have to set up from scratch. SaaSFollo is purpose-built for solo founders — version-based planning, growth tracking, and an AI cofounder that understands your project. No setup, no templates to find, no integration headaches.",
  },
  {
    question: "What does version-based planning mean?",
    answer:
      "Instead of an endless backlog that never shrinks, you define clear versions of your product (like v1, v2, v3). Each version has specific goals, a deadline, and tasks tied to it. You ship one version, then move to the next. It's how great products actually get built.",
  },
  {
    question: "How does growth tracking work?",
    answer:
      "You pick your growth channels — SEO, cold DMs, cold emails, Reddit, etc. Set weekly targets for each. SaaSFollo tracks your daily progress, builds streaks, and gives you a clear view of how consistently you're doing the work that drives growth.",
  },
  {
    question: "How do I get started?",
    answer:
      "Sign up for free, create your first project, and define your current version. Start adding tasks, notes, and links. Ask your AI cofounder for a plan. No credit card required.",
  },
]

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <section className="w-full bg-[#F6F1EA] border-t border-[#0C1510]/6">
      <div className="max-w-4xl mx-auto px-6 pb-20 md:pb-28">
        <Image
          src="/phone-hanging-down.png"
          alt="FAQ Section Decoration"
          width={120}
          height={120}
          className="mx-auto mb-8"
        />
        <h2 className="text-[#0C1510] text-3xl md:text-5xl font-medium font-serif-instrumental text-center mb-14">
          Frequently asked questions
          <SealQuestionIcon size={38} weight="duotone" className="ml-3 inline-block" />
        </h2>
        <div className="max-w-2xl mx-auto">
          {faqData.map((item, index) => {
            const isOpen = openItems.includes(index)

            return (
              <div key={index} className="border-b border-[#0C1510]/8">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full py-5 flex justify-between items-center gap-4 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-[#0C1510] text-[15px] font-sans font-medium leading-snug group-hover:text-[#2C4839] transition-colors">
                    {item.question}
                  </span>
                  <ChevronIcon
                    className={`w-5 h-5 text-[#0C1510]/30 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="pb-5 text-[#0C1510]/55 text-sm font-sans leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
