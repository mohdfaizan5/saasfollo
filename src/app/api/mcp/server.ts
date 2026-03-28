import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { createAdminClient } from "@/lib/admin";

const MCP_BASE_PATH = "/api/mcp";

function getMcpUserEmail() {
  const email = process.env.MCP_USER_EMAIL?.trim();

  if (!email) {
    throw new Error(
      "MCP_USER_EMAIL is required. Set it to the SaaSfollo account email the MCP server should read from."
    );
  }

  return email;
}

async function verifyApiKeyIfConfigured(request: Request) {
  const expectedKey = process.env.MCP_API_KEY?.trim();

  if (!expectedKey) {
    return;
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : undefined;
  const token = bearerToken || new URL(request.url).searchParams.get("token") || undefined;

  if (token !== expectedKey) {
    throw new Error("Unauthorized: Invalid MCP API key");
  }
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function getTargetUserId(adminClient: AdminClient, email: string) {
  const {
    data: { users },
    error,
  } = await adminClient.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to look up MCP user: ${error.message}`);
  }

  const user = users.find((candidate) => candidate.email === email);

  if (!user) {
    throw new Error(`No SaaSfollo user found for MCP_USER_EMAIL=${email}`);
  }

  return user.id;
}

async function getScopedProject(adminClient: AdminClient, userId: string, projectNanoid: string) {
  const { data: project, error } = await adminClient
    .from("projects")
    .select("id")
    .eq("nanoid", projectNanoid)
    .eq("user_id", userId)
    .single();

  if (error || !project) {
    throw new Error(`Project ${projectNanoid} not found for the configured MCP user.`);
  }

  return project;
}

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_projects",
      {
        title: "List Projects",
        description: "Fetch all active SaaS projects available in SaaSfollo.",
        inputSchema: z.object({}),
      },
      async () => {
        const admin = createAdminClient();
        const userId = await getTargetUserId(admin, getMcpUserEmail());

        const { data, error } = await admin
          .from("projects")
          .select("nanoid, name, description, is_archived, is_pinned, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch projects: ${error.message}`);
        }

        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    );

    server.registerTool(
      "list_versions",
      {
        title: "List Versions",
        description: "Fetch all scope versions for a specific project.",
        inputSchema: z.object({
          projectNanoid: z.string().describe("The nanoid of the project to fetch versions for."),
        }),
      },
      async ({ projectNanoid }) => {
        const admin = createAdminClient();
        const userId = await getTargetUserId(admin, getMcpUserEmail());
        const project = await getScopedProject(admin, userId, projectNanoid);

        const { data, error } = await admin
          .from("versions")
          .select("id, name, description, status, created_at")
          .eq("project_id", project.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch versions: ${error.message}`);
        }

        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    );

    server.registerTool(
      "list_tasks",
      {
        title: "List Tasks",
        description: "Fetch tasks for a project, with optional filtering by version, status, or priority.",
        inputSchema: z.object({
          projectNanoid: z.string().describe("The nanoid of the project to fetch tasks for."),
          versionId: z.number().optional().describe("Numeric ID of a version to filter by."),
          status: z
            .enum(["now", "next", "later", "done"])
            .optional()
            .describe("Filter tasks by completion status."),
          priority: z
            .enum(["low", "medium", "high"])
            .optional()
            .describe("Filter tasks by priority."),
        }),
      },
      async ({ projectNanoid, versionId, status, priority }) => {
        const admin = createAdminClient();
        const userId = await getTargetUserId(admin, getMcpUserEmail());
        const project = await getScopedProject(admin, userId, projectNanoid);

        let query = admin.from("tasks").select("*").eq("project_id", project.id);

        if (versionId !== undefined) {
          query = query.eq("version_id", versionId);
        }

        if (status) {
          query = query.eq("status", status);
        }

        if (priority) {
          query = query.eq("priority", priority);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch tasks: ${error.message}`);
        }

        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }
    );
  },
  {},
  {
    basePath: MCP_BASE_PATH,
    maxDuration: 60,
    verboseLogs: true,
  }
);

export async function handleMcpRequest(request: Request) {
  await verifyApiKeyIfConfigured(request);
  return mcpHandler(request);
}

export function rewriteToMcpTransport(request: Request, transport: "mcp" | "sse" | "message") {
  const url = new URL(request.url);
  url.pathname = `${MCP_BASE_PATH}/${transport}`;

  return new Request(url, request);
}
