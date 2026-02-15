/**
 * Database Types for SaaSfollo
 * TypeScript types matching the Supabase schema
 */

// =============================================================================
// Base Types
// =============================================================================

export type TaskStatus = 'now' | 'next' | 'later' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | null;
export type TaskCategory = 'website' | 'marketing' | 'seo' | 'content' | null;
export type VersionStatus = 'active' | 'inactive';
export type LinkType = 'figma' | 'github' | 'vercel' | 'notion' | 'linear' | 'slack' | 'discord' | 'generic';

// =============================================================================
// Table Types
// =============================================================================

export interface Project {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  active_version_id: number | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Version {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  status: VersionStatus;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  version_id: number | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string | null;
  assignee: string | null;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: number;
  project_id: number;
  url: string;
  detected_type: LinkType;
  icon: string | null;
  label: string | null;
  created_at: string;
}

export interface Note {
  id: number;
  project_id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Secret {
  id: number;
  project_id: number;
  key: string;
  encrypted_value: string;
  created_at: string;
}

export interface UserSettings {
  id: number;
  user_id: string;
  secrets_pin_hash: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Insert Types (for creating new records)
// =============================================================================

export interface ProjectInsert {
  name: string;
  description?: string | null;
  icon_url?: string | null;
  is_pinned?: boolean;
}

export interface VersionInsert {
  project_id: number;
  name: string;
  description?: string | null;
  status?: VersionStatus;
}

export interface TaskInsert {
  project_id: number;
  version_id?: number | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string | null;
  assignee?: string | null;
}

export interface LinkInsert {
  project_id: number;
  url: string;
  detected_type?: LinkType;
  icon?: string | null;
  label?: string | null;
}

export interface NoteInsert {
  project_id: number;
  title: string;
  content?: string | null;
}

export interface SecretInsert {
  project_id: number;
  key: string;
  encrypted_value: string;
}

export interface UserSettingsInsert {
  secrets_pin_hash?: string | null;
}

// =============================================================================
// Update Types (for updating existing records)
// =============================================================================

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  icon_url?: string | null;
  active_version_id?: number | null;
  is_pinned?: boolean;
}

export interface VersionUpdate {
  name?: string;
  description?: string | null;
  status?: VersionStatus;
}

export interface TaskUpdate {
  version_id?: number | null;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string | null;
  assignee?: string | null;
}

export interface LinkUpdate {
  url?: string;
  detected_type?: LinkType;
  icon?: string | null;
  label?: string | null;
}

export interface NoteUpdate {
  title?: string;
  content?: string | null;
}

export interface SecretUpdate {
  key?: string;
  encrypted_value?: string;
}

export interface UserSettingsUpdate {
  secrets_pin_hash?: string | null;
}

// =============================================================================
// Extended Types (with relations)
// =============================================================================

export interface ProjectWithStats extends Project {
  version_count?: number;
  task_count?: number;
  active_version?: Version | null;
}

export interface VersionWithTasks extends Version {
  tasks?: Task[];
  task_count?: number;
}

export interface TaskWithVersion extends Task {
  version?: Version | null;
}

// =============================================================================
// Collaboration Types
// =============================================================================

export type CollaboratorRole = 'owner' | 'editor' | 'reader';

export interface ProjectCollaborator {
  id: number;
  project_id: number;
  user_id: string;
  email: string;
  role: CollaboratorRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface ProjectCollaboratorInsert {
  project_id: number;
  email: string;
  role?: CollaboratorRole;
}
