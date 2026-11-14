/* =========================================================
 *  نزيه — المساعد الصوتي لليوم العالمي لمكافحة الفساد
 * ========================================================= */
const CONFIG = {
  apiBase: '',                 // اتركه فارغاً إذا كان الموقع والخادم على نفس الدومين
  // ملفات شخصيتك (ضعها في مجلد assets). يكفي واحد منها:
  avatarIdleVideo: 'assets/avatar-idle.mp4', // فيديو الشخصية وهي ساكتة
  avatarTalkVideo: 'assets/avatar-talk.mp4', // فيديو الشخصية وهي تتكلم
  avatarImage: 'assets/avatar.jpg',          // أو صورة ثابتة بدل الفيديو
  idleResetSeconds: 120,       // يرجع للشاشة الرئيسية بعد دقيقتين بدون تفاعل
  maxRecordSeconds: 15,
  silenceMs: 1400,             // يوقف التسجيل تلقائياً بعد هذا الصمت
  eventDate: '2026-12-09T00:00:00+03:00',
  greeting: 'هلا والله وحياك الله! أنا نزيه، مساعدك الافتراضي في فعالية جامعة حائل باليوم العالمي لمكافحة الفساد. اسألني عن نظام هيئة الرقابة ومكافحة الفساد، أو كيف تبلّغ، أو أي شي يخص النزاهة.',
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------------- التنقل ---------------- */
function showView(name) {
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
  $$('.bottom-nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
$$('.bottom-nav button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));

/* ---------------- الشخصية ---------------- */
const avatarBox = $('#avatarBox');
const vidIdle = $('#vidIdle'), vidTalk = $('#vidTalk'), avatarImg = $('#avatarImg');
let hasIdle = false, hasTalk = false, hasImg = false;

function refreshAvatar() {
  avatarBox.classList.toggle('has-video', hasIdle || hasTalk);
  avatarBox.classList.toggle('has-image', hasImg && !(hasIdle || hasTalk));
  avatarBox.classList.toggle('empty', !hasIdle && !hasTalk && !hasImg);
}
vidIdle.onloadeddata = () => { hasIdle = true; vidIdle.play().catch(() => {}); refreshAvatar(); };
vidTalk.onloadeddata = () => { hasTalk = true; vidTalk.play().catch(() => {}); refreshAvatar(); };
avatarImg.onload = () => { hasImg = true; refreshAvatar(); };
vidIdle.onerror = vidTalk.onerror = avatarImg.onerror = refreshAvatar;
vidIdle.src = CONFIG.avatarIdleVideo;
vidTalk.src = CONFIG.avatarTalkVideo;
avatarImg.src = CONFIG.avatarImage;
refreshAvatar();

function setTalking(on) {
  avatarBox.classList.toggle('talking', on && hasTalk);
  avatarBox.classList.toggle('speaking', on);
}
function setMouth() {} // للتوافق

/* ---------------- الصوت ---------------- */
let audioCtx, analyser, mediaSrc;
const ttsAudio = $('#ttsAudio');

function ensureAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    mediaSrc = audioCtx.createMediaElementSource(ttsAudio);
    mediaSrc.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function lipSyncLoop() {
  const data = new Uint8Array(analyser.frequencyBinCount);
  let smooth = 0;
  const tick = () => {
    if (ttsAudio.paused || ttsAudio.ended) { setTalking(false); return; }
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
    const rms = Math.sqrt(sum / data.length);
    smooth = smooth * 0.5 + Math.min(1, rms * 5) * 0.5;
    avatarBox.style.setProperty('--level', smooth.toFixed(2));
    requestAnimationFrame(tick);
  };
  tick();
}

let fakeTalkTimer = null;
function fakeLipSync(on) {
  clearInterval(fakeTalkTimer);
  if (on) setTalking(true);
  else setTalking(false);
}

function stopSpeaking() {
  ttsAudio.pause();
  if (window.speechSynthesis) speechSynthesis.cancel();
  fakeLipSync(false);
  setTalking(false);
}

async function speak(text) {
  stopSpeaking();
  try {
    const r = await fetch(`${CONFIG.apiBase}/api/tts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
    });
    if (!r.ok) throw new Error('tts');
    const blob = await r.blob();
    ensureAudioCtx();
    if (ttsAudio.src) URL.revokeObjectURL(ttsAudio.src);
    ttsAudio.src = URL.createObjectURL(blob);
    setStatus('نزيه يتكلم... (اضغط المايك للمقاطعة)');
    await ttsAudio.play();
    setTalking(true);
    lipSyncLoop();
    await new Promise((res) => { ttsAudio.onended = res; ttsAudio.onpause = res; });
  } catch {
    // بديل: صوت المتصفح
    if (!window.speechSynthesis) return;
    await new Promise((res) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA'; u.rate = 1;
      const v = speechSynthesis.getVoices().find((x) => x.lang?.startsWith('ar'));
      if (v) u.voice = v;
      u.onstart = () => fakeLipSync(true);
      u.onend = u.onerror = () => { fakeLipSync(false); res(); };
      speechSynthesis.speak(u);
    });
  }
  setTalking(false);
  setStatus('اضغط على المايك واسألني 👇');
}

/* ---------------- المحادثة ---------------- */
const chatLog = $('#chatLog');
let history = [];
let busy = false;

function setStatus(t, cls = '') { const s = $('#status'); s.textContent = t; s.className = `status ${cls}`; }
function addMsg(role, text) {
  const d = document.createElement('div');
  d.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
  d.textContent = text;
  chatLog.appendChild(d);
  chatLog.scrollTop = chatLog.scrollHeight;
  return d;
}

async function ask(text) {
  text = (text || '').trim();
  if (!text || busy) return;
  busy = true; $('#micBtn').classList.add('busy');
  addMsg('user', text);
  history.push({ role: 'user', content: text });
  setStatus('نزيه يفكر... 🤔');
  const thinking = addMsg('bot', '...');
  let reply;
  try {
    const r = await fetch(`${CONFIG.apiBase}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }),
    });
    const data = await r.json();
    if (!r.ok || !data.reply) throw new Error(data.error);
    reply = data.reply;
  } catch (e) {
    console.warn('chat fallback:', e?.message);
    reply = localAnswer(text);
  }
  thinking.textContent = reply;
  history.push({ role: 'assistant', content: reply });
  history = history.slice(-10);
  busy = false; $('#micBtn').classList.remove('busy');
  await speak(reply);
}

$('#textForm').addEventListener('submit', (e) => {
  e.preventDefault();
  ensureAudioCtx();
  const v = $('#textInput').value; $('#textInput').value = '';
  ask(v);
});
$$('.chip').forEach((c) => c.addEventListener('click', () => { ensureAudioCtx(); ask(c.textContent); }));

/* ---------------- التسجيل الصوتي ---------------- */
let recState = null; // { recorder, stream, chunks, ... }

$('#micBtn').addEventListener('click', async () => {
  ensureAudioCtx();
  stopSpeaking();
  if (recState) { recState.stop(); return; }
  if (busy) return;
  if (navigator.mediaDevices?.getUserMedia && window.MediaRecorder) startRecording();
  else startBrowserRecognition();
});

async function startRecording() {
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch { setStatus('ما قدرت أوصل للمايك — تأكد من السماح للمتصفح بالمايك'); return; }

  const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks = [];
  const src = audioCtx.createMediaStreamSource(stream);
  const micAnalyser = audioCtx.createAnalyser(); micAnalyser.fftSize = 512; src.connect(micAnalyser);
  const buf = new Uint8Array(micAnalyser.frequencyBinCount);
  let heardSpeech = false, lastLoud = performance.now();
  const startedAt = performance.now();
  let stopped = false;

  const stop = () => { if (stopped) return; stopped = true; try { recorder.stop(); } catch {} };
  recState = { stop };

  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    src.disconnect();
    recState = null;
    $('#micBtn').classList.remove('listening');
    if (!heardSpeech) { setStatus('ما سمعتك 🙂 اضغط المايك وجرّب مرة ثانية'); return; }
    setStatus('جاري تحويل كلامك لنص...');
    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    try {
      const r = await fetch(`${CONFIG.apiBase}/api/stt`, { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (!data.text) { setStatus('ما وضح الكلام، جرّب مرة ثانية'); return; }
      ask(data.text);
    } catch (e) {
      console.warn('stt error', e);
      setStatus('خدمة تحويل الصوت غير متاحة الآن — اكتب سؤالك بالأسفل');
    }
  };

  const monitor = () => {
    if (stopped) return;
    micAnalyser.getByteTimeDomainData(buf);
    let sum = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
    const rms = Math.sqrt(sum / buf.length);
    const now = performance.now();
    if (rms > 0.035) { heardSpeech = true; lastLoud = now; }
    if (heardSpeech && now - lastLoud > CONFIG.silenceMs) return stop();
    if (!heardSpeech && now - startedAt > 7000) return stop();
    if (now - startedAt > CONFIG.maxRecordSeconds * 1000) return stop();
    requestAnimationFrame(monitor);
  };

  recorder.start();
  $('#micBtn').classList.add('listening');
  setStatus('أسمعك... تكلّم الحين 🎙', 'listening');
  monitor();
}

// بديل: التعرف على الكلام من المتصفح (Chrome)
function startBrowserRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { setStatus('المتصفح لا يدعم المايك — اكتب سؤالك بالأسفل'); return; }
  const rec = new SR();
  rec.lang = 'ar-SA'; rec.interimResults = false; rec.maxAlternatives = 1;
  recState = { stop: () => rec.stop() };
  $('#micBtn').classList.add('listening');
  setStatus('أسمعك... تكلّم الحين 🎙', 'listening');
  rec.onresult = (e) => ask(e.results[0][0].transcript);
  rec.onend = () => { recState = null; $('#micBtn').classList.remove('listening'); };
  rec.onerror = () => setStatus('ما سمعتك، جرّب مرة ثانية');
  rec.start();
}

/* ---------------- إجابات محلية (عند عدم توفر الاتصال بالذكاء الاصطناعي) ---------------- */
function localAnswer(q) {
  const has = (...w) => w.some((x) => q.includes(x));
  if (has('أبلغ', 'ابلغ', 'أبلّغ', 'بلاغ', 'بلغ'))
    return 'أبشر، تقدر تبلّغ عن أي شبهة فساد على الرقم المجاني تسعمية وثمانين، أو بالإيميل 980@nazaha.gov.sa، أو من موقع نزاهة وتطبيقها. وتقدر تبلّغ بدون ما تذكر اسمك إذا كانت معلوماتك قابلة للتحقق.';
  if (has('جرائم', 'جريمة', 'أنواع'))
    return 'حسب المادة الثانية من نظام هيئة الرقابة ومكافحة الفساد، جرائم الفساد هي: الرشوة، والاعتداء على المال العام، وإساءة استعمال السلطة، وأي جريمة ثانية ينص نظام على إنها جريمة فساد.';
  if (has('9 ديسمبر', '٩ ديسمبر', 'ديسمبر', 'اليوم العالمي'))
    return 'لأن في تسعة ديسمبر ألفين وثلاثة فُتح باب التوقيع على اتفاقية الأمم المتحدة لمكافحة الفساد، ومن وقتها صار هذا اليوم يوم عالمي للتوعية بخطر الفساد.';
  if (has('ثروة', 'زادت', 'أموال'))
    return 'حسب المادة التاسعة عشرة، إذا زادت ثروة الموظف العام زيادة ما تتناسب مع دخله، يكون عبء الإثبات عليه هو إنه كسبها بطريقة مشروعة، ويشمل ذلك زوجه وأولاده وأقاربه من الدرجة الأولى.';
  if (has('محمي', 'حماية', 'سرية'))
    return 'أكيد، من اختصاصات الهيئة حسب المادة الرابعة توفير الحماية اللازمة لمن يبلّغ أو يدلي بمعلومات عن الفساد، وفيه كذلك نظام خاص لحماية المبلغين والشهود والخبراء والضحايا.';
  if (has('اختصاص', 'مهام', 'وش تسوي', 'نزاهة'))
    return 'هيئة الرقابة ومكافحة الفساد تعنى بالرقابة الإدارية على الجهات العامة، وحماية النزاهة وتعزيز الشفافية ومكافحة الفساد، ومن اختصاصاتها تلقي البلاغات، والتحقيق في جرائم الفساد، ومتابعة استرداد الأموال، ونشر الوعي.';
  if (has('محكمة'))
    return 'حسب المرسوم الملكي، تختص المحكمة الجزائية في مدينة الرياض بالنظر في جميع جرائم الفساد.';
  return 'سؤال حلو! الحين أنا شغال بالوضع المحدود، لكن تقدر تتصفح مواد النظام كاملة من قسم الأنظمة تحت، أو تجرب الأسئلة التفاعلية.';
}

/* ---------------- الأنظمة ---------------- */
function escapeHTML(s) { return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function renderLaw(filter = '') {
  const box = $('#lawArticles');
  const law = window.NAZAHA_LAW;
  let f = filter.trim();
  const match = (a, t) => a.title.includes(t) || a.body.includes(t);
  const all = [{ title: 'المرسوم الملكي وقرار مجلس الوزراء', body: law.preamble }, ...law.articles];
  if (f.startsWith('ال') && f.length > 3 && !all.some((a) => match(a, f))) f = f.slice(2); // "الثروة" ← "ثروة"

  const hl = (t) => {
    const safe = escapeHTML(t);
    if (!f) return safe;
    const re = new RegExp(escapeHTML(f).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    return safe.replace(re, (m) => `<mark>${m}</mark>`);
  };
  const items = [{ title: 'المرسوم الملكي وقرار مجلس الوزراء', chapter: '', body: law.preamble }, ...law.articles];
  const shown = items.filter((a) => !f || match(a, f));
  box.innerHTML = shown.length
    ? shown.map((a) => `<details ${f ? 'open' : ''}><summary><span>${hl(a.title)}<span class="chapter">${escapeHTML(a.chapter)}</span></span></summary><div class="body">${hl(a.body)}</div></details>`).join('')
    : '<p>لا توجد نتائج مطابقة.</p>';
}
renderLaw();
$('#lawSearch').addEventListener('input', (e) => renderLaw(e.target.value));

/* ---------------- الاختبار ---------------- */
let qi = 0, score = 0;
function renderQuiz() {
  const box = $('#quiz');
  const Q = window.QUIZ;
  if (qi >= Q.length) {
    const pct = Math.round((score / Q.length) * 100);
    const msg = pct >= 80 ? 'ممتاز! أنت سفير للنزاهة 🏅' : pct >= 50 ? 'زين! وتقدر توصل للعلامة الكاملة 💪' : 'ولا يهمك، تصفّح الأنظمة وجرّب مرة ثانية 📘';
    box.innerHTML = `<div class="q-card q-result"><div class="score">${score} / ${Q.length}</div><p style="font-size:1.2rem">${msg}</p>
      <button class="q-next" id="qRestart">أعد الاختبار</button></div>`;
    $('#qRestart').onclick = () => { qi = 0; score = 0; renderQuiz(); };
    return;
  }
  const item = Q[qi];
  box.innerHTML = `<div class="q-progress"><div style="width:${(qi / Q.length) * 100}%"></div></div>
    <div class="q-card"><div class="q-num">السؤال ${qi + 1} من ${Q.length}</div>
    <div class="q-text">${item.q}</div>
    ${item.o.map((o, i) => `<button class="q-opt" data-i="${i}">${o}</button>`).join('')}
    <div id="qAfter"></div></div>`;
  $$('.q-opt', box).forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.i);
    $$('.q-opt', box).forEach((x) => { x.disabled = true; if (Number(x.dataset.i) === item.a) x.classList.add('correct'); });
    if (i === item.a) score++; else b.classList.add('wrong');
    $('#qAfter').innerHTML = `<div class="q-exp">${i === item.a ? '✅ إجابة صحيحة!' : '❌ الإجابة الصحيحة موضحة باللون الأخضر.'}<br>${item.e}</div>
      <button class="q-next" id="qNext">${qi + 1 < Q.length ? 'السؤال التالي' : 'النتيجة'}</button>`;
    $('#qNext').onclick = () => { qi++; renderQuiz(); };
  }));
}
renderQuiz();

/* ---------------- العد التنازلي ---------------- */
function tickCountdown() {
  const diff = new Date(CONFIG.eventDate) - new Date();
  const box = $('#countdown');
  if (diff <= 0) { box.innerHTML = '<div><b>اليوم!</b>اليوم العالمي لمكافحة الفساد</div>'; return; }
  const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5), m = Math.floor((diff % 36e5) / 6e4);
  box.innerHTML = `<div><b>${d}</b>يوم</div><div><b>${h}</b>ساعة</div><div><b>${m}</b>دقيقة</div>`;
}
tickCountdown(); setInterval(tickCountdown, 30_000);

/* ---------------- إعادة الضبط عند الخمول (للشاشة التفاعلية) ---------------- */
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    stopSpeaking();
    history = []; chatLog.innerHTML = ''; addMsg('bot', CONFIG.greeting);
    qi = 0; score = 0; renderQuiz();
    $('#lawSearch').value = ''; renderLaw();
    showView('assistant');
  }, CONFIG.idleResetSeconds * 1000);
}
['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, resetIdle));
resetIdle();

/* ---------------- البداية ---------------- */
addMsg('bot', CONFIG.greeting);
