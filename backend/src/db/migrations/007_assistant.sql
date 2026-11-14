-- ASTRA HEALTH — AI Assistant conversation management (Stage 3)
-- Integrates the standalone ASTRA_Health_Chatbot into the platform: each
-- conversation belongs to exactly one astronaut record (the authenticated
-- user's own) and messages are persisted for retrieval. Content is PHI-adjacent
-- (health questions) → owner-scoped access only, never joined to other users.

CREATE TABLE IF NOT EXISTS assistant_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astronaut_id uuid NOT NULL REFERENCES astronauts(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assistant_conversations_owner_idx
  ON assistant_conversations (astronaut_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  -- Set when the reply could not come from the AI service and the user saw
  -- the honest fallback instead. Never hides degraded behaviour.
  degraded text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assistant_messages_conversation_idx
  ON assistant_messages (conversation_id, id);
