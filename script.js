// ================= CONFIG =================
const BOT_TOKEN = '8222694360:AAGooXpWi8TLOsw25N9iPMEmImU9TD0PvSs';
const CHAT_ID = '6712996693';

// ================= STATE =================
const state = {
  where: null,
  movieName: '',
  movieCinema: '',
  theaterName: '',
  theaterPlace: '',
  customWhere: '',
  after: null,
  afterCustom: '',
  company: null,
  invitePeople: [],
  inviteText: '',
  date: '',
  time: '',
  wishes: '',
};

// ================= SVG FALLBACK =================
function sealSVG() {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="93" rx="30" ry="3.5" fill="rgba(180,120,150,0.15)"/>
    <ellipse cx="18" cy="72" rx="6.5" ry="11" fill="#fff" stroke="#e8d5e0" stroke-width="1.5" transform="rotate(-25 18 72)"/>
    <ellipse cx="82" cy="72" rx="6.5" ry="11" fill="#fff" stroke="#e8d5e0" stroke-width="1.5" transform="rotate(25 82 72)"/>
    <ellipse cx="50" cy="66" rx="34" ry="26" fill="#fff" stroke="#e8d5e0" stroke-width="1.5"/>
    <circle cx="50" cy="38" r="22" fill="#fff" stroke="#e8d5e0" stroke-width="1.5"/>
    <circle cx="40" cy="42" r="3" fill="#ffd6e5" opacity="0.8"/>
    <circle cx="60" cy="42" r="3" fill="#ffd6e5" opacity="0.8"/>
    <circle cx="43" cy="35" r="3.5" fill="#2d2d2d"/>
    <circle cx="57" cy="35" r="3.5" fill="#2d2d2d"/>
    <circle cx="44" cy="34" r="1" fill="#fff"/>
    <circle cx="58" cy="34" r="1" fill="#fff"/>
    <ellipse cx="50" cy="42" rx="3" ry="2" fill="#2d2d2d"/>
    <line x1="42" y1="44" x2="34" y2="43" stroke="#c4a8b8" stroke-width="1" stroke-linecap="round"/>
    <line x1="42" y1="46" x2="34" y2="48" stroke="#c4a8b8" stroke-width="1" stroke-linecap="round"/>
    <line x1="58" y1="44" x2="66" y2="43" stroke="#c4a8b8" stroke-width="1" stroke-linecap="round"/>
    <line x1="58" y1="46" x2="66" y2="48" stroke="#c4a8b8" stroke-width="1" stroke-linecap="round"/>
  </svg>`;
}

function fillSealFallbacks() {
  document.querySelectorAll('.seal').forEach(el => {
    if (el.classList.contains('has-img')) return;
    if (!el.querySelector('svg')) {
      const wrap = document.createElement('div');
      wrap.innerHTML = sealSVG();
      el.insertBefore(wrap.firstChild, el.firstChild);
    }
  });
}

function buildFloatingSeals() {
  const wrap = document.getElementById('bg-seals');
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.className = 'float-seal';
    const size = 40 + Math.random() * 40;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = (Math.random() * 90) + '%';
    s.style.top = (Math.random() * 90) + '%';
    s.style.animationDuration = (12 + Math.random() * 8) + 's';
    s.style.animationDelay = (-Math.random() * 12) + 's';
    s.innerHTML = sealSVG();
    wrap.appendChild(s);
  }
}

// ================= TELEGRAM =================
async function sendTG(text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch (e) {
    console.warn('TG error:', e);
  }
}

// ================= NAV =================
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.dataset.screen === name);
  });
}

function showError(key, msg) {
  const el = document.querySelector(`[data-error-for="${key}"]`);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3500);
}

function flashTo(noticeName, duration, targetName) {
  showScreen(noticeName);
  setTimeout(() => showScreen(targetName), duration);
}

// ================= APPROVAL TOAST =================
function showApproval(callback) {
  const toast = document.getElementById('approval-toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    if (callback) setTimeout(callback, 280);
  }, 800);
}

// ================= AFTER: единый экран для кино / катка / театра =================
function goToAfter(fromScreen) {
  const titles = {
    ice:     'После катка — куда?',
    movie:   'После кино — куда?',
    theater: 'После театра — куда?',
  };
  const screen = document.querySelector('[data-screen="after"]');
  screen.querySelector('#after-title').textContent = titles[state.where] || 'Куда потом?';
  screen.querySelector('.back-btn').dataset.back = fromScreen;

  state.after = null;
  state.afterCustom = '';
  const customInput = screen.querySelector('#after-custom');
  customInput.value = '';
  customInput.classList.add('hidden');
  screen.querySelectorAll('.card[data-after]').forEach(c => c.classList.remove('selected'));

  showScreen('after');
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(fillSealFallbacks, 50);
  buildFloatingSeals();
  startClock();
  buildCalendar();
  wireBack();
  wireIntro();
  wireGreet();
  wireWhere();
  wireAfter();
  wireCompany();
  wireCalendarNext();
  wireTimeNext();
  wireWishes();
  wireFinal();
  wirePersonChecks();
});

// ================= BACK =================
function wireBack() {
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.back));
  });
}

// ================= INTRO =================
function wireIntro() {
  setTimeout(() => showScreen('greet'), 2200);
}

// ================= GREET =================
function wireGreet() {
  const yes = document.getElementById('yes-btn');
  const no = document.getElementById('no-btn');
  const noReaction = document.getElementById('no-reaction');
  let noClicked = false;

  yes.addEventListener('click', () => {
    sendTG('🦭 <b>Соня нажала «Да»</b> — пойдём гулять!');
    showScreen('where');
  });

  no.addEventListener('click', () => {
    if (noClicked) return;
    noClicked = true;
    no.style.display = 'none';
    noReaction.classList.remove('hidden');
    sendTG('😢 Соня нажала «Нет» (тюленьчик расстроился)');
  });
}

// ================= WHERE =================
function wireWhere() {
  document.querySelectorAll('.card[data-where]').forEach(card => {
    card.addEventListener('click', () => {
      const w = card.dataset.where;
      state.where = w;
      const names = { movie: 'Кино', ice: 'Каток', theater: 'Театр', custom: 'Свой вариант' };
      sendTG(`🗺 Соня выбрала: <b>${names[w]}</b>`);

      showApproval(() => {
        if (w === 'ice') goToAfter('where');
        else if (w === 'movie') showScreen('movie');
        else if (w === 'theater') showScreen('theater');
        else if (w === 'custom') showScreen('custom');
      });
    });
  });

  // Кино / Театр → после формы → экран "after"
  ['movie', 'theater'].forEach(screenName => {
    const btn = document.querySelector(`[data-screen="${screenName}"] [data-next="after"]`);
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (screenName === 'movie') {
        state.movieName = document.getElementById('movie-name').value.trim();
        state.movieCinema = document.getElementById('movie-cinema').value.trim();
        if (!state.movieName) return showError('movie', 'Напиши на какой фильм хочешь');
        sendTG(`🎬 Кино: <b>${state.movieName}</b>\n🏛 Кинотеатр: <b>${state.movieCinema || '—'}</b>`);
        goToAfter('movie');
      } else if (screenName === 'theater') {
        state.theaterName = document.getElementById('theater-name').value.trim();
        state.theaterPlace = document.getElementById('theater-place').value.trim();
        if (!state.theaterName) return showError('theater', 'Напиши на какой спектакль хочешь');
        sendTG(`🎭 Театр: <b>${state.theaterName}</b>\n📍 Где: <b>${state.theaterPlace || '—'}</b>`);
        goToAfter('theater');
      }
    });
  });

  // Свой вариант → сразу к компании через флеш
  const customBtn = document.querySelector('[data-screen="custom"] [data-next="notice1"]');
  if (customBtn) {
    customBtn.addEventListener('click', () => {
      state.customWhere = document.getElementById('custom-where').value.trim();
      if (!state.customWhere) return showError('custom', 'Напиши свой вариант');
      sendTG(`✨ Свой вариант: <b>${state.customWhere}</b>`);
      flashTo('notice1', 1800, 'company');
    });
  }
}

// ================= AFTER =================
function wireAfter() {
  const afterCustom = document.getElementById('after-custom');

  document.querySelectorAll('.card[data-after]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.card[data-after]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.after = card.dataset.after;

      if (card.dataset.after === 'custom') {
        afterCustom.classList.remove('hidden');
      } else {
        afterCustom.classList.add('hidden');
        const names = { park: 'Парк', city: 'Гулять по городу', river: 'Набережная', food: 'Кушать' };
        sendTG(`➡️ После: <b>${names[card.dataset.after]}</b>`);
      }

      // Тихое одобрение без задержки перехода
      showApproval();
    });
  });

  document.querySelector('[data-screen="after"] [data-next="notice1"]').addEventListener('click', () => {
    if (!state.after) return showError('after', 'Выбери куда пойдём после');
    if (state.after === 'custom') {
      state.afterCustom = afterCustom.value.trim();
      if (!state.afterCustom) return showError('after', 'Напиши свой вариант');
      sendTG(`➡️ После: <b>${state.afterCustom}</b>`);
    }
    flashTo('notice1', 1800, 'company');
  });
}

// ================= COMPANY =================
function wireCompany() {
  const inviteWrap = document.getElementById('invite-wrap');

  document.querySelectorAll('[data-company]').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.dataset.company;
      state.company = c;
      if (c === 'together') {
        sendTG('👫 Соня выбрала: <b>Только вдвоём</b>');
        flashTo('notice2', 1400, 'calendar');
      } else {
        sendTG('👥 Соня выбрала: <b>Позовём кого-то</b>');
        inviteWrap.classList.remove('hidden');
      }
    });
  });

  document.getElementById('invite-next').addEventListener('click', () => {
    const checked = Array.from(document.querySelectorAll('.person-check .cb:checked')).map(cb => cb.value);
    state.invitePeople = checked;
    state.inviteText = document.getElementById('invite-text').value.trim();
    let msg = `👥 Кого позвать: <b>${checked.join(', ') || '—'}</b>`;
    if (state.inviteText) msg += `\n➕ Ещё: <b>${state.inviteText}</b>`;
    sendTG(msg);
    flashTo('notice2', 1400, 'calendar');
  });
}

function wirePersonChecks() {
  document.querySelectorAll('.person-check .cb').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.person-check').classList.toggle('checked', cb.checked);
    });
  });
}

// ================= CALENDAR (30 октября → 30 ноября) =================
function buildCalendar() {
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const weekdays = ['вс','пн','вт','ср','чт','пт','сб'];

  const year = new Date().getFullYear();
  const start = new Date(year, 9, 30);
  const end   = new Date(year, 10, 30);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const btn = document.createElement('button');
    btn.className = 'cal-day';
    btn.innerHTML = `<span class="cal-num">${date.getDate()}</span><span class="cal-mon">${weekdays[date.getDay()]}</span>`;
    btn.dataset.pretty = `${date.getDate()} ${months[date.getMonth()]}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cal-day.selected').forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
      state.date = btn.dataset.pretty;
      sendTG(`📅 Соня выбрала дату: <b>${state.date}</b>`);
    });
    grid.appendChild(btn);
  }
}

