
-- Drop the partial unique index and create a regular one
DROP INDEX IF EXISTS idx_events_external_id;
CREATE UNIQUE INDEX idx_events_external_id ON public.events(external_id) WHERE external_id IS NOT NULL;

-- Actually we need a proper unique constraint, not just index, for ON CONFLICT
ALTER TABLE public.events ADD CONSTRAINT events_external_id_unique UNIQUE (external_id);
