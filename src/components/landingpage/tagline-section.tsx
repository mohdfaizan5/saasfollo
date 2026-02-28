import type { TaglineContent } from "@/data/landing-content";
import { Folder } from "@/components/ui/folder";
import { GearIcon } from "@phosphor-icons/react/dist/ssr";

interface TaglineSectionProps {
  content: TaglineContent;
}

export default function TaglineSection({ content }: TaglineSectionProps) {
  return (
    <section className="w-full bg-[#F6F1EA] py-20 md:py-28 relative overflow-hidden">
      {/* Decorative Folders */}
      {/* <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block opacity-90 hover:opacity-100 transition-opacity z-0">
        <Folder direction="right" color="#F4D5D5" text="TEAM" className="rotate-6" />
      </div> */}
      <div className="absolute right-10 top-8/12 -translate-y-1/2 hidden lg:block opacity-90 hover:opacity-100 transition-opacity z-0">
        <Folder direction="left" icon={<GearIcon size={42} weight="duotone" className="absolute top-1/3"/>} color="#D2E4D4" text="Systems" className="rotate-12 w-60 h-96 font- " textClassName="font-normal  -rotate-12"  />
      </div>

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <p className="text-[#0C1510]/50 text-base md:text-lg font-sans mb-4 tracking-wide">
          {content.subtitle}
        </p>
        <h2 className="text-[#0C1510] text-3xl sm:text-4xl md:text-5xl  font-semibold opacity-85 ">
          {content.headlineBefore}
        {content.headlineEmphasis}
          {content.headlineAfter && (
            <>
              <br className="hidden md:block" />
              {content.headlineAfter} 
            </>
          )}
        </h2>
      </div>
    </section>
  );
}
