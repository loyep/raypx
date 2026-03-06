export type ToolCall = {
  toolName: string;
  input: Record<string, unknown>;
};

export type ToolResult = {
  toolName: string;
  output: Record<string, unknown>;
  error?: string | null;
};

export type ToolHandler = (input: Record<string, unknown>) => Promise<ToolResult>;
