// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { differenceInDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createGrowthPlan } from '@/lib/actions/growth';
import type { GrowthActivityType } from '@/lib/types/database';
import {
    FileTextIcon,
    ChatTextIcon,
    EnvelopeSimpleIcon,
    CurrencyDollarIcon,
    FlaskIcon,
    ChartLineUpIcon,
    SmileyIcon,
    MoneyIcon,
    CursorClickIcon,
    RocketLaunchIcon,
    RedditLogoIcon,
    CalendarStarIcon,
    WrenchIcon,
    CalendarIcon
} from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

const ACTIVITY_DEF = [
    { type: 'SEO' as GrowthActivityType, label: 'SEO Pages', defaultUnit: 'pages', icon: FileTextIcon },
    { type: 'COLD_DM' as GrowthActivityType, label: 'Cold DMs', defaultUnit: 'messages', icon: ChatTextIcon },
    { type: 'COLD_EMAIL' as GrowthActivityType, label: 'Cold Emails', defaultUnit: 'emails', icon: EnvelopeSimpleIcon },
    { type: 'PAID_ADS' as GrowthActivityType, label: 'Paid Ads', defaultUnit: 'campaigns', icon: CurrencyDollarIcon },
    { type: 'AB_TEST' as GrowthActivityType, label: 'A/B Testing', defaultUnit: 'tests', icon: FlaskIcon },
    { type: 'ANALYTICS' as GrowthActivityType, label: 'Analytics', defaultUnit: 'reports', icon: ChartLineUpIcon },
    { type: 'USER_FEEDBACK' as GrowthActivityType, label: 'User Feedback', defaultUnit: 'interviews', icon: SmileyIcon },
    // { type: 'PRICING_OPTIMIZATION' as GrowthActivityType, label: 'Pricing Opt.', defaultUnit: 'tests', icon: MoneyIcon },
    { type: 'CRO' as GrowthActivityType, label: 'CRO', defaultUnit: 'experiments', icon: CursorClickIcon },
    { type: 'ACCELERATOR' as GrowthActivityType, label: 'Accelerator Apps', defaultUnit: 'apps', icon: RocketLaunchIcon },
    { type: 'REDDIT' as GrowthActivityType, label: 'Reddit Posts', defaultUnit: 'posts', icon: RedditLogoIcon },
    { type: 'EVENTS' as GrowthActivityType, label: 'Events Attended', defaultUnit: 'events', icon: CalendarStarIcon },
    { type: 'CUSTOM' as GrowthActivityType, label: 'Custom Activity', defaultUnit: 'units', icon: WrenchIcon },
];

interface SelectedActivity {
    type: GrowthActivityType;
    customName?: string;
    target?: number;
}

interface GrowthOnboardingProps {
    projectId: number;
    versionId: number;
    versionName: string;
}

