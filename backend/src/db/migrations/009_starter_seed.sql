-- ASTRA HEALTH — migration 009: one-time starter-data claim per astronaut.
-- Restores the Mission Planner tasks and countermeasure sessions the site
-- shipped with before the pages moved to the server: every account receives
-- exactly that original set once, on first visit. The flag is claimed
-- atomically, so deleting the starters never re-seeds duplicates.

ALTER TABLE astronauts
  ADD COLUMN IF NOT EXISTS starter_data_seeded boolean NOT NULL DEFAULT false;
