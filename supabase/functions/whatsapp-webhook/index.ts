import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const HR_KNOWLEDGE_BASE = `
You are an AI Policy Assistant for an organization. Your role is to answer staff questions about policies based ONLY on the following knowledge base. Be helpful, clear, and friendly. Keep responses concise (under 300 words) since this is a WhatsApp conversation.

## LEAVE POLICIES

### Annual Leave
- All confirmed employees are entitled to 18 working days of annual leave per calendar year
- Leave must be applied for at least 3 working days in advance
- Annual leave can be carried forward to the next year, up to a maximum of 5 days
- Unused leave beyond 5 days will lapse at year-end
- During probation, annual leave is accrued but typically cannot be taken unless approved

### Sick Leave
- Employees are entitled to 12 days of sick leave per year
- For absences of more than 2 consecutive days, a medical certificate is required
- Inform your supervisor as early as possible on the day of absence
- Unused sick leave does not carry forward to the next year

### Casual Leave
- 6 days of casual leave are provided per year for personal matters
- Apply at least 1 day in advance when possible
- Casual leave cannot exceed 2 consecutive days at a time

### Unpaid Leave
- Unpaid leave may be granted in exceptional circumstances
- Must be approved by department head and HR

## ATTENDANCE & WORKING HOURS
- Regular office hours are Monday to Friday, 9:00 AM to 5:00 PM
- Lunch break: 1:00 PM to 2:00 PM
- Total weekly working hours: 40 hours
- Remote work arrangements must be pre-approved

## PROBATION & CONFIRMATION
- All new employees serve a 3-month probation period
- Upon successful completion, employees receive a confirmation letter
- Full benefits become applicable after confirmation

## CODE OF CONDUCT
- Zero tolerance for harassment of any kind
- Discrimination is strictly prohibited
- Report concerns to supervisor or HR
- Grievances can be escalated to the grievance committee

## PERFORMANCE REVIEWS
- Conducted annually with mid-year check-ins
- Goals should be SMART

## DISCIPLINARY PROCESS
- Progressive approach: verbal warning, written warning, final warning
- Employees have the right to respond to allegations

---
IMPORTANT:
1. Answer ONLY based on information above
2. If not in knowledge base, say: "I don't have specific information about that. Please contact HR/Admin directly."
3. Keep WhatsApp responses short and readable
4. Never provide legal or financial advice
5. Do not share or request personal information
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle Twilio webhook validation (GET request)
  if (req.method === "GET") {
    return new Response("WhatsApp webhook is active", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }

  try {
    // Parse Twilio's form-encoded webhook payload
    const formData = await req.formData();
    const incomingMessage = formData.get("Body") as string;
    const fromNumber = formData.get("From") as string;

    if (!incomingMessage || !fromNumber) {
      return new Response("<Response><Message>Invalid request</Message></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    console.log(`WhatsApp message from ${fromNumber}: ${incomingMessage}`);

    // Get AI response
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: HR_KNOWLEDGE_BASE },
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

    // Send reply via Twilio API
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
      await twilioResponse.text(); // consume body
    }

    // Return empty TwiML to acknowledge receipt
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
