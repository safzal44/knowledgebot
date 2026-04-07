import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
      return "You are an AI Policy Assistant. No policy documents have been uploaded yet. Let the user know to contact HR/Admin directly.";
    }

    const documentsText = data
      .map((doc) => `## ${doc.title}\n\n${doc.extracted_text}`)
      .join("\n\n---\n\n");

    return `You are an AI Policy Assistant for an organization. Answer staff questions based ONLY on these policy documents. Keep responses concise (under 300 words) for WhatsApp.

${documentsText}

---
IMPORTANT:
1. Answer ONLY based on information above
2. If not in documents, say: "I don't have specific information about that. Please contact HR/Admin directly."
3. Keep WhatsApp responses short and readable
4. Never provide legal or financial advice
5. Do not share or request personal information`;
  } catch (err) {
    console.error("Error fetching knowledge base:", err);
    return "You are an AI Policy Assistant. An error occurred loading policies. Please ask the user to try again later.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response("WhatsApp webhook is active", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }

  try {
    const formData = await req.formData();
    const incomingMessage = formData.get("Body") as string;
    const fromNumber = formData.get("From") as string;

    if (!incomingMessage || !fromNumber) {
      return new Response("<Response><Message>Invalid request</Message></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    console.log(`WhatsApp message from ${fromNumber}: ${incomingMessage}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = await getKnowledgeBase();

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: incomingMessage },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI gateway error:", aiResponse.status);
      return twimlResponse("Sorry, I'm having trouble processing your request right now. Please try again later.");
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";

    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      throw new Error("Twilio credentials not configured");
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioBody = new URLSearchParams({
      From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      To: fromNumber,
      Body: reply,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioBody.toString(),
    });

    if (!twilioResponse.ok) {
      const errText = await twilioResponse.text();
      console.error("Twilio send error:", twilioResponse.status, errText);
    } else {
      await twilioResponse.text();
    }

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (e) {
    console.error("WhatsApp webhook error:", e);
    return twimlResponse("An error occurred. Please try again later.");
  }
});

function twimlResponse(message: string): Response {
  return new Response(`<Response><Message>${message}</Message></Response>`, {
    headers: { "Content-Type": "text/xml" },
  });
}
