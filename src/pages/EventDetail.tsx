import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BadgeCheck,
  Share2,
  Heart,
  CalendarPlus,
  ExternalLink,
  ChevronRight,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EventReviews from "@/components/EventReviews";
import EventWinners from "@/components/EventWinners";

const EventDetail = () => {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center pt-40">
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <Link to="/events" className="text-primary hover:underline">Browse events</Link>
        </div>
      </div>
    );
  }

  const spotsLeft = (event.max_attendees || 100) - (event.current_attendees || 0);
  const attendees = event.current_attendees || 0;
  const maxAttendees = event.max_attendees || 100;
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const organizer = event.college || event.source_name || "Unknown";
  const imageUrl = event.image_url || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Link to="/events" className="hover:text-primary">Events</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span>{event.category}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="gradient-bg text-primary-foreground">{event.category}</Badge>
                  {event.mode === "online" && <Badge className="bg-accent text-accent-foreground">Online</Badge>}
                  {event.mode === "hybrid" && <Badge className="gradient-bg text-primary-foreground">Hybrid</Badge>}
                  {event.mode === "offline" && <Badge variant="secondary">In-Person</Badge>}
                  {(event.price === 0 || event.price === null) && (
                    <Badge className="bg-accent text-accent-foreground">FREE</Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl font-bold mb-4">{event.title}</h1>

                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{organizer[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{organizer}</span>
                      {event.is_verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                    </div>
                    {event.source_name && (
                      <p className="text-sm text-muted-foreground">via {event.source_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{event.time || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{event.location || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Attendees</p>
                      <p className="font-medium">{attendees}/{maxAttendees} registered</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Tab */}
              <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow">
                <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {event.description || "No description available for this event. Visit the registration page for more details."}
                </p>
              </div>

              {/* Winners Section */}
              <div className="mt-6">
                <EventWinners eventId={event.id} isCompleted={event.is_completed || false} />
              </div>

              {/* Reviews Section */}
              <div className="mt-6">
                <EventReviews eventId={event.id} isCompleted={event.is_completed || false} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-card rounded-2xl p-6 card-shadow mb-6">
                  <div className="text-center mb-6">
                    {event.price === 0 || event.price === null ? (
                      <div className="text-3xl font-bold text-accent">FREE</div>
                    ) : (
                      <div className="text-3xl font-bold">₹{event.price}</div>
                    )}
                    <p className="text-sm text-muted-foreground">per person</p>
                  </div>

                  {spotsLeft <= 50 && spotsLeft > 0 && (
                    <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-center mb-4">
                      <p className="text-sm font-medium">🔥 Only {spotsLeft} spots left!</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-medium">{Math.round((attendees / maxAttendees) * 100)}% full</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all"
                        style={{ width: `${(attendees / maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Register Button - links to actual registration page */}
                  <Button variant="hero" size="lg" className="w-full mb-4" asChild>
                    <a
                      href={event.registration_link || event.source_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Register Now
                    </a>
                  </Button>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSaved(!isSaved)}
                      className={isSaved ? "text-destructive border-destructive" : ""}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <CalendarPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold mb-4">Event Location</h3>
                  <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{event.location || "TBA"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default EventDetail;
