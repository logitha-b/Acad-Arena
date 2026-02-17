
-- Create event_winners table
CREATE TABLE public.event_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  winner_name TEXT NOT NULL,
  college_name TEXT,
  team_name TEXT,
  position INTEGER NOT NULL DEFAULT 1, -- 1st, 2nd, 3rd etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create winner_projects table
CREATE TABLE public.winner_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  winner_id UUID NOT NULL REFERENCES public.event_winners(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  problem_statement TEXT,
  solution_summary TEXT,
  technologies TEXT[] DEFAULT '{}',
  impact TEXT,
  demo_link TEXT,
  repo_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_projects ENABLE ROW LEVEL SECURITY;

-- Everyone can view winners and projects
CREATE POLICY "Winners are viewable by everyone" ON public.event_winners FOR SELECT USING (true);
CREATE POLICY "Projects are viewable by everyone" ON public.winner_projects FOR SELECT USING (true);

-- Event organizers can manage winners
CREATE POLICY "Organizers can add winners" ON public.event_winners FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = event_winners.event_id AND events.organizer_id = auth.uid()));

CREATE POLICY "Organizers can update winners" ON public.event_winners FOR UPDATE
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_winners.event_id AND events.organizer_id = auth.uid()));

CREATE POLICY "Organizers can delete winners" ON public.event_winners FOR DELETE
  USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_winners.event_id AND events.organizer_id = auth.uid()));

-- Winner project management via winner's event organizer
CREATE POLICY "Organizers can add projects" ON public.winner_projects FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM event_winners ew JOIN events e ON e.id = ew.event_id
    WHERE ew.id = winner_projects.winner_id AND e.organizer_id = auth.uid()
  ));

CREATE POLICY "Organizers can update projects" ON public.winner_projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM event_winners ew JOIN events e ON e.id = ew.event_id
    WHERE ew.id = winner_projects.winner_id AND e.organizer_id = auth.uid()
  ));

CREATE POLICY "Organizers can delete projects" ON public.winner_projects FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM event_winners ew JOIN events e ON e.id = ew.event_id
    WHERE ew.id = winner_projects.winner_id AND e.organizer_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_event_winners_updated_at BEFORE UPDATE ON public.event_winners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_winner_projects_updated_at BEFORE UPDATE ON public.winner_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
