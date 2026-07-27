// /api/generate -- Vercel serverless function
// Receives a topic from the frontend, asks Gemini to generate one anatomy
// flashcard (question, answer, explanation, mnemonic), and returns JSON.
//
// Requires an environment variable GEMINI_API_KEY, set in Vercel's
// project settings (Settings -> Environment Variables). NEVER commit the
// actual key to the repo. Get a free key (no credit card needed) at
// https://aistudio.google.com/apikey

// This is the system prompt: the instructions you write that shape the AI feature.
var SYSTEM_PROMPT = [
  'You are an anatomy tutor helping a medical student drill recall of a specific topic.',
  '',
  'Given a topic, generate ONE flashcard about a specific structure within that topic.',
  '',
  'Respond with ONLY valid JSON, no markdown code fences, no preamble, in exactly this shape:',
  '{',
  '  "question": "a specific, exam-style recall question about one structure in the topic",',
  '  "answer": "the concise correct answer (a name, term, or short phrase)",',
  '  "explanation": "2-3 sentences explaining the structure, its function, and why it matters clinically",',
  '  "mnemonic": "a short, specific memory aid for this exact fact (not generic advice)"',
  '}',
  '',
  'Rules:',
  '- Ask about a different structure/fact each time so repeated calls on the same topic do not repeat.',
  '- Write at the level of a second-year medical student studying for a practical/OSCE.',
  '- The mnemonic must be specific to this fact, not a generic study tip.',
  '- If the topic given is not related to human anatomy or medicine, still return the same JSON shape,',
  '  but set "question" to ask the student to enter an anatomy topic instead, and leave the other fields',
  '  as a brief, polite note explaining why.'
].join('\n');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var topic = (req.body || {}).topic;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'A topic is required.' });
  }

  var apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });
  }

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + apiKey;

  try {
    var response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: 'Topic: ' + topic.trim() }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      var errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(502).json({ error: 'The AI service returned an error.' });
    }

    var data = await response.json();
    var parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
    var text = parts.map(function (p) { return p.text || ''; }).join('');

    var cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    var parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', text);
      return res.status(502).json({ error: 'Could not parse the AI response. Try again.' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
  }