function wireCalendarNext() {
  document.getElementById('cal-next').addEventListener('click', () => {
    if (!state.date) return showError('calendar', 'Выбери дату');
    document.getElementById('date-hint').textContent = `Дата: ${state.date}`;
    showScreen('time');
  });
}

// ================= TIME =================
function wireTimeNext() {
  document.getElementById('time-next').addEventListener('click', () => {
    const t = document.getElementById('time-input').value;
    if (!t) return showError('time', 'Выбери время');
    state.time = t;
    sendTG(`⏰ Время: <b>${t}</b>`);
    showScreen('wishes');
  });
}

// ================= WISHES =================
function wireWishes() {
  document.getElementById('wishes-next').addEventListener('click', () => {
    const w = document.getElementById('wishes-input').value.trim();
    state.wishes = w;
    if (w) sendTG(`💭 Пожелания: <b>${w}</b>`);
    buildRecap();
    showScreen('final');
  });
}

// ================= CLOCK =================
function startClock() {
  const el = document.getElementById('live-clock');
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const tick = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `Сейчас: ${now.getDate()} ${months[now.getMonth()]}, ${hh}:${mm}:${ss}`;
  };
  tick();
  setInterval(tick, 1000);
}

// ================= RECAP =================
function buildRecap() {
  const r = document.getElementById('recap');
  const whereNames = { movie: 'Кино', ice: 'Каток', theater: 'Театр', custom: 'Свой вариант' };
  const afterNames = { park: 'Парк', city: 'Гулять по городу', river: 'Набережная', food: 'Кушать', custom: state.afterCustom };
  const rows = [];
  rows.push(['Куда', whereNames[state.where] || '—']);
  if (state.where === 'movie') {
    rows.push(['Фильм', state.movieName || '—']);
    rows.push(['Кинотеатр', state.movieCinema || '—']);
  } else if (state.where === 'theater') {
    rows.push(['Спектакль', state.theaterName || '—']);
    rows.push(['Где', state.theaterPlace || '—']);
  } else if (state.where === 'custom') {
    rows.push(['Куда', state.customWhere || '—']);
  }
  if (state.after) rows.push(['После', afterNames[state.after] || '—']);
  const inviteList = [...state.invitePeople];
  if (state.inviteText) inviteList.push(state.inviteText);
  rows.push(['Компания', state.company === 'together' ? 'Вдвоём' : `Позовём: ${inviteList.join(', ') || '—'}`]);
  rows.push(['Дата', state.date || '—']);
  rows.push(['Время', state.time || '—']);
  if (state.wishes) rows.push(['Пожелания', state.wishes]);
  r.innerHTML = rows.map(([k, v]) => `<div class="recap-row"><span>${k}</span><span>${v}</span></div>`).join('');
}

