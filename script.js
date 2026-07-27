// AnatomyBuddy — frontend logic
// Talks to /api/generate (a Vercel serverless function) which calls the AI.

const topicInput = document.getElementById('topic-input');
const newCardBtn = document.getElementById('new-card-btn');
const retryBtn = document.getElementById('retry-btn');
const revealBtn = document.getElementById('reveal-btn');
const gotItBtn = document.getElementById('got-it-btn');
const missedItBtn = document.getElementById('missed-it-btn');

const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const cardState = document.getElementById('card-state');
const errorMessage = document.getElementById('error-message');

const questionText = document.getElementById('question-text');
const answerBlock = document.getElementById('answer-block');
const answerText = document.getElementById('answer-text');
const explanationText = document.getElementById('explanation-text');
const mnemonicText = document.getElementById('mnemonic-text');
const plateFig = document.getElementById('plate-fig');

const preRevealActions = document.getElementById('pre-reveal-actions');
const postRevealActions = document.getElementById('post-reveal-actions');

const scoreStrip = document.getElementById('score-strip');
const scoreRight = document.getElementById('score-right');
const scoreWrong = document.getElementById('score-wrong');
const scoreTotal = document.getElementById('score-total');

let cardNumber = 0;
let score = { right: 0, wrong: 0 };
let lastTopic = '';

function showOnly(stateEl) {
  [emptyState, loadingState, errorState, cardState].forEach((el) => {
    el.hidden = el !== stateEl;
  });
}

function updateScoreStrip() {
  scoreStrip.hidden = false;
  scoreRight.textContent = score.right;
  scoreWrong.textContent = score.wrong;
  scoreTotal.textContent = score.right + score.wrong;
}

async function drawCard() {
  const topic = topicInput.value.trim();
  if (!topic) {
    topicInput.focus();
    return;
  }
  lastTopic = topic;
  showOnly(loadingState);

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }

    const data = await res.json();

    if (!data.question || !data.answer) {
      throw new Error('The AI response was missing fields. Try again.');
    }

    cardNumber += 1;
    plateFig.textContent = `FIG. ${cardNumber} — ${topic.toUpperCase()}`;
    questionText.textContent = data.question;
    answerText.textContent = data.answer;
    explanationText.textContent = data.explanation || '';
    mnemonicText.textContent = data.mnemonic ? `Mnemonic: ${data.mnemonic}` : '';

    answerBlock.hidden = true;
    preRevealActions.hidden = false;
    postRevealActions.hidden = true;

    showOnly(cardState);
  } catch (err) {
    errorMessage.textContent = err.message || 'Something went wrong. Please try again.';
    showOnly(errorState);
  }
}

function revealAnswer() {
  answerBlock.hidden = false;
  preRevealActions.hidden = true;
  postRevealActions.hidden = false;
}

function markResult(gotIt) {
  if (gotIt) score.right += 1;
  else score.wrong += 1;
  updateScoreStrip();
  drawCard(); // auto-advance to a new card on the same topic
}

newCardBtn.addEventListener('click', drawCard);
retryBtn.addEventListener('click', () => {
  if (lastTopic) {
    topicInput.value = lastTopic;
  }
  drawCard();
});
revealBtn.addEventListener('click', revealAnswer);
gotItBtn.addEventListener('click', () => markResult(true));
missedItBtn.addEventListener('click', () => markResult(false));

topicInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') drawCard();
});
