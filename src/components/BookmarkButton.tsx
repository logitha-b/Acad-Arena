import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookmarkButtonProps {
  eventId: string;
  variant?: "icon" | "full";
}

const BookmarkButton = ({ eventId, variant = "icon" }: BookmarkButtonProps) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) checkBookmark();
  }, [user, eventId]);

  const checkBookmark = async () => {
    const { data } = await supabase
      .from("event_bookmarks")
      .select("id")
      .eq("user_id", user!.id)
      .eq("event_id", eventId)
      .maybeSingle();
    setIsBookmarked(!!data);
  };

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Please log in to save events"); return; }

    setLoading(true);
    if (isBookmarked) {
      await supabase.from("event_bookmarks").delete().eq("user_id", user.id).eq("event_id", eventId);
      setIsBookmarked(false);
      toast.success("Removed from saved events");
    } else {
      await supabase.from("event_bookmarks").insert({ user_id: user.id, event_id: eventId });
      setIsBookmarked(true);
      toast.success("Event saved!");
    }
    setLoading(false);
  };

  if (variant === "full") {
    return (
      <Button variant="outline" onClick={toggleBookmark} disabled={loading} className="gap-2">
        <Heart className={`w-4 h-4 ${isBookmarked ? "fill-red-500 text-red-500" : ""}`} />
        {isBookmarked ? "Saved" : "Save Event"}
      </Button>
    );
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Heart className={`w-5 h-5 ${isBookmarked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
    </button>
  );
};

export default BookmarkButton;
