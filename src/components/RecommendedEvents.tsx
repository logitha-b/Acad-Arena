import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EventCard from "./EventCard";

const RecommendedEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchRecommended();
  }, [user]);

  const fetchRecommended = async () => {
    // Get user profile interests
    const { data: profile } = await supabase
      .from("profiles")
      .select("interests, college")
      .eq("user_id", user!.id)
      .single();

    let query = supabase.from("events").select("*").eq("is_completed", false).order("view_count", { ascending: false }).limit(4);

    // If user has interests, filter by them
    if (profile?.interests && profile.interests.length > 0) {
      query = query.in("category", profile.interests);
    }

    const { data } = await query;
    if (data) setEvents(data);
  };

  if (!user || events.length === 0) return null;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <p className="text-sm text-muted-foreground">Based on your interests and activity</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              image={event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"}
              date={new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              time={event.time || "TBD"}
              location={event.location || "TBD"}
              mode={event.mode || "offline"}
              category={event.category}
              organizer="Organizer"
              price={event.price === 0 ? "free" : event.price}
              attendees={event.current_attendees || 0}
              maxAttendees={event.max_attendees || 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedEvents;
