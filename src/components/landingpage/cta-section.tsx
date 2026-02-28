import Link from "next/link";
import type { CTAContent } from "@/data/landing-content";
import { GearFineIcon, GearIcon } from "@phosphor-icons/react/dist/ssr";

interface CTASectionProps {
  content: CTAContent;
}

export default function CTASection({ content }: CTASectionProps) {
  return (
    <section className="w-full bg-[#2C4839] relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(166,174,164,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 py-20 md:py-20 text-center relative z-10">
        <h2 className="text-[#F6F1EA] text-3xl sm:text-4xl md:text-6xl font-serif-instrumental  leading-[0.85] mb-4">
          {content.headlineBefore} 
          <br className="hidden md:block" />
          {content.headlineEmphasis}
          {content.headlineAfter}
        </h2>
        <p className="text-[#A6AEA4] text-base font-sans max-w-md mx-auto leading-relaxed mb-8">
          {content.subheadline}
        </p>
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center h-12 px-10 bg-[#F6F1EA] text-[#2C4839] text-[15px] font-medium font-sans rounded-full hover:bg-white transition-colors"
        >
          {content.cta} <GearIcon size={18} weight="duotone" className="ml-2" />
        </Link>
      </div>
    </section>
  );
}
