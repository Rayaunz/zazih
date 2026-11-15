/* =========================================================
 *  نزيه — شاشة واحدة تفاعلية لليوم العالمي لمكافحة الفساد
 *  الإعدادات وبنك الأسئلة في أعلى الملف
 * ========================================================= */
const CONFIG = {
  apiBase: '',                 // اتركه فارغاً إذا كان الموقع والخادم على نفس الدومين
  avatarImage: 'assets/avatar.jpg',
  idleResetSeconds: 120,       // يرجع لشاشة الترحيب بعد دقيقتين بدون تفاعل
  maxRecordSeconds: 15,
  silenceMs: 1400,             // يوقف التسجيل تلقائياً بعد هذا الصمت
  showWelcome: false,          // true لإظهار رسالة الترحيب عند فتح الموقع وبعد الخمول
  quizLength: 5,               // عدد أسئلة «اختبر نفسك» في كل مرة
  idleStatus: 'اضغط للتحدث',
  didStatus: 'تحدّث مع نزيه مباشرة من الأعلى، أو اختر سؤالاً',   // نص الحالة عند تشغيل شخصية D-ID
  didWaitSeconds: 12,          // مدة انتظار تحميل D-ID قبل اعتماد الصورة المتحركة
  greeting: 'حياك الله! أنا نزيه. اسألني عن النزاهة ومكافحة الفساد، أو اسحب الأسئلة واختر ما يهمك، أو قل: اختبرني.',
};

/* إحداثيات الوجه بمقاس صورة الشخصية (2322×768). لو غيّرت الصورة عدّل هذه الأرقام فقط.
   جرّب بعد التعديل: ‎/?test=open‎ (فم مفتوح) و ‎/?test=blink‎ (عين مغمضة) و ‎/?test=1‎ (كلام تجريبي) */
const FACE = {
  mouthX: 1160, mouthY: 505,   // منتصف خط التقاء الشفتين
  mouthHalfW: 44,              // نصف عرض الفم
  jaw: { x0: 1006, x1: 1310, yBottom: 642 },  // حدود الفك والذقن
  maxOpen: 14,                 // أقصى فتحة للفم بالبكسل
  eyes: [{ x: 1101, y: 348, rx: 26, ry: 10 }, { x: 1241, y: 359, rx: 26, ry: 10 }],
  head: { cx: 1175, cy: 380, rx: 345, ry: 400 }, // المنطقة التي تتحرك (الرأس والشماغ فقط)
  pivot: { x: 1160, y: 715 },  // نقطة ارتكاز حركة الرأس (الرقبة)
};

/* ---------------- بنك الأسئلة المتحركة ----------------
   q: نص السؤال | a: الجواب الجاهز (يُنطق مباشرة فيكون سريعاً ودقيقاً) | k: كلمات تدل عليه لو كتبه الزائر بصيغته */
