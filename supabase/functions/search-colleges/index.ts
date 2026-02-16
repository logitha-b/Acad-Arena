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
    const { query, country } = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Query must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search Hipo Universities API
    let url = `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`;
    if (country) {
      url += `&country=${encodeURIComponent(country)}`;
    }

    const hipoResponse = await fetch(url);
    const universities = await hipoResponse.json();

    // Also check our local DB for enriched college data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: localColleges } = await supabase
      .from("colleges")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(20);

    // Merge: prefer local data (has reputation scores), supplement with Hipo
    const localNames = new Set((localColleges || []).map((c: any) => c.name.toLowerCase()));

    const hipoMapped = universities
      .filter((u: any) => !localNames.has(u.name.toLowerCase()))
      .slice(0, 30)
      .map((u: any) => ({
        id: null,
        name: u.name,
        country: u.country,
        state_province: u["state-province"],
        city: null,
        website: u.web_pages?.[0] || null,
        domains: u.domains || [],
        alpha_two_code: u.alpha_two_code,
        reputation_score: 0,
        total_events: 0,
        total_reviews: 0,
        is_external: true,
      }));

    const results = [
      ...(localColleges || []).map((c: any) => ({ ...c, is_external: false })),
      ...hipoMapped,
    ];

    return new Response(
      JSON.stringify({ success: true, data: results, total: results.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("College search error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Search failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