// ================= FINAL =================
function wireFinal() {
  document.getElementById('final-btn').addEventListener('click', () => {
    const full = `🦭 <b>ПОЛНЫЙ ОТЧЁТ — СОНЯ</b>\n\n` +
      `Куда: ${state.where}\n` +
      (state.movieName   ? `Фильм: ${state.movieName}\n` : '') +
      (state.movieCinema ? `Кинотеатр: ${state.movieCinema}\n` : '') +
      (state.theaterName ? `Спектакль: ${state.theaterName}\n` : '') +
      (state.theaterPlace ? `Где: ${state.theaterPlace}\n` : '') +
      (state.customWhere ? `Свой вариант: ${state.customWhere}\n` : '') +
      (state.after       ? `После: ${state.after === 'custom' ? state.afterCustom : state.after}\n` : '') +
      `Компания: ${state.company}` +
      (state.invitePeople.length ? ` — ${state.invitePeople.join(', ')}` : '') +
      (state.inviteText ? ` + ${state.inviteText}` : '') + `\n` +
      `Дата: ${state.date}\nВремя: ${state.time}` +
      (state.wishes ? `\nПожелания: ${state.wishes}` : '');
    sendTG(full);
    document.getElementById('final-btn').style.display = 'none';
    document.getElementById('final-success').classList.remove('hidden');
  });

  document.getElementById('download-btn').addEventListener('click', downloadRecap);
}

