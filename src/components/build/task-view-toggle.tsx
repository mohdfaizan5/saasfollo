'use client';

import { LayoutList, Columns3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryState } from 'nuqs';

export type TaskView = 'todo' | 'kanban';

interface TaskViewToggleProps {
    currentView: TaskView;
    onViewChange: (view: TaskView) => void;
}

export function TaskViewToggle({ currentView, onViewChange }: TaskViewToggleProps) {
    const [view, setView] = useQueryState('view');

    const handleViewChange = (newView: TaskView) => {
        onViewChange(newView);
        if (newView === 'todo') {
            setView(null); // Default view, no need for param
        } else {
            setView(newView);
        }
    };

    return (
        <div className="inline-flex items-center gap-1 bg-muted rounded-lg p-1">
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
        </div>
    );
}
