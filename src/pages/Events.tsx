import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Technology", "Business", "Design", "Cultural", "Sports", "Career", "Health"];
const modes = ["All Modes", "Online", "Offline", "Hybrid"];
const priceFilters = ["All Prices", "Free", "Paid"];

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All Modes");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ["all-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_completed", false)
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.college || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesMode = selectedMode === "All Modes" || event.mode === selectedMode.toLowerCase();
    const matchesPrice =
      selectedPrice === "All Prices" ||
      (selectedPrice === "Free" && (event.price === 0 || event.price === null)) ||
      (selectedPrice === "Paid" && event.price && event.price > 0);
    return matchesSearch && matchesCategory && matchesMode && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Explore <span className="gradient-text">Events</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real events from Knowafest, Unstop & more — updated daily
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events, colleges, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg rounded-xl border-2 focus:border-primary"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full mb-4"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "gradient-bg text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="w-[140px]">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map((mode) => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceFilters.map((price) => (
                      <SelectItem key={price} value={price}>{price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Any Date
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> events
            </p>
            <Select defaultValue="date">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Soonest)</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
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
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedMode("All Modes");
                  setSelectedPrice("All Prices");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
