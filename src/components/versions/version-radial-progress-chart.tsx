"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface VersionRadialProgressChartProps {
    stats: {
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        pendingTasks: number;
    }
}

const VersionRadialProgressChart = ({ stats }: VersionRadialProgressChartProps) => {
    const chartConfig = {
        completed: {
            label: "Completed",
            color: "#F6F1EA",
        },
        remaining: {
            label: "Remaining",
            color: "#566D61",
        },
    } satisfies ChartConfig;

    const hasNoTasks = stats.totalTasks === 0;
    const chartData = [
        {
            name: "tasks",
            completed: hasNoTasks ? 1 : stats.completedTasks,
            remaining: hasNoTasks ? 0 : stats.totalTasks - stats.completedTasks,
            fill: "var(--color-completed)",
        }
    ];

    const displayTotal = stats.totalTasks;

    return (
        <Card className="flex flex-col bg-[#2C4839] border-none">
            <CardContent className="flex flex-1 items-center justify-center p-4">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-square w-full max-w-[200px]"
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={180}
                        innerRadius={60}
                        outerRadius={100}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 10}
                                                    className="fill-[#F6F1EA] text-3xl font-bold"
                                                >
                                                    {hasNoTasks ? 0 : stats.completedTasks}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 12}
                                                    className="fill-[#A6AEA4] text-xs"
                                                >
                                                    {hasNoTasks ? 'No tasks yet' : `of ${displayTotal} tasks`}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar
                            dataKey="remaining"
                            fill="#566D61"
                            stackId="a"
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                            dataKey="completed"
                            fill="#F6F1EA"
                            stackId="a"
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default VersionRadialProgressChart;
