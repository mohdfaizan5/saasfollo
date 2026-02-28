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
  completed: { label: 'Development', color: '#2C4839' },
  growth: { label: 'Growth', color: 'var(--chart-4)' },
} satisfies ChartConfig;

const weeklyWorkConfig = {
  completed: { label: 'Development', color: 'var(--primary)' },
  growth: { label: 'Growth', color: '#2C4839' },
} satisfies ChartConfig;

const growthConfig = {
  quantity: { label: 'Growth Logs', color: 'var(--chart-4)' },
} satisfies ChartConfig;

const radialConfig = {
  completion: { label: 'Completion', color: '#2C4839' },
  remaining: { label: 'Remaining', color: 'var(--chart-5)' },
} satisfies ChartConfig;

// Custom tick for two-line labels: "Mon|28Feb" → line1: Mon, line2: 28Feb
function DayDateTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
  const value = payload.value;
  const parts = value.split('|');
  if (parts.length === 2) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={4} textAnchor="middle" fontSize={11} fontWeight={600} fill="currentColor">
          {parts[0]}
        </text>
        <text x={0} y={0} dy={18} textAnchor="middle" fontSize={10} fill="var(--muted-foreground, #888)">
          {parts[1]}
        </text>
      </g>
    );
  }
  // Fallback for "today" range (just hours)
  return (
    <text x={x} y={y} dy={10} textAnchor="middle" fontSize={11} fill="currentColor">
      {value}
    </text>
  );
}

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

  // Merge throughput + growth into a single series for the dual-line chart
  const devVsGrowthSeries = throughputSeries.map((point, i) => ({
    label: point.label,
    completed: point.completed,
    growth: growthSeries[i]?.quantity ?? 0,
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Charts ({range})</h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <p className="text-sm font-medium">Development vs Growth</p>
            <div className="flex items-center gap-3 ml-auto">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: '#2C4839' }} />
                Development
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: 'var(--chart-4)' }} />
                Growth
              </span>
            </div>
          </div>
          <ChartContainer config={throughputConfig} className="h-56 w-full">
            <AreaChart data={devVsGrowthSeries}>
              <defs>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2C4839" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2C4839" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={DayDateTick as any} height={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="natural" dataKey="completed" stroke="var(--color-completed)" fill="url(#fillCompleted)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-completed)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="natural" dataKey="growth" stroke="var(--color-growth)" fill="url(#fillGrowth)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-growth)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <p className="text-sm font-medium">Weekly Work Output</p>
            <div className="flex items-center gap-3 ml-auto">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: 'var(--primary)' }} />
                Development
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block w-2.5 h-2.5 rounded" style={{ background: '#2C4839' }} />
                Growth
              </span>
            </div>
          </div>
          <ChartContainer config={weeklyWorkConfig} className="h-56 w-full">
            <BarChart data={devVsGrowthSeries}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={DayDateTick as any} height={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="completed" fill="var(--color-completed)" stackId="work" radius={[0, 0, 4, 4]} />
              <Bar dataKey="growth" fill="var(--color-growth)" stackId="work" radius={[4, 4, 0, 0]} />
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

        {/* <Card className="p-4 flex flex-col">
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
        </Card> */}
      </div>
    </section>
  );
}
