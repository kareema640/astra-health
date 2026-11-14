import { z } from "zod";

/** Secrets come from environment variables only — never committed (see backend/.env.example). */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().min(1).startsWith("postgres"),
  // 32+ chars; generate with: openssl rand -base64 48
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  // Comma-separated exact origins allowed to call the API with credentials.
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://127.0.0.1:5173"),
  // AI Assistant — provider kept from the standalone chatbot (Google Gemini).
  // Optional: without a key the assistant still works and replies with its
  // honest "temporarily unavailable" fallback, never an invented answer.
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
  GEMINI_BASE_URL: z.string().default("https://generativelanguage.googleapis.com/v1beta"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  console.error(`Invalid environment configuration:\n${issues}`);
  console.error("Copy backend/.env.example to backend/.env and set real values.");
  process.exit(1);
}

export const env = parsed.data;
export const isTest = env.NODE_ENV === "test";
