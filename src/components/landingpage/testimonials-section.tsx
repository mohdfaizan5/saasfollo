"use client";

import { useState, useEffect } from "react";

export default function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials = [
    {
      quote:
        "I've replaced five scattered tools with one system. What used to live across Notion, Trello, and spreadsheets is now unified. I get my clarity back, my focus returns, and I actually trust my process again.",
      name: "Jamie Marshall",
      company: "Founder, Tech Startup",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2011%2C%202025%2C%2011_35_19%20AM-z4zSRLsbOQDp7MJS1t8EXmGNB6Al9Z.png",
    },
    {
      quote:
        "The old way was manual chaos — juggling tools, losing track, burning out. SaaSFollo gives me clarity. I define what matters, it organizes the rest. It's not just productivity, it's peace of mind.",
      name: "Faizan",
      company: "Founder - UnicornSpace",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2011%2C%202025%2C%2011_01_05%20AM-TBOe92trRxKn4G5So1m9D2h7LRH4PG.png",
      // image: "/faizan-founder-unicornspace.png",
    },
    {
      quote:
        "As a solo founder, I was drowning in missed deadlines and broken promises to myself. SaaSFollo brought back control. I ship consistently, track growth, and actually finish versions. It's the system I wish I had years ago.",
      name: "Marcus Rodriguez",
      company: "Serial Entrepreneur",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2011%2C%202025%2C%2011_01_05%20AM-TBOe92trRxKn4G5So1m9D2h7LRH4PG.png",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 300);
    }, 12000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleClick = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTestimonial(index);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  return (
    <section className="w-full bg-[#F6F1EA] border-t border-[#0C1510]/6">
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <img
            className="w-40 h-48 md:w-48 md:h-56 rounded-xl object-cover transition-all duration-700 shrink-0"
            style={{
              opacity: isTransitioning ? 0.6 : 1,
              transform: isTransitioning ? "scale(0.95)" : "scale(1)",
            }}
            src={testimonials[activeTestimonial].image || "/placeholder.svg"}
            alt={testimonials[activeTestimonial].name}
          />
          <div className="flex-1 flex flex-col justify-between">
            <blockquote
              className="text-[#0C1510] text-2xl md:text-[28px] font-serif leading-snug tracking-tight transition-all duration-700"
              style={{
                filter: isTransitioning ? "blur(3px)" : "blur(0px)",
              }}
            >
              &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
            </blockquote>
            <div
              className="mt-6 transition-all duration-700"
              style={{
                filter: isTransitioning ? "blur(3px)" : "blur(0px)",
              }}
            >
              <p className="text-[#0C1510] text-base font-sans font-medium">
                {testimonials[activeTestimonial].name}
              </p>
              <p className="text-[#0C1510]/40 text-sm font-sans">
                {testimonials[activeTestimonial].company}
              </p>
            </div>
            {/* Navigation dots */}
            <div className="flex gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeTestimonial
                      ? "bg-[#2C4839] w-6"
                      : "bg-[#2C4839]/15 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
