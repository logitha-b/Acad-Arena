import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_id } = await req.json();

    if (!event_id) {
      return new Response(
        JSON.stringify({ success: false, error: "event_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all ratings for this event
    const { data: ratings, error: ratingsError } = await supabase
      .from("event_ratings")
      .select("*")
      .eq("event_id", event_id);

    if (ratingsError) throw ratingsError;
    if (!ratings || ratings.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No reviews found for this event" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate averages
    const totalReviews = ratings.length;
    const avgOrganization = ratings.reduce((s, r) => s + (r.organization_rating || 0), 0) / totalReviews;
    const avgDifficulty = ratings.reduce((s, r) => s + (r.difficulty_rating || 0), 0) / totalReviews;
    const avgWorth = ratings.reduce((s, r) => s + (r.worth_rating || 0), 0) / totalReviews;

    // Collect written reviews for AI processing
    const writtenReviews = ratings.filter((r) => r.review && r.review.trim()).map((r) => r.review);

    let summary = "No written reviews yet.";
    let sentimentScore = 0;
    let sentimentLabel = "neutral";
    let pros: string[] = [];
    let cons: string[] = [];
    let commonFeedback: string[] = [];

    if (writtenReviews.length > 0) {
      // Use Lovable AI for sentiment analysis and summarization
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You analyze event reviews and return structured JSON. No markdown, just valid JSON.",
            },
            {
              role: "user",
              content: `Analyze these event reviews and return JSON with:
- "summary": A 2-3 sentence summary of what participants are saying
- "sentiment_score": Number from -1.0 (very negative) to 1.0 (very positive)
- "sentiment_label": "positive", "neutral", or "negative"
- "pros": Array of 2-4 positive points mentioned
- "cons": Array of 2-4 negative points or areas for improvement
- "common_feedback": Array of 3-5 most common themes

Reviews:
${writtenReviews.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Ratings context: Avg Organization: ${avgOrganization.toFixed(1)}/5, Avg Difficulty: ${avgDifficulty.toFixed(1)}/5, Avg Worth: ${avgWorth.toFixed(1)}/5`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_reviews",
                description: "Return structured review analysis",
                parameters: {
                  type: "object",
                  properties: {
                    summary: { type: "string" },
                    sentiment_score: { type: "number" },
                    sentiment_label: { type: "string", enum: ["positive", "neutral", "negative"] },
                    pros: { type: "array", items: { type: "string" } },
                    cons: { type: "array", items: { type: "string" } },
                    common_feedback: { type: "array", items: { type: "string" } },
                  },
                  required: ["summary", "sentiment_score", "sentiment_label", "pros", "cons", "common_feedback"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_reviews" } },
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const parsed = JSON.parse(toolCall.function.arguments);
          summary = parsed.summary;
          sentimentScore = parsed.sentiment_score;
          sentimentLabel = parsed.sentiment_label;
          pros = parsed.pros || [];
          cons = parsed.cons || [];
          commonFeedback = parsed.common_feedback || [];
        }
      }
    } else {
      // No written reviews - derive sentiment from ratings
      const overallAvg = (avgOrganization + avgDifficulty + avgWorth) / 3;
      sentimentScore = (overallAvg - 2.5) / 2.5; // normalize to -1 to 1
      sentimentLabel = sentimentScore > 0.2 ? "positive" : sentimentScore < -0.2 ? "negative" : "neutral";
      summary = `Based on ${totalReviews} rating(s), participants gave this event an average of ${overallAvg.toFixed(1)}/5.`;
    }

    // Upsert the review summary
    const { error: upsertError } = await supabase.from("review_summaries").upsert(
      {
        event_id,
        summary,
        sentiment_score: sentimentScore,
        sentiment_label: sentimentLabel,
        pros,
        cons,
        common_feedback: commonFeedback,
        total_reviews: totalReviews,
        avg_organization: avgOrganization,
        avg_difficulty: avgDifficulty,
        avg_worth: avgWorth,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "event_id" }
    );

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({
        success: true,
        data: { summary, sentimentScore, sentimentLabel, pros, cons, commonFeedback, totalReviews, avgOrganization, avgDifficulty, avgWorth },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Review summary error:", error);
    const msg = error instanceof Error ? error.message : "Failed to summarize reviews";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