export function GrowthOnboarding({ projectId, versionId, versionName }: GrowthOnboardingProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedTypes, setSelectedTypes] = useState<GrowthActivityType[]>([]);
    const [activities, setActivities] = useState<SelectedActivity[]>([]);
    const [deadline, setDeadline] = useState<Date>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleSelect = (type: GrowthActivityType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const goToStep2 = () => {
        if (selectedTypes.length === 0) return;
        const initActs = selectedTypes.map(t => ({
            type: t,
            target: 0,
            customName: t === 'CUSTOM' ? '' : undefined
        }));
        setActivities(initActs);
        setStep(2);
    };

    const updateActivity = (index: number, updates: Partial<SelectedActivity>) => {
        setActivities(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...updates };
            return copy;
        });
    };

    const goToStep3 = () => {
        if (!deadline) return;
        const invalidTarget = activities.some(a => !a.target || a.target <= 0);
        const invalidCustom = activities.some(a => a.type === 'CUSTOM' && !a.customName?.trim());
        if (invalidTarget || invalidCustom) return;
        setStep(3);
    };

    const submit = async () => {
        if (!deadline) return;
        setIsSubmitting(true);
        try {
            await createGrowthPlan(
                projectId,
                versionId,
                deadline,
                activities.map(a => ({ type: a.type, target: a.target!, customName: a.customName }))
            );
            // Wait for revalidation
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Failed to create plan");
            setIsSubmitting(false);
        }
    };

    if (step === 1) {
        return (
            <div className="space-y-6">
                {/* <Card className="border-border/70 bg-muted/20">
                    <CardContent className="p-6"> */}

                {/* </CardContent>
                </Card> */}

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {ACTIVITY_DEF.map(def => {
                        const Icon = def.icon;
                        const isSelected = selectedTypes.includes(def.type);
                        return (
                            <Card
                                key={def.type}
                                className={cn(
                                    "cursor-pointer transition-all hover:bg-muted/50 hover:border-primary/40 hover:shadow-sm",
                                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                                )}
                                onClick={() => toggleSelect(def.type)}
                            >
                                <CardContent className="flex flex-col items-center gap-3 p-4 px-3 text-center h-full justify-center">
                                    <Icon className={cn("w-8 h-8", isSelected ? "text-primary" : "text-muted-foreground")} weight="duotone" />
                                    <span className="font-medium text-sm leading-tight">{def.label}</span>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-4">
                    <Button disabled={selectedTypes.length === 0} onClick={goToStep2}>
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="space-y-6">
                <Card className="border-border/70 bg-muted/20">
                    <CardContent className="p-6">
                        <h2 className="text-3xl font-bold tracking-tight">How much, and by when?</h2>
                        <p className="text-muted-foreground mt-2">Set a target for each activity and a deadline to keep yourself on track.</p>
                    </CardContent>
                </Card>

                <div className="space-y-6 p-0">
                    <div className="space-y-2 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-muted/40 border border-border/70 px-4 py-4 rounded-xl gap-3">
                        <div>

                            <Label className="text-base mb-0">Deadline</Label>
                            <p className="text-sm text-muted-foreground">When are you wrapping this up?</p>
                        </div>
                        <Popover >
                            {/*  */}
                            <PopoverTrigger >
                                <Button
                                    
                                    variant="outline"
                                    className={cn(
                                        "w-full sm:w-70 justify-start text-left font-normal",
                                        !deadline && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent  className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={deadline}
                                    onSelect={setDeadline}
                                    initialFocus
                                    disabled={(d) => d < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base">Target Numbers</Label>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {activities.map((act, i) => {
                                const def = ACTIVITY_DEF.find(d => d.type === act.type)!;
                                const Icon = def.icon;
                                return (
                                    <div key={i} className="flex gap-4 items-center bg-muted/30 p-4 rounded-xl border border-border/70">
                                        <div className="bg-background border border-border/70 shadow-sm p-3 rounded-md">
                                            <Icon weight="duotone" className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="font-medium">{def.label}</p>
                                            {act.type === 'CUSTOM' ? (
                                                <Input
                                                    placeholder="Activity name (e.g. Cold calls)"
                                                    value={act.customName || ''}
                                                    onChange={(e) => updateActivity(i, { customName: e.target.value })}
                                                    className="h-8 max-w-50"
                                                />
                                            ) : (
                                                <p className="text-xs text-muted-foreground">How many {def.defaultUnit}?</p>
                                            )}
                                        </div>
                                        <div className="w-36 shrink-0">
                                            <Label className="sr-only">Target Value</Label>
                                            <NumberInput
                                                min={1}
                                                placeholder="e.g. 100"
                                                value={act.target || ''}
                                                onChange={(val) => updateActivity(i, { target: val })}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {/* <Card className="p-6 bg-amber-300 ">

                </Card> */}

                <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button
                        disabled={!deadline || activities.some(a => !a.target || a.target <= 0 || (a.type === 'CUSTOM' && !a.customName?.trim()))}
                        onClick={goToStep3}
                    >
                        See Your Plan
                    </Button>
                </div>
            </div>
        );
    }

    // Step 3 
    const remainingDays = deadline ? Math.max(1, differenceInDays(deadline, new Date())) : 1;

    return (
        <div className="space-y-6">
            <Card className="border-border/70 bg-muted/20">
                <CardContent className="text-center py-6">
                    <h2 className="text-3xl font-bold tracking-tight">Here's your plan</h2>
                    <p className="text-muted-foreground mt-2">{remainingDays} days to hit these numbers. Here's what that looks like day-to-day.</p>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70">
                <div className="p-0 border-b">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Activity</th>
                                <th className="px-6 py-4 font-semibold text-right">Target</th>
                                <th className="px-6 py-4 font-semibold text-right">Daily Pace</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((act, i) => {
                                const def = ACTIVITY_DEF.find(d => d.type === act.type)!;
                                const dailyReq = Math.ceil((act.target || 0) / remainingDays);
                                const name = act.type === 'CUSTOM' ? act.customName : def.label;
                                return (
                                    <tr key={i} className="border-b last:border-0 border-border bg-background">
                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                            <def.icon className="w-4 h-4 text-primary" weight="duotone" />
                                            {name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">{act.target}</td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">
                                            ~ {dailyReq} / day
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting}>Back</Button>
                <Button onClick={submit} disabled={isSubmitting} size="lg" className="px-12">
                    {isSubmitting ? 'Setting up...' : 'Start Sprint'}
                </Button>
            </div>
        </div>
    );
}