const BANK = [
  { id: 'day', icon: 'cal', q: 'لماذا 9 ديسمبر يوم عالمي لمكافحة الفساد؟', k: ['ديسمبر', 'اليوم العالمي', 'المناسبة'],
    a: 'في التاسع من ديسمبر عام ألفين وثلاثة فُتح باب التوقيع على اتفاقية الأمم المتحدة لمكافحة الفساد، ومنذ ذلك الوقت أصبح هذا اليوم مناسبة عالمية للتوعية بخطر الفساد وتأكيد أن مكافحته مسؤولية الجميع. والمملكة دولة طرف في هذه الاتفاقية.' },
  { id: 'role', icon: 'shield', q: 'ما هو دور نزاهة؟', k: ['دور نزاهه', 'اختصاص', 'مهام', 'وش تسوي نزاهه', 'ما هي نزاهه'],
    a: 'هيئة الرقابة ومكافحة الفساد، نزاهة، تُعنى بالرقابة الإدارية على الجهات العامة، وحماية النزاهة وتعزيز الشفافية ومكافحة الفساد. ومن اختصاصاتها تلقي البلاغات، والتحري والتحقيق في جرائم الفساد، ومتابعة استرداد الأموال، ونشر الوعي في المجتمع.' },
  { id: 'report', icon: 'horn', q: 'كيف أبلّغ عن حالة فساد؟', k: ['ابلغ', 'بلاغ', 'بلغ', 'تبليغ'], sheet: 'report',
    a: 'أبشر. يمكنك الإبلاغ عن أي شبهة فساد عبر الرقم المجاني تسعمئة وثمانين، أو البريد الإلكتروني 980@nazaha.gov.sa، أو موقع نزاهة وتطبيقها. ويمكنك تقديم البلاغ دون ذكر اسمك إذا كانت معلوماتك قابلة للتحقق.' },
  { id: 'protect', icon: 'lock', q: 'هل هوية المبلّغ محمية؟', k: ['محمي', 'حمايه', 'سريه', 'هويه المبلغ', 'اخاف'],
    a: 'نعم. من اختصاصات الهيئة حسب المادة الرابعة من نظامها اتخاذ الإجراءات اللازمة لحماية من يبلّغ أو يدلي بمعلومات عن جرائم الفساد. وهناك أيضاً نظام خاص لحماية المبلّغين والشهود والخبراء والضحايا يحفظ سرية هوياتهم.' },
  { id: 'crimes', icon: 'scale', q: 'ما هي جرائم الفساد في النظام؟', k: ['جرائم', 'جريمه', 'انواع الفساد', 'صور الفساد'],
    a: 'حسب المادة الثانية من نظام هيئة الرقابة ومكافحة الفساد، جرائم الفساد هي: جرائم الرشوة، وجرائم الاعتداء على المال العام، وجرائم إساءة استعمال السلطة، وأي جريمة أخرى يُنص على أنها جريمة فساد بناءً على نظام.' },
  { id: 'gift', icon: 'gift', q: 'ما الفرق بين الهدية والرشوة؟', k: ['هديه', 'رشوه', 'عطيه'],
    a: 'العبرة بالسبب لا بالاسم. إذا قُدِّمت العطية للموظف العام مقابل أداء عمل من أعمال وظيفته أو الامتناع عنه فهي رشوة يعاقب عليها النظام ولو سُمّيت هدية، ويُعاقب معه الراشي والوسيط. وعند الشك، الأسلم أن تعتذر عن قبولها وتسأل الجهة المختصة في عملك.' },
  { id: 'student', icon: 'cap', q: 'ما دوري كطالب في تعزيز النزاهة؟', k: ['طالب', 'دوري', 'الغش', 'الامانه العلميه'],
    a: 'النزاهة تبدأ منك. التزم بالأمانة العلمية في اختباراتك وبحوثك، وانسب كل عمل إلى صاحبه، واحترم الأنظمة والمال العام في جامعتك، وكن قدوة لزملائك. وإذا رأيت شبهة فساد فبلّغ عنها عبر القنوات الرسمية.' },
  { id: 'wealth', icon: 'coin', q: 'ماذا لو تضخمت ثروة الموظف فجأة؟', k: ['ثروه', 'تضخم', 'زادت امواله', 'اثراء'],
    a: 'حسب المادة التاسعة عشرة من النظام، إذا زادت ثروة الموظف العام زيادة لا تتناسب مع دخله، يكون عليه هو أن يثبت أنه اكتسبها بطريقة مشروعة، ويشمل ذلك زوجه وأولاده وأقاربه من الدرجة الأولى.' },
  { id: 'rights', icon: 'user', q: 'ما هي حقوقي كمواطن؟', k: ['حقوقي', 'حقوق المواطن', 'حقي'],
    a: 'من حقك أن تحصل على الخدمة العامة دون أي مقابل غير نظامي، وأن تبلّغ عن أي شبهة فساد عبر القنوات الرسمية بسرية تامة، وأن تتمتع بالحماية التي كفلتها الأنظمة للمبلّغين والشهود.' },
  { id: 'oversight', icon: 'eye', q: 'كيف تتم الرقابة والمساءلة؟', k: ['الرقابه', 'المساءله', 'المحاسبه', 'محكمه'],
    a: 'تمارس الهيئة الرقابة الإدارية على الجهات العامة، وتتلقى البلاغات وتتحرى عنها وتحقق في جرائم الفساد، ثم تُحال القضايا إلى المحكمة المختصة. وحسب المرسوم الملكي تختص المحكمة الجزائية في مدينة الرياض بالنظر في جرائم الفساد.' },
  { id: 'why', icon: 'heart', q: 'ما أهمية مكافحة الفساد؟', k: ['اهميه', 'ليش نكافح', 'خطر الفساد', 'اضرار', 'لماذا نكافح'],
    a: 'مكافحة الفساد تحفظ المال العام، وتضمن وصول الفرص والخدمات إلى مستحقيها بعدل، وتقوّي ثقة الناس بالجهات العامة وتدعم التنمية. ولكل واحد منا دور: أن يلتزم بالأمانة في دراسته وعمله، وأن يبلّغ إذا رأى شبهة فساد.' },
  { id: 'examples', icon: 'list', q: 'أعطني أمثلة على صور الفساد', k: ['امثله', 'مثال'],
    a: 'من صور الفساد: أن يطلب موظف مبلغاً لإنهاء معاملة، وهذه رشوة. أو أن يستخدم ممتلكات جهته وأموالها لمصلحته الشخصية، وهذا اعتداء على المال العام. أو أن يستغل منصبه ليمنح نفسه أو غيره ما لا يستحق، وهذه إساءة لاستعمال السلطة.' },
  { id: 'uoh', icon: 'cap', q: 'ما دور جامعة حائل في التوعية؟', k: ['جامعه', 'حائل'],
    a: 'جامعة حائل جامعة حكومية تأسست عام ألف وأربعمئة وستة وعشرين للهجرة، وهي تنظّم هذه الفعالية بمناسبة اليوم العالمي لمكافحة الفساد لنشر ثقافة النزاهة والأمانة بين طلابها ومنسوبيها وزوارها، وتعريفهم بالأنظمة وطرق الإبلاغ.' },
];
/* بطاقات تفتح وظيفة بدل سؤال */
const ACTIONS = [
  { id: 'quiz', icon: 'check', q: 'اختبر نفسك', cls: 'gold' },
  { id: 'laws', icon: 'book', q: 'تصفّح الأنظمة', cls: 'action' },
  { id: 'rate', icon: 'star', q: 'قيّم تجربتك', cls: 'action' },
];
const ICONS = {
  cal: '<rect x="3.500" y="5" width="17" height="15" rx="2"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.400 9.300 8 11 4.600-1.700 8-6 8-11V5z"/><path d="m8.500 12 2.500 2.500 4.500-5"/>',
  horn: '<path d="M3 10v4h3l8 5V5l-8 5z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  gift: '<rect x="4" y="10" width="16" height="10" rx="1.500"/><path d="M3 7h18v3H3zM12 7v13M12 7c-1.500-4-6-3-4.500 0M12 7c1.500-4 6-3 4.500 0"/>',
  cap: '<path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11.500V16c0 1.500 2.700 3 6 3s6-1.500 6-3v-4.500"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M14.500 9.500c-.500-1-1.500-1.500-2.500-1.500-1.500 0-2.500.900-2.500 2s1 1.700 2.500 2 2.500.900 2.500 2-1 2-2.500 2c-1 0-2-.500-2.500-1.500M12 6.500V8m0 8v1.500"/>',
  user: '<circle cx="12" cy="8" r="3.500"/><path d="M5 20c.500-4 3.500-6 7-6s6.500 2 7 6"/>',
  eye: '<path d="M2 12s3.500-6.500 10-6.500S22 12 22 12s-3.500 6.500-10 6.500S2 12 2 12z"/><circle cx="12" cy="12" r="2.800"/>',
  heart: '<path d="M12 20s-7-4.400-7-9.500A4 4 0 0 1 12 8a4 4 0 0 1 7 2.500c0 5.100-7 9.500-7 9.500z"/>',
  list: '<path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8.500 12 2.500 2.500 4.500-5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M9 7h6"/>',
  star: '<path d="m12 3 2.700 5.600 6.100.800-4.500 4.200 1.200 6-5.500-3-5.500 3 1.200-6L3.200 9.400l6.100-.800z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18"/>',
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const app = $('#app');
const TEST = params.get('test');
const buzz = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };
/* توحيد الحروف العربية للمقارنة: بدون تشكيل، والهمزات ألف، والتاء المربوطة هاء */
const norm = (s) => String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
function escapeHTML(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ---------------- الإعدادات (تُحفظ في المتصفح) ---------------- */
const settings = { volume: 1, voice: true, text: true, big: false };
try { Object.assign(settings, JSON.parse(localStorage.getItem('nazih-settings') || '{}')); } catch {}
if (params.get('kiosk')) settings.text = false;
function saveSettings() { try { localStorage.setItem('nazih-settings', JSON.stringify(settings)); } catch {} }
function applySettings() {
  document.body.classList.toggle('no-text', !settings.text);
  document.body.classList.toggle('big', !!settings.big);
  if (gainNode) gainNode.gain.value = settings.volume;
  $('#setVol').value = settings.volume; $('#setVoice').checked = settings.voice; $('#setText').checked = settings.text; $('#setBig').checked = !!settings.big;
}

/* ---------------- الصوت ---------------- */
let audioCtx = null, analyser = null, gainNode = null, timeArr = null, freqArr = null, currentSrc = null;
let talking = false, fakeTalk = false, micLevel = 0;

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.55;
    timeArr = new Uint8Array(analyser.fftSize); freqArr = new Uint8Array(analyser.frequencyBinCount);
    gainNode = audioCtx.createGain(); gainNode.gain.value = settings.volume;
    analyser.connect(gainNode); gainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function setTalking(on, fake = false) { talking = on; fakeTalk = on && fake; app.classList.toggle('talking', on); }

/* =========================================================
 *  الشخصية: الخلفية ثابتة تماماً، والحركة للرأس فقط
 *  - الفك ينزل والشفة السفلى تتمدد معه، والشفة العليا ترتفع قليلاً
 *  - داخل الفم: أسنان عليا، لسان، وأسنان سفلى عند الفتحة الواسعة
 *  - عرض الفم يتغير مع نوع الصوت (ضيق مع الحروف المضمومة، أعرض مع المفتوحة)
 * ========================================================= */
const cv = $('#cv'), ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const img = new Image();
const HB = (() => { const h = FACE.head; const x = Math.max(0, Math.round(h.cx - h.rx)), y = Math.max(0, Math.round(h.cy - h.ry));
  return { x, y, w: Math.min(W, Math.round(h.cx + h.rx)) - x, h: Math.min(H, Math.round(h.cy + h.ry)) - y }; })();
const work = document.createElement('canvas'); work.width = HB.w; work.height = HB.h;
const wctx = work.getContext('2d');
const mask = document.createElement('canvas'); mask.width = HB.w; mask.height = HB.h;
let mouthOpen = 0, mouthWide = 1, voiceLevel = 0, blinkT = -1, nextBlink = performance.now() + 2500, bgDrawn = false;

function buildMask() {
  const m = mask.getContext('2d'), h = FACE.head;
  m.save(); m.translate(h.cx - HB.x, h.cy - HB.y); m.scale(1, h.ry / h.rx);
  const g = m.createRadialGradient(0, 0, h.rx * 0.62, 0, 0, h.rx);
  g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
  m.fillStyle = g; m.fillRect(-h.rx, -h.rx * 2, h.rx * 2, h.rx * 4); m.restore();
}

function readVoice(t) {
  let open = 0, wide = 1, level = 0;
  if (talking && analyser && !fakeTalk) {
    analyser.getByteTimeDomainData(timeArr);
    let s = 0; for (let i = 0; i < timeArr.length; i++) { const v = (timeArr[i] - 128) / 128; s += v * v; }
    const rms = Math.sqrt(s / timeArr.length);
    open = Math.min(1, Math.max(0, (rms - 0.012) * 7.5));
    analyser.getByteFrequencyData(freqArr);
    const hz = audioCtx.sampleRate / analyser.fftSize, band = (a, b) => { let x = 0, n = 0; for (let i = Math.round(a / hz); i < Math.round(b / hz); i++) { x += freqArr[i]; n++; } return x / (n || 1); };
    const lo = band(250, 900), hi = band(1800, 4500);
    wide = 0.8 + Math.min(1, (hi / (lo + hi + 1)) * 2.4) * 0.34;      // 0.80 (مضموم) … 1.14 (مفتوح عريض)
    level = Math.min(1, rms * 6);
  } else if (fakeTalk || TEST === '1') {
    open = (Math.sin(t / 95) * 0.5 + 0.5) * (Math.sin(t / 640) > -0.35 ? 1 : 0) * (0.55 + 0.45 * Math.sin(t / 233));
    wide = 0.95 + 0.17 * Math.sin(t / 410); level = open * 0.7;
  }
  if (TEST === 'open') { open = 1; wide = 1; }
  voiceLevel += (level - voiceLevel) * 0.4;
  mouthOpen += (open - mouthOpen) * (open > mouthOpen ? 0.5 : 0.28);
  mouthWide += (wide - mouthWide) * 0.25;
}

/* يرسم الوجه (فم + رمش) داخل لوحة الرأس بإحداثيات الصورة */
function drawFace(c, t) {
  const d = mouthOpen * FACE.maxOpen;
  if (d > 0.35) {
    const { x0, x1, yBottom } = FACE.jaw, top = FACE.mouthY, mx = FACE.mouthX;
    const hw = FACE.mouthHalfW * mouthWide, spread = (x1 - x0) / 2, K = 26, U = 18;
    const drop = (x) => { const u = Math.abs(x - mx) / spread; return u >= 1 ? 0 : d * Math.pow(Math.cos(u * Math.PI / 2), 1.5); };       // نزول الفك
    const gapF = (x) => { const u = Math.abs(x - mx) / hw; return u >= 1 ? 0 : Math.pow(Math.cos(u * Math.PI / 2), 1.05); };                 // شكل فتحة الفم
    const lift = (x) => d * 0.14 * gapF(x);                                                                                               // ارتفاع الشفة العليا
    for (let x = x0; x < x1; x++) {
      const dx = drop(x); if (dx < 0.05) continue;
      const gap = dx * gapF(x) * 0.92, st = dx - gap;
      // الشفة السفلى وما تحتها مباشرة: تنزل بمقدار الفتحة وتتمدد بالباقي (بدون تكرار بكسلات)
      c.drawImage(img, x, top, 1, K, x, top + gap, 1.5, K + st);
      // بقية الذقن واللحية: تنضغط حتى حد الفك
      c.drawImage(img, x, top + K, 1, yBottom - top - K, x, top + gap + K + st, 1.5, yBottom - top - K - dx);
      const l = lift(x);
      if (l > 0.2) c.drawImage(img, x, top - U, 1, U, x, top - U, 1.5, U - l);
    }
    // تجويف الفم
    const xa = mx - hw, xb = mx + hw;
    c.beginPath(); c.moveTo(xa, top);
    for (let x = xa; x <= xb; x += 2) c.lineTo(x, top - lift(x) - 0.5);
    for (let x = xb; x >= xa; x -= 2) c.lineTo(x, top + drop(x) * gapF(x) * 0.92 + 0.8);
    c.closePath();
    const cav = c.createLinearGradient(0, top - 3, 0, top + d);
    cav.addColorStop(0, 'rgb(38,10,12)'); cav.addColorStop(1, 'rgb(74,22,26)');
    c.fillStyle = cav; c.fill();
    c.save(); c.clip();
    // اللسان
    if (d > 5) { c.fillStyle = `rgba(178,82,88,${Math.min(0.75, (d - 5) / 9)})`; c.beginPath(); c.ellipse(mx, top + d * 0.98, hw * 0.6, d * 0.42, 0, 0, Math.PI * 2); c.fill(); }
    // الأسنان العليا
    const th = Math.min(4.6, d * 0.3);
    c.fillStyle = `rgba(238,231,222,${Math.min(0.8, d / 9)})`;
    c.beginPath(); c.ellipse(mx, top - d * 0.14 - 1.5, hw * 0.55, th + 1, 0, 0, Math.PI); c.fill();
    // الأسنان السفلى عند الفتحة الواسعة
    if (d > 9) { c.fillStyle = `rgba(226,220,212,${Math.min(0.7, (d - 9) / 8)})`; c.beginPath(); c.ellipse(mx, top + d * 0.94, hw * 0.5, 3.2, 0, Math.PI, 0); c.fill(); }
    // ظل تحت الشفة العليا
    const sh = c.createLinearGradient(0, top - 3, 0, top + 5); sh.addColorStop(0, 'rgba(0,0,0,.5)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sh; c.fillRect(xa, top - 4, hw * 2, 9);
    c.restore();
  }
  // رمش العين: الجفن ينزل فوق العين
  if (t > nextBlink && blinkT < 0) blinkT = t;
  let k = 0;
  if (blinkT >= 0) { const p = (t - blinkT) / 180; k = p < 0.5 ? p * 2 : 2 - p * 2; if (p >= 1) { blinkT = -1; nextBlink = t + 2200 + Math.random() * 3800; k = 0; } }
  if (TEST === 'blink') k = 1;
  if (k > 0.03) { c.globalAlpha = Math.min(1, k * 1.25); for (const e of eyePatches) c.drawImage(e.cv, e.x, e.y); c.globalAlpha = 1; }
}

// صورة «العين المغمضة»: جفن بلون الجلد المحيط بكل عين مع خط الرموش وحواف ناعمة
let eyePatches = [];
function buildEyePatches() {
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
  const tc = tmp.getContext('2d', { willReadFrequently: true }); tc.drawImage(img, 0, 0);
  eyePatches = FACE.eyes.map((e) => {
    const m = 4, mt = 1, x = Math.round(e.x - e.rx - m), y = Math.round(e.y - e.ry - mt),
      w = Math.round(e.rx * 2 + m * 2), h = Math.round(e.ry * 2 + mt + m + 2);
    const src = tc.getImageData(x, y, w, h).data;
    const pc = document.createElement('canvas'); pc.width = w; pc.height = h;
    const p = pc.getContext('2d'), out = p.createImageData(w, h);
    const avg = (yy, xx) => { let r = 0, g = 0, b = 0, n = 0;
      for (let dx = -4; dx <= 4; dx++) { const X = Math.min(w - 1, Math.max(0, xx + dx)); const i = (yy * w + X) * 4; r += src[i]; g += src[i + 1]; b += src[i + 2]; n++; }
      return [r / n, g / n, b / n]; };
    for (let xx = 0; xx < w; xx++) {
      const b = avg(h - 1, xx), a = [b[0] * 0.9, b[1] * 0.88, b[2] * 0.87];   // الجفن بلون الخد تحته، أغمق قليلاً من الأعلى
      for (let yy = 0; yy < h; yy++) {
        const f = Math.pow(yy / (h - 1), 1.2), i = (yy * w + xx) * 4;
        const shade = 0.96 + 0.04 * Math.sin(Math.PI * yy / h);          // انحناء الجفن
        out.data[i] = (a[0] * (1 - f) + b[0] * f) * shade; out.data[i + 1] = (a[1] * (1 - f) + b[1] * f) * shade;
        out.data[i + 2] = (a[2] * (1 - f) + b[2] * f) * shade; out.data[i + 3] = 255;
      }
    }
    p.putImageData(out, 0, 0);
    p.strokeStyle = 'rgba(38,24,20,0.55)'; p.lineWidth = 1.8; p.lineCap = 'round';   // خط الرموش
    p.beginPath(); p.ellipse(w / 2, mt + e.ry * 1.3, e.rx * 0.8, e.ry * 0.45, 0, 0.25, Math.PI - 0.25); p.stroke();
    p.globalCompositeOperation = 'destination-in';
    p.save(); p.translate(w / 2, h / 2); p.scale(1, h / w);
    const g = p.createRadialGradient(0, 0, w * 0.3, 0, 0, w / 2);
    g.addColorStop(0, '#000'); g.addColorStop(0.6, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
    p.fillStyle = g; p.fillRect(-w / 2, -w / 2, w, w); p.restore();
    return { cv: pc, x, y };
  });
}

function drawFrame(t) {
  readVoice(t);
  ctx.drawImage(img, 0, 0);                         // الاستديو: ثابت لا يتحرك
  // لوحة الرأس
  wctx.globalCompositeOperation = 'source-over';
  wctx.clearRect(0, 0, HB.w, HB.h);
  wctx.save(); wctx.translate(-HB.x, -HB.y);
  wctx.drawImage(img, HB.x, HB.y, HB.w, HB.h, HB.x, HB.y, HB.w, HB.h);
  drawFace(wctx, t);
  wctx.restore();
  wctx.globalCompositeOperation = 'destination-in'; wctx.drawImage(mask, 0, 0);
  // حركة خفيفة للرأس فقط (تنفس وإيماءة مع الكلام)
  const sp = talking ? 1 : 0;
  const dy = Math.sin(t / 1800) * 1.1 + sp * (Math.sin(t / 370) * 0.9 - mouthOpen * 1.6);
  const dxh = Math.sin(t / 2900) * 0.7;
  const rot = Math.sin(t / 2600) * 0.003 + sp * Math.sin(t / 540) * 0.0045;
  ctx.save();
  ctx.translate(FACE.pivot.x + dxh, FACE.pivot.y + dy); ctx.rotate(rot); ctx.translate(-FACE.pivot.x, -FACE.pivot.y);
  ctx.drawImage(work, HB.x, HB.y);
  ctx.restore();
  drawWave(t);
  requestAnimationFrame(drawFrame);
}
img.onload = () => { buildMask(); try { buildEyePatches(); } catch (e) { console.warn(e); } requestAnimationFrame(drawFrame); };
img.src = CONFIG.avatarImage;

/* ---------------- موجة الصوت حول المايك ---------------- */
const BARS = 22;
const waveBars = ['#waveR', '#waveL'].map((id, side) => {
  const box = $(id);
  return Array.from({ length: BARS }, (_, i) => {
    const s = document.createElement('span'); box.appendChild(s);
    return { s, near: side === 0 ? i / (BARS - 1) : 1 - i / (BARS - 1), ph: Math.random() * 6.28 };
  });
}).flat();
function drawWave(t) {
  const level = talking ? Math.max(voiceLevel, 0.15) : micLevel;
  for (const b of waveBars) {
    const env = 0.25 + 0.75 * Math.sin(b.near * Math.PI * 0.5 + 0.2) * (0.6 + 0.4 * Math.sin(b.near * 9));
    const wob = 0.55 + 0.45 * Math.sin(t / 110 + b.ph);
    const idle = 0.1 + 0.12 * env * (0.5 + 0.5 * Math.sin(t / 600 + b.ph));
    b.s.style.transform = `scaleY(${Math.min(1, idle + level * env * wob * 1.6).toFixed(3)})`;
  }
}

/* ---------------- شخصية D-ID الحية ----------------
   إذا اشتغل وسم D-ID في index.html يظهر الأفتار الحي مكان الصورة، وهو يتولى المايك والمحادثة،
   والأسئلة المتحركة تجعله ينطق إجاباتها الجاهزة. وإذا لم يشتغل (نطاق غير مسموح، انتهاء الرصيد، انقطاع)
   يبقى الموقع على الصورة المتحركة وصوت OpenAI كما كان. */
let did = null;
function initDID() {
  if (TEST && TEST !== 'did') return;
  const started = performance.now();
  const timer = setInterval(() => {
    const api = window.DID_AGENTS_API;
    if (api?.functions) {
      clearInterval(timer);
      did = api;
      document.body.classList.add('did-on');
      CONFIG.idleStatus = CONFIG.didStatus; setStatus(CONFIG.idleStatus);
      try {
        api.events?.on('agentActivity', ({ state }) => app.classList.toggle('talking', state === 'TALKING'));
        api.events?.on('error', ({ error }) => console.warn('D-ID:', error));
      } catch (e) { console.warn(e); }
    } else if (performance.now() - started > CONFIG.didWaitSeconds * 1000) clearInterval(timer);
  }, 300);
}

/* ---------------- النطق ---------------- */
const ttsCache = new Map();   // الإجابات الجاهزة تُحفظ بعد أول نطق فتصير فورية
function stopSpeaking() {
  if (did) { try { Promise.resolve(did.functions.interrupt()).catch(() => {}); } catch {} return; }
  if (currentSrc) { try { currentSrc.stop(); } catch {} currentSrc = null; }
  if (window.speechSynthesis) speechSynthesis.cancel();
  setTalking(false);
}
async function speak(text) {
  stopSpeaking();
  if (did) {
    if (!text) return;
    try { await did.functions.speak({ type: 'text', input: text }); }
    catch (e) { console.warn('D-ID speak:', e); setStatus('اضغط على نزيه في الأعلى لبدء المحادثة، ثم اختر السؤال', 'err'); }
    return;
  }
  if (!settings.voice || !text) return;
  try {
    ensureAudio();
    let buf = ttsCache.get(text);
    if (!buf) {
      const r = await fetch(`${CONFIG.apiBase}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (!r.ok) throw new Error('tts');
      buf = await audioCtx.decodeAudioData(await r.arrayBuffer());
      if (ttsCache.size > 40) ttsCache.delete(ttsCache.keys().next().value);
      ttsCache.set(text, buf);
    }
    await new Promise((res) => {
      const src = audioCtx.createBufferSource(); src.buffer = buf; src.connect(analyser);
      currentSrc = src; setTalking(true);
      setStatus('نزيه يتكلم... (اضغط المايك للمقاطعة)');
      src.onended = () => { if (currentSrc === src) { currentSrc = null; setTalking(false); } res(); };
      src.start();
    });
  } catch {
    // بديل: صوت المتصفح مع حركة فم تقريبية
    if (!window.speechSynthesis) return;
    await new Promise((res) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA'; u.volume = settings.volume;
      const v = speechSynthesis.getVoices().find((x) => x.lang?.startsWith('ar'));
      if (v) u.voice = v;
      const done = () => { setTalking(false); clearTimeout(guard); res(); };
      const guard = setTimeout(done, 4000 + text.length * 120);
      u.onstart = () => { setTalking(true, true); setStatus('نزيه يتكلم... (اضغط المايك للمقاطعة)'); };
      u.onend = u.onerror = done;
      speechSynthesis.speak(u);
    });
  }
}

/* ---------------- المحادثة ---------------- */
const capEl = $('#caption'), capQ = $('#capQ'), capA = $('#capA'), micBtn = $('#micBtn');
let history = [], busy = false, session = 0;

function setStatus(t, cls = '') {
  const s = $('#status'); s.textContent = t; s.className = `status ${cls}`;
  clearTimeout(setStatus.timer);
  if (did && cls === 'err') setStatus.timer = setTimeout(() => { s.className = 'status'; }, 5000);   // تنبيه مؤقت فوق الفيديو
}
function showCaption(q, a, thinking = false) {
  capEl.classList.toggle('asked', !!q);
  capQ.hidden = !q; capQ.textContent = q || '';
  if (thinking) capA.innerHTML = '<span class="dots" aria-label="نزيه يفكر"><i></i><i></i><i></i></span>'; else capA.textContent = a;
  capEl.scrollTop = 0;
  // مع شخصية D-ID: الإجابة المكتوبة تظهر مؤقتاً فوق الفيديو ثم تختفي
  clearTimeout(showCaption.timer);
  const visible = thinking || !!q || (!!a && a !== CONFIG.greeting);
  capEl.classList.toggle('show', visible);
  if (did && visible && !thinking) showCaption.timer = setTimeout(() => capEl.classList.remove('show'), Math.max(9000, String(a).length * 110));
}
capEl.addEventListener('click', () => { if (did) capEl.classList.remove('show'); });
function setBusy(on) { busy = on; micBtn.classList.toggle('busy', on); }

/* تحديد نية الزائر: يفتح الوظيفة المناسبة بدل الجواب النصي */
function detectIntent(text) {
  const n = norm(text), has = (...w) => w.some((x) => n.includes(x));
  if (has('اختبار', 'اختبرني', 'اختبر', 'مسابقه', 'كويز', 'امتحان', 'تحدي')) return 'quiz';
  if (has('تقييم', 'قيم', 'اقيم', 'رايي في', 'نجوم')) return 'rate';
  if (has('تصفح', 'اعرض النظام', 'نص النظام', 'مواد النظام', 'افتح الانظمه', 'الانظمه')) return 'laws';
  return null;
}
const INTENT_LINES = {
  quiz: 'أبشر، لنختبر معلوماتك في النزاهة. اختر الإجابة الصحيحة لكل سؤال.',
  rate: 'يسعدني رأيك. اختر عدد النجوم الذي يعبّر عن تجربتك.',
  laws: 'تفضّل، هذه الأنظمة ذات العلاقة. يمكنك البحث في مواد نظام الهيئة.',
};
function findBank(text) { const n = norm(text); return BANK.find((b) => norm(b.q) === n) || BANK.find((b) => b.k.some((k) => n.includes(k))); }

async function ask(text, item = null) {
  text = (text || '').trim();
  if (!text || busy) return;
  const my = session;
  stopSpeaking(); closeSheets();
  const intent = item ? null : detectIntent(text);
  if (intent) { runAction(intent, text); return; }

  setBusy(true);
  showCaption(text, '', true);
  history.push({ role: 'user', content: text });
  setStatus('نزيه يفكر...');
  let reply, suggestions = [], hit = item;
  if (!hit) {
    try {
      const r = await fetch(`${CONFIG.apiBase}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      const data = await r.json();
      if (!r.ok || !data.reply) throw new Error(data.error);
      reply = data.reply; suggestions = data.suggestions || [];
    } catch (e) {
      console.warn('chat fallback:', e?.message);
      hit = findBank(text);
      reply = hit ? hit.a : 'سؤال جميل! أنا الآن أعمل بالوضع المحدود، فاختر من الأسئلة الجاهزة أمامك، أو جرّب «اختبر نفسك».';
    }
  }
  if (hit) reply = hit.a;
  setBusy(false);
  if (my !== session) return;
  history.push({ role: 'assistant', content: reply }); history = history.slice(-10);
  showCaption(text, reply);
  if (suggestions.length) addFollowUps(suggestions);
  if (hit?.sheet) openSheet(hit.sheet);
  setStatus(CONFIG.idleStatus);
  await speak(reply);
  if (my === session && !recState && !busy && !did) setStatus(CONFIG.idleStatus);
}

async function runAction(name, said = '') {
  const my = session;
  stopSpeaking();
  if (name === 'quiz') startQuiz();
  openSheet(name);
  showCaption(said, INTENT_LINES[name]);
  setStatus(CONFIG.idleStatus);
  await speak(INTENT_LINES[name]);
  if (my === session && !recState && !busy) setStatus(CONFIG.idleStatus);
}

function newChat() {
  session++; stopSpeaking(); setBusy(false);
  history = []; showCaption('', CONFIG.greeting); setStatus(CONFIG.idleStatus);
}

$('#textForm').addEventListener('submit', (e) => {
  e.preventDefault(); ensureAudio();
  const v = $('#textInput').value; $('#textInput').value = ''; $('#textInput').blur();
  ask(v);
});

/* ---------------- الأسئلة المتحركة ---------------- */
const carousel = $('#carousel');
let followUps = [];
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const chipHTML = (c, cls = '') => `<button class="chip ${cls} ${c.cls || ''}" role="listitem" data-id="${escapeHTML(c.id)}"><svg viewBox="0 0 24 24">${ICONS[c.icon] || ICONS.spark}</svg><span>${escapeHTML(c.q)}</span></button>`;
function renderCarousel(reshuffle = false) {
  if (reshuffle || !renderCarousel.order) {
    // بطاقات الوظائف موزعة بين الأسئلة: الاختبار أولاً، ثم الأسئلة بترتيب متنوع كل مرة
    const qs = shuffle(BANK);
    renderCarousel.order = [ACTIONS[0], ...qs.slice(0, 4), ACTIONS[1], ...qs.slice(4, 9), ACTIONS[2], ...qs.slice(9)];
  }
  carousel.innerHTML = followUps.map((q, i) => chipHTML({ id: `ai:${i}`, icon: 'spark', q }, 'ai')).join('') + renderCarousel.order.map((c) => chipHTML(c)).join('');
  carousel.scrollTo({ left: 0 });
}
function addFollowUps(list) { followUps = list.slice(0, 2); renderCarousel(); }

// الضغط على بطاقة (مع تجاهل الضغط إذا كان سحباً)
let dragMoved = false;
carousel.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip'); if (!chip || dragMoved) return;
  ensureAudio(); buzz(12);
  const id = chip.dataset.id;
  if (id.startsWith('ai:')) return ask(followUps[Number(id.slice(3))]);
  if (ACTIONS.some((a) => a.id === id)) return runAction(id, '');
  const item = BANK.find((b) => b.id === id);
  if (item) ask(item.q, item);
});
// السحب بالماوس على الكمبيوتر (اللمس يعمل تلقائياً)
let dragX = null, dragLeft = 0;
carousel.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; dragX = e.clientX; dragLeft = carousel.scrollLeft; dragMoved = false; });
window.addEventListener('pointermove', (e) => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  if (Math.abs(dx) > 6) { dragMoved = true; carousel.classList.add('drag'); }
  if (dragMoved) carousel.scrollLeft = dragLeft - dx;
});
window.addEventListener('pointerup', () => { if (dragX === null) return; dragX = null; carousel.classList.remove('drag'); setTimeout(() => { dragMoved = false; }, 0); });
carousel.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { carousel.scrollLeft -= e.deltaY; e.preventDefault(); } }, { passive: false });
// اهتزاز خفيف عند الانتقال من بطاقة لأخرى
let lastSnap = 0;
carousel.addEventListener('scroll', () => {
  const w = carousel.firstElementChild?.offsetWidth || 1, i = Math.round(Math.abs(carousel.scrollLeft) / w);
  if (i !== lastSnap) { lastSnap = i; buzz(6); }
}, { passive: true });

