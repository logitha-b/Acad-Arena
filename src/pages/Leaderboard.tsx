import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all-time");
  const [colleges, setColleges] = useState<string[]>([]);

  useEffect(() => {
    fetchLeaderboard();
    fetchColleges();
  }, [collegeFilter]);

  const fetchLeaderboard = async () => {
    let query = supabase
      .from("profiles")
      .select("*")
      .order("participation_points", { ascending: false })
      .limit(50);

    if (collegeFilter !== "all") {
      query = query.eq("college", collegeFilter);
    }

    const { data } = await query;
    if (data) setUsers(data);
  };

  const fetchColleges = async () => {
    const { data } = await supabase.from("profiles").select("college").not("college", "is", null);
    if (data) {
      const unique = [...new Set(data.map(d => d.college).filter(Boolean))] as string[];
      setColleges(unique);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Leaderboard</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top performers ranked by participation, wins, and points
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Select value={collegeFilter} onValueChange={setCollegeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="College" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <div className="flex justify-center items-end gap-4 mb-12">
              {[1, 0, 2].map((idx) => {
                const u = users[idx];
                if (!u) return null;
                const heights = ["h-40", "h-48", "h-32"];
                const podiumIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
                return (
                  <div key={u.id} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-xl font-bold text-primary-foreground mb-2">
                      {u.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <p className="font-semibold text-sm text-center mb-1 max-w-[100px] truncate">{u.display_name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{u.participation_points} pts</p>
                    <div className={`${heights[podiumIdx]} w-24 rounded-t-xl gradient-bg flex items-start justify-center pt-4`}>
                      <span className="text-2xl font-bold text-primary-foreground">#{idx + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full List */}
          <Card>
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No participants yet. Be the first!</p>
              ) : (
                <div className="space-y-2">
                  {users.map((u, i) => (
                    <div key={u.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${i < 3 ? "bg-primary/5" : "hover:bg-secondary"}`}>
                      {getRankIcon(i)}
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                        {u.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{u.display_name || "Anonymous"}</p>
                        {u.college && <p className="text-xs text-muted-foreground">{u.college}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{u.participation_points} pts</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{u.events_attended} attended</span>
                          <span>{u.events_won} won</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
