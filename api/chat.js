export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, systemPrompt } = req.body;
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'CLAUDE_API_KEY not configured in Vercel environment variables.' });
  if (!messages || !messages.length) return res.status(400).json({ error: 'No messages provided.' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: systemPrompt || 'You are QuickCart AI, Nigeria\'s smartest deal-finding assistant. Be helpful, friendly, and always mention prices in Naira (₦).',
        messages: messages
      })
    });

    const data = await r.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const reply = data.content?.[0]?.text || '';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
