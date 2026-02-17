import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Loader2,
  Award,
  GraduationCap,
  Lightbulb,
  ExternalLink,
  Filter,
} from "lucide-react";

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Fetch completed events with winners
  const { data: completedEvents, isLoading } = useQuery({
    queryKey: ["archive-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_completed", true)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all winners with projects
  const { data: allWinners } = useQuery({
    queryKey: ["archive-winners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_winners")
        .select("*, winner_projects(*)")
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Get unique categories and years
  const categories = [...new Set(completedEvents?.map((e) => e.category) || [])];
  const years = [...new Set(completedEvents?.map((e) => new Date(e.date).getFullYear().toString()) || [])].sort((a, b) => Number(b) - Number(a));

  // Filter events
  const filteredEvents = completedEvents?.filter((event) => {
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.college?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    const matchesYear = yearFilter === "all" || new Date(event.date).getFullYear().toString() === yearFilter;
    return matchesSearch && matchesCategory && matchesYear;
  });

  // Top winning projects
  const topProjects = allWinners
    ?.filter((w) => w.position === 1 && (w as any).winner_projects?.length > 0)
    ?.slice(0, 6) || [];

  // Most awarded colleges
  const collegeCounts: Record<string, number> = {};
  allWinners?.forEach((w) => {
    if (w.college_name) {
      collegeCounts[w.college_name] = (collegeCounts[w.college_name] || 0) + 1;
    }
  });
  const topColleges = Object.entries(collegeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500 text-yellow-950">🥇 1st Place</Badge>;
    if (position === 2) return <Badge className="bg-gray-300 text-gray-800">🥈 2nd Place</Badge>;
    if (position === 3) return <Badge className="bg-amber-700 text-amber-50">🥉 3rd Place</Badge>;
    return <Badge variant="secondary">#{position}</Badge>;
  };

  const getWinnersForEvent = (eventId: string) =>
    allWinners?.filter((w) => w.event_id === eventId) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Completed Events & Winners
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Event <span className="gradient-text">Archive</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore past events, discover winning projects, and celebrate student innovation from colleges worldwide.
            </p>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="container mx-auto px-4 mb-10">
          <div className="bg-card rounded-2xl p-4 md:p-6 card-shadow">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, colleges, or winners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Top Winning Projects */}
        {topProjects.length > 0 && (
          <section className="container mx-auto px-4 mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Top Winning Projects</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topProjects.map((winner) => {
                const project = (winner as any).winner_projects?.[0];
                if (!project) return null;
                return (
                  <div key={winner.id} className="bg-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-yellow-500 text-yellow-950">🏆 Winner</Badge>
                      {project.technologies?.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-end">
                          {project.technologies.slice(0, 2).map((tech: string) => (
                            <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{project.project_title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">by {winner.winner_name}</p>
                    {project.solution_summary && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.solution_summary}</p>
                    )}
                    <div className="flex gap-2">
                      {project.demo_link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.demo_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" /> Demo
                          </a>
                        </Button>
                      )}
                      {project.repo_link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.repo_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" /> Repo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Most Awarded Colleges */}
        {topColleges.length > 0 && (
          <section className="container mx-auto px-4 mb-12">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Most Awarded Colleges</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {topColleges.map(([college, count], i) => (
                <div key={college} className="bg-card rounded-xl p-4 card-shadow text-center">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-foreground font-bold">#{i + 1}</span>
                  </div>
                  <p className="font-medium text-sm line-clamp-2 mb-1">{college}</p>
                  <p className="text-xs text-muted-foreground">{count} win{count > 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed Events Grid */}
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Completed Events</h2>
            {filteredEvents && (
              <span className="text-sm text-muted-foreground">({filteredEvents.length} events)</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents?.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No completed events found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents?.map((event) => {
                const winners = getWinnersForEvent(event.id);
                return (
                  <Link key={event.id} to={`/event/${event.id}`} className="group">
                    <div className="bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={event.image_url || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=300&fit=crop"}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-muted-foreground/80 text-white backdrop-blur-sm">Completed</Badge>
                          {winners.length > 0 && (
                            <Badge className="bg-yellow-500/90 text-yellow-950 backdrop-blur-sm">
                              🏆 {winners.length} Winner{winners.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <Badge variant="secondary" className="mb-2">{event.category}</Badge>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                          {event.college && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span className="line-clamp-1">{event.college}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                          {event.current_attendees && event.current_attendees > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" />
                              <span>{event.current_attendees} participants</span>
                            </div>
                          )}
                        </div>

                        {/* Winner Preview */}
                        {winners.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-2">WINNERS</p>
                            <div className="space-y-1.5">
                              {winners.slice(0, 3).map((w) => (
                                <div key={w.id} className="flex items-center gap-2 text-sm">
                                  <span>{w.position === 1 ? "🥇" : w.position === 2 ? "🥈" : "🥉"}</span>
                                  <span className="font-medium line-clamp-1">{w.winner_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Archive;
