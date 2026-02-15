import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import EventCard from "./EventCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FeaturedEvents = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["featured-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_completed", false)
        .order("date", { ascending: true })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Featured <span className="gradient-text">Events</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Real upcoming events from trusted sources. Don't miss out!
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" className="group">
              View All Events
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                image={event.image_url || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop"}
                date={new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                time={event.time || "TBA"}
                location={event.location || "TBA"}
                mode={(event.mode as "online" | "offline" | "hybrid") || "offline"}
                category={event.category}
                organizer={event.college || event.source_name || "Unknown"}
                isVerified={event.is_verified || false}
                price={event.price === 0 ? "free" : (event.price || 0)}
                attendees={event.current_attendees || 0}
                maxAttendees={event.max_attendees || 100}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">No upcoming events found.</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
