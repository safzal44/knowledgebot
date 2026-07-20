import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/integrations/supabase/client";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const FALLBACK_KNOWLEDGE = `You are an AI HR Assistant. No specific policy documents have been uploaded yet. Please inform the user that system policies are being configured and provide general, helpful HR guidance while advising them to contact HR/Admin for official organization policies.`;

export async function getKnowledgeBaseContext(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("policy_documents")
      .select("title, extracted_text")
      .eq("is_active", true)
      .not("extracted_text", "is", null);

    if (error || !data || data.length === 0) {
      return FALLBACK_KNOWLEDGE;
    }

    const documentsText = data
      .map((doc) => `## ${doc.title}\n\n${doc.extracted_text}`)
      .join("\n\n---\n\n");

    return `You are an AI Policy Assistant for an organization. Your role is to answer staff questions about policies based primary on the following uploaded policy documents. Be helpful, clear, and friendly.

${documentsText}

---

IMPORTANT INSTRUCTIONS:
1. Answer questions based on the uploaded policy documents when available.
2. If the information is not in the documents, respond politely stating what is available and offer general HR guidance where appropriate, reminding them to check with HR/Admin for official confirmation.
3. Be friendly, professional, and helpful.
4. Keep answers clear, concise, and structured with markdown bullet points where helpful.
5. Never provide legal or financial advice.
6. Always remind users that final decisions rest with HR management.`;
  } catch (err) {
    console.error("Error fetching knowledge base context:", err);
    return FALLBACK_KNOWLEDGE;
  }
}

export async function streamGeminiChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk: (chunk: string) => void
): Promise<void> {
  const currentApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!currentApiKey) {
    throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const aiClient = new GoogleGenAI({ apiKey: currentApiKey });
  const systemInstruction = await getKnowledgeBaseContext();
  
  // Format history for Gemini API
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const responseStream = await aiClient.models.generateContentStream({
    model: "gemini-flash-latest",
    contents,
    config: {
      systemInstruction,
    },
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
}
