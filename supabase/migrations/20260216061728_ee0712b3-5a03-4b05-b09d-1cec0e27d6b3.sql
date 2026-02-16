
-- Colleges table for global college search
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  state_province TEXT,
  city TEXT,
  website TEXT,
  domains TEXT[],
  alpha_two_code TEXT,
  reputation_score NUMERIC(3,1) DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_organization_rating NUMERIC(3,1) DEFAULT 0,
  avg_difficulty_rating NUMERIC(3,1) DEFAULT 0,
  avg_worth_rating NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Colleges are viewable by everyone
CREATE POLICY "Colleges are viewable by everyone" ON public.colleges FOR SELECT USING (true);

-- Index for search
CREATE INDEX idx_colleges_name ON public.colleges USING gin(to_tsvector('english', name));
CREATE INDEX idx_colleges_country ON public.colleges(country);

-- Review summaries table for AI-generated summaries
CREATE TABLE public.review_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  summary TEXT,
  sentiment_score NUMERIC(3,2), -- -1.0 to 1.0
  sentiment_label TEXT, -- positive, neutral, negative
  pros TEXT[],
  cons TEXT[],
  common_feedback TEXT[],
  total_reviews INTEGER DEFAULT 0,
  avg_organization NUMERIC(3,1) DEFAULT 0,
  avg_difficulty NUMERIC(3,1) DEFAULT 0,
  avg_worth NUMERIC(3,1) DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id)
);

ALTER TABLE public.review_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review summaries are viewable by everyone" ON public.review_summaries FOR SELECT USING (true);

-- Allow service role to insert/update review summaries (via edge function)
CREATE POLICY "Service role can manage review summaries" ON public.review_summaries 
FOR ALL USING (true) WITH CHECK (true);

-- Add college_id to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id);

-- Trigger to update colleges updated_at
CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
