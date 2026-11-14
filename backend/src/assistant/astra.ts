import { env } from "../env";
import type { AstraHealthContext } from "./context";
import type { AnalysisResult } from "./analyzer";

/**
 * Port of the standalone chatbot's app/assistant.py (ASTRA_Health_Chatbot).
 * The AI provider is unchanged: Google Gemini, model gemini-3.5-flash-lite,
 * temperature 0.3, 60 s timeout — exactly as the user built it. The system
 * prompt below mirrors the user's UPDATED assistant.py verbatim (revised
 * ASTRA personality: short direct answers, friendly follow-up questions for
 * missing details, knowledge limits, medical safety, conversation context,
 * answer in the astronaut's language). The per-message assembly is likewise
 * preserved verbatim; only the data source moved from the local CSV to the
 * user's real database rows and multi-turn conversation history was added —
 * which the new prompt explicitly requires ("Maintain context throughout
 * the conversation") and this integration already provides.
 *
 * Credentials: GEMINI_API_KEY comes from backend/.env (gitignored) and is
 * never sent to the browser.
 */

export const SYSTEM_PROMPT = `
You are ASTRA, a friendly and intelligent AI Health Assistant designed
for astronauts during space missions.

PERSONALITY:
- Be friendly, warm, supportive, and professional.
- Speak naturally, like a helpful companion.
- Keep responses SHORT, clear, and easy to understand.
- Avoid long explanations, unnecessary details, and repetitive information.
- Use simple language and explain medical terms when necessary.

RESPONSE STYLE:
- Start directly with the answer.
- Use short paragraphs and bullet points when helpful.
- Use numbered steps for instructions.
- Use emojis occasionally when appropriate, but do not overuse them.
- Highlight important warnings clearly.

CONTEXT AWARENESS:
- Consider the unique conditions of space missions, including microgravity,
  radiation, isolation, stress, sleep disruption, and limited medical resources.
- When discussing astronaut health, use available health data if relevant.
- Never invent health measurements or claim access to unavailable data.

MISSING INFORMATION:
- If the user's question is unclear or missing important details,
  ask a short and friendly follow-up question.
- Ask only for the information necessary to answer accurately.
- Never guess missing information or make assumptions about the astronaut.

KNOWLEDGE LIMITS:
- Answer general health, wellness, space-related health, and mission-related
  questions within your knowledge.
- If a question is outside your knowledge or capabilities, politely explain
  that you cannot answer it reliably.
- Never fabricate facts, scientific information, or medical advice.
- Do not pretend to know information you do not have.
- If you cannot answer directly, explain what information is needed.

MEDICAL SAFETY:
- Never diagnose medical conditions.
- Never replace professional medical evaluation.
- For potentially serious or urgent symptoms, clearly recommend contacting
  the mission medical officer or following mission emergency protocols.
- Never dismiss potentially dangerous symptoms.

CONVERSATION:
- Maintain context throughout the conversation.
- Avoid repeating information the astronaut already provided.
- Ask follow-up questions naturally.
- Be reassuring without making unrealistic promises.

Your goal is to make astronauts feel supported, informed, and safe
throughout their missions.

Always respond in the language used by the astronaut.
`;

/** Verbatim structure of assistant.py's full_message, with real DB data. */
export function buildUserPrompt(
  ctx: AstraHealthContext | null,
  analysis: AnalysisResult | null,
  message: string,
): string {
  const healthContext = ctx
    ? JSON.stringify(ctx, null, 4)
    : "No health data available for this astronaut.";
  const analyzerResult = analysis
    ? JSON.stringify(analysis, null, 4)
    : "Health analysis unavailable.";
  return `
ASTRONAUT ID:
${ctx ? ctx.astronaut_id : "unknown"}

LATEST HEALTH MEASUREMENTS:
${healthContext}

HEALTH ANALYZER FINDINGS:
${analyzerResult}

ASTRONAUT QUESTION:
${message}

INSTRUCTIONS:

Answer the astronaut's question using the actual health
measurements and analyzer findings provided above.

Explain relevant measurements in simple language.

If the question is unrelated to personal health,
answer it normally.

Do not invent measurements or medical conclusions.
`;
}

export interface GeminiTurn {
  role: "user" | "model";
  text: string;
}

export interface AstraReply {
  text: string;
  /** Present when the user saw a fallback instead of a Gemini answer. */
  degraded: string | null;
}

export const FALLBACK_TEXT = "Sorry, ASTRA is temporarily unavailable.";

/** Gemini answers use markdown; chat bubbles render plain text — tidy it. */
export function presentReply(raw: string): string {
  return raw
    .replace(/\$\\text\{([^}]*)\}\$/g, "$1")
    .replace(/\$\\mathrm\{([^}]*)\}\$/g, "$1")
    .replace(/\\(?:text|mathrm|mathbf)\{([^}]*)\}/g, "$1")
    .replace(/\$(.+?)\$/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .trim();
}

export async function askAstra(turns: GeminiTurn[], userContent: string): Promise<AstraReply> {
  if (!env.GEMINI_API_KEY) {
    // Same visible behaviour as the original when no key is configured,
    // but honest about why.
    return { text: FALLBACK_TEXT, degraded: "AI_NOT_CONFIGURED" };
  }
  try {
    const url = `${env.GEMINI_BASE_URL}/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          ...turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
          { role: "user", parts: [{ text: userContent }] },
        ],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.3 },
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      // Provider error details are safe to surface (no request content in them).
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      return { text: FALLBACK_TEXT, degraded: `AI_HTTP_${res.status}:${detail}` };
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: unknown }[] } }[];
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((p) => (typeof p.text === "string" ? p.text : ""))
      .join("")
      .trim();
    const shown = text ? presentReply(text) : "";
    return {
      text: shown || "ASTRA could not generate a response.",
      degraded: shown ? null : "AI_EMPTY_RESPONSE",
    };
  } catch (e) {
    return {
      text: FALLBACK_TEXT,
      degraded: `AI_ERROR:${e instanceof Error ? e.name : "unknown"}`,
    };
  }
}
