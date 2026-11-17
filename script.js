const form = document.getElementById('chatForm');
const input = document.getElementById('userInput');
const chat = document.getElementById('chatWindow');
const avatar = document.getElementById('avatar');
const mood = document.getElementById('mood');
const voiceBtn = document.getElementById('voiceBtn');
const voiceReplies = document.getElementById('voiceReplies');

function addMessage(text, who) {
  const row = document.createElement('div');
  row.className = `message ${who === 'user' ? 'user-message' : 'echo-message'}`;
  const icon = document.createElement('div');
  icon.className = 'mini-avatar';
  icon.textContent = who === 'user' ? 'Y' : 'E';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const name = document.createElement('strong');
  name.textContent = who === 'user' ? 'You' : 'Echo';
  const p = document.createElement('p');
  p.textContent = text;
  bubble.append(name, p); row.append(icon, bubble); chat.append(row);
  chat.scrollTop = chat.scrollHeight;
}

function makeReply(message) {
  const m = message.toLowerCase();
  if (/hello|hi\b|hey|good morning/.test(m)) return "Hey! It's lovely to see you. How has your day been so far? Try answering in two or three complete sentences.";
  if (/travel|trip|holiday|vacation/.test(m)) return "Travel is one of my favourite topics! Imagine you have one week and a free plane ticket. Where would you go, and what would you do first?";
  if (/job|interview|career|work/.test(m)) return "Let's practise a real interview. First question: tell me about yourself and one strength you would bring to this role.";
  if (/correct|grammar|english/.test(m)) return "Absolutely. Send me a sentence and I'll help make it sound more natural. I'll explain the correction without making you feel bad about mistakes.";
  if (/sad|bad day|tired|stress/.test(m)) return "I'm sorry it's been a tough day. You can take your time. If you'd like to practise English, tell me what happened — I'll listen and gently help with your wording.";
  if (/thank/.test(m)) return "You're very welcome! You're doing well. Remember: making mistakes is part of becoming fluent. Want to keep going?";
  if (/name|who are you/.test(m)) return "I'm Echo, your friendly AI language companion. I'm curious, patient, and a little adventurous. My mission is to make speaking practice feel less like a lesson and more like a conversation.";
  const starters = [
    "That's interesting! Could you tell me a little more about that? Try using the past tense if you're describing something that already happened.",
    "I like the way you're thinking. Here's a follow-up: why is that important to you? There isn't one perfect answer.",
    "Nice! Let's make this a little more challenging. Can you explain your idea using an example from real life?",
    "I'm listening. One small language tip: try connecting your ideas with 'because', 'although', or 'as a result'. What else would you add?"
  ];
  return starters[Math.floor(Math.random() * starters.length)];
}

function speak(text) {
  if (!('speechSynthesis' in window) || !voiceReplies.checked) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; utterance.rate = 0.98; utterance.pitch = 1.08;
  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && /female|samantha|zira|aria/i.test(v.name));
  if (preferred) utterance.voice = preferred;
  utterance.onstart = () => { avatar.classList.add('speaking'); mood.textContent = 'Speaking with you…'; };
  utterance.onend = () => { avatar.classList.remove('speaking'); mood.textContent = 'Happy to meet you!'; };
  utterance.onerror = () => { avatar.classList.remove('speaking'); mood.textContent = 'Ready to chat'; };
  speechSynthesis.speak(utterance);
}

function send(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage(clean, 'user'); input.value = '';
  avatar.classList.add('thinking'); mood.textContent = 'Thinking…';
  setTimeout(() => {
    avatar.classList.remove('thinking');
    const reply = makeReply(clean);
    addMessage(reply, 'echo');
    speak(reply);
    if (!voiceReplies.checked) mood.textContent = 'That is a great question!';
  }, 650);
}
form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
document.querySelectorAll('.prompt').forEach(btn => btn.addEventListener('click', () => {
  const topic = btn.textContent.replace(/^[^ ]+ /, '');
  const starters = {
    'Daily life': "Let's talk about daily life. What does a normal weekday look like for you?",
    'Travel': "I'd love to talk about travel. Which country would you most like to visit, and why?",
    'Job interview': "Let's simulate a job interview. Tell me about yourself in a few sentences.",
    'Correct my English': "Send me a sentence in English and I'll help you improve it."
  };
  send(starters[topic] || `Let's practise ${topic}. What would you like to talk about?`);
}));
document.getElementById('clearBtn').addEventListener('click', () => {
  chat.innerHTML = '';
  addMessage("Fresh start! What would you like to talk about today?", 'echo');
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  avatar.classList.remove('speaking','thinking'); mood.textContent = 'Ready for a new chat';
});

// Browser speech recognition (Chrome/Edge support varies by device and permissions).
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US'; recognition.interimResults = false;
  voiceBtn.addEventListener('click', () => {
    try { recognition.start(); voiceBtn.classList.add('listening'); mood.textContent = 'Listening…'; }
    catch (e) { mood.textContent = 'Microphone is busy — try again'; }
  });
  recognition.onresult = e => { input.value = e.results[0][0].transcript; send(input.value); };
  recognition.onend = () => { voiceBtn.classList.remove('listening'); if (!avatar.classList.contains('speaking')) mood.textContent = 'Ready to chat'; };
  recognition.onerror = () => { voiceBtn.classList.remove('listening'); mood.textContent = 'Check microphone permission'; };
} else {
  voiceBtn.addEventListener('click', () => {
    mood.textContent = 'Voice input works best in Chrome or Edge';
    alert('Voice input is not supported by this browser. Try Google Chrome or Microsoft Edge. You can still type and hear Echo speak.');
  });
}
