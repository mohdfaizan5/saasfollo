import { BoxIcon, HouseIcon, PanelsTopLeftIcon } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import type { Version } from '@/lib/types/database';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface VersionTabsProps {
  versions: Version[];
  currentActiveId: number | null;
}

export default function VersionTabs({ versions, currentActiveId }: VersionTabsProps) {
  const searchParams = useSearchParams();
  const versionId = searchParams.get('versionId');
  const tabParam = searchParams.get('tab');

  const currentTab = tabParam || 'overview';
  const currentVersionIndex = versionId ? parseInt(versionId, 10) - 1 : 0;
  const selectedVersion = versions[currentVersionIndex];

  const stats = {
    totalTasks: 12,
    completedTasks: 7,
    inProgressTasks: 3,
    pendingTasks: 2,
  };

  const progressPercentage = Math.round((stats.completedTasks / stats.totalTasks) * 100);

  return (
    <div className="space-y-6">
      {currentTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Circle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">{progressPercentage}% completion rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>
        </div>
      )}

      {currentTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Version Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completion Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.totalTasks - stats.completedTasks} tasks remaining to complete this version
            </p>
          </CardContent>
        </Card>
      )}

      {currentTab === 'overview' && selectedVersion && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedVersion.name}</CardTitle>
            <Badge variant={selectedVersion.status === 'active' ? 'default' : 'secondary'}>
              {selectedVersion.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {selectedVersion.description || 'No description available'}
            </p>
          </CardContent>
        </Card>
      )}

      {currentTab === 'projects' && (
        <div className="text-center py-12 text-muted-foreground">
          <PanelsTopLeftIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No projects associated with this version yet</p>
          <p className="text-sm">Projects will appear here when created</p>
        </div>
      )}

      {currentTab === 'packages' && (
        <div className="text-center py-12 text-muted-foreground">
          <BoxIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No packages associated with this version yet</p>
          <p className="text-sm">Packages will appear here when created</p>
        </div>
      )}
    </div>
  );
}
