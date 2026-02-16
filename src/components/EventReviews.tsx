import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ThumbsUp, ThumbsDown, Minus, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface EventReviewsProps {
  eventId: string;
  isCompleted: boolean;
}

const EventReviews = ({ eventId, isCompleted }: EventReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [review, setReview] = useState("");
  const [orgRating, setOrgRating] = useState(0);
  const [diffRating, setDiffRating] = useState(0);
  const [worthRating, setWorthRating] = useState(0);

  // Fetch ratings
  const { data: ratings = [] } = useQuery({
    queryKey: ["event-ratings", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_ratings").select("*").eq("event_id", eventId);
      if (error) throw error;
      return data;
    },
  });

  // Fetch AI summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["review-summary", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_summaries")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Submit review
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("event_ratings").insert({
        event_id: eventId,
        user_id: user.id,
        organization_rating: orgRating,
        difficulty_rating: diffRating,
        worth_rating: worthRating,
        review: review || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      queryClient.invalidateQueries({ queryKey: ["event-ratings", eventId] });
      setShowForm(false);
      setReview("");
      setOrgRating(0);
      setDiffRating(0);
      setWorthRating(0);
      // Trigger AI summary regeneration
      supabase.functions.invoke("summarize-reviews", { body: { event_id: eventId } });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Calculate averages
  const avgOrg = ratings.length ? ratings.reduce((s, r) => s + (r.organization_rating || 0), 0) / ratings.length : 0;
  const avgDiff = ratings.length ? ratings.reduce((s, r) => s + (r.difficulty_rating || 0), 0) / ratings.length : 0;
  const avgWorth = ratings.length ? ratings.reduce((s, r) => s + (r.worth_rating || 0), 0) / ratings.length : 0;

  const renderStarInput = (label: string, value: number, setValue: (v: number) => void) => (
    <div>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setValue(i)} className="p-0.5">
            <Star className={`w-6 h-6 transition-colors ${i <= value ? "fill-primary text-primary" : "text-muted-foreground/30 hover:text-primary/50"}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderRatingBar = (label: string, value: number) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
          ))}
          <span className="font-medium text-sm ml-1">{value > 0 ? value.toFixed(1) : "—"}</span>
        </div>
      </div>
      <Progress value={(value / 5) * 100} className="h-2" />
    </div>
  );

  const sentimentIcon = summary?.sentiment_label === "positive" ? <ThumbsUp className="w-4 h-4" /> :
    summary?.sentiment_label === "negative" ? <ThumbsDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />;

  const sentimentColor = summary?.sentiment_label === "positive" ? "bg-accent text-accent-foreground" :
    summary?.sentiment_label === "negative" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground";

  return (
    <div className="space-y-6">
      {/* Ratings Summary */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-primary" />
            Ratings Summary
            <Badge variant="secondary" className="ml-auto">{ratings.length} review{ratings.length !== 1 ? "s" : ""}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderRatingBar("Organization", avgOrg)}
          {renderRatingBar("Difficulty", avgDiff)}
          {renderRatingBar("Worth Attending", avgWorth)}
        </CardContent>
      </Card>

      {/* AI Summary */}
      {(summary || summaryLoading) && (
        <Card className="card-shadow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              What Participants Are Saying
              {summary?.sentiment_label && (
                <Badge className={`ml-auto ${sentimentColor}`}>
                  {sentimentIcon}
                  <span className="ml-1 capitalize">{summary.sentiment_label}</span>
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading summary...
              </div>
            ) : summary ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">{summary.summary}</p>

                {summary.pros && (summary.pros as string[]).length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-accent">👍 Pros</h4>
                    <ul className="space-y-1">
                      {(summary.pros as string[]).map((p, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.cons && (summary.cons as string[]).length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-destructive">👎 Cons</h4>
                    <ul className="space-y-1">
                      {(summary.cons as string[]).map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.common_feedback && (summary.common_feedback as string[]).length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">🔑 Common Feedback</h4>
                    <div className="flex flex-wrap gap-2">
                      {(summary.common_feedback as string[]).map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Participant Comments */}
      {ratings.filter((r) => r.review).length > 0 && (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-primary" />
              Participant Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratings
              .filter((r) => r.review)
              .map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-secondary/50 space-y-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i <= Math.round(((r.organization_rating || 0) + (r.worth_rating || 0)) / 2) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(r.created_at!).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">"{r.review}"</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Submit Review */}
      {isCompleted && user && (
        <div>
          {!showForm ? (
            <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          ) : (
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Your Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {renderStarInput("Organization", orgRating, setOrgRating)}
                  {renderStarInput("Difficulty", diffRating, setDiffRating)}
                  {renderStarInput("Worth Attending", worthRating, setWorthRating)}
                </div>
                <Textarea
                  placeholder="Share your experience... (optional)"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="hero"
                    onClick={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending || (orgRating === 0 && diffRating === 0 && worthRating === 0)}
                  >
                    {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Review
                  </Button>
                  <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default EventReviews;
