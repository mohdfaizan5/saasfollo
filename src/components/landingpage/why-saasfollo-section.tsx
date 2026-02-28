import type { WhySaasfolloContent } from "@/data/landing-content";

interface WhySaasfolloSectionProps {
  content: WhySaasfolloContent;
}

export default function WhySaasFolloSection({ content }: WhySaasfolloSectionProps) {
  return (
    <section className="w-full bg-[#F6F1EA] border-t border-[#0C1510]/6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center">
        <p className="text-[#0C1510]/50 text-base font-sans mb-3 tracking-wide">
          {content.subtitle}
        </p>
        <h2 className="text-[#0C1510] text-3xl sm:text-4xl md:text-5xl font-serif font-semibold leading-[1.15] text-center mb-14">
          {content.headlineBefore}
          <em>{content.headlineEmphasis}</em>
          {content.headlineAfter}
        </h2>

        <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-sm border border-[#0C1510]/6">
          <div className="space-y-5">
            {content.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#2C4839] flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 6L5 8.5L9.5 4"
                      stroke="#F6F1EA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-[#0C1510] text-[15px] font-sans leading-snug">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
