
-- Drop the foreign key constraint on organizer_id so scraped events can have a null organizer
ALTER TABLE public.events DROP CONSTRAINT events_organizer_id_fkey;

-- Make organizer_id nullable for scraped events
ALTER TABLE public.events ALTER COLUMN organizer_id DROP NOT NULL;
