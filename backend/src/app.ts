import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env, isTest } from "./env";
import { authRouter } from "./routes-auth";
import { onboardingRouter } from "./routes/onboarding";
import { vitalsRouter } from "./routes/vitals";
import { heartRouter } from "./routes/heart";
import { summariesRouter } from "./routes/summaries";
import { aiRouter, analyticsRouter, documentsRouter, missionsRouter } from "./routes/analytics";
import { datasetRouter } from "./routes/dataset";
import { assistantRouter } from "./routes/assistant";
import { knowledgeRouter } from "./routes/knowledge";
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "16kb" }));

  const origins = env.CORS_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin(origin, cb) {
        // Same-origin/curl requests (no Origin header) are fine.
        if (!origin || origins.includes(origin)) return cb(null, true);
        return cb(new Error("Origin not allowed by CORS"));
      },
      credentials: true,
    }),
  );

  if (!isTest) {
    app.use(
      "/api/auth",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        standardHeaders: true,
        legacyHeaders: false,
        // Per-IP budget: plenty for humans, painful for credential stuffing.
        max: env.NODE_ENV === "production" ? 20 : 100,
      }),
    );
    // Generous for real use, tight enough to contain abuse of write endpoints.
    app.use(
      "/api",
      rateLimit({
        windowMs: 60_000,
        standardHeaders: true,
        legacyHeaders: false,
        max: env.NODE_ENV === "production" ? 300 : 1000,
      }),
    );
  }

  app.get("/api/health", (_req, res) =>
    res.json({
      status: "ok",
      service: "astra-health",
      modules: [
        "auth",
        "profile",
        "vitals",
        "heart",
        "summaries",
        "analytics",
        "ai",
        "assistant",
        "documents",
        "missions",
        "dataset",
        "knowledge",
      ],
    }),
  );
  app.use("/api/auth", authRouter);
  app.use("/api/assistant", assistantRouter);
  app.use("/api/onboarding", onboardingRouter);
  app.use("/api/vitals", vitalsRouter);
  app.use("/api/heart", heartRouter);
  app.use("/api/summaries", summariesRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/documents", documentsRouter);
  app.use("/api/missions", missionsRouter);
  app.use("/api/dataset", datasetRouter);
  app.use("/api/knowledge", knowledgeRouter);

  app.use((_req, res) =>
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown endpoint" } }),
  );

  // Central error handler: consistent shape, no stack traces to clients.
  app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (!res.headersSent) {
        const pg = err as { code?: string };
        // Integrity violations from direct API misuse: map to 400/409, log
        // without any values (privacy rule: no PHI in logs).
        if (pg.code === "23514") {
          return res
            .status(400)
            .json({ error: { code: "CONSTRAINT", message: "Values violate data constraints" } });
        }
        if (pg.code === "23503") {
          return res
            .status(409)
            .json({ error: { code: "REFERENCE", message: "Related record is missing" } });
        }
        if (pg.code === "22P02") {
          return res
            .status(400)
            .json({ error: { code: "VALIDATION", message: "Malformed identifier" } });
        }
        console.error("[api]", pg.code ?? err);
        res
          .status(500)
          .json({ error: { code: "INTERNAL", message: "Something went wrong. Try again." } });
      }
    },
  );

  return app;
}
