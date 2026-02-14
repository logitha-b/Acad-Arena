import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ScrapedEvent {
  title: string;
  date: string;
  location: string | null;
  college: string | null;
  category: string;
  description: string | null;
  image_url: string | null;
  registration_link: string | null;
  source_name: string;
  source_url: string;
  external_id: string;
  mode: string;
  price: number;
}

function categorizeEvent(title: string): string {
  const text = title.toLowerCase();
  if (text.match(/hack|code|program|dev|software|web|app|tech|cyber|ai|ml|data|cloud|blockchain|iot|robot|python|java|embedded|raspberry|gen ai|arduino/)) return "Technology";
  if (text.match(/business|market|finance|entrepreneur|startup|management|mba/)) return "Business";
  if (text.match(/design|ui|ux|graphic|creative|art|photo/)) return "Design";
  if (text.match(/cultural|dance|music|drama|literary|fest|carnival/)) return "Cultural";
  if (text.match(/sport|cricket|football|athletic|chess/)) return "Sports";
  if (text.match(/career|placement|interview|resume|intern/)) return "Career";
  if (text.match(/health|medical|pharma|bio/)) return "Health";
  if (text.match(/workshop/)) return "Technology";
  return "Technology";
}

function parseDateStr(dateStr: string): string | null {
  try {
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, "$1").trim();
    const monthMap: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    // "14th Feb 2026" -> "14 Feb 2026"
    let match = cleaned.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i);
    if (match) return `${match[3]}-${monthMap[match[2].toLowerCase()]}-${match[1].padStart(2, "0")}`;
    match = cleaned.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i);
    if (match) return `${match[3]}-${monthMap[match[1].toLowerCase()]}-${match[2].padStart(2, "0")}`;
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2025) {
      return parsed.toISOString().split("T")[0];
    }
    return null;
  } catch {
    return null;
  }
}

const today = () => new Date().toISOString().split("T")[0];

async function scrapeFirecrawl(apiKey: string, url: string): Promise<string> {
  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, waitFor: 5000 }),
  });
  const data = await response.json();
  return data?.data?.markdown || data?.markdown || "";
}

// Knowafest format:
// [![Title venue Poster](imageUrl)Category\\\n\\\nCity\\\n\\\n\- Date\\\n\\\n\\\nTitle](link)
function parseKnowafest(markdown: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  // Match pattern: [![...](imageUrl)...](eventLink)
  const regex = /\[!\[([^\]]*)\]\(([^)]*)\)([^\]]*)\]\(([^)]*)\)/g;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const altText = match[1]; // "Title venue Poster"
    const imageUrl = match[2];
    const innerText = match[3]; // "Category\\\n\\\nCity\\\n\\\n- Date\\\n\\\n\\\nTitle"
    const link = match[4];

    // Parse inner text - split by \\ or newlines
    const parts = innerText.split(/\\+\n|\\n|\\\\/).map(s => s.replace(/^[\s\\-]+|[\s\\]+$/g, "").trim()).filter(Boolean);

    if (parts.length < 3) continue;

    // Format: [category, city, date, title] or similar
    const category = parts[0] || "";
    const city = parts[1] || "";
    // Find date part
    let dateStr = "";
    let title = "";
    for (const part of parts) {
      if (part.match(/\d{1,2}\w*\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)) {
        dateStr = part;
      }
    }
    // Title is usually the last meaningful part
    title = parts[parts.length - 1] || altText.replace(/\s*venue\s*Poster\s*$/i, "").trim();

    if (!title || title.length < 3) continue;

    // Add year if missing
    if (dateStr && !dateStr.match(/\d{4}/)) {
      dateStr += " 2026";
    }
    const parsedDate = parseDateStr(dateStr);
    if (!parsedDate || parsedDate < today()) continue;

    events.push({
      title,
      date: parsedDate,
      location: city || null,
      college: null,
      category: categorizeEvent(title),
      description: null,
      image_url: imageUrl.startsWith("http") ? imageUrl : `https://www.knowafest.com${imageUrl}`,
      registration_link: link.startsWith("http") ? link : `https://www.knowafest.com${link}`,
      source_name: "Knowafest",
      source_url: "https://www.knowafest.com",
      external_id: `knowafest_${title.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 80)}`,
      mode: "offline",
      price: 0,
    });
  }

  return events;
}