/* ---------------- التسجيل الصوتي ---------------- */
let recState = null;
micBtn.addEventListener('click', () => {
  ensureAudio(); buzz(15);
  const wasTalking = talking;
  stopSpeaking();
  if (recState) { recState.stop(); return; }
  if (busy) return;
  if (wasTalking) setStatus(CONFIG.idleStatus);
  if (navigator.mediaDevices?.getUserMedia && window.MediaRecorder) startRecording();
  else startBrowserRecognition();
});

async function startRecording() {
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch { setStatus('لم أستطع الوصول للمايك — اسمح للمتصفح باستخدامه', 'err'); return; }

  const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
  const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  const chunks = [];
  const src = audioCtx.createMediaStreamSource(stream);
  const micAnalyser = audioCtx.createAnalyser(); micAnalyser.fftSize = 512; src.connect(micAnalyser);
  const buf = new Uint8Array(micAnalyser.frequencyBinCount);
  let heardSpeech = false, lastLoud = performance.now(), stopped = false;
  const startedAt = performance.now();
  const stop = () => { if (stopped) return; stopped = true; try { recorder.stop(); } catch {} };
  recState = { stop };

  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = async () => {
    stream.getTracks().forEach((t) => t.stop());
    src.disconnect(); recState = null; micLevel = 0;
    micBtn.classList.remove('listening');
    if (!heardSpeech) { setStatus('ما سمعتك، حاول مرة ثانية 😊', 'err'); return; }
    setStatus('جاري تحويل كلامك لنص...'); setBusy(true);
    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    try {
      const r = await fetch(`${CONFIG.apiBase}/api/stt`, { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setBusy(false);
      if (!data.text) { setStatus('ما فهمتك، حاول مرة ثانية 😊', 'err'); return; }
      ask(data.text);
    } catch (e) {
      console.warn('stt:', e?.message); setBusy(false);
      setStatus('تعذّر سماعك الآن — اختر من الأسئلة أو اكتب سؤالك 😊', 'err');
    }
  };

  const monitor = () => {
    if (stopped) return;
    micAnalyser.getByteTimeDomainData(buf);
    let sum = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
    const rms = Math.sqrt(sum / buf.length);
    micLevel += (Math.min(1, rms * 8) - micLevel) * 0.4;
    const now = performance.now();
    if (rms > 0.035) { heardSpeech = true; lastLoud = now; }
    if (heardSpeech && now - lastLoud > CONFIG.silenceMs) return stop();
    if (!heardSpeech && now - startedAt > 7000) return stop();
    if (now - startedAt > CONFIG.maxRecordSeconds * 1000) return stop();
    requestAnimationFrame(monitor);
  };
  recorder.start();
  micBtn.classList.add('listening');
  setStatus('أسمعك... تكلّم الآن', 'listening');
  monitor();
}

// بديل: التعرف على الكلام من المتصفح
function startBrowserRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { setStatus('المتصفح لا يدعم المايك — اكتب سؤالك بالأسفل', 'err'); return; }
  const rec = new SR();
  rec.lang = 'ar-SA'; rec.interimResults = false; rec.maxAlternatives = 1;
  recState = { stop: () => rec.stop() };
  micBtn.classList.add('listening');
  setStatus('أسمعك... تكلّم الآن', 'listening');
  rec.onresult = (e) => ask(e.results[0][0].transcript);
  rec.onend = () => { recState = null; micBtn.classList.remove('listening'); };
  rec.onerror = () => setStatus('ما فهمتك، حاول مرة ثانية 😊', 'err');
  rec.start();
}

/* ---------------- اللوحات ---------------- */
function openSheet(name) {
  $$('.sheet').forEach((s) => { s.hidden = s.id !== `sheet-${name}`; });
  const s = $(`#sheet-${name}`); if (s) { $('.sheet-body', s).scrollTop = 0; if (name === 'rate') resetRate(); }
}
function closeSheets() { $$('.sheet').forEach((s) => { s.hidden = true; }); }
$$('[data-close]').forEach((b) => b.addEventListener('click', () => { closeSheets(); buzz(8); }));

/* الأنظمة */
/* تقسيم نص نظام ملصوق في laws-extra.js إلى مواد أو بنود */
function parseLawText(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').map((l) => l.trimEnd());
  const ART = /^(ال)?مادة\s*[(\d\u0600-\u06FF\s)]{0,40}:?\s*$/;
  const ORD = /^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً)\s*:/;
  const HEAD = /^(الباب|الفصل)\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|الحادي)/;
  const byArticle = lines.some((l) => ART.test(l.trim()) && l.trim().length < 45);
  const arts = [], pre = []; let cur = null, chapter = '';
  for (const l of lines) {
    const s = l.trim();
    if (byArticle && HEAD.test(s) && s.length < 90) { chapter = s; cur = null; continue; }
    if (byArticle && ART.test(s) && s.length < 45) {
      cur = { title: s.replace(/:$/, '').replace(/\s+/g, ' ').replace(/^مادة\s*/, 'المادة '), chapter, body: [] }; arts.push(cur); continue;
    }
    if (!byArticle && ORD.test(s)) { cur = { title: 'البند ' + s.match(ORD)[1], chapter: '', body: [l] }; arts.push(cur); continue; }
    (cur ? cur.body : pre).push(l);
  }
  const join = (a) => a.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  arts.forEach((x) => { x.body = join(x.body); });
  return { preamble: join(pre), articles: arts };
}
(function mergeExtraLaws() {
  const all = window.LAWS || [], extra = (window.EXTRA_LAWS || []).map((e, i) => ({ id: 'extra-' + i, name: e.name || '', decree: e.decree || '', note: e.note || '', preLabel: 'تمهيد', ...parseLawText(e.text) }));
  const at = all.findIndex((l) => l.pages);            // الإضافات قبل اللوائح المصوّرة
  window.LAWS = at < 0 ? [...all, ...extra] : [...all.slice(0, at), ...extra, ...all.slice(at)];
})();

