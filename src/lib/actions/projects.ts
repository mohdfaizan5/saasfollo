/**
 * Server actions for Projects
 * All public-facing lookups now use the `nanoid` field instead of numeric `id`.
 * Internal FK references (active_version_id, etc.) still use numeric ids.
 */
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { createAdminClient } from "@/lib/admin";
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectWithStats,
  CollaboratorRole,
} from "@/lib/types/database";

export type UserProjectRole = CollaboratorRole | "owner";
export interface PendingProjectIconUploadResult {
  publicUrl: string;
  storagePath: string;
}

function getAdminClientOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getProjectIconExtension(file: File) {
  const rawExt = file.name.split(".").pop()?.toLowerCase();
  if (rawExt && rawExt.length <= 10) {
    return rawExt;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
}

function validateProjectIconFile(formData: FormData) {
  const file = formData.get("icon") as File;
  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/svg+xml",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only PNG, JPEG, GIF, SVG, and WebP are allowed.",
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File too large. Maximum size is 2MB.");
  }

  return file;
}

async function getProjectAccess<TProject extends { id: number; user_id: string }>(
  projectNanoid: string,
  selectClause: string,
): Promise<{ project: TProject | null; role: UserProjectRole | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { project: null, role: null };
  }

  const admin = getAdminClientOrNull();
  const projectClient = admin ?? supabase;
  const collaboratorClient = admin ?? supabase;

  const { data: project, error: projectError } = await projectClient
    .from("projects")
    .select(selectClause)
    .eq("nanoid", projectNanoid)
    .maybeSingle();

  if (projectError || !project) {
    if (projectError) {
      console.error("Error fetching project access:", projectError);
    }
    return { project: null, role: null };
  }

  const typedProject = project as unknown as TProject;

  if (typedProject.user_id === user.id) {
    return { project: typedProject, role: "owner" };
  }

  const { data: collaborator, error: collaboratorError } = await collaboratorClient
    .from("project_collaborators")
    .select("role")
    .eq("project_id", typedProject.id)
    .eq("user_id", user.id)
    .not("accepted_at", "is", null)
    .maybeSingle();

  if (collaboratorError || !collaborator) {
    return { project: null, role: null };
  }

  return {
    project: typedProject,
    role: collaborator.role as UserProjectRole,
  };
}

/**
 * Get the current user's role for a specific project
 * Accepts nanoid (string) as the project identifier
 */
export async function getUserProjectRole(
  projectNanoid: string,
): Promise<UserProjectRole | null> {
  const { role } = await getProjectAccess<{ id: number; user_id: string }>(
    projectNanoid,
    "id, user_id",
  );

  return role;
}

/**
 * Get all projects for the current user
 * Returns projects with pinned ones first, then sorted by updated_at
 */
