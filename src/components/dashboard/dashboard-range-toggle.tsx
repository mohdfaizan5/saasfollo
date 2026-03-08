'use client';

import { useQueryState } from 'nuqs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DashboardRange = 'today' | 'week' | 'month';

const RANGE_OPTIONS: DashboardRange[] = ['today', 'week', 'month'];

export function DashboardRangeToggle() {
  const [range, setRange] = useQueryState('range');
  const activeRange: DashboardRange = range === 'today' || range === 'month' ? range : 'week';

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1">
      {RANGE_OPTIONS.map((option) => (
        <Button
          key={option}
          variant="ghost"
          size="sm"
          onClick={() => setRange(option)}
          className={cn(
            'h-7 px-3 text-xs capitalize',
            activeRange === option && activeRange === 'today' ? 'bg-primary text-primary-foreground' : activeRange === option ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-white' : 'text-muted-foreground',
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
