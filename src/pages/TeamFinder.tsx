import { useEffect, useState } from "react";
import { Users, Plus, Search, Code, Palette, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TeamFinder = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ title: "", description: "", skills_needed: "", max_members: 5 });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*, profiles!teams_created_by_fkey(display_name, college), team_members(count)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setTeams(data);
  };

  const createTeam = async () => {
    if (!user) { toast.error("Please log in first"); return; }
    if (!newTeam.title) { toast.error("Title is required"); return; }

    const { error } = await supabase.from("teams").insert({
      created_by: user.id,
      title: newTeam.title,
      description: newTeam.description,
      skills_needed: newTeam.skills_needed.split(",").map(s => s.trim()).filter(Boolean),
      max_members: newTeam.max_members,
    });

    if (error) { toast.error("Failed to create team"); return; }
    toast.success("Team created!");
    setIsCreateOpen(false);
    setNewTeam({ title: "", description: "", skills_needed: "", max_members: 5 });
    fetchTeams();
  };

  const requestToJoin = async (teamId: string) => {
    if (!user) { toast.error("Please log in first"); return; }

    const { error } = await supabase.from("team_members").insert({
      team_id: teamId,
      user_id: user.id,
      status: "pending",
    });

    if (error) {
      if (error.code === "23505") toast.info("You already requested to join");
      else toast.error("Failed to send request");
      return;
    }
    toast.success("Join request sent!");
  };

  const filteredTeams = teams.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.skills_needed?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const skillIcons: Record<string, any> = { python: Code, react: Code, design: Palette, analytics: BarChart3 };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Team Finder</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find teammates for hackathons, competitions, and projects
            </p>
          </div>

          {/* Search + Create */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search teams or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="h-12">
                  <Plus className="w-5 h-5 mr-2" /> Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Team Name</Label>
                    <Input value={newTeam.title} onChange={(e) => setNewTeam({ ...newTeam, title: e.target.value })} placeholder="e.g., AI Wizards" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={newTeam.description} onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })} placeholder="What are you building?" />
                  </div>
                  <div>
                    <Label>Skills Needed (comma-separated)</Label>
                    <Input value={newTeam.skills_needed} onChange={(e) => setNewTeam({ ...newTeam, skills_needed: e.target.value })} placeholder="Python, React, UI Design" />
                  </div>
                  <div>
                    <Label>Max Members</Label>
                    <Input type="number" value={newTeam.max_members} onChange={(e) => setNewTeam({ ...newTeam, max_members: parseInt(e.target.value) || 5 })} />
                  </div>
                  <Button variant="hero" className="w-full" onClick={createTeam}>Create Team</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Teams Grid */}
          {filteredTeams.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No teams found</h3>
              <p className="text-muted-foreground">Create the first team or try a different search</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{team.title}</CardTitle>
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {(team as any).team_members?.[0]?.count || 0}/{team.max_members}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{team.description || "No description"}</p>
                    {team.skills_needed?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {team.skills_needed.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        by {(team as any).profiles?.display_name || "Unknown"}
                      </p>
                      <Button size="sm" variant="hero" onClick={() => requestToJoin(team.id)}>
                        Join Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamFinder;
