# AnatomyBuddy

AI-powered anatomy flashcards for medical students — built to help with recall
and understanding, not just memorization.

## The problem

Medical students studying anatomy rely heavily on flashcard apps like Anki or
Quizlet, but those apps only test recall with a fixed, pre-written deck. They
don't explain *why* an answer is correct, and they don't help you remember
structures you keep getting wrong. AnatomyBuddy is for med students (starting
with myself) who want a study tool that generates fresh questions on any
topic on demand, and — when you miss one — actually teaches you the structure
and gives you a memory trick, instead of just showing the "right answer" card.

## Live URL

[https://the-anatomy-buddy.vercel.app](https://the-anatomy-buddy.vercel.app)

## Features

- Type any anatomy topic (e.g. "cranial nerves", "brachial plexus", "cardiac chambers")
- AI generates a fresh, exam-style recall question on that topic — no fixed deck, no repeats
- Reveal the answer to see the correct answer, a clinical explanation, and a specific mnemonic
- Mark each card "recalled" or "missed" to track a running score for the session
- Auto-advances to a new card on the same topic after each answer, so you can drill a topic repeatedly
- Clean, distraction-free interface styled like a specimen plate from an anatomy atlas

## The AI feature

The AI feature is the core of the app: given a topic typed by the student, it
generates one flashcard (question, answer, explanation, and mnemonic) as
structured JSON, which the frontend renders.

**Where it lives:** `api/generate.js` (a Vercel serverless function)

**Model used:** Gemini (`gemini-flash-latest`) via the Google AI Studio API (free tier, no billing required)

**The system prompt / instructions I wrote:**You are an anatomy tutor helping a medical student drill recall of a specific topic.

Given a topic, generate ONE flashcard about a specific structure within that topic.

Respond with ONLY valid JSON, no markdown code fences, no preamble, in exactly this shape:
{
“question”: “a specific, exam-style recall question about one structure in the topic”,
“answer”: “the concise correct answer (a name, term, or short phrase)”,
“explanation”: “2-3 sentences explaining the structure, its function, and why it matters clinically”,
“mnemonic”: “a short, specific memory aid for this exact fact (not generic advice)”
}

Rules:

	•	Ask about a different structure/fact each time so repeated calls on the same topic do not repeat.
	•	Write at the level of a second-year medical student studying for a practical/OSCE.
	•	The mnemonic must be specific to this fact, not a generic study tip.
	•	If the topic given is not related to human anatomy or medicine, still return the same JSON shape,
but set “question” to ask the student to enter an anatomy topic instead, and leave the other fields
as a brief, polite note explaining why.## Tools, services, and models used

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework)
- **Backend:** Vercel serverless function (Node.js)
- **AI model:** Gemini (`gemini-flash-latest`) via the Google AI Studio API
- **Hosting/deployment:** Vercel
- **Version control:** Git + GitHub

## Screenshots
![Empty state](empty-state.png)
![Question](question.png)
![Answer revealed](answer-revealed.png)

<!-- If you add screenshot image files to the repo, replace this list with:
![Empty state](screenshots/1-empty-state.png)
![Question](screenshots/2-question.png)
![Answer revealed](screenshots/3-answer-revealed.png)
-->

## How to run this project locally

1. Clone the repo:git clone https://github.com/imbsat2005-tech/The-Anatomy-Buddy.git
cd The-Anatomy-Buddy2. Install the Vercel CLI (if you don't have it):npm install -g vercel3. Create a `.env` file in the project root with your own free Gemini API key (get one at https://aistudio.google.com/apikey):GEMINI_API_KEY=your_key_here4. Run it locally:vercel dev5. Open the local URL it prints (usually `http://localhost:3000`).

## Deploying your own copy

1. Push this repo to your own public GitHub account.
2. Go to [vercel.com](https://vercel.com), import the GitHub repo.
3. In the Vercel project's Settings → Environment Variables, add:
- `GEMINI_API_KEY` = your free Gemini API key from https://aistudio.google.com/apikey
4. Deploy. Vercel will give you a public URL.
