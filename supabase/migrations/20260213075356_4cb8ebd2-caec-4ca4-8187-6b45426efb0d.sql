
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  college TEXT,
  city TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'professional', 'entrepreneur')),
  interests TEXT[] DEFAULT '{}',
  preferred_mode TEXT DEFAULT 'both' CHECK (preferred_mode IN ('online', 'offline', 'both')),
  events_attended INTEGER DEFAULT 0,
  events_won INTEGER DEFAULT 0,
  certificates_earned INTEGER DEFAULT 0,
  participation_points INTEGER DEFAULT 0,
  is_verified_organizer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  end_date DATE,
  end_time TEXT,
  mode TEXT DEFAULT 'offline' CHECK (mode IN ('online', 'offline', 'hybrid')),
  location TEXT,
  price INTEGER DEFAULT 0,
  max_attendees INTEGER DEFAULT 100,
  current_attendees INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  speakers JSONB DEFAULT '[]',
  agenda JSONB DEFAULT '[]',
  college TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own events" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- Event bookmarks
CREATE TABLE public.event_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.event_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.event_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.event_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete bookmarks" ON public.event_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'won', 'cancelled')),
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizers can view event registrations" ON public.event_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
);
CREATE POLICY "Users can register" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registration" ON public.event_registrations FOR UPDATE USING (auth.uid() = user_id);

-- Event views tracking
CREATE TABLE public.event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event views" ON public.event_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can track views" ON public.event_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Event ratings
CREATE TABLE public.event_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  organization_rating INTEGER CHECK (organization_rating BETWEEN 1 AND 5),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  worth_rating INTEGER CHECK (worth_rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.event_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone" ON public.event_ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate events" ON public.event_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.event_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Teams (team finder)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  skills_needed TEXT[] DEFAULT '{}',
  max_members INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owners can update teams" ON public.teams FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Owners can delete teams" ON public.teams FOR DELETE USING (auth.uid() = created_by);

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members viewable by team participants" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Users can request to join" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Team owners can manage members" ON public.team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);
CREATE POLICY "Users can leave or owners can remove" ON public.team_members FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'reminder', 'team', 'achievement')),
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_college ON public.events(college);
CREATE INDEX idx_events_view_count ON public.events(view_count DESC);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_bookmarks_user ON public.event_bookmarks(user_id);
CREATE INDEX idx_event_views_event ON public.event_views(event_id);
CREATE INDEX idx_profiles_college ON public.profiles(college);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_teams_event ON public.teams(event_id);
