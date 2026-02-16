import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Globe, MapPin, Star, Trophy, Users, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";

const CollegeProfile = () => {
  const { id } = useParams();

  const { data: college, isLoading } = useQuery({
    queryKey: ["college", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("colleges").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["college-events", id],
    queryFn: async () => {
      const collegeName = college?.name;
      if (!collegeName) return [];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .or(`college.ilike.%${collegeName}%,college_id.eq.${id}`)
        .order("date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!college,
  });

  const renderStarBar = (label: string, value: number) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value > 0 ? value.toFixed(1) : "N/A"}/5</span>
      </div>
      <Progress value={(value / 5) * 100} className="h-2" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center pt-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center pt-40">
          <h1 className="text-2xl font-bold mb-2">College not found</h1>
          <Link to="/colleges" className="text-primary hover:underline">Search colleges</Link>
        </div>
      </div>
    );
  }

  const completedEvents = events.filter((e) => e.is_completed);
  const upcomingEvents = events.filter((e) => !e.is_completed);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="bg-card rounded-2xl p-8 card-shadow mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shrink-0">
                <GraduationCap className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{college.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {[college.city, college.state_province, college.country].filter(Boolean).join(", ")}
                  </span>
                  {college.website && (
                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge className="gradient-bg text-primary-foreground text-sm px-3 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Reputation: {college.reputation_score > 0 ? `${Number(college.reputation_score).toFixed(1)}/5` : "N/A"}
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Trophy className="w-4 h-4 mr-1" />
                    {college.total_events} Events Hosted
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Users className="w-4 h-4 mr-1" />
                    {college.total_reviews} Reviews
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ratings Breakdown */}
            <div className="lg:col-span-1">
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Ratings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderStarBar("Organization", Number(college.avg_organization_rating))}
                  {renderStarBar("Difficulty", Number(college.avg_difficulty_rating))}
                  {renderStarBar("Worth Attending", Number(college.avg_worth_rating))}
                </CardContent>
              </Card>
            </div>

            {/* Events */}
            <div className="lg:col-span-2 space-y-8">
              {upcomingEvents.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {upcomingEvents.slice(0, 4).map((event) => (
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
                        organizer={college.name}
                        isVerified={event.is_verified || false}
                        price={event.price === 0 ? "free" : (event.price || 0)}
                        attendees={event.current_attendees || 0}
                        maxAttendees={event.max_attendees || 100}
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedEvents.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Past Events</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {completedEvents.slice(0, 4).map((event) => (
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
                        organizer={college.name}
                        isVerified={event.is_verified || false}
                        price={event.price === 0 ? "free" : (event.price || 0)}
                        attendees={event.current_attendees || 0}
                        maxAttendees={event.max_attendees || 100}
                      />
                    ))}
                  </div>
                </div>
              )}

              {events.length === 0 && (
                <div className="text-center py-12 bg-card rounded-2xl card-shadow">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground">This college hasn't hosted any events on the platform yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CollegeProfile;
