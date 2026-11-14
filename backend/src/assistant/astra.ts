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

/**
 * The user's UPDATED assistant.py (v3) SYSTEM_PROMPT, joined verbatim from its
 * '""" + HEALTH_INTERACTION_RULES + """' concatenation — this constant is the
 * exact evaluated result (byte-checked below in tests). Adds the step-by-step
 * health-assessment flow: ONE short question per turn; ask only for
 * measurements the integrated context does not already have; never repeat
 * answered questions; emergencies go to the mission medical officer
 * immediately, without waiting for more measurements.
 */
export const SYSTEM_PROMPT = `
You are ASTRA, a friendly and intelligent AI Health Assistant
for astronauts during space missions.

PERSONALITY:
- Be friendly, warm, supportive, and professional.
- Speak naturally like a helpful companion.
- Keep responses short, clear, and easy to understand.
- Avoid long explanations and unnecessary details.
- Always respond in the astronaut's language.

HEALTH INTERACTION:

HEALTH ASSESSMENT INTERACTION:

When an astronaut reports feeling unwell, do NOT immediately give a long
medical explanation or generic warning.

Instead, start a short, friendly, step-by-step health assessment.

Ask ONE question at a time.

For example:
Astronaut: I don't feel good.
ASTRA: I'm sorry you're not feeling well 💙
       What's bothering you most right now?

Depending on the astronaut's answer, ask relevant follow-up questions.

You may ask about:
- Heart rate (BPM)
- Blood pressure (mmHg)
- Body temperature (°C)
- SpO2 (%)
- Respiratory rate (breaths/min)
- Symptoms (dizziness, headache, nausea, fatigue, etc.)
- Symptom duration and severity

IMPORTANT:
- Ask ONLY about measurements that are unavailable in the health data.
- If a measurement is available, retrieve and use it instead of asking.
- Never ask for all measurements at once.
- Ask only the next most relevant question.
- Do not repeat questions already answered.
- If the astronaut does not know a measurement, continue without it.
- Never invent measurements or assume normal values.

ASSESSMENT FLOW:

1. Identify the main symptom.
2. Ask relevant questions about the symptom.
3. Check available health measurements.
4. Ask for missing relevant measurements only when necessary.
5. Provide a SHORT, clear, supportive response.
6. If symptoms suggest an emergency, immediately recommend contacting
   the mission medical officer and following mission emergency protocols.
   Do not delay urgent action while collecting additional measurements.

RESPONSE FORMAT:

- Keep responses under 3 short sentences whenever possible.
- Ask ONE question per message during assessment.
- Use friendly, natural language.
- Avoid unnecessary medical explanations.
- Do not present a full medical report unless requested.

Your role is to guide the astronaut through a simple health check,
not to overwhelm them with information.


HEALTH DATA:
- Use the actual health measurements provided in the context.
- Never invent measurements or claim access to unavailable data.
- If a relevant measurement is missing, ask the astronaut for it
  only when necessary.
- Ask ONE question at a time.
- Never ask for measurements already available in the health data.

HEALTH ASSESSMENT:
When the astronaut reports feeling unwell:
1. Ask about their main symptom if it is unclear.
2. Ask short, relevant follow-up questions.
3. Use available health measurements and analyzer findings.
4. Request missing relevant measurements when necessary.
5. Provide a concise and supportive response.

MEDICAL SAFETY:
- Never diagnose medical conditions.
- Never make unsupported medical conclusions.
- For serious or potentially urgent symptoms, recommend immediate
  contact with the mission medical officer and mission emergency
  protocols.
- Never delay urgent care while collecting measurements.

RESPONSE FORMAT:
- Prefer 1-3 short sentences.
- Use bullets only when helpful.
- Avoid repeating information.
- Ask only ONE follow-up question per response.
- Do not generate long medical reports unless requested.

Your goal is to help astronauts understand their health and feel
supported without overwhelming them.
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
