import { useState } from "react";
import { Search, Globe, MapPin, ExternalLink, Star, Loader2, GraduationCap, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface CollegeResult {
  id: string | null;
  name: string;
  country: string | null;
  state_province: string | null;
  city: string | null;
  website: string | null;
  alpha_two_code: string | null;
  reputation_score: number;
  total_events: number;
  total_reviews: number;
  is_external: boolean;
}

const CollegeSearch = () => {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.length < 2) return;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke("search-colleges", {
        body: { query, country: country || undefined },
      });

      if (error) throw error;
      setResults(data?.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (score: number) => {
    const full = Math.floor(score);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= full ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{score > 0 ? score.toFixed(1) : "N/A"}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Global College</span> Search
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search universities worldwide — view events, ratings & reputation scores
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search any college or university..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary"
                />
              </div>
              <Input
                type="text"
                placeholder="Country (optional)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-40 h-14 rounded-xl border-2 focus:border-primary hidden sm:block"
              />
              <Button type="submit" variant="hero" size="lg" disabled={isLoading || query.length < 2} className="h-14 px-8">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </Button>
            </div>
          </form>

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((college, idx) => (
                <Card key={college.id || `ext-${idx}`} className="hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                          <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base leading-tight">
                            {college.id ? (
                              <Link to={`/college/${college.id}`} className="hover:text-primary transition-colors">
                                {college.name}
                              </Link>
                            ) : (
                              college.name
                            )}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>{[college.city, college.state_province, college.country].filter(Boolean).join(", ") || "Unknown"}</span>
                    </div>

                    {renderStars(college.reputation_score)}

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        {college.total_events} events
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {college.total_reviews} reviews
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {college.id && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={`/college/${college.id}`}>View Profile</Link>
                        </Button>
                      )}
                      {college.website && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={college.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
              <p className="text-muted-foreground">Try a different search term or country</p>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CollegeSearch;
