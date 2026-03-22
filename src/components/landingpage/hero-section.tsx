import Link from "next/link";
import Logo from "../logo";
import type { HeroContent } from "@/data/landing-content";
import Image from "next/image";
import Navbar2 from "./navbar2";

interface HeroSectionProps {
  content: HeroContent;
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="w-full bg-[#f7f5f3] relative overflow-hidden min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/herosection-man-using-pc.png"
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Optional overlay to ensure text readability */}
        <div className="absolute inset-0 bg-[#f7f5f3]/15 " />
        <div className="absolute bottom-10 lg:left-[53%] lg:top-[66%]">
          <span className="text-[#25F10A] font-mono font-black">{">"}</span>
          <span className="text-[#25F10A] font-mono font-black animate-pulse">{"|"}</span>
        </div>
      </div>


      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(166,174,164,0.08)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Navigation */}
      <Navbar2 />
      {/* Hero Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-28 md:pt-18 md:pb-40 relative z-10">
        <div className="max-w-2xl text-center flex flex-col items-center gap-2">
          <p className="foreground/60 font-semibold text-base md:text-lg font-sans tracking-wide">
            {content.preHeadline}
          </p>
          {/* font-serif-instrumental w-lg */}
          <div className="relative">
            <h1 className="text-slate-950 text-5xl sm:text-6xl md:text-7xl font-serif-instrumental font-bold w-2xl leading-[0.8]">
              {content.headline}
            </h1>
            <Image
              src="/three-lines.svg"
              alt="Hero Background"
              width={18}
              height={18}
              className="absolute -top-1.5 -right-1.5 opacity-60"
            />
          </div>
          {/* <p className="text-foreground font-semibold text-base md:text-lg font-sans tracking-wide">
            {content.postHeadline}
          </p> */}
          <p className="text-black text- md:text-[15px] font-sans max-w-sm leading-">
            {content.subheadline}
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-32 h-12 px-10 bg-[#0C1510] text-[#F6F1EA] text-[15px] font-medium font-sans rounded-full inline-flex items-center hover:bg-[#1a2a20] transition-colors shadow-lg"
          >
            {content.cta}
          </Link>

        </div>
      </div>
    </section>
  );
}
