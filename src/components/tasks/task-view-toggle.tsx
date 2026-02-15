'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LayoutList, Columns3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TaskView = 'todo' | 'kanban';

interface TaskViewToggleProps {
    currentView: TaskView;
    onViewChange: (view: TaskView) => void;
}

export function TaskViewToggle({ currentView, onViewChange }: TaskViewToggleProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleViewChange = (newView: TaskView) => {
        onViewChange(newView);

        // Update URL with new view param
        const params = new URLSearchParams(searchParams.toString());
        if (newView === 'todo') {
            params.delete('view'); // Default view, no need for param
        } else {
            params.set('view', newView);
        }

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.push(newUrl, { scroll: false });
    };

    return (
        <div className="inline-flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
                type="button"
                onClick={() => handleViewChange('todo')}
                className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    currentView === 'todo'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                )}
            >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">To-Do</span>
            </button>

            <button
                type="button"
                onClick={() => handleViewChange('kanban')}
                className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    currentView === 'kanban'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                )}
            >
                <Columns3 className="h-4 w-4" />
                <span className="hidden sm:inline">Kanban</span>
            </button>
        </div>
    );
}
