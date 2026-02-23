"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useProjectRole } from '@/hooks/use-project-role';
import type { Version } from '@/lib/types/database';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Check, Layers, Layout, Package } from 'lucide-react';

interface VersionStepperProps {
  versions: Version[];
  currentActiveId: number | null;
}

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'projects', label: 'Projects', icon: Layout },
  { id: 'packages', label: 'Packages', icon: Package },
];

export default function VersionStepper({ versions, currentActiveId }: VersionStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentTab, setCurrentTab] = useState('overview');
  const searchParams = useSearchParams();
  const versionId = searchParams.get('versionId');
  const tabParam = searchParams.get('tab');
  const router = useRouter();
  
  useEffect(() => {
    if (versionId) {
      setCurrentStep(parseInt(versionId, 10));
    }
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, [versionId, tabParam]);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    router.push(`?versionId=${step}&tab=${currentTab}`);
  };

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    router.push(`?versionId=${currentStep}&tab=${tabId}`);
  };

  const selectedVersion = versions[currentStep - 1];

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-4xl">
        <Stepper onValueChange={setCurrentStep} value={currentStep}>
          {versions.map((version, index) => (
            <StepperItem className="not-last:flex-1" key={version.id} step={index + 1}>
              <StepperTrigger asChild>
                <div className="cursor-pointer">
                  <StepperIndicator />
                  <div className="mt-2 text-sm font-medium">
                    {version.name}
                  </div>
                </div>
              </StepperTrigger>
              {index < versions.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </Stepper>
      </div>

      <div className="flex justify-center space-x-2">
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={currentTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTabClick(tab.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {selectedVersion?.name || 'Select a version'} - {tabConfig.find(t => t.id === currentTab)?.label}
        </h2>
        {selectedVersion && (
          <div className="text-sm text-muted-foreground">
            {selectedVersion.description || 'No description available'}
          </div>
        )}
      </div>
    </div>
  );
}
