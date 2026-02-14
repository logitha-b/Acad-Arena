
-- Add source tracking columns to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS source_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS source_url text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS registration_link text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS external_id text DEFAULT NULL;

-- Create unique index to prevent duplicate scraped events
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_id ON public.events(external_id) WHERE external_id IS NOT NULL;

-- Create index for source filtering
CREATE INDEX IF NOT EXISTS idx_events_source_name ON public.events(source_name);
