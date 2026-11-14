/*
 * خادم المساعد الافتراضي "نزيه" — اليوم العالمي لمكافحة الفساد
 * يعمل بـ Node.js 18 أو أحدث، بدون أي مكتبات خارجية (لا يحتاج npm install).
 *
 * التشغيل:
 *   OPENAI_API_KEY=sk-xxxx node server.js
 * ثم افتح: http://localhost:3000
 *
 * مفتاح OpenAI يبقى هنا في الخادم فقط ولا يصل للمتصفح أبداً.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// ---------- تحميل ملف .env إن وُجد ----------
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENAI_API_KEY || '';
const CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const TTS_MODEL = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
const TTS_VOICE = process.env.TTS_VOICE || 'onyx';
const STT_MODEL = process.env.STT_MODEL || 'gpt-4o-mini-transcribe';
const OPENAI_BASE = 'https://api.openai.com/v1';
const PUBLIC_DIR = __dirname;

// ---------- قاعدة المعرفة: نص النظام ----------
const LAW_TEXT = fs.readFileSync(path.join(__dirname, 'data', 'nazaha-law.txt'), 'utf8');

const SYSTEM_PROMPT = `
أنت "نزيه"، شخصية افتراضية سعودية تقف على شاشة تفاعلية في فعالية جامعة حائل بمناسبة اليوم العالمي لمكافحة الفساد (9 ديسمبر)، بالتعاون مع هيئة الرقابة ومكافحة الفساد (نزاهة).

أسلوبك:
- تتكلم بلهجة سعودية بيضاء مهذبة وودودة، مثل موظف سعودي محترم يرحّب بالزوار ("هلا والله"، "أبشر"، "حياك الله").
- إجاباتك تُقرأ بصوت عالٍ، فاجعلها قصيرة: من جملتين إلى أربع جمل، بدون نقاط أو جداول أو رموز أو روابط.
- اكتب الأرقام بطريقة سهلة النطق.

مصادرك:
- اعتمد أولاً على نص "نظام هيئة الرقابة ومكافحة الفساد" المرفق أدناه، واذكر رقم المادة عند الاستشهاد بها (مثل: "حسب المادة الثانية من النظام...").
- يمكنك الحديث بشكل عام عن: نظام مكافحة الرشوة، نظام حماية المبلغين والشهود والخبراء والضحايا، الاستراتيجية الوطنية لحماية النزاهة ومكافحة الفساد، واتفاقية الأمم المتحدة لمكافحة الفساد واليوم العالمي لمكافحة الفساد.
- إذا لم تكن متأكداً من معلومة (مثل رقم مادة أو عقوبة محددة) فقل ذلك بوضوح ووجّه الزائر لموقع هيئة الخبراء بمجلس الوزراء laws.boe.gov.sa أو موقع نزاهة. لا تخترع أرقام مواد أو عقوبات.

قنوات البلاغ عن الفساد لدى نزاهة: الرقم المجاني 980، والبريد الإلكتروني 980@nazaha.gov.sa، وموقع الهيئة الإلكتروني وتطبيقها. ويمكن تقديم البلاغ دون ذكر الاسم إذا كانت المعلومات قابلة للتحقق.

حدودك:
- أنت لا تستقبل بلاغات ولا تحفظ بيانات؛ إذا أراد الزائر أن يبلّغ فوجّهه للقنوات الرسمية أعلاه، ولا تطلب منه أسماء أو تفاصيل شخصية.
- لا تقدّم استشارة قانونية في قضية شخصية بعينها؛ قدّم المعلومة العامة وانصح بمراجعة محامٍ أو الجهة المختصة.
- لا تتهم أشخاصاً أو جهات بعينها بالفساد، ولا تدخل في السياسة.
- إذا سُئلت عن موضوع بعيد تماماً، ردّ بلطف وارجع للحديث عن النزاهة ومكافحة الفساد.

نص نظام هيئة الرقابة ومكافحة الفساد (مع المرسوم الملكي وقرار مجلس الوزراء):
"""
${LAW_TEXT}
"""
`.trim();

// ---------- حماية بسيطة من الإفراط في الاستخدام ----------
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 30; // 30 طلب في الدقيقة لكل جهاز
}

// ---------- أدوات ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp',
};

function readBody(req, limit = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function needKey(res) {
  if (!API_KEY) { sendJSON(res, 503, { error: 'لم يتم ضبط OPENAI_API_KEY في الخادم' }); return true; }
  return false;
}

// ---------- نقاط الـ API ----------
async function handleChat(req, res) {
  if (needKey(res)) return;
  const body = JSON.parse((await readBody(req, 200_000)).toString('utf8') || '{}');
  const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) })),
  ];
  const r = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: CHAT_MODEL, messages, temperature: 0.4, max_tokens: 350 }),
  });
  const data = await r.json();
  if (!r.ok) return sendJSON(res, 502, { error: data.error?.message || 'OpenAI error' });
  sendJSON(res, 200, { reply: data.choices?.[0]?.message?.content?.trim() || '' });
}

async function handleTTS(req, res) {
  if (needKey(res)) return;
  const { text } = JSON.parse((await readBody(req, 50_000)).toString('utf8') || '{}');
  if (!text) return sendJSON(res, 400, { error: 'no text' });
  const payload = {
    model: TTS_MODEL, voice: TTS_VOICE, input: String(text).slice(0, 1500), response_format: 'mp3',
  };
  // نموذج gpt-4o-mini-tts يقبل تعليمات لطريقة الأداء
  if (TTS_MODEL.includes('gpt-4o')) {
    payload.instructions = 'تحدث بالعربية بلهجة سعودية نجدية بيضاء، بصوت رجل هادئ وواثق وودود، وبإيقاع طبيعي غير متسرع.';
  }
  const r = await fetch(`${OPENAI_BASE}/audio/speech`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) { const e = await r.text(); return sendJSON(res, 502, { error: e.slice(0, 300) }); }
  const buf = Buffer.from(await r.arrayBuffer());
  res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': buf.length, 'Cache-Control': 'no-store' });
  res.end(buf);
}

async function handleSTT(req, res) {
  if (needKey(res)) return;
  const audio = await readBody(req);
  if (audio.length < 1000) return sendJSON(res, 400, { error: 'audio too short' });
  const type = (req.headers['content-type'] || 'audio/webm').split(';')[0];
  const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : type.includes('wav') ? 'wav' : type.includes('mpeg') ? 'mp3' : 'webm';
  const form = new FormData();
  form.append('file', new Blob([audio], { type }), `speech.${ext}`);
  form.append('model', STT_MODEL);
  form.append('language', 'ar');
  form.append('prompt', 'سؤال عن نزاهة ومكافحة الفساد والرشوة والمال العام وهيئة الرقابة.');
  const r = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
    method: 'POST', headers: { Authorization: `Bearer ${API_KEY}` }, body: form,
  });
  const data = await r.json();
  if (!r.ok) return sendJSON(res, 502, { error: data.error?.message || 'STT error' });
  sendJSON(res, 200, { text: (data.text || '').trim() });
}

// ---------- الملفات الثابتة ----------
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  const blocked = ['.env', 'server.js', 'package.json'];
  if (!filePath.startsWith(PUBLIC_DIR) || blocked.includes(path.basename(filePath))) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

// ---------- الخادم ----------
http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      if (req.method !== 'POST') return sendJSON(res, 405, { error: 'POST only' });
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      if (rateLimited(ip)) return sendJSON(res, 429, { error: 'طلبات كثيرة، حاول بعد قليل' });
      if (req.url.startsWith('/api/chat')) return await handleChat(req, res);
      if (req.url.startsWith('/api/tts')) return await handleTTS(req, res);
      if (req.url.startsWith('/api/stt')) return await handleSTT(req, res);
      return sendJSON(res, 404, { error: 'not found' });
    }
    serveStatic(req, res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) sendJSON(res, 500, { error: 'خطأ في الخادم' });
  }
}).listen(PORT, () => {
  console.log(`✅ نزيه يعمل على: http://localhost:${PORT}`);
  if (!API_KEY) console.log('⚠️  لم يتم ضبط OPENAI_API_KEY — الموقع سيعمل لكن المساعد سيرد بإجابات محلية محدودة فقط.');
});
