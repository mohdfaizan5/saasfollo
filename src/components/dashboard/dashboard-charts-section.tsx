'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface ThroughputPoint {
  label: string;
  created: number;
  completed: number;
}

interface GrowthPoint {
  label: string;
  quantity: number;
}

interface StatusPoint {
  status: string;
  count: number;
}

interface DashboardChartsSectionProps {
  range: 'today' | 'week' | 'month';
  throughputSeries: ThroughputPoint[];
  growthSeries: GrowthPoint[];
  statusBreakdown: StatusPoint[];
  completionPercent: number;
}

const throughputConfig = {
  created: { label: 'Created', color: 'var(--chart-2)' },
  completed: { label: 'Completed', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const statusConfig = {
  count: { label: 'Tasks', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const growthConfig = {
  quantity: { label: 'Growth Logs', color: 'var(--chart-4)' },
} satisfies ChartConfig;

const radialConfig = {
  completion: { label: 'Completion', color: 'var(--chart-1)' },
  remaining: { label: 'Remaining', color: 'var(--chart-5)' },
} satisfies ChartConfig;

export function DashboardChartsSection({
  range,
  throughputSeries,
  growthSeries,
  statusBreakdown,
  completionPercent,
}: DashboardChartsSectionProps) {
  const safeCompletion = Math.max(0, Math.min(completionPercent, 100));
  const radialData = [
    {
      name: 'version',
      completion: safeCompletion,
      remaining: 100 - safeCompletion,
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Charts ({range})</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Created vs Completed</p>
          <ChartContainer config={throughputConfig} className="h-56 w-full">
            <AreaChart data={throughputSeries}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="created" stroke="var(--color-created)" fill="var(--color-created)" fillOpacity={0.22} />
              <Area type="monotone" dataKey="completed" stroke="var(--color-completed)" fill="var(--color-completed)" fillOpacity={0.28} />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Status Breakdown</p>
          <ChartContainer config={statusConfig} className="h-56 w-full">
            <BarChart data={statusBreakdown}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={6} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium mb-2">Growth Log Trend</p>
          <ChartContainer config={growthConfig} className="h-56 w-full">
            <LineChart data={growthSeries}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="quantity" stroke="var(--color-quantity)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </Card>

        <Card className="p-4 flex flex-col">
          <p className="text-sm font-medium mb-2">Active Version Completion</p>
          <div className="h-56">
            <ChartContainer config={radialConfig} className="h-full w-full">
              <RadialBarChart data={radialData} innerRadius={60} outerRadius={100} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <RadialBar dataKey="remaining" fill="var(--color-remaining)" cornerRadius={8} stackId="a" />
                <RadialBar dataKey="completion" fill="var(--color-completion)" cornerRadius={8} stackId="a" />
              </RadialBarChart>
            </ChartContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{safeCompletion}% complete</p>
        </Card>
      </div>
    </section>
  );
}
