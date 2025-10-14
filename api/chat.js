// api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
  }

  // Parse JSON body (works even if req.body is undefined)
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  let message = "";
  try { message = (JSON.parse(raw).message || "").trim(); } catch {}

  if (!message) {
    return res.status(400).json({ error: "Missing 'message' string in JSON body" });
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a friendly reading helper for a 10+ child. Keep answers short and supportive." },
      { role: "user", content: message }
    ],
    temperature: 0.7
  });

  const reply = completion.choices?.[0]?.message?.content ?? "I couldn't form a reply.";
  return res.status(200).json({ reply });
}