// Unstop format:
// [**Title**\\\n\\\nOrganizer\\\n\\\nFee\\\n\\\nMembers\\\n\\\nLocation\\\n\\\n...\\\n\\\nPosted Date\\\n\\\nX days left](link)
function parseUnstop(markdown: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = [];
  // Match blocks: [**Title**...](link)
  const regex = /\[\*\*([^*]+)\*\*([^\]]*)\]\(([^)]*)\)/g;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const title = match[1].trim();
    const body = match[2];
    const link = match[3];

    if (!title || title.length < 3 || title.match(/^(filter|sort|search|login|sign)/i)) continue;

    const parts = body.split(/\\+\n|\\n|\\\\/).map(s => s.replace(/^[\s\\-]+|[\s\\]+$/g, "").trim()).filter(Boolean);

    let organizer = "";
    let fee = 0;
    let location = "";
    let imageUrl = "";
    let mode = "offline";
    let daysLeft = 0;

    for (const part of parts) {
      // Extract organizer (first substantive text after title)
      if (!organizer && part.match(/institute|university|college|iit|nit|iiit|bits|vit|society|school|academy/i)) {
        organizer = part;
      }
      // Fee
      const feeMatch = part.match(/^(\d+)\s*Fee/i);
      if (feeMatch) fee = parseInt(feeMatch[1]);
      // Location
      if (part.match(/India\s*$/) || part.match(/Online/i)) {
        location = part;
        if (part.match(/Online/i)) mode = "online";
      }
      // Image
      const imgMatch = part.match(/!\[.*?\]\(([^)]+)\)/);
      if (imgMatch) imageUrl = imgMatch[1];
      // Days left
      const daysMatch = part.match(/(\d+)\s*days?\s*left/i);
      if (daysMatch) daysLeft = parseInt(daysMatch[1]);
      const hoursMatch = part.match(/(\d+)\s*hours?\s*left/i);
      if (hoursMatch) daysLeft = 1;
    }

    // Calculate date from "X days left"
    if (daysLeft <= 0) continue; // expired
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysLeft);
    const dateStr = eventDate.toISOString().split("T")[0];

    events.push({
      title,
      date: dateStr,
      location: location || (mode === "online" ? "Online" : null),
      college: organizer || null,
      category: categorizeEvent(title),
      description: null,
      image_url: imageUrl || null,
      registration_link: link.startsWith("http") ? link : `https://unstop.com${link}`,
      source_name: "Unstop",
      source_url: "https://unstop.com",
      external_id: `unstop_${title.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 80)}`,
      mode,
      price: fee,
    });
  }

  return events;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Scrape both in parallel
    const [knowafestMd, unstopMd] = await Promise.all([
      scrapeFirecrawl(firecrawlKey, "https://www.knowafest.com/"),
      scrapeFirecrawl(firecrawlKey, "https://unstop.com/hackathons"),
    ]);

    console.log(`Knowafest markdown: ${knowafestMd.length} chars`);
    console.log(`Unstop markdown: ${unstopMd.length} chars`);

    const knowafestEvents = parseKnowafest(knowafestMd);
    const unstopEvents = parseUnstop(unstopMd);

    console.log(`Knowafest parsed: ${knowafestEvents.length} events`);
    console.log(`Unstop parsed: ${unstopEvents.length} events`);

    const allEvents = [...knowafestEvents, ...unstopEvents];

    let inserted = 0;
    let skipped = 0;
    const SCRAPER_ID = "00000000-0000-0000-0000-000000000000";

    for (const event of allEvents) {
      const { error } = await supabase.from("events").upsert(
        {
          title: event.title,
          date: event.date,
          location: event.location,
          college: event.college,
          category: event.category,
          description: event.description,
          image_url: event.image_url,
          registration_link: event.registration_link,
          source_name: event.source_name,
          source_url: event.source_url,
          external_id: event.external_id,
          mode: event.mode,
          price: event.price,
          organizer_id: SCRAPER_ID,
          is_verified: true,
        },
        { onConflict: "external_id" }
      );

      if (error) {
        console.error(`Upsert failed "${event.title}":`, error.message);
        skipped++;
      } else {
        inserted++;
      }
    }

    // Mark past events as completed
    await supabase
      .from("events")
      .update({ is_completed: true })
      .lt("date", today())
      .eq("is_completed", false);

    return new Response(
      JSON.stringify({
        success: true,
        total_scraped: allEvents.length,
        inserted,
        skipped,
        sources: { knowafest: knowafestEvents.length, unstop: unstopEvents.length },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scrape error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