export async function getProjects(): Promise<ProjectWithStats[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const projectSelect = `
      *,
      versions:versions(count),
      tasks:tasks(count),
      active_version:versions!fk_projects_active_version(name)
    `;

  const [{ data: ownedProjects, error: ownedError }, { data: collaboratorRows, error: collaboratorError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(projectSelect)
        .eq("user_id", user.id),
      supabase
        .from("project_collaborators")
        .select("project_id, role")
        .eq("user_id", user.id)
        .not("accepted_at", "is", null),
    ]);

  if (ownedError) {
    console.error("Error fetching owned projects:", ownedError);
    throw new Error("Failed to fetch projects");
  }

  if (collaboratorError) {
    console.error("Error fetching shared projects:", collaboratorError);
    throw new Error("Failed to fetch projects");
  }

  const collaboratorProjectIds = Array.from(
    new Set((collaboratorRows || []).map((row) => row.project_id)),
  );

  const currentUserRoleByProjectId = new Map<number, UserProjectRole>();
  for (const row of collaboratorRows || []) {
    currentUserRoleByProjectId.set(row.project_id, row.role as UserProjectRole);
  }

  const { data: sharedProjects, error: sharedError } = collaboratorProjectIds.length
    ? await supabase
        .from("projects")
        .select(projectSelect)
        .in("id", collaboratorProjectIds)
    : { data: [], error: null };

  if (sharedError) {
    console.error("Error fetching shared projects:", sharedError);
    throw new Error("Failed to fetch projects");
  }

  const data = Array.from(
    new Map(
      [...(ownedProjects || []), ...(sharedProjects || [])].map((project) => [
        project.id,
        project,
      ]),
    ).values(),
  ).sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }

    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const projectIds = data.map((project) => project.id);

  const [{ data: projectCollaborators, error: collaboratorsError }, { data: projectTasks, error: tasksError }] =
    projectIds.length
      ? await Promise.all([
          supabase
            .from("project_collaborators")
            .select("project_id, email")
            .in("project_id", projectIds)
            .not("accepted_at", "is", null),
          supabase
            .from("tasks")
            .select("project_id, is_completed")
            .in("project_id", projectIds),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];

  if (collaboratorsError) {
    console.error("Error fetching project collaborators:", collaboratorsError);
    throw new Error("Failed to fetch projects");
  }

  if (tasksError) {
    console.error("Error fetching project tasks:", tasksError);
    throw new Error("Failed to fetch projects");
  }

  const collaboratorEmailsByProject = new Map<number, string[]>();
  for (const row of projectCollaborators || []) {
    const existing = collaboratorEmailsByProject.get(row.project_id) ?? [];
    if (!existing.includes(row.email)) {
      existing.push(row.email);
      collaboratorEmailsByProject.set(row.project_id, existing);
    }
  }

  const taskProgressByProject = new Map<number, { total: number; completed: number }>();
  for (const task of projectTasks || []) {
    const current = taskProgressByProject.get(task.project_id) ?? {
      total: 0,
      completed: 0,
    };
    current.total += 1;
    if (task.is_completed) current.completed += 1;
    taskProgressByProject.set(task.project_id, current);
  }

  const ownerEmailByUserId = new Map<string, string>();
  if (user.email) {
    ownerEmailByUserId.set(user.id, user.email);
  }

  const ownerIdsToResolve = Array.from(
    new Set(
      data
        .map((project) => project.user_id)
        .filter((ownerId) => !ownerEmailByUserId.has(ownerId)),
    ),
  );

  const admin = getAdminClientOrNull();
  if (admin && ownerIdsToResolve.length > 0) {
    const ownerResults = await Promise.all(
      ownerIdsToResolve.map(async (ownerId) => {
        const { data: ownerData, error: ownerError } =
          await admin.auth.admin.getUserById(ownerId);

        if (ownerError) {
          console.error("Error fetching project owner email:", ownerError);
          return null;
        }

        const ownerEmail = ownerData.user?.email;
        return ownerEmail ? { ownerId, ownerEmail } : null;
      }),
    );

    for (const ownerResult of ownerResults) {
      if (ownerResult) {
        ownerEmailByUserId.set(ownerResult.ownerId, ownerResult.ownerEmail);
      }
    }
  }

  // Transform the count aggregates and add active version name
  return (data || []).map((project) => {
    const projectCollaboratorEmails = [
      ownerEmailByUserId.get(project.user_id),
      ...(collaboratorEmailsByProject.get(project.id) ?? []),
    ].filter((email, index, emails): email is string => {
      return Boolean(email) && emails.indexOf(email) === index;
    });

    return {
      ...project,
      version_count: project.versions?.[0]?.count ?? 0,
      task_count: project.tasks?.[0]?.count ?? 0,
      completed_task_count: taskProgressByProject.get(project.id)?.completed ?? 0,
      progress_percentage:
        (taskProgressByProject.get(project.id)?.total ?? 0) > 0
          ? Math.round(
              ((taskProgressByProject.get(project.id)?.completed ?? 0) /
                (taskProgressByProject.get(project.id)?.total ?? 1)) *
                100,
            )
          : 0,
      progress_label: `${taskProgressByProject.get(project.id)?.completed ?? 0}/${taskProgressByProject.get(project.id)?.total ?? 0} completed`,
      collaborator_count: projectCollaboratorEmails.length,
      collaborator_emails: projectCollaboratorEmails,
      active_version_name: project.active_version?.[0]?.name ?? null,
      current_user_role:
        project.user_id === user.id
          ? "owner"
          : currentUserRoleByProjectId.get(project.id) ?? "reader",
    };
  });
}

