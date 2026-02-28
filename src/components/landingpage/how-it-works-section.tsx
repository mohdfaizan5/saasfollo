import Link from "next/link";
import type { HowItWorksContent } from "@/data/landing-content";
import { Folder } from "../ui/folder";

interface HowItWorksSectionProps {
  content: HowItWorksContent;
}

export default function HowItWorksSection({ content }: HowItWorksSectionProps) {
  return (
    <section className="w-full">
      {/* Dark green header band */}
      <div className="w-full bg-[#2C4839] py-14 md:py-20 relative overflow-">
        <div className="max-w-3xl mx-auto px-6 text-center ">
          <h2 className="text-[#F6F1EA] text-3xl sm:text-4xl md:text-5xl font-semibold  leading-[0.85]">
            {content.sectionHeadlineBefore}
            <br />
            {content.sectionHeadlineEmphasis}
          </h2>
        </div>
        <div className="absolute right-10 -top-4/12 left-1/12 hidden lg:block opacity-90 hover:opacity-100 transition-opacity z-0">
          <Folder direction="right" color="#F4D5D5" text="Secret" className="-rotate-12 w-60 h-96 !font-sans " textClassName="font-normal  -rotate-12" />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full bg-[#F6F1EA]">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="space-y-20 md:space-y-28">
            {content.steps.map((step, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-lg ${i % 2 === 1 ? "items-end text-right ml-auto" : "items-start"
                  }`}
              >
                <div className="w-11 h-11 rounded-full bg-[#2C4839] text-[#F6F1EA] flex items-center justify-center font-serif-instrumental text-lg mb-5">
                  {i + 1}
                </div>
                <p className="text-[#A6AEA4] text-xs font-sans uppercase tracking-[0.15em] mb-0">
                  {step.label}
                </p>
                <h3 className="text-[#0C1510] text-3xl md:text-4xl  font-serif-instrumental  ">
                  {step.headline}{" "}
                  {step.headlineItalic}
                </h3>
                <p className="text-[#0C1510]/55 text-base font-sans  mt-3 max-w-md">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
