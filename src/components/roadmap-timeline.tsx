"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateVersion } from '@/lib/actions/versions';
import type { Version } from '@/lib/types/database';

interface RoadmapTimelineProps {
  versions: Version[];
  activeVersionId: number | null;
  projectNanoid: string;
}
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { Badge } from './ui/badge';
type PrdMap = Record<number, string>;
type SavingMap = Record<number, boolean>;
type ErrorMap = Record<number, string | null>;

function sortVersionsAscending(versions: Version[]): Version[] {
  return [...versions].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function toPrdMap(versions: Version[]): PrdMap {
  return versions.reduce<PrdMap>((acc, version) => {
    acc[version.id] = version.prd ?? '';
    return acc;
  }, {});
}

export default function RoadmapTimeline({ versions, activeVersionId, projectNanoid }: RoadmapTimelineProps) {
  const orderedVersions = useMemo(() => sortVersionsAscending(versions), [versions]);

  const resolvedActiveVersionId =
    activeVersionId ??
    orderedVersions.find((version) => version.status === 'active')?.id ??
    orderedVersions[orderedVersions.length - 1]?.id ??
    null;

  const activeIndex = orderedVersions.findIndex((version) => version.id === resolvedActiveVersionId);
  const displayVersions = useMemo(() => {
    const versionsUpToActive =
      activeIndex >= 0 ? orderedVersions.slice(0, activeIndex + 1) : orderedVersions;
    return [...versionsUpToActive].reverse();
  }, [activeIndex, orderedVersions]);

  const [savedPrdByVersionId, setSavedPrdByVersionId] = useState<PrdMap>(() => toPrdMap(displayVersions));
  const [draftPrdByVersionId, setDraftPrdByVersionId] = useState<PrdMap>(() => toPrdMap(displayVersions));
  const [savingByVersionId, setSavingByVersionId] = useState<SavingMap>({});
  const [errorByVersionId, setErrorByVersionId] = useState<ErrorMap>({});

  useEffect(() => {
    const nextPrdMap = toPrdMap(displayVersions);

    const syncMap = (prev: PrdMap) => {
      const merged: PrdMap = {};
      let changed = false;

      for (const version of displayVersions) {
        const nextValue = prev[version.id] ?? nextPrdMap[version.id] ?? '';
        merged[version.id] = nextValue;

        if (prev[version.id] !== nextValue) {
          changed = true;
        }
      }

      if (!changed && Object.keys(prev).length === Object.keys(merged).length) {
        return prev;
      }

      return merged;
    };

    setSavedPrdByVersionId(syncMap);
    setDraftPrdByVersionId(syncMap);
  }, [displayVersions]);

  const isVersionDirty = useCallback(
    (versionId: number) => {
      const saved = savedPrdByVersionId[versionId] ?? '';
      const draft = draftPrdByVersionId[versionId] ?? '';
      return saved !== draft;
    },
    [draftPrdByVersionId, savedPrdByVersionId],
  );

  const dirtyVersions = useMemo(
    () => displayVersions.filter((version) => isVersionDirty(version.id)),
    [displayVersions, isVersionDirty],
  );
  const isSavingAny = useMemo(
    () => Object.values(savingByVersionId).some(Boolean),
    [savingByVersionId],
  );

  const hasUnsavedChanges = dirtyVersions.length > 0;

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      const sidebarMenuButton = target?.closest('[data-sidebar="menu-button"]') as HTMLElement | null;

      let isNavigationAttempt = false;

      if (anchor) {
        if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        const nextUrl = new URL(href, window.location.href);
        if (nextUrl.href === window.location.href) return;

        isNavigationAttempt = true;
      }

      if (!isNavigationAttempt && sidebarMenuButton) {
        const isAlreadyActiveRoute = sidebarMenuButton.getAttribute('data-active') === 'true';
        if (!isAlreadyActiveRoute) {
          isNavigationAttempt = true;
        }
      }

      if (!isNavigationAttempt) return;

      const shouldLeave = window.confirm('You have unsaved changes. Click "Save all changes" to keep your edits. Leave this page anyway?');
      if (!shouldLeave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [hasUnsavedChanges]);

  const handleDraftChange = (versionId: number, value: string) => {
    setDraftPrdByVersionId((prev) => ({
      ...prev,
      [versionId]: value,
    }));
  };

  const handleSaveVersion = useCallback(
    async (version: Version) => {
      const nextPrd = draftPrdByVersionId[version.id] ?? '';

      setSavingByVersionId((prev) => ({ ...prev, [version.id]: true }));
      setErrorByVersionId((prev) => ({ ...prev, [version.id]: null }));

      try {
        await updateVersion(version.nanoid, projectNanoid, {
          prd: nextPrd.trim() ? nextPrd : null,
        });

        setSavedPrdByVersionId((prev) => ({
          ...prev,
          [version.id]: nextPrd,
        }));
      } catch (error) {
        setErrorByVersionId((prev) => ({
          ...prev,
          [version.id]: error instanceof Error ? error.message : 'Failed to save PRD.',
        }));
      } finally {
        setSavingByVersionId((prev) => ({ ...prev, [version.id]: false }));
      }
    },
    [draftPrdByVersionId, projectNanoid],
  );

  const handleSaveAll = useCallback(async () => {
    if (dirtyVersions.length === 0) {
      return;
    }

    for (const version of dirtyVersions) {
      await handleSaveVersion(version);
    }
  }, [dirtyVersions, handleSaveVersion]);

  if (displayVersions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/70 p-8 text-center">
        <h2 className="text-lg font-semibold">Roadmap is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No versions found yet. Create your first version to start the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 rounded-xl md:block" />

      {(hasUnsavedChanges || isSavingAny) && (
        <div className="mb-3 flex items-center justify-end">
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isSavingAny}
          >
            {isSavingAny ? 'Saving...' : 'Save all changes'}
          </Button>
        </div>
      )}

      <Timeline defaultValue={resolvedActiveVersionId ?? displayVersions[0]?.id ?? 1}>
        {displayVersions.map((version) => {
          const isActive = version.id === resolvedActiveVersionId;
          const isSaving = Boolean(savingByVersionId[version.id]);
          const isDirty = isVersionDirty(version.id);
          const draftPrd = draftPrdByVersionId[version.id] ?? '';
          const saveError = errorByVersionId[version.id];

          return (
            <TimelineItem
              className="sm:group-data-[orientation=vertical]/timeline:ms-32"
              key={version.id}
              step={version.id}
            >
              <TimelineHeader>
                <TimelineSeparator />
                <TimelineDate className="sm:group-data-[orientation=vertical]/timeline:-left-32 sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:w-20 sm:group-data-[orientation=vertical]/timeline:text-right">
                  {version.name}
                </TimelineDate>
                <TimelineTitle className="sm:-mt-0.5">{version.name}</TimelineTitle>
                <TimelineIndicator />
              </TimelineHeader>
              <TimelineContent className=' max-w-3xl'>
                {version.status === 'active' &&
                  (<Badge>Active</Badge>)
                }
                {version.deadline && (
                  <Badge>
                    {version.deadline}
                  </Badge>
                )}
                <Textarea
                  value={draftPrd}
                  onChange={(event) => handleDraftChange(version.id, event.target.value)}
                  placeholder="Write PRD content for this version..."
                  className="field-sizing-content max-h-56 min-h-0 resize-none py-1.75"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className={saveError ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
                    {saveError
                      ? saveError
                      : isDirty
                        ? 'You have unsaved changes.'
                        : 'All changes saved.'}
                  </p>

                  <Button
                    size="sm"
                    onClick={() => handleSaveVersion(version)}
                    disabled={!isDirty || isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>



    </div>
  );
}