/**
 * Get a single project by nanoid
 */
export async function getProject(
  projectNanoid: string,
): Promise<Project | null> {
  const { project } = await getProjectAccess<Project>(
    projectNanoid,
    "*",
  );

  return project
    ? {
        ...project,
        is_archived: project.is_archived ?? false,
      }
    : null;
}

/**
 * Get a project with its active version by nanoid
 */
export async function getProjectWithActiveVersion(
  projectNanoid: string,
): Promise<ProjectWithStats | null> {
  const { project } = await getProjectAccess<ProjectWithStats>(
    projectNanoid,
    `
      *,
      active_version:versions!fk_projects_active_version(*)
    `,
  );

  if (!project) {
    return null;
  }

  return {
    ...project,
    is_archived: project.is_archived ?? false,
    active_version: project.active_version ?? null,
  };
}

/**
 * Create a new project
 * Returns the created project (which will have an auto-generated nanoid)
 */
export async function createProject(project: ProjectInsert): Promise<Project> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...project,
      user_id: userData.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }

  revalidatePath("/projects");
  return data;
}

/**
 * Update an existing project (lookup by nanoid)
 */
export async function updateProject(
  projectNanoid: string,
  updates: ProjectUpdate,
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

/**
 * Delete a project (lookup by nanoid)
 */
export async function deleteProject(projectNanoid: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("nanoid", projectNanoid);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }

  revalidatePath("/projects");
}

/**
 * Toggle project pinned status (lookup by nanoid)
 */