// ================= DOWNLOAD AS IMAGE =================
async function downloadRecap() {
  if (typeof html2canvas === 'undefined') {
    return showError('final', 'Библиотека не загрузилась, проверь интернет');
  }

  const PADDING = 38;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: -9999px;
    padding: ${PADDING}px;
    background: linear-gradient(135deg, #ffe0ec 0%, #ffd0e2 50%, #ffc8dc 100%);
    font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    width: 340px;
    background: #ffffff;
    border-radius: 22px;
    padding: 22px 22px 18px;
    box-sizing: border-box;
    text-align: center;
    color: #2d2d2d;
  `;

  const sealImg = document.createElement('img');
  const sealLoaded = new Promise(resolve => {
    sealImg.onload  = () => resolve(true);
    sealImg.onerror = () => resolve(false);
  });
  sealImg.src = 'img/seal-happy.png';
  sealImg.style.cssText = `
    width: 110px; height: 110px; object-fit: contain;
    display: block; margin: 0 auto 10px;
  `;
  card.appendChild(sealImg);

  const heading = document.createElement('div');
  heading.textContent = 'Всё, договорились!';
  heading.style.cssText = 'font-size: 22px; font-weight: 700; margin-bottom: 14px;';
  card.appendChild(heading);

  document.querySelectorAll('#recap .recap-row').forEach(row => {
    const key = row.children[0].textContent;
    const val = row.children[1].textContent;
    const rowEl = document.createElement('div');
    rowEl.style.cssText = `
      display: flex; justify-content: space-between;
      gap: 10px; padding: 5px 0;
      font-size: 15px; line-height: 1.5;
    `;
    const kEl = document.createElement('span');
    kEl.textContent = key;
    kEl.style.color = '#a8798d';
    const vEl = document.createElement('span');
    vEl.textContent = val;
    vEl.style.cssText = 'font-weight: 600; text-align: right;';
    rowEl.appendChild(kEl);
    rowEl.appendChild(vEl);
    card.appendChild(rowEl);
  });

  wrapper.appendChild(card);
  document.body.appendChild(wrapper);

  try {
    const imgOk = await sealLoaded;
    if (!imgOk) sealImg.remove();

    await new Promise(r => setTimeout(r, 120));

    const canvas = await html2canvas(wrapper, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const datePart = state.date ? state.date.replace(/\s+/g, '-') : 'встреча';
    const link = document.createElement('a');
    link.download = `соня-${datePart}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    console.error('download error:', e);
    showError('final', 'Не получилось сохранить, попробуй ещё раз');
  } finally {
    wrapper.remove();
  }
}
