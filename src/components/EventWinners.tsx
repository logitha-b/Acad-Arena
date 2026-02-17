import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ExternalLink, Code, Lightbulb, Target } from "lucide-react";
import { Loader2 } from "lucide-react";

interface EventWinnersProps {
  eventId: string;
  isCompleted: boolean;
}

const EventWinners = ({ eventId, isCompleted }: EventWinnersProps) => {
  const { data: winners, isLoading } = useQuery({
    queryKey: ["event-winners", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_winners")
        .select("*, winner_projects(*)")
        .eq("event_id", eventId)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isCompleted,
  });

  if (!isCompleted || isLoading) return null;
  if (!winners || winners.length === 0) return null;

  const getPositionEmoji = (pos: number) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return `#${pos}`;
  };

  const getPositionLabel = (pos: number) => {
    if (pos === 1) return "1st Place";
    if (pos === 2) return "2nd Place";
    if (pos === 3) return "3rd Place";
    return `${pos}th Place`;
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Winners & Projects</h3>
      </div>

      <div className="space-y-6">
        {winners.map((winner) => {
          const projects = (winner as any).winner_projects || [];
          return (
            <div key={winner.id} className="border border-border rounded-xl p-5">
              {/* Winner Info */}
              <div className="flex items-start gap-3 mb-4">
                <div className="text-2xl">{getPositionEmoji(winner.position)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-lg">{winner.winner_name}</h4>
                    <Badge variant="secondary">{getPositionLabel(winner.position)}</Badge>
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                    {winner.college_name && <span>{winner.college_name}</span>}
                    {winner.team_name && (
                      <>
                        <span>•</span>
                        <span>Team: {winner.team_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Projects */}
              {projects.map((project: any) => (
                <div key={project.id} className="bg-secondary/50 rounded-lg p-4 mt-3">
                  <h5 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    {project.project_title}
                  </h5>

                  {project.problem_statement && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> PROBLEM STATEMENT
                      </p>
                      <p className="text-sm">{project.problem_statement}</p>
                    </div>
                  )}

                  {project.solution_summary && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">SOLUTION</p>
                      <p className="text-sm">{project.solution_summary}</p>
                    </div>
                  )}

                  {project.technologies?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Code className="w-3 h-3" /> TECHNOLOGIES
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech: string) => (
                          <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.impact && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">IMPACT</p>
                      <p className="text-sm">{project.impact}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {project.demo_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.demo_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" /> Live Demo
                        </a>
                      </Button>
                    )}
                    {project.repo_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.repo_link} target="_blank" rel="noopener noreferrer">
                          <Code className="w-3 h-3 mr-1" /> Source Code
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventWinners;
