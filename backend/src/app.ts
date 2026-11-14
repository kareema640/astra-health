import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env, isTest } from "./env";
import { authRouter } from "./routes-auth";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "16kb" }));

  const origins = env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
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
        limit: { standardHeaders: true, legacyHeaders: false },
        // Per-IP budget: plenty for humans, painful for credential stuffing.
        max: env.NODE_ENV === "production" ? 20 : 100,
      }),
    );
  }

  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "astra-health-auth" }));
  app.use("/api/auth", authRouter);

  app.use((_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown endpoint" } }));

  // Central error handler: consistent shape, no stack traces to clients.
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (!res.headersSent) {
      console.error("[api]", err);
      res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong. Try again." } });
    }
  });

  return app;
}
