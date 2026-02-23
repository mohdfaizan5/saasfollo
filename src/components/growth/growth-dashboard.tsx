'use client';

import { useState } from 'react';
import { differenceInDays, isSameDay, subDays, startOfDay, isBefore } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
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
    TargetIcon
} from '@phosphor-icons/react';

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
                        <DialogContent className="sm:max-w-106.25">
                            <DialogHeader>
                                <DialogTitle>Log Progress</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleLogSubmit} className="space-y-6 mt-4">
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
                        </DialogContent>
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

                <Card className="p-4 border-border/70">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <ChartBarIcon className="w-5 h-5 text-green-500" weight="duotone" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Progress</p>
                            <p className="font-semibold">{completionRate}% complete</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* MAIN COL: Summary & Progress */}
                <div className="lg:col-span-2 space-y-4">

                    {/* <Card className="border-border/70 overflow-hidden">
                        <CardHeader className="border-b bg-muted/20 py-4">
                            <CardTitle className="tracking-tight text-base text-foreground">Target Summary</CardTitle>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border/60">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Activity</th>
                                        <th className="px-6 py-4 text-right font-semibold">Target</th>
                                        <th className="px-6 py-4 text-right font-semibold">Done</th>
                                        <th className="px-6 py-4 text-right font-semibold">Remaining</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {plan.activities.map((act) => {
                                        const remaining = Math.max(0, act.target_value - act.completed_value);
                                        const name = act.custom_name || act.type;
                                        return (
                                            <tr key={act.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4 font-medium capitalize flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                                                    {name.replace(/_/g, ' ')}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-muted-foreground">{act.target_value}</td>
                                                <td className="px-6 py-4 text-right font-bold text-primary">{act.completed_value}</td>
                                                <td className="px-6 py-4 text-right font-medium">{remaining}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card> */}

                    <Card className="border-border/70">
                        <CardHeader className="border-b bg-muted/20">
                            <CardTitle className="tracking-tight text-base text-foreground">Progress Visualization</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 space-y-2">
                            {plan.activities.map((act) => {
                                const percentage = Math.min(100, Math.round((act.completed_value / act.target_value) * 100));
                                const name = act.custom_name || act.type;
                                return (
                                    <div key={act.id} className="space-y-4">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="font-light capitalize tracking-tight text-foreground text-sm flex gap-2 items-center">
                                                <div className="bg-primary/10 font-medium text-primary px-2 py-0.5 rounded text-xs">
                                                    {percentage}%
                                                </div>
                                                {name.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground uppercase opacity-80 bg-muted px-2 py-1 rounded-sm">
                                                {act.completed_value} / {act.target_value}
                                            </span>
                                        </div>
                                        {/* Native progress visualization simulating the ASCII request */}
                                        <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden border border-border/60">
                                            <div
                                                className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-1000 ease-in-out relative"
                                                style={{ width: `${percentage}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>

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
