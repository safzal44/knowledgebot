import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { document_id } = await req.json();
    if (!document_id) {
      return new Response(JSON.stringify({ error: "document_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: doc, error: docErr } = await supabase
      .from("policy_documents")
      .select("id, title, extracted_text")
      .eq("id", document_id)
      .single();
    if (docErr || !doc) throw new Error("Document not found");
    if (!doc.extracted_text) throw new Error("Document has no extracted text");

    const text = doc.extracted_text.slice(0, 30000);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a data analyst. Extract quantitative information from policy/handbook PDFs and return chart-ready data. Only return data that is genuinely present (numbers, counts, percentages, breakdowns, schedules, salary bands, leave entitlements, budget allocations, etc.). If no chartable data exists, return an empty array.",
          },
          {
            role: "user",
            content: `Document title: ${doc.title}\n\n--- CONTENT ---\n${text}\n\nExtract up to 6 meaningful charts.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_charts",
              description: "Return chart specifications based on document content.",
              parameters: {
                type: "object",
                properties: {
                  charts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        chart_type: { type: "string", enum: ["bar", "pie", "line"] },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              label: { type: "string" },
                              value: { type: "number" },
                            },
                            required: ["label", "value"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["title", "description", "chart_type", "data"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["charts"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_charts" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Lovable AI credits exhausted. Please add credits to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${errText}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { charts: [] };
    const charts: Array<{ title: string; description: string; chart_type: string; data: any[] }> =
      args.charts || [];

    // Replace existing charts for this document
    await supabase.from("document_charts").delete().eq("document_id", document_id);
    if (charts.length > 0) {
      const rows = charts.map((c) => ({
        document_id,
        title: c.title,
        description: c.description,
        chart_type: c.chart_type,
        data: c.data,
      }));
      const { error: insErr } = await supabase.from("document_charts").insert(rows);
      if (insErr) throw insErr;
    }

    return new Response(JSON.stringify({ ok: true, count: charts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-document-charts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
