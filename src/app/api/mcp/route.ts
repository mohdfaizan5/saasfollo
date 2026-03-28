import { handleMcpRequest, rewriteToMcpTransport } from "./server";

export async function GET(request: Request) {
  return handleMcpRequest(rewriteToMcpTransport(request, "mcp"));
}

export async function POST(request: Request) {
  return handleMcpRequest(rewriteToMcpTransport(request, "mcp"));
}
