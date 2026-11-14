import { Router } from "express";
import { z } from "zod";
import { query, queryOne } from "../db";
import { env } from "../env";
import { h, notFound, validationFail } from "../lib/api";
import { requireAuth, resolveAstronaut } from "../middleware/auth";
import { analyzeHealth } from "../assistant/analyzer";
import { buildHealthContext, buildUIMetrics } from "../assistant/context";
import { askAstra, buildUserPrompt, type GeminiTurn } from "../assistant/astra";

/**
 * AI Assistant module — the user's standalone ASTRA_Health_Chatbot, now
 * integrated: authenticated (existing JWT), personalized (the caller's own
 * rows only), conversation-persisted, and served by the existing backend.
 */
export const assistantRouter = Router();
assistantRouter.use(requireAuth());

const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000),
});

interface ConvRow {
  id: string;
  title: string;
  astronaut_id: string;
}

async function ownedConversation(astronautId: string, id: string): Promise<ConvRow | null> {
  return queryOne<ConvRow>(
    "SELECT id, title, astronaut_id FROM assistant_conversations WHERE id = $1 AND astronaut_id = $2",
    [id, astronautId],
  );
}

assistantRouter.post(
  "/messages",
  h(async (req, res) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);
    const { conversationId, message } = parsed.data;

    const aid = await resolveAstronaut(req.user);
    let conv: ConvRow | null = null;
    if (conversationId) {
      conv = await ownedConversation(aid, conversationId);
      // Someone else's conversation id is simply not found — never leaked.
      if (!conv) return notFound(res, "Conversation");
    }
    if (!conv) {
      conv = await queryOne<ConvRow>(
        `INSERT INTO assistant_conversations (astronaut_id, title)
         VALUES ($1, $2) RETURNING id, title, astronaut_id`,
        [aid, message.slice(0, 80)],
      );
      if (!conv) throw new Error("conversation insert failed");
    }

    // Persist the user's message first so history order is authoritative.
    const userMsg = await queryOne<{ id: string }>(
      `INSERT INTO assistant_messages (conversation_id, role, content)
       VALUES ($1, 'user', $2) RETURNING id::text AS id`,
      [conv.id, message],
    );
    if (!userMsg) throw new Error("message insert failed");

    // Conversation context: the most recent 20 turns of THIS conversation.
    const hist = await query<{ role: string; content: string }>(
      `SELECT role, content FROM assistant_messages
       WHERE conversation_id = $1 AND id::bigint < $2::bigint
       ORDER BY id ASC`,
      [conv.id, userMsg.id],
    );
    const turns: GeminiTurn[] = hist.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      text: m.content,
    }));

    // Real, authenticated user's data — the chatbot's CSV loader is gone.
    const ctx = await buildHealthContext(aid, req.user.astronautId);
    const analysis = ctx.hasData
      ? analyzeHealth(ctx.astronaut_id, {
          heart_rate: ctx.heart_rate,
          spo2: ctx.spo2,
          systolic: ctx.blood_pressure?.systolic ?? null,
          diastolic: ctx.blood_pressure?.diastolic ?? null,
          body_temperature: ctx.body_temperature,
          respiratory_rate: ctx.respiratory_rate,
          sleep_hours: ctx.sleep_hours,
          stress: ctx.stress,
          fatigue: ctx.fatigue,
        })
      : null;
    const userContent = buildUserPrompt(ctx.hasData ? ctx : null, analysis, message);
    const reply = await askAstra(turns, userContent);

    const astMsg = await queryOne<{ id: string; created_at: string }>(
      `INSERT INTO assistant_messages (conversation_id, role, content, degraded)
       VALUES ($1, 'assistant', $2, $3) RETURNING id::text AS id, created_at`,
      [conv.id, reply.text, reply.degraded],
    );
    await query("UPDATE assistant_conversations SET last_message_at = now() WHERE id = $1", [
      conv.id,
    ]);
    // Actions only — no clinical values in the audit trail.
    await query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, ip)
       VALUES ($1,'assistant.chat','assistant_conversations',$2,$3)`,
      [req.user.id, conv.id, req.ip ?? null],
    );

    return res.status(201).json({
      conversationId: conv.id,
      reply: {
        id: astMsg?.id,
        text: reply.text,
        degraded: reply.degraded,
        metrics: ctx.hasData ? buildUIMetrics(ctx) : [],
        dataAsOf: ctx.timestamp,
        generatedAt: astMsg?.created_at ?? new Date().toISOString(),
      },
    });
  }),
);

/** The caller's own conversations, newest activity first. */
assistantRouter.get(
  "/conversations",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const rows = await query(
      `SELECT c.id, c.title, c.started_at AS "startedAt",
              c.last_message_at AS "lastMessageAt",
              count(m.id)::int AS "messageCount"
       FROM assistant_conversations c
       LEFT JOIN assistant_messages m ON m.conversation_id = c.id
       WHERE c.astronaut_id = $1
       GROUP BY c.id
       ORDER BY c.last_message_at DESC
       LIMIT 20`,
      [aid],
    );
    res.json({ conversations: rows });
  }),
);

/** Messages of one own conversation; anything else is 404, never 403-with-data. */
assistantRouter.get(
  "/conversations/:id/messages",
  h(async (req, res) => {
    const aid = await resolveAstronaut(req.user);
    const conv = await ownedConversation(aid, req.params.id ?? "");
    if (!conv) return notFound(res, "Conversation");
    const messages = await query(
      `SELECT id::text AS id, role, content, degraded, created_at AS "createdAt"
       FROM assistant_messages WHERE conversation_id = $1 ORDER BY id ASC LIMIT 500`,
      [conv.id],
    );
    res.json({ conversation: { id: conv.id, title: conv.title }, messages });
  }),
);

/** Capability probe for the frontend badge: is the AI service configured? */
assistantRouter.get(
  "/status",
  h(async (_req, res) => {
    res.json({
      configured: Boolean(env.GEMINI_API_KEY),
      provider: "google-gemini",
      model: env.GEMINI_MODEL,
    });
  }),
);
