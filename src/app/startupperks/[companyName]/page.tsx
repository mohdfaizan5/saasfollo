import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Gift, Tag, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { startupPerks, categories, getPerkByCompany } from '@/data/startupperks';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { ArrowBendDoubleUpLeftIcon, ArrowBendUpLeftIcon } from '@phosphor-icons/react';

interface Props {
  params: Promise<{ companyName: string }>;
}

export async function generateStaticParams() {
  return startupPerks.map((perk) => ({
    companyName: perk.companyName.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companyName } = await params;
  const perk = getPerkByCompany(companyName);

  if (!perk) {
    return { title: 'Perk Not Found | SaaSFollo' };
  }


  return {
    title: `${perk.companyName} - ${perk.perkName} | Startup Perks | SaaSFollo`,
    description: perk.description,
    openGraph: {
      title: `${perk.companyName} - ${perk.perkName}`,
      description: perk.description,
      type: 'website',
    },
  };
}

export default async function PerkDetailPage({ params }: Props) {
  const { companyName } = await params;
  const perk = getPerkByCompany(companyName);

  if (!perk) {
    notFound();
  } const steps = [
    {
      step: 1,
      title: `Click the ${perk.companyName} button above`,

    },
    {
      step: 2,
      title: "Fill in the form for and submit",
    },
    {
      step: 3,
      title: "Receive your perk",
    },
    {
      step: 4,
      title: "Enjoy the perk",
    },
  ];

  const categoryInfo = categories.find(c => c.value === perk.category);
  const relatedPerks = startupPerks
    .filter(p => p.category === perk.category && p.companyName !== perk.companyName)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F6F1EA]">
      {/* Header */}
      <div className="bg-[#2C4839] text-white py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/startupperks"
            className="inline-flex items-center gap-2 text-[#A6AEA4] hover:text-white transition-colors mb-4 md:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all perks
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-0">
            {perk.companyName}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4 md:mb-6">
            <p className="text-lg md:text-xl text-[#A6AEA4]">
              {perk.perkName}
            </p>
            <Badge
              variant="secondary"
              className="font-semibold w-fit"
              style={{
                backgroundColor: '#F6F1EA',
                color: categoryInfo?.color || '#2C4839'
              }}
            >
              {categoryInfo?.label || perk.category}
            </Badge>
          </div>
          <Card className="border-2 border-[#2C4839] shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 md:p-3 rounded-full bg-[#F6F1EA]">
                  <Gift className="h-5 w-5 md:h-6 md:w-6 text-[#2C4839]" />
                </div>
                <div>
                  <div className="text-xs md:text-sm text-[#444444]">Value</div>
                  <div className="text-xl md:text-2xl font-bold text-[#0C1510]">
                    {perk.valueOrDiscount}
                  </div>
                </div>
              </div>
              <a
                href={perk.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  className="w-full bg-[#2C4839] hover:bg-[#0C1510] text-white py-4 md:py-6 text-base md:text-lg font-semibold"
                >
                  Apply Now
                  <ExternalLink className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Description */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#0C1510] mb-3 md:mb-4">About this Perk</h2>
          <p className="text-base md:text-lg text-[#0C1510]/80 leading-relaxed">
            {perk.description}
          </p>
        </div>

        {/* What's Included */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#0C1510] mb-3 md:mb-4">What's Included</h2>
          <Card>
            <CardContent className="px-4 py-3 md:py-4">
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-[#2C4839] mt-0.5 shrink-0" />
                  <span className="text-sm md:text-base text-[#0C1510]/80">Exclusive startup pricing and discounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-[#2C4839] mt-0.5 shrink-0" />
                  <span className="text-sm md:text-base text-[#0C1510]/80">Priority access to new features and products</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-[#2C4839] mt-0.5 shrink-0" />
                  <span className="text-sm md:text-base text-[#0C1510]/80">Technical support and dedicated assistance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-[#2C4839] mt-0.5 shrink-0" />
                  <span className="text-sm md:text-base text-[#0C1510]/80">Access to startup community and resources</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How to Apply */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#0C1510] mb-3 md:mb-4">How to Apply</h2>
          <div className="space-y-6 md:space-y-8">
            <Stepper defaultValue={2} orientation="vertical">
              {steps.map(({ step, title }) => (
                <StepperItem
                  className="relative not-last:flex-1 items-start"
                  key={step}
                  step={step}
                >
                  <StepperTrigger className="items-start rounded pb-8 md:pb-10 last:pb-0">
                    <StepperIndicator />
                    <div className="mt-0.5 px-2 text-left">
                      <StepperTitle className="text-sm md:text-base">{title}</StepperTitle>
                    </div>
                  </StepperTrigger>
                  {step < steps.length && (
                    <StepperSeparator className="-order-1 -translate-x-1/2 absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 m-0 group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </div>
        </div>

        {/* Related Perks */}
        {relatedPerks.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0C1510] mb-3 md:mb-4">Related Perks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {relatedPerks.map((relatedPerk) => (
                <Link key={relatedPerk.companyName} href={`/startupperks/${relatedPerk.companyName.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#2C4839]">
                    <CardContent className="p-3 md:p-4">
                      <h3 className="font-bold text-[#0C1510] text-sm md:text-base mb-1">{relatedPerk.companyName}</h3>
                      <p className="text-xs md:text-sm text-[#A6AEA4] mb-2">{relatedPerk.perkName}</p>
                      <span
                        className="inline-flex items-center text-xs md:text-sm font-medium"
                        style={{ color: categories.find(c => c.value === relatedPerk.category)?.color || '#2C4839' }}
                      >
                        {relatedPerk.valueOrDiscount}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0C1510] text-white py-6 md:py-8 px-4 mt-8 md:mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/startupperks"
            className="inline-flex items-center gap-2 text-[#A6AEA4] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            View all {startupPerks.length} perks
          </Link>
        </div>
      </footer>
    </div>
  );
}
