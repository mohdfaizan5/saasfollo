'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { CollaboratorRole } from '@/lib/types/database';

export type UserProjectRole = CollaboratorRole | 'owner';

interface ProjectRoleContextValue {
    role: UserProjectRole;
    isOwner: boolean;
    isEditor: boolean;
    isReader: boolean;
    canEdit: boolean;
    canManage: boolean;
}

const ProjectRoleContext = createContext<ProjectRoleContextValue | null>(null);

interface ProjectRoleProviderProps {
    children: ReactNode;
    role: UserProjectRole;
}

export function ProjectRoleProvider({ children, role }: ProjectRoleProviderProps) {
    const value: ProjectRoleContextValue = {
        role,
        isOwner: role === 'owner',
        isEditor: role === 'editor',
        isReader: role === 'reader',
        canEdit: role === 'owner' || role === 'editor',
        canManage: role === 'owner',
    };

    return (
        <ProjectRoleContext.Provider value={value}>
            {children}
        </ProjectRoleContext.Provider>
    );
}

export function useProjectRole(): ProjectRoleContextValue {
    const context = useContext(ProjectRoleContext);
    if (!context) {
        // Default to owner if not in context (for backwards compatibility)
        return {
            role: 'owner',
            isOwner: true,
            isEditor: false,
            isReader: false,
            canEdit: true,
            canManage: true,
        };
    }
    return context;
}
