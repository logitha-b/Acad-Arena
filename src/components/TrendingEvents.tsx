import { useEffect, useState } from "react";
import { TrendingUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const TrendingEvents = () => {
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("view_count", { ascending: false })
      .limit(6);
    if (data) setTrending(data);
  };

  if (trending.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-red-500/10">
            <TrendingUp className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <p className="text-sm text-muted-foreground">Most viewed events</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((event, i) => (
            <Link key={event.id} to={`/event/${event.id}`} className="group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card hover:shadow-md transition-all">
                <span className="text-3xl font-bold text-muted-foreground/30">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {event.view_count}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;
