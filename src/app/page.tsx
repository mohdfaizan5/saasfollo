import { HeroSection } from "@/components/landingpage/hero-section";
import TaglineSection from "@/components/landingpage/tagline-section";
import HowItWorksSection from "@/components/landingpage/how-it-works-section";
import WhySaasFolloSection from "@/components/landingpage/why-saasfollo-section";
import ManifestoSection from "@/components/landingpage/manifesto-section";
import TestimonialsSection from "@/components/landingpage/testimonials-section";
import FAQSection from "@/components/landingpage/faq-section";
import CTASection from "@/components/landingpage/cta-section";
import FooterSection from "@/components/landingpage/footer-section";
import { landingContent } from "@/data/landing-content";

export const metadata = {
  title: "SaaSFollo — The OS for Solo SaaS Founders",
  description:
    "Plan versions, ship features, track growth. The all-in-one system built for solo founders who are tired of juggling scattered tools.",
};

// Pick a random content variation per render.
// During dev (hot reload) you'll see different variations on refresh.
// In production builds (SSG), the variation is fixed at build time.
// To force SSR per request, uncomment: export const dynamic = 'force-dynamic';
const variation =
  landingContent[0];
  // landingContent[Math.floor(Math.random() * landingContent.length)];
/*
[#F6F1EA] 
bg-[#f7f5f3] 
foreground text-[#0C1510]
*/ 

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background overflow-x-hidden">
      <HeroSection content={variation.hero} />
      <TaglineSection content={variation.tagline} />
      <HowItWorksSection content={variation.howItWorks} />
      {/* <WhySaasFolloSection content={variation.whySaasfollo} /> */}
      {/* <ManifestoSection content={variation.manifesto} /> */}
      {/* <TestimonialsSection /> */}
      <FAQSection />
      <CTASection content={variation.cta} />
      <FooterSection />
    </div>
  );
}
