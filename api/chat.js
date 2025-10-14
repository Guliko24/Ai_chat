// api/chat.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "message" field' });
    }

    // ✅ Ensure key is present
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is missing!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a friendly reading helper for a 10+ child. Keep answers short and supportive.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const reply = completion.choices[0].message.content.trim();
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('🚨 AI Error:', error.message);
    return res.status(500).json({ error: 'Sorry, I had trouble processing that.' });
  }
}
