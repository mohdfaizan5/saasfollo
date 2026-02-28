import Link from "next/link";
import type { ManifestoContent } from "@/data/landing-content";

interface ManifestoSectionProps {
  content: ManifestoContent;
}

export default function ManifestoSection({ content }: ManifestoSectionProps) {
  // Support \n in heading for line breaks
  const headingLines = content.heading.split("\n");

  return (
    <section className="w-full bg-[#F6F1EA] border-t border-[#0C1510]/6">
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          {/* Left - Heading */}
          <div className="md:w-1/3">
            <h2 className="text-[#2C4839] text-3xl md:text-4xl font-serif italic leading-[1.2] md:sticky md:top-8">
              {headingLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
          </div>

          {/* Right - Body */}
          <div className="md:w-2/3 space-y-5 text-[#0C1510]/65 text-[15px] font-sans leading-[1.7]">
            <p>{content.intro}</p>
            <p>
              {content.premise}
              <br />
              <strong className="text-[#0C1510]">
                {content.boldStatement}
              </strong>
            </p>
            <p>{content.body}</p>
            <p>{content.extension}</p>
            <p>{content.closing}</p>
            <p className="text-[#0C1510] font-medium">
              {content.signoff}
            </p>
            <Link
              href="/auth/sign-up"
              className="mt-2 inline-flex items-center gap-2 h-10 px-6 bg-[#0C1510] text-[#F6F1EA] text-sm font-medium font-sans rounded-full hover:bg-[#2C4839] transition-colors"
            >
              {content.cta}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
