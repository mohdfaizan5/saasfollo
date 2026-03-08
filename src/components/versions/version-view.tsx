"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Circle, Clock, Layers, Layout, Users, MoreVertical, Play, Save, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import {
  Tabs, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Version, Task, ProjectCollaborator } from '@/lib/types/database';
import VersionRadialProgressChart from "./version-radial-progress-chart";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";

interface VersionViewProps {
  versions: Version[];
  currentActiveId: string | null;
  tasks: Task[];
  collaborators: ProjectCollaborator[];
  currentUserId: string;
  canEdit: boolean;
  onSetActive: (version: Version) => void;
  onDelete: (version: Version) => void;
  onUpdateVersion: (version: Version, updates: Partial<Version>) => Promise<void>;
  onMoveVersion: (version: Version, direction: 'up' | 'down') => Promise<void>;
}

export default function VersionView({ versions, currentActiveId, tasks, collaborators, currentUserId, canEdit, onSetActive, onDelete, onUpdateVersion, onMoveVersion }: VersionViewProps) {
  const [selectedVersionNanoid, setSelectedVersionNanoid] = useState<string | null>(versions[0]?.nanoid ?? null);
  const [prdDraft, setPrdDraft] = useState('');
  const [isSavingPrd, setIsSavingPrd] = useState(false);
  const [prdError, setPrdError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projectId } = useParams<{ projectId: string }>();

  const getAssigneeName = (userId: string | null | undefined): string => {
    if (!userId) return 'Unassigned';
    if (userId === currentUserId) return 'You';
    const collab = collaborators.find(c => c.user_id === userId);
    return collab ? collab.email.split('@')[0] : userId.slice(0, 8);
  };

  // Initialize from URL params or default to first version
  useEffect(() => {
    const versionId = searchParams.get('versionId');
    if (versionId) {
      const step = parseInt(versionId, 10);
      if (step >= 1 && step <= versions.length) {
        setSelectedVersionNanoid(versions[step - 1]?.nanoid ?? null);
        return;
      }
    }

    if (currentActiveId && versions.some((version) => version.nanoid === currentActiveId)) {
      setSelectedVersionNanoid(currentActiveId);
      return;
    }

    setSelectedVersionNanoid((previous) => {
      if (previous && versions.some((version) => version.nanoid === previous)) {
        return previous;
      }
      return versions[0]?.nanoid ?? null;
    });
  }, [versions, currentActiveId, searchParams]);

  const selectedVersion = versions.find((version) => version.nanoid === selectedVersionNanoid) ?? versions[0];
  const currentStep = selectedVersion ? versions.findIndex((version) => version.nanoid === selectedVersion.nanoid) + 1 : 1;
  const selectedVersionIndex = selectedVersion ? versions.findIndex((version) => version.nanoid === selectedVersion.nanoid) : -1;

  const handleStepClick = (step: number) => {
    const version = versions[step - 1];
    if (!version) return;
    setSelectedVersionNanoid(version.nanoid);
    router.push(`?versionId=${step}`);
  };

  const handleVersionTabChange = (versionNanoid: string) => {
    const index = versions.findIndex((version) => version.nanoid === versionNanoid);
    if (index >= 0) {
      const step = index + 1;
      setSelectedVersionNanoid(versionNanoid);
      router.push(`?versionId=${step}`);
    }
  };

  useEffect(() => {
    if (!selectedVersion) return;
    setPrdDraft(selectedVersion.prd ?? '');
    setPrdError(null);
  }, [selectedVersion?.nanoid, selectedVersion?.prd]);

  const isPrdDirty = (selectedVersion?.prd ?? '') !== prdDraft;

  const handleSavePrd = async () => {
    if (!selectedVersion || !isPrdDirty) return;

    setIsSavingPrd(true);
    setPrdError(null);
    try {
      await onUpdateVersion(selectedVersion, { prd: prdDraft.trim() || null });
    } catch (error) {
      console.error('Failed to save PRD:', error);
      setPrdError('Failed to save PRD. Please try again.');
    } finally {
      setIsSavingPrd(false);
    }
  };

  // Compute real stats from tasks for this version
  const versionTasks = selectedVersion ? tasks.filter(t => t.version_id === selectedVersion.id) : [];
  const completedTasksCount = versionTasks.filter(t => t.status === 'done').length;
  const inProgressTasksCount = versionTasks.filter(t => t.status === 'now' || t.status === 'next').length;

  const stats = {
    totalTasks: versionTasks.length,
    completedTasks: completedTasksCount,
    inProgressTasks: inProgressTasksCount,
    pendingTasks: versionTasks.length - completedTasksCount - inProgressTasksCount,
  };

  const progressPercentage = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  // Compute assignees from versionTasks
  const assigneeStats = versionTasks.reduce((acc, task) => {
    const assigneeName = getAssigneeName(task.assignee);
    if (!acc[assigneeName]) {
      acc[assigneeName] = { total: 0, completed: 0 };
    }
    acc[assigneeName].total += 1;
    if (task.status === 'done') {
      acc[assigneeName].completed += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number; }>);

  const assigneesList = Object.entries(assigneeStats).map(([name, s]) => ({
    name,
    ...s
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className=" max-w-4xl px-4">
        <Stepper value={currentStep}>
          {versions.map((version, index) => (
            <StepperItem
              className="not-last:flex-1 cursor-pointer"
              key={version.id}
              step={index + 1}
            >
              <StepperTrigger asChild>
                <div
                  className={`cursor-pointer transition-all duration-200 ${currentStep === index + 1 ? 'scale-110' : 'hover:scale-105'
                    }`}
                  onClick={() => handleStepClick(index + 1)}
                >
                  <StepperIndicator />
                  <div className={`mt-2 text-sm font-medium transition-colors ${currentStep === index + 1
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
                    }`}>
                    {version.name}
                  </div>
                </div>
              </StepperTrigger>
              {index < versions.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </Stepper>
      </div>
      <div>
        {selectedVersion && (
          <Tabs value={selectedVersion.nanoid} onValueChange={handleVersionTabChange} className={"-mb-3 ml-2.5 -z-10 "}>
            <ScrollArea className="w- whitespace-nowrap">
              <TabsList className="relative mb-3 h-auto w- gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
                {versions.map((version) => (
                  <TabsTrigger
                    key={version.nanoid}
                    value={version.nanoid}
                    className="px-5 border  overflow-hidden rounded-b-none border-x border-t   py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
                  >
                    {version.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Tabs>
        )}
        {/* Version Content */}
        {selectedVersion && (
          <div className="z-10 bg-[#ECE5DB] border rounded-2xl  p-3 px-4 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">


            {/* Version Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedVersion.name}</h2>
                <p className="text-muted-foreground">
                  {selectedVersion.description || 'No description available'}
                </p>
              </div>

              <div className="flex items-center justify-start gap-2">
          
                {canEdit && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs px-2 shadow-sm rounded-full" 
                    onClick={() => router.push(`/projects/${projectId}/build?version=${selectedVersion.id}&newTask=true`)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Task
                  </Button>
                )}

                <Badge
                  variant={selectedVersion.status === 'active' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {selectedVersion.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>

                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onMoveVersion(selectedVersion, 'up')}
                        disabled={selectedVersionIndex <= 0}
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Move Version Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onMoveVersion(selectedVersion, 'down')}
                        disabled={selectedVersionIndex < 0 || selectedVersionIndex >= versions.length - 1}
                      >
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Move Version Down
                      </DropdownMenuItem>
                      {selectedVersion.status !== 'active' && (
                        <DropdownMenuItem onClick={() => onSetActive(selectedVersion)}>
                          <Play className="h-4 w-4 mr-2" />
                          Set Active Version
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(selectedVersion)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Version
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Goals Section */}
            {/* {selectedVersion.goals && (
              <div className="bg-white/50 rounded-lg p-4 border">
                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">Goals</h3>
                <div className="text-sm whitespace-pre-wrap">
                  {selectedVersion.goals}
                </div>
              </div>
            )} */}

            {/* Stats Grid */}
            <div className="grid gap-2 md:grid-cols-4">
              <section className="space-y-2">

                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.completedTasks} <span className="text-sm">of {stats.totalTasks}</span></div>
                    <p className="text-xs text-muted-foreground">Across all categories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Version Progress -</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion Progress</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{stats.completedTasks} tasks completed</span>
                      <span>{stats.pendingTasks} tasks remaining</span>
                    </div>
                  </CardContent>
                </Card>
              </section>
              <VersionRadialProgressChart stats={stats} />


              <div>
                <Card className="cursor-pointer hover:border-blue-500/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
                    <p className="text-xs text-muted-foreground">Active tasks</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-blue-500/50 transition-colors">
                  {/* <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Started</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader> */}
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
                    <p className="text-xs text-muted-foreground">Active tasks</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Content Sections */}
            <div className="grid gap-2 md:grid-cols-6">
              {/* Projects Section */}
              <Card className="col-span-4 cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      PRD File
                    </span>
                    {canEdit && (
                      <Button
                        size="sm"
                        onClick={handleSavePrd}
                        disabled={isSavingPrd || !isPrdDirty}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSavingPrd ? 'Saving...' : 'Save'}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prdDraft}
                    onChange={(event) => setPrdDraft(event.target.value)}
                    placeholder="Write your product requirements for this version..."
                    rows={12}
                    disabled={!canEdit || isSavingPrd}
                    className="bg-background/70 font-mono text-sm"
                  />
                  {prdError && (
                    <p className="mt-2 text-sm text-destructive">{prdError}</p>
                  )}
                </CardContent>
              </Card>

              {/* People & Assignments Section */}
              <Card className="col-span-2 cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    People & Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assigneesList.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No tasks assigned in this version yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assigneesList.map((assignee) => (
                        <div key={assignee.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                              {assignee.name === 'Unassigned' ? '?' : assignee.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{assignee.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{assignee.completed}/{assignee.total}</span>
                            <Progress value={assignee.total > 0 ? (assignee.completed / assignee.total) * 100 : 0} className="w-16 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      {/* Empty State */}
      {versions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No versions created yet</p>
          <p className="text-sm">Create your first version to get started</p>
        </div>
      )}
    </div>
  );
}