/* نمط بحث يتجاهل التشكيل واختلاف الهمزات والتاء المربوطة */
function searchRegex(q) {
  const map = { 'ا': '[اأإآ]', 'ه': '[هة]', 'ي': '[يى]' };
  const body = [...norm(q)].map((ch) => map[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\u064B-\u0652\u0640]*');
  return new RegExp(body, 'g');
}
function renderLaw(filter = '') {
  const box = $('#lawList'), laws = window.LAWS || [];
  let f = filter.trim(), re = f ? searchRegex(f) : null;
  const match = (a) => { re.lastIndex = 0; if (re.test(a.title)) return true; re.lastIndex = 0; return re.test(a.body); };
  const itemsOf = (law) => (law.preamble ? [{ title: law.preLabel || 'المرسوم الملكي وقرار مجلس الوزراء', chapter: '', body: law.preamble }] : []).concat(law.articles);
  if (f.startsWith('ال') && f.length > 3 && !laws.some((l) => itemsOf(l).some(match))) { f = f.slice(2); re = searchRegex(f); }   // «الثروة» ← «ثروة»
  const hl = (t) => { const safe = escapeHTML(t); return re ? safe.replace(re, (m) => `<mark>${m}</mark>`) : safe; };
  let total = 0;
  const html = laws.map((law) => {
    if (law.pages) {   // لائحة معروضة كصور صفحات (غير قابلة للبحث)
      if (f) return '';
      return `<details class="law pages" data-law="${law.id}">
        <summary><span class="law-name">${escapeHTML(law.name)}<small>${escapeHTML(law.decree)}</small></span><span class="badge">${law.pages.length} صفحة</span></summary>
        <div class="pages-box"></div></details>`;
    }
    const shown = itemsOf(law).filter((a) => !f || match(a));
    if (!shown.length) return '';
    total += shown.length;
    total += 0; const count = f ? `${shown.length} نتيجة` : `${law.articles.length} ${(law.articles[0]?.title || '').startsWith('البند') ? 'بنود' : 'مادة'}`;
    return `<details class="law" ${f ? 'open' : ''}>
      <summary><span class="law-name">${escapeHTML(law.name)}<small>${escapeHTML(law.decree)}${!law.decree || /هـ|م$/.test(law.decree) ? '' : 'هـ'}</small></span><span class="badge">${count}</span></summary>
      ${law.note ? `<p class="law-note">${escapeHTML(law.note)}</p>` : ''}
      <div class="articles">${shown.map((a) => `<details ${f ? 'open' : ''}><summary><span>${hl(a.title)}<span class="chapter">${escapeHTML(a.chapter || '')}</span></span></summary><div class="body">${hl(a.body)}</div></details>`).join('')}</div>
    </details>`;
  }).join('');
  box.innerHTML = html || '<p>لا توجد نتائج مطابقة.</p>';
  // صور الصفحات تُحمّل فقط عند فتح اللائحة
  $$('details.law.pages', box).forEach((d) => d.addEventListener('toggle', () => {
    const pb = $('.pages-box', d); if (!d.open || pb.childElementCount) return;
    const law = laws.find((l) => l.id === d.dataset.law);
    pb.innerHTML = law.pages.map((p, i) => `<img loading="lazy" src="${p}" alt="${escapeHTML(law.name)} — صفحة ${i + 1}">`).join('');
  }));
  $('#lawCount').textContent = f ? (total ? `${total} نتيجة في الأنظمة (اللوائح المصوّرة لا يشملها البحث)` : '') : `${laws.length} أنظمة ولوائح — اضغط على الاسم للعرض`;
}
renderLaw();
let lawTimer;
$('#lawSearch').addEventListener('input', (e) => { clearTimeout(lawTimer); lawTimer = setTimeout(() => renderLaw(e.target.value), 250); });

/* الاختبار التفاعلي */
let quiz = null;
function startQuiz() { quiz = { items: shuffle(window.QUIZ).slice(0, CONFIG.quizLength), i: 0, score: 0, picks: [] }; renderQuiz(); }
function renderQuiz() {
  const box = $('#quiz'), n = quiz.items.length;
  if (quiz.i >= n) {
    const pct = quiz.score / n;
    const msg = pct >= 0.8 ? 'ممتاز! أنت سفير للنزاهة' : pct >= 0.5 ? 'جيد! وتستطيع الوصول للعلامة الكاملة' : 'لا بأس، تصفّح الأنظمة وحاول مرة ثانية';
    box.innerHTML = `<div class="score">${quiz.score} / ${n}</div><p class="score-msg">${msg}</p>
      <div class="btn-row"><button class="btn" id="qAgain">اختبار جديد</button><button class="btn ghost" id="qShare">مشاركة النتيجة</button></div>
      <div class="review">${quiz.items.map((it, i) => `<div class="card"><b>${i + 1}. ${escapeHTML(it.q)}</b><br>
        <span class="${quiz.picks[i] === it.a ? 'ok' : 'no'}">${quiz.picks[i] === it.a ? 'إجابتك صحيحة' : 'إجابتك: ' + escapeHTML(it.o[quiz.picks[i]])}</span><br>
        الإجابة الصحيحة: ${escapeHTML(it.o[it.a])}<br><span class="meta">${escapeHTML(it.e)}</span></div>`).join('')}</div>`;
    $('#qAgain').onclick = () => { startQuiz(); $('#quiz').scrollTop = 0; };
    $('#qShare').onclick = async (e) => {
      const text = `حصلت على ${quiz.score} من ${n} في اختبار النزاهة مع «نزيه» — اليوم العالمي لمكافحة الفساد، جامعة حائل.`;
      try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); e.target.textContent = 'تم نسخ النتيجة'; } } catch {}
    };
    const line = `نتيجتك ${quiz.score} من ${n}. ${msg}.`;
    showCaption('', line); speak(line);
    return;
  }
  const it = quiz.items[quiz.i];
  box.innerHTML = `<div class="q-progress"><div style="width:${(quiz.i / n) * 100}%"></div></div>
    <div class="q-num">السؤال ${quiz.i + 1} من ${n}</div>
    <div class="q-text">${escapeHTML(it.q)}</div>
    <div class="q-opts">${it.o.map((o, i) => `<button class="q-opt" data-i="${i}">${escapeHTML(o)}</button>`).join('')}</div>
    <div id="qAfter"></div>`;
  $$('.q-opt', box).forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.i), ok = i === it.a;
    quiz.picks[quiz.i] = i; buzz(ok ? 12 : [20, 40, 20]);
    $$('.q-opt', box).forEach((x) => { x.disabled = true; if (Number(x.dataset.i) === it.a) x.classList.add('correct'); });
    if (ok) quiz.score++; else b.classList.add('wrong');
    $('#qAfter').innerHTML = `<div class="q-exp"><b>${ok ? 'إجابة صحيحة!' : 'الإجابة الصحيحة موضحة بالأخضر.'}</b>${escapeHTML(it.e)}</div>
      <button class="btn" id="qNext">${quiz.i + 1 < n ? 'السؤال التالي' : 'النتيجة'}</button>`;
    $('#qNext').onclick = () => { quiz.i++; renderQuiz(); $('#quiz').scrollTop = 0; };
    $('#qNext').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }));
}

