/**
 * AI Assistant client — talks to the integrated backend assistant (the user's
 * standalone ASTRA chatbot, now authenticated and connected to the real
 * database). No credentials here: tokens live in the auth module and requests
 * flow through the shared client in health-api.
 */
import { apiRequest } from "./health-api";

export interface AssistantMetric {
  emoji: string;
  value: string;
  label: string;
}

export interface AssistantReply {
  id?: string;
  text: string;
  degraded: string | null;
  metrics: AssistantMetric[];
  dataAsOf: string | null;
  generatedAt: string;
}

export interface ChatSendResult {
  conversationId: string;
  reply: AssistantReply;
}

export async function sendAssistantMessage(
  message: string,
  conversationId?: string,
): Promise<ChatSendResult> {
  const body: Record<string, unknown> = { message };
  if (conversationId) body["conversationId"] = conversationId;
  return apiRequest<ChatSendResult>("/api/assistant/messages", { body });
}

export interface AssistantStatus {
  configured: boolean;
  provider: string;
  model: string;
}

export async function fetchAssistantStatus(): Promise<AssistantStatus> {
  return apiRequest<AssistantStatus>("/api/assistant/status");
}

export interface ConversationSummary {
  id: string;
  title: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await apiRequest<{ conversations: ConversationSummary[] }>(
    "/api/assistant/conversations",
  );
  return res.conversations;
}

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  degraded: string | null;
  createdAt: string;
}

export async function fetchConversationMessages(id: string): Promise<StoredMessage[]> {
  const res = await apiRequest<{ messages: StoredMessage[] }>(
    `/api/assistant/conversations/${id}/messages`,
  );
  return res.messages;
}
