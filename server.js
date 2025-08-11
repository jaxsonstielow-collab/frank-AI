const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error('Please set OPENAI_API_KEY in .env');
}

const FRANK_SYSTEM_PROMPT = `You are Frank — a friendly, concise, slightly witty assistant. Answer clearly, ask clarifying questions when needed, and never pretend to have opinions or experiences. If the user asks for disallowed content, refuse politely with alternatives.`;

// Extract string safely from complex objects
function extractContentString(content) {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'number' || typeof content === 'boolean') return String(content);
  if (Array.isArray(content)) return content.map(c => extractContentString(c)).join('');
  if (typeof content === 'object') {
    if (Array.isArray(content.parts)) return content.parts.map(p => extractContentString(p)).join('');
    if (typeof content.text === 'string') return content.text;
    if (Array.isArray(content.content)) return content.content.map(p => extractContentString(p)).join('');
    for (const k in content) {
      if (Object.prototype.hasOwnProperty.call(content, k)) {
        const v = content[k];
        if (typeof v === 'string') return v;
        if (Array.isArray(v) || typeof v === 'object') {
          const nested = extractContentString(v);
          if (nested) return nested;
        }
      }
    }
    try {
      return JSON.stringify(content);
    } catch (e) {
      return String(content);
    }
  }
  return String(content);
}

function sanitizeAssistantMessageFromApi(apiResponse) {
  const raw = apiResponse?.choices?.[0]?.message ?? null;
  if (!raw) return null;
  const role = raw.role || 'assistant';
  const content = extractContentString(raw.content ?? raw);
  return { role, content };
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const payloadMessages = [
      { role: 'system', content: FRANK_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: extractContentString(m.content) }))
    ];

    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: payloadMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!apiRes.ok) {
      const txt = await apiRes.text();
      return res.status(apiRes.status).send(txt);
    }

    const data = await apiRes.json();
    const assistantMsg = sanitizeAssistantMessageFromApi(data);
    res.json({ assistant: assistantMsg, raw: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

// Serve React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  if (!OPENAI_KEY) {
    console.error('OPENAI_API_KEY is not set.');
    process.exit(1);
  }
  app.listen(port, () => console.log(`Frank server running on http://localhost:${port}`));
}

module.exports = { extractContentString, sanitizeAssistantMessageFromApi, app };
