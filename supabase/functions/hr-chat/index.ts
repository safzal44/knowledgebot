import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FALLBACK_KNOWLEDGE = `You are an AI HR Assistant. No policy documents have been uploaded yet. Please let the user know that the system is being set up and to check back later, or contact HR/Admin directly.`;

async function getKnowledgeBase(): Promise<string> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("policy_documents")
      .select("title, extracted_text")
      .eq("is_active", true)
      .not("extracted_text", "is", null);

    if (error || !data || data.length === 0) {
      console.log("No active documents found, using fallback");
      return FALLBACK_KNOWLEDGE;
    }

    const documentsText = data
      .map((doc) => `## ${doc.title}\n\n${doc.extracted_text}`)
      .join("\n\n---\n\n");

    return `You are an AI Policy Assistant for an organization. Your role is to answer staff questions about policies based ONLY on the following uploaded policy documents. Be helpful, clear, and friendly.

${documentsText}

---

IMPORTANT INSTRUCTIONS:
1. Answer questions ONLY based on the information provided above
2. If the information is not in the documents, respond with: "I don't have specific information about that in the uploaded policy documents. Please confirm with HR/Admin for accurate guidance."
3. Be friendly, professional, and helpful
4. Keep answers concise and easy to understand
5. Never provide legal or financial advice
6. Do not share or request personal information
7. Always remind users that final decisions rest with management when appropriate
8. Use simple, clear English that non-technical staff can understand`;
  } catch (err) {
    console.error("Error fetching knowledge base:", err);
    return FALLBACK_KNOWLEDGE;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = await getKnowledgeBase();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("HR chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