export async function toggleProjectPin(
  projectNanoid: string,
): Promise<Project> {
  const supabase = await createClient();

  // First get the current pinned status
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("is_pinned")
    .eq("nanoid", projectNanoid)
    .single();

  if (fetchError) {
    console.error("Error fetching project for pin toggle:", fetchError);
    throw new Error("Failed to fetch project");
  }

  // Toggle the pin
  const { data, error } = await supabase
    .from("projects")
    .update({
      is_pinned: !project.is_pinned,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error toggling project pin:", error);
    throw new Error("Failed to toggle project pin");
  }

  revalidatePath("/projects");
  return data;
}

/**
 * Archive a project (lookup by nanoid)
 */
export async function archiveProject(projectNanoid: string): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error archiving project:", error);
    throw new Error("Failed to archive project");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

/**
 * Unarchive a project (lookup by nanoid)
 */
export async function unarchiveProject(
  projectNanoid: string,
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error unarchiving project:", error);
    throw new Error("Failed to unarchive project");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

/**
 * Set the active version for a project
 * Uses nanoid for project lookup, numeric id for version FK
 */
export async function setActiveVersion(
  projectNanoid: string,
  versionId: number | null,
): Promise<Project> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({
      active_version_id: versionId,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error setting active version:", error);
    throw new Error("Failed to set active version");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

/**
 * Upload a project icon (lookup by nanoid)
 */
export async function uploadProjectIcon(
  projectNanoid: string,
  formData: FormData,
): Promise<Project> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Not authenticated");
  }

  // Verify user has permission to update this project
  const role = await getUserProjectRole(projectNanoid);
  if (!role || role === "reader") {
    throw new Error("You do not have permission to update this project");
  }

  const file = validateProjectIconFile(formData);
  const admin = getAdminClientOrNull();
  const storageClient = admin ?? supabase;

  // Get current project to delete old icon if exists
  const { data: currentProject } = await supabase
    .from("projects")
    .select("icon_url, nanoid")
    .eq("nanoid", projectNanoid)
    .single();

  // Generate unique filename using nanoid
  const fileExt = getProjectIconExtension(file);
  const fileName = `${projectNanoid}/${Date.now()}-icon.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await storageClient.storage
    .from("project-icons")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error(
      "[Storage Error] Failed to upload icon:",
      JSON.stringify(uploadError, null, 2),
    );
    throw new Error(
      "Failed to upload project icon due to a service error. Please try again.",
    );
  }

  // Get public URL
  const { data: urlData } = storageClient.storage
    .from("project-icons")
    .getPublicUrl(fileName);

  // Delete old icon if exists
  if (currentProject?.icon_url) {
    try {
      const oldUrl = new URL(currentProject.icon_url);
      const pathParts = oldUrl.pathname.split(
        "/storage/v1/object/public/project-icons/",
      );
      if (pathParts.length > 1) {
        await storageClient.storage
          .from("project-icons")
          .remove([decodeURIComponent(pathParts[1])]);
      }
    } catch {
      console.warn("Could not delete old icon");
    }
  }

  // Update project with new icon URL
  const { data, error } = await supabase
    .from("projects")
    .update({
      icon_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error updating project icon:", error);
    throw new Error("Failed to update project icon");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

/**
 * Set a project's icon to an already-hosted image URL (e.g. uploaded via
 * UploadThing on the client). Only updates the DB column — no storage work.
 */
export async function setProjectIcon(
  projectNanoid: string,
  iconUrl: string,
): Promise<Project> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Not authenticated");
  }

  const role = await getUserProjectRole(projectNanoid);
  if (!role || role === "reader") {
    throw new Error("You do not have permission to update this project");
  }

  if (!iconUrl || !/^https?:\/\//i.test(iconUrl)) {
    throw new Error("A valid image URL is required");
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      icon_url: iconUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error setting project icon:", error);
    throw new Error("Failed to update project icon");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

/**
 * Upload an icon before a project exists yet.
 */
export async function uploadPendingProjectIcon(
  formData: FormData,
): Promise<PendingProjectIconUploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const file = validateProjectIconFile(formData);
  const admin = getAdminClientOrNull();
  const storageClient = admin ?? supabase;
  const fileExt = getProjectIconExtension(file);
  const fileNameBase = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  const storagePath = `pending/${user.id}/${Date.now()}-${fileNameBase || "project-icon"}.${fileExt}`;

  const { error: uploadError } = await storageClient.storage
    .from("project-icons")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error(
      "[Storage Error] Failed to upload pending icon:",
      JSON.stringify(uploadError, null, 2),
    );
    throw new Error(
      "Failed to upload project icon due to a service error. Please try again.",
    );
  }

  const { data: urlData } = storageClient.storage
    .from("project-icons")
    .getPublicUrl(storagePath);

  return {
    publicUrl: urlData.publicUrl,
    storagePath,
  };
}

/**
 * Delete a temporary uploaded icon before a project exists yet.
 */
export async function deletePendingProjectIcon(
  storagePath: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !storagePath) {
    return;
  }

  const expectedPrefix = `pending/${user.id}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    throw new Error("Invalid pending icon path");
  }

  const admin = getAdminClientOrNull();
  const storageClient = admin ?? supabase;

  const { error } = await storageClient.storage
    .from("project-icons")
    .remove([storagePath]);

  if (error) {
    console.error("Error deleting pending project icon:", error);
    throw new Error("Failed to delete pending project icon");
  }
}

/**
 * Delete a project icon (lookup by nanoid)
 */
export async function deleteProjectIcon(
  projectNanoid: string,
): Promise<Project> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Not authenticated");
  }

  // Verify user has permission
  const role = await getUserProjectRole(projectNanoid);
  if (!role || role === "reader") {
    throw new Error("You do not have permission to update this project");
  }

  const admin = getAdminClientOrNull();
  const storageClient = admin ?? supabase;

  // Get current project to find the icon URL
  const { data: currentProject } = await supabase
    .from("projects")
    .select("icon_url")
    .eq("nanoid", projectNanoid)
    .single();

  // Delete icon from storage if exists
  if (currentProject?.icon_url) {
    try {
      const oldUrl = new URL(currentProject.icon_url);
      const pathParts = oldUrl.pathname.split(
        "/storage/v1/object/public/project-icons/",
      );
      if (pathParts.length > 1) {
        await storageClient.storage
          .from("project-icons")
          .remove([decodeURIComponent(pathParts[1])]);
      }
    } catch {
      console.warn("Could not delete icon from storage");
    }
  }

  // Update project to remove icon URL
  const { data, error } = await supabase
    .from("projects")
    .update({
      icon_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("nanoid", projectNanoid)
    .select()
    .single();

  if (error) {
    console.error("Error removing project icon:", error);
    throw new Error("Failed to remove project icon");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}
