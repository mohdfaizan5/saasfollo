'use client';

import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface TaskProgressBarProps {
    totalTasks: number;
    completedTasks: number;
    label?: string;
}

export function TaskProgressBar({ totalTasks, completedTasks, label }: TaskProgressBarProps) {
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-2 relative w-[94%]">
            {label && (
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">
                        {percentage}% completed
                    </span>
                </div>
            )}
            <div className="relative">
                <Progress value={percentage} className="h-3" />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{completedTasks} of {totalTasks} tasks done</span>
                <span>{totalTasks - completedTasks} remaining</span>
            </div>

        </div>
    );
}
