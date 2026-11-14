import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { presentReply } from "../src/assistant/astra";
import { app, newUser, setupDb, syncUser, teardownDb, wipe } from "./helpers";

beforeAll(async () => {
  await setupDb();
  await wipe();
});
afterEach(() => {
  vi.unstubAllGlobals();
  return wipe();
});
afterAll(teardownDb);

/** Fake Gemini: records payloads, returns the real API's response shape. */
function stubGemini(replyText = "Your readings look steady, keep hydrating.") {
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: unknown, init: unknown) => {
      calls.push({ url: String(url), body: JSON.parse(String((init as RequestInit).body)) });
      return new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: replyText }] } }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }),
  );
  return calls;
}

let dataSeq = 0;
async function userWithData() {
  const user = await newUser({ astronautId: `AST-AST${++dataSeq}` });
  await syncUser(user, {
    basic: { age: "34", sex: "female", height: "175", weight: "63" },
    vitals: { systolic: "118", diastolic: "76", spo2: "98" },
    heart: { restingHr: "58", alertAbove: "120", alertBelow: "45", conditions: ["none"] },
    avatar: { character: "commander", callsign: "NOVA" },
    progress: { basic: "done", avatar: "done" },
  });
  await request(app)
    .post("/api/vitals/observations")
    .set("authorization", `Bearer ${user.accessToken}`)
    .send({ heartRate: "75", spo2: "97" })
    .expect(201);
  return user;
}

describe("AI Assistant — auth & status", () => {
  it("tidies markdown/LaTeX markup for plain-text bubbles", () => {
    expect(presentReply("Your **SpO₂** is fine ($\\text{SpO}_2$ = 96%).\n* tip")).toBe(
      "Your SpO₂ is fine (SpO_2 = 96%).\n• tip",
    );
  });

  it("requires a signed-in session", async () => {
    const res = await request(app).post("/api/assistant/messages").send({ message: "hi" });
    expect(res.status).toBe(401);
  });

  it("reports the kept provider without leaking the key", async () => {
    const user = await newUser({ astronautId: "AST-AST0" });
    const res = await request(app)
      .get("/api/assistant/status")
      .set("authorization", `Bearer ${user.accessToken}`)
      .expect(200);
    expect(res.body).toMatchObject({
      configured: true,
      provider: "google-gemini",
      model: "gemini-3.5-flash-lite",
    });
    expect(JSON.stringify(res.body)).not.toContain("test-key");
  });
});

describe("POST /api/assistant/messages", () => {
  it("answers using the caller's REAL database measurements", async () => {
    const calls = stubGemini();
    const user = await userWithData();
    const res = await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${user.accessToken}`)
      .send({ message: "How is my heart doing today?" })
      .expect(201);

    expect(res.body.reply.text).toBe("Your readings look steady, keep hydrating.");
    expect(res.body.reply.metrics).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Heart Rate", value: "75 bpm" })]),
    );
    expect(res.body.reply.degraded).toBeNull();

    // The provider received the user's actual value, the preserved system
    // prompt, and the astronaut's own designator.
    const last = calls[calls.length - 1]!;
    const content = JSON.stringify(last.body);
    const body = last.body as { contents: { role: string; parts: { text?: string }[] }[] };
    const userContent = body.contents.at(-1)!.parts[0]!.text ?? "";
    expect(content).toContain("You are ASTRA, a friendly and intelligent AI Health Assistant");
    // v3 prompt: astronaut's language + the step-by-step assessment rules
    expect(content).toContain("Always respond in the astronaut's language.");
    expect(content).toContain("HEALTH ASSESSMENT INTERACTION:");
    expect(content).toContain("Ask ONE question at a time.");
    expect(content).toContain(
      "Ask ONLY about measurements that are unavailable in the health data.",
    );
    expect(userContent).toContain("AST-AST1");
    expect(userContent).toContain('"heart_rate": 75');
    expect(userContent).toContain("How is my heart doing today?");
    expect(last.url).toContain("models/gemini-3.5-flash-lite:generateContent");
  });

  it("keeps conversation context across turns", async () => {
    const calls = stubGemini();
    const user = await userWithData();
    const first = await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${user.accessToken}`)
      .send({ message: "Summarize my sleep." })
      .expect(201);
    await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${user.accessToken}`)
      .send({ conversationId: first.body.conversationId, message: "And compared to before?" })
      .expect(201);

    const second = calls[1]!.body as { contents: { role: string; parts: { text: string }[] }[] };
    // history turn pair + current question
    expect(second.contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    // The REST API requires parts[]; history text must round-trip inside them.
    expect(second.contents[0]!.parts[0]!.text).toBe("Summarize my sleep.");
    expect(second.contents[1]!.parts[0]!.text).toBe("Your readings look steady, keep hydrating.");
  });

  it("tells the model there is no data instead of inventing any", async () => {
    const calls = stubGemini();
    const user = await newUser({ astronautId: "AST-AST2" });
    const res = await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${user.accessToken}`)
      .send({ message: "What were my vitals yesterday?" })
      .expect(201);
    const uc =
      (calls[0]!.body as { contents: { parts: { text?: string }[] }[] }).contents.at(-1)!.parts[0]!
        .text ?? "";
    expect(uc).toContain("No health data available for this astronaut.");
    expect(res.body.reply.metrics).toEqual([]);
    expect(res.body.reply.dataAsOf).toBeNull();
  });

  it("persists messages and degrades honestly when Gemini is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const user = await userWithData();
    const res = await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${user.accessToken}`)
      .send({ message: "hello" })
      .expect(201);
    expect(res.body.reply.text).toBe("Sorry, ASTRA is temporarily unavailable.");
    expect(res.body.reply.degraded).toContain("AI_ERROR");

    const convs = await request(app)
      .get("/api/assistant/conversations")
      .set("authorization", `Bearer ${user.accessToken}`)
      .expect(200);
    expect(convs.body.conversations).toHaveLength(1);
    expect(convs.body.conversations[0]).toMatchObject({ title: "hello", messageCount: 2 });

    const msgs = await request(app)
      .get(`/api/assistant/conversations/${convs.body.conversations[0].id}/messages`)
      .set("authorization", `Bearer ${user.accessToken}`)
      .expect(200);
    expect(msgs.body.messages.map((m: { role: string }) => m.role)).toEqual(["user", "assistant"]);
    expect(msgs.body.messages[1].degraded).toContain("AI_ERROR");
  });
});

describe("Conversation isolation", () => {
  it("never exposes or accepts another user's conversation", async () => {
    stubGemini();
    const alice = await userWithData();
    const created = await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${alice.accessToken}`)
      .send({ message: "alice secret question" })
      .expect(201);
    const bob = await newUser({ astronautId: "AST-BOB9" });

    const list = await request(app)
      .get("/api/assistant/conversations")
      .set("authorization", `Bearer ${bob.accessToken}`)
      .expect(200);
    expect(list.body.conversations).toEqual([]);

    await request(app)
      .get(`/api/assistant/conversations/${created.body.conversationId}/messages`)
      .set("authorization", `Bearer ${bob.accessToken}`)
      .expect(404);

    const hijack = await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${bob.accessToken}`)
      .send({ conversationId: created.body.conversationId, message: "try it" });
    expect(hijack.status).toBe(404);
  });

  it("rejects malformed requests with the standard validation shape", async () => {
    const user = await newUser({ astronautId: "AST-AST3" });
    const res = await request(app)
      .post("/api/assistant/messages")
      .set("authorization", `Bearer ${user.accessToken}`)
      .send({ message: "   " });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION");
  });
});
