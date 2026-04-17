'use client';

import { useState } from 'react';
import { differenceInDays, isSameDay, subDays, startOfDay, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogPanel,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { logGrowthActivity, type GrowthPlanWithDetails } from '@/lib/actions/growth';
import {
    FireIcon,
    PlusIcon,
    CheckCircleIcon,
    WarningCircleIcon,
    CalendarBlankIcon,
    FlagIcon,
    ChartBarIcon,
    TargetIcon,
    FileTextIcon,
    ChatTextIcon,
    EnvelopeSimpleIcon,
    CurrencyDollarIcon,
    FlaskIcon,
    ChartLineUpIcon,
    SmileyIcon,
    CursorClickIcon,
    RocketLaunchIcon,
    RedditLogoIcon,
    CalendarStarIcon,
    WrenchIcon,
    MoneyIcon
} from '@phosphor-icons/react';
import Gauge from '../gauge';
import type { GrowthActivityType } from '@/lib/types/database';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from 'next/image';
import { Badge } from '../ui/badge';


const ACTIVITY_ICON_MAP: Record<GrowthActivityType, React.ComponentType<any>> = {
    SEO: FileTextIcon,
    COLD_DM: ChatTextIcon,
    COLD_EMAIL: EnvelopeSimpleIcon,
    PAID_ADS: CurrencyDollarIcon,
    AB_TEST: FlaskIcon,
    ANALYTICS: ChartLineUpIcon,
    USER_FEEDBACK: SmileyIcon,
    PRICING_OPTIMIZATION: MoneyIcon,
    CRO: CursorClickIcon,
    ACCELERATOR: RocketLaunchIcon,
    REDDIT: RedditLogoIcon,
    EVENTS: CalendarStarIcon,
    CUSTOM: WrenchIcon,
};

interface GrowthDashboardProps {
    plan: GrowthPlanWithDetails;
    versionName: string;
}

// Minimal formatting
function formatDaysRemaining(deadlineStr: string) {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    if (isBefore(deadline, startOfDay(now))) return 0;
    return differenceInDays(deadline, now) + 1;
}

// Calculate streak based on GrowthLogs
function calculateStreak(plan: GrowthPlanWithDetails): number {
    if (!plan.activities.length) return 0;

    // Flatten all logs from all activities
    const allLogs = plan.activities.flatMap(a => a.logs || []);
    if (allLogs.length === 0) return 0;

    // Sort logs by date descending
    allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Get unique local dates of logs
    const activeDates = new Set(allLogs.map(l => startOfDay(new Date(l.created_at)).toISOString()));

    let streak = 0;
    let currentDate = startOfDay(new Date());

    // Check today
    if (activeDates.has(currentDate.toISOString())) {
        streak = 1;
    } else {
        // If no log today, check if yesterday has a log to maintain streak (currently active streak)
        currentDate = subDays(currentDate, 1);
        if (!activeDates.has(currentDate.toISOString())) {
            return 0; // broken streak
        }
        streak = 1;
    }

    // Count backwards
    while (true) {
        currentDate = subDays(currentDate, 1);
        if (activeDates.has(currentDate.toISOString())) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

export function GrowthDashboard({ plan, versionName }: GrowthDashboardProps) {
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [logActivityId, setLogActivityId] = useState<string>('');
    const [logQuantity, setLogQuantity] = useState<number>(1);
    const [logNote, setLogNote] = useState('');
    const [isLogging, setIsLogging] = useState(false);

    // Stats
    const remainingDays = formatDaysRemaining(plan.deadline);
    const streak = calculateStreak(plan);
    const deadlinePassed = remainingDays <= 0;
    const totalTarget = plan.activities.reduce((sum, activity) => sum + activity.target_value, 0);
    const totalCompleted = plan.activities.reduce((sum, activity) => sum + activity.completed_value, 0);
    const completionRate = totalTarget > 0 ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;

    const handleLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logActivityId || logQuantity <= 0) return;

        setIsLogging(true);
        try {
            await logGrowthActivity(parseInt(logActivityId, 10), logQuantity, logNote);
            setIsLogOpen(false);
            setLogActivityId('');
            setLogQuantity(1);
            setLogNote('');
        } catch (err) {
            console.error(err);
            alert('Failed to log activity.');
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* HEADER */}
            <div className="flex flex-col gap-2">
                <div className='flex  items-center justify-between'>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        Growth Sprint
                        <span className="text-muted-foreground font-medium text-xl">· {versionName}</span>
                    </h1>
                    <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
                        <DialogTrigger className={"w-52"} render={
                            <Button size="lg" className="w-full  shadow-lg shadow-primary/20 group">
                                <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" weight="bold" />
                                Log Activity
                            </Button>
                        } />
                        <DialogPopup className="sm:max-w-106.25">
                            <DialogHeader>
                                <DialogTitle>Log Progress</DialogTitle>
                            </DialogHeader>
                            <DialogPanel className="pt-4">
                                <form onSubmit={handleLogSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Activity</Label>
                                        <Select value={logActivityId} onValueChange={(val) => setLogActivityId(val || '')} required>
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {!logActivityId && <span className="text-muted-foreground">Select activity completed</span>}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {plan.activities.map((act) => (
                                                    <SelectItem key={act.id} value={act.id.toString()}>
                                                        {act.custom_name || act.type.replace(/_/g, ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quantity Done</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            required
                                            value={logQuantity}
                                            onChange={(e) => setLogQuantity(parseInt(e.target.value) || 0)}
                                        />
                                        <p className="text-xs text-muted-foreground">Amount completed in this session.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>(Optional) Note</Label>
                                        <Textarea
                                            placeholder="E.g. messaged top 5 prospects"
                                            value={logNote}
                                            onChange={(e) => setLogNote(e.target.value)}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full font-bold" disabled={isLogging || !logActivityId}>
                                        {isLogging ? 'Logging...' : 'Submit Log'}
                                    </Button>
                                </form>
                            </DialogPanel>
                        </DialogPopup>
                    </Dialog>
                    {/* <p className="text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                        {deadlinePassed ? (
                            <span className="text-destructive flex items-center gap-1">
                                <WarningCircleIcon weight="fill" /> Deadline Passed
                            </span>
                        ) : (
                            <span className="text-primary flex items-center gap-1">
                                <CheckCircleIcon weight="fill" /> {remainingDays} days remaining
                            </span>
                        )}
                    </p> */}
                </div>
            </div>
            <Card className='bg-primary/5 px-2 py-2 text-white relative overflow-hidden border-primary/70'>
                <div className=' flex gap-2'>

                    <Card className="p-4 border-border/70">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <FireIcon weight="fill" className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Streak</p>
                                <p className="font-semibold">{streak > 0 ? `${streak} day${streak > 1 ? 's' : ''}` : 'Start today'}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-border/70">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FlagIcon className="w-5 h-5 text-primary" weight="duotone" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Days Left</p>
                                <p className="font-semibold">{deadlinePassed ? 'Deadline passed' : `${remainingDays} days`}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="absolute -bottom-5 right-1 flex flex-row items-center gap-0 ">
                    <Image src={"/phone-hanging-down.png"} alt="Dashboard Illustration" width={90} height={90} className="smooth-edges  feathered-edges  rounded-full pointer-events-none select-none" />
                    <div className='flex flex-col gap-px mt-10 -ml-5'>
                        <Badge>Marketing</Badge>
                        <Badge>Sales</Badge>
                        <Badge>DM's</Badge>
                    </div>
                </div>
                {/* <CardFooter>
                    <p>Card Footer</p>
                </CardFooter> */}
            </Card>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* <div>

                    <Card className="p-4 border-border/70">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <FireIcon weight="fill" className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Streak</p>
                                <p className="font-semibold">{streak > 0 ? `${streak} day${streak > 1 ? 's' : ''}` : 'Start today'}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 border-border/70">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FlagIcon className="w-5 h-5 text-primary" weight="duotone" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Days Left</p>
                                <p className="font-semibold">{deadlinePassed ? 'Deadline passed' : `${remainingDays} days`}</p>
                            </div>
                        </div>
                    </Card>
                </div> */}

                {/* <Card className="p-4 border-border/70">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <TargetIcon className="w-5 h-5 text-blue-500" weight="duotone" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Activities</p>
                            <p className="font-semibold">{plan.activities.length} active goals</p>
                        </div>
                    </div>
                </Card> */}

                <Card className="p-4 border-border/70 max-h-40 overflow-hidden">
                    {/* <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <ChartBarIcon className="w-5 h-5 text-green-500" weight="duotone" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Progress </p>
                            <p className="font-semibold">{completionRate}% complete</p> */}
                    <div className="flex justify-center items-center  w-full h-[400px] py-2">
                        <Gauge value={completionRate} size={250} gap={2} thickness={4} activeColor='bg-emerald-950' />
                    </div>
                    {/* </div>
                    </div> */}
                </Card>
                <div className=" gap-3 rounded-xl border border-border/70 bg-background py-2">
                    <p className="px-4 text-lg font-medium mb-1">Growth Activities</p>
                    {plan.activities.map((act) => {
                        const percentage = act.target_value > 0
                            ? Math.min(100, Math.round((act.completed_value / act.target_value) * 100))
                            : 0;
                        const name = act.custom_name || act.type;
                        const Icon = ACTIVITY_ICON_MAP[act.type] || WrenchIcon;

                        return (
                            <div
                                key={act.id}
                                className="flex items-center gap-3  p-2.5 px-4 transition-shadow hover:shadow-sm"
                            >
                                {/* Left: Icon */}
                                {/* <div className="shrink-0 mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg bg-muted/60"> */}
                                <Icon size={24} weight="duotone" className="text-foreground/70" />
                                {/* </div> */}

                                {/* Right: Name + Progress */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    {/* Top row: name + count */}
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-sm font-semibold  truncate">
                                            {name.replace(/_/g, ' ')}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground font-medium">
                                            ({act.completed_value}/{act.target_value})
                                        </span>
                                    </div>

                                    {/* Progress bar with circle indicator */}
                                    <div className="relative h-3">
                                        {/* Track */}
                                        <div className="absolute inset-0 rounded-full bg-muted/60 border border-border/40" />
                                        {/* Fill */}
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                        {/* Percentage circle at end of fill */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-full border-2 border-primary bg-background shadow-sm transition-all duration-700 ease-out"
                                            style={{ left: `clamp(0px, calc(${percentage}% - 14px), calc(100% - 28px))` }}
                                        >
                                            {percentage === 100 ? (<CheckCircleIcon className="size-5 text-green-500" weight="fill" />) : (
                                                <span className="text-[9px] font-bold text-primary leading-none">
                                                    {percentage}%
                                                </span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Activity Progress Cards */}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* MAIN COL */}
                <div className="lg:col-span-2 space-y-4">

                </div>

                {/* SIDE COL: Required Output & CTA */}
                <div className="space-y-6">

                    {/* <Card className="border-primary/20 bg-primary/2 pt-0">
                        <CardHeader className="border-b !py-2  bg-background">
                            <CardTitle className="tracking-tight text-base text-foreground flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-primary" />
                                Today's Output
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {plan.activities.map((act) => {
                                    const remainingTarget = Math.max(0, act.target_value - act.completed_value);
                                    const dailyRequired = remainingDays > 0 ? Math.ceil(remainingTarget / remainingDays) : 0;
                                    const name = act.custom_name || act.type;

                                    return (
                                        <li key={act.id} className="p-4 flex justify-between items-center group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                <span className="font-medium text-sm capitalize">{name.replace(/_/g, ' ')}</span>
                                            </div>
                                            <div className="font-bold text-lg">{dailyRequired}</div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </CardContent>
                    </Card> */}



                </div>

            </div>

        </div>
    );
}

// Ensure the icon exists
function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    );
}