/* التقييم (يُحفظ عدده في متصفح الشاشة فقط) */
function resetRate() { $('#rateMsg').textContent = 'كيف كانت تجربتك؟ اختر عدد النجوم.'; $$('#stars button').forEach((b) => b.classList.remove('on')); }
$$('#stars button').forEach((b) => b.addEventListener('click', () => {
  const v = Number(b.dataset.v); buzz(12);
  $$('#stars button').forEach((x) => x.classList.toggle('on', Number(x.dataset.v) <= v));
  try { const r = JSON.parse(localStorage.getItem('nazih-ratings') || '[0,0,0,0,0]'); r[v - 1]++; localStorage.setItem('nazih-ratings', JSON.stringify(r)); } catch {}
  $('#rateMsg').textContent = 'شكراً لك! رأيك يساعدنا على التطوير.';
  setTimeout(() => { if (!$('#sheet-rate').hidden) closeSheets(); }, 2200);
}));

/* ---------------- نافذة الإعدادات ---------------- */
const dlg = $('#settings');
$('#settingsBtn').addEventListener('click', () => { applySettings(); dlg.showModal(); });
$('#setClose').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('#setVol').addEventListener('input', (e) => { settings.volume = Number(e.target.value); saveSettings(); applySettings(); });
$('#setVoice').addEventListener('change', (e) => { settings.voice = e.target.checked; if (!settings.voice) stopSpeaking(); saveSettings(); });
$('#setText').addEventListener('change', (e) => { settings.text = e.target.checked; saveSettings(); applySettings(); });
$('#setBig').addEventListener('change', (e) => { settings.big = e.target.checked; saveSettings(); applySettings(); });
$('#setNew').addEventListener('click', () => { newChat(); closeSheets(); dlg.close(); });
$('#setFull').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); });

/* ---------------- الترحيب ---------------- */
const onboard = $('#onboard');
$('#startBtn').addEventListener('click', () => {
  ensureAudio(); buzz(15);
  onboard.hidden = true;
  if (did) return;                                  // شخصية D-ID ترحّب بنفسها عند بدء المحادثة
  speak(CONFIG.greeting).then(() => { if (!recState && !busy) setStatus(CONFIG.idleStatus); });   // نزيه يرحّب بصوته وفمه يتحرك
});

/* ---------------- إعادة الضبط عند الخمول (للشاشة التفاعلية) ---------------- */
let idleTimer;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (talking || busy || recState) return resetIdle();
    if (dlg.open) dlg.close();
    closeSheets(); newChat();
    followUps = []; renderCarousel(true);
    $('#lawSearch').value = ''; renderLaw();
    onboard.hidden = !CONFIG.showWelcome;
  }, CONFIG.idleResetSeconds * 1000);
}
['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, resetIdle));

/* ---------------- البداية ---------------- */
applySettings();
initDID();
renderCarousel(true);
showCaption('', CONFIG.greeting);
if (TEST || !CONFIG.showWelcome) onboard.hidden = true;
resetIdle();
