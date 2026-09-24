// ── Config ──
const API = 'https://evaad.onrender.com';

// ── Device identity ──
let DEVICE_ID = localStorage.getItem('evaad.device_id');
if (!DEVICE_ID) {
  DEVICE_ID = 'dev-' + Math.random().toString(36).slice(2, 8) + '-' + Date.now();
  localStorage.setItem('evaad.device_id', DEVICE_ID);
}

// ── Anonymous name generator ──
const ADJECTIVES = [
  'Curious','Brave','Calm','Wise','Gentle','Bold','Quiet','Bright',
  'Steady','Sage','Kind','Fair','Swift','Deep','Warm','Honest',
  'Nimble','Lucid','Eager','Patient','Humble','Earnest','True',
  'Vivid','Serene','Fierce','Tender','Keen','Sturdy','Radiant'
];
const ANIMALS = [
  'Falcon','Otter','Hawk','Bear','Owl','Heron','Fox','Deer',
  'Crane','Sparrow','Tiger','Panther','Mango','Peacock','Cobra',
  'Mynah','Kingfisher','Swan','Dolphin','Tortoise','Antelope',
  'Elephant','Leopard','Wolf','Raven','Lynx','Bison','Stork'
];
function makeAnonName() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return a + ' ' + b;
}

// ── i18n ──
const I18N = {
  en: {
    brand: 'evaad', tagline: 'See both sides.',
    feed: 'Debates', new: '+ New debate', lang: 'Language',
    for: 'For', against: 'Against', both: 'Both', vs: 'vs',
    addArgument: 'Add argument', askQuestion: 'Ask a debate question',
    questionPh: 'e.g. Should AI be allowed in classrooms?',
    cancel: 'Cancel', post: 'Post', writeArg: 'Write your argument…',
    footer: 'A balance-first debate space · See both sides.',
    noTopics: 'No debates yet. Start the first one!',
    error: 'Something went wrong. Please try again.',
    like: 'Like', liked: 'Liked', reply: 'Reply',
    seeFull: 'see full answer', seeLess: 'see less',
    today: 'Today', thisWeek: 'This week', thisMonth: 'This month', earlier: 'Earlier',
    yourQuestion: 'Your question', genre: 'Genre', region: 'Region', all: 'All',
    replySoon: 'Replies are coming in v0.5 — for now, post a counter on the other side.',
    sortHot: 'Hot', sortNew: 'New', sortTop: 'Top', sortControversial: 'Controversial',
    views: 'views', arguments: 'arguments', created: 'Created',
    topicCreated: 'Debate created!', topicError: 'Failed to create debate',
    argPosted: 'Argument posted!', argError: 'Failed to post argument',
    likeError: 'Failed to update like',
    noArgs: 'No arguments yet. Be the first to share your view!',
    loading: 'Loading debates...'
  },
  hi: {
    brand: 'evaad', tagline: 'दोनों पक्ष देखें।',
    feed: 'बहस', new: '+ नई बहस', lang: 'भाषा',
    for: 'पक्ष में', against: 'विरोध में', both: 'दोनों', vs: 'बनाम',
    addArgument: 'तर्क जोड़ें', askQuestion: 'एक बहस का सवाल पूछें',
    questionPh: 'उदाहरण: क्या AI को कक्षाओं में अनुमति दी जानी चाहिए?',
    cancel: 'रद्द करें', post: 'पोस्ट करें', writeArg: 'अपना तर्क लिखें…',
    footer: 'संतुलन-प्रथम बहस स्थल · दोनों पक्ष देखें',
    noTopics: 'अभी तक कोई बहस नहीं। पहली बहस शुरू करें!',
    error: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
    like: 'पसंद', liked: 'पसंद किया', reply: 'जवाब',
    seeFull: 'पूरा जवाब देखें', seeLess: 'कम देखें',
    today: 'आज', thisWeek: 'इस सप्ताह', thisMonth: 'इस महीने', earlier: 'पहले',
    yourQuestion: 'आपका सवाल', genre: 'श्रेणी', region: 'क्षेत्र', all: 'सभी',
    replySoon: 'जवाब v0.5 में आ रहे हैं — अभी के लिए, दूसरे पक्ष पर प्रतिवाद पोस्ट करें।',
    sortHot: 'हॉट', sortNew: 'नया', sortTop: 'शीर्ष', sortControversial: 'विवादास्पद',
    views: 'बार देखा गया', arguments: 'तर्क', created: 'बनाया गया',
    topicCreated: 'बहस बनाई गई!', topicError: 'बहस बनाने में विफल',
    argPosted: 'तर्क पोस्ट किया गया!', argError: 'तर्क पोस्ट करने में विफल',
    likeError: 'पसंद अपडेट करने में विफल',
    noArgs: 'अभी तक कोई तर्क नहीं। पहला तर्क साझा करने वाले आप बनें!',
    loading: 'बहस लोड हो रही हैं...'
  }
};

let LANG = localStorage.getItem('evaad.lang') || 'en';
let SORT = localStorage.getItem('evaad.sort') || 'hot';

function t(key) {
  return I18N[LANG][key] || I18N['en'][key] || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[LANG][key]) el.textContent = I18N[LANG][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (I18N[LANG][key]) el.placeholder = I18N[LANG][key];
  });
  document.getElementById('brand-tagline').textContent = t('tagline');
  if (CURRENT_TOPIC) renderChat();
}

// ── Toast notifications ──
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✗'}</span> ${escapeHtml(message)}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── State ──
let META = { genres: [], regions: [] };
let FILTER = { genre: null, region: null };
let CURRENT_TOPIC = null;
let SIDE_FILTER = 'both';
let COLLAPSED = new Set();
let NEW_GENRE = null;
let NEW_REGION = null;

// ── API helpers ──
async function api(path, opts = {}) {
  const url = API + path;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': DEVICE_ID,
      ...(opts.headers || {})
    },
    ...opts
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || t('error'));
  }
  return res.json();
}

// ── Render sort bar ──
function renderSortBar() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === SORT);
  });
}

// ── Render filter chips ──
function renderFilterChips() {
  const genreEl = document.getElementById('genre-chips');
  const regionEl = document.getElementById('region-chips');

  genreEl.innerHTML = '';
  const allGenre = document.createElement('button');
  allGenre.className = 'chip' + (FILTER.genre === null ? ' active' : '');
  allGenre.textContent = t('all');
  allGenre.onclick = () => { FILTER.genre = null; renderFilterChips(); loadTopics(); };
  genreEl.appendChild(allGenre);

  META.genres.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (FILTER.genre === g ? ' active' : '');
    btn.textContent = g;
    btn.onclick = () => { FILTER.genre = g; renderFilterChips(); loadTopics(); };
    genreEl.appendChild(btn);
  });

  regionEl.innerHTML = '';
  const allRegion = document.createElement('button');
  allRegion.className = 'chip' + (FILTER.region === null ? ' active' : '');
  allRegion.textContent = t('all');
  allRegion.onclick = () => { FILTER.region = null; renderFilterChips(); loadTopics(); };
  regionEl.appendChild(allRegion);

  META.regions.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (FILTER.region === r ? ' active' : '');
    btn.textContent = r;
    btn.onclick = () => { FILTER.region = r; renderFilterChips(); loadTopics(); };
    regionEl.appendChild(btn);
  });
}

// ── Render new topic chips ──
function renderNewChips() {
  const genreEl = document.getElementById('new-genre-chips');
  const regionEl = document.getElementById('new-region-chips');

  genreEl.innerHTML = '';
  META.genres.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (NEW_GENRE === g ? ' active' : '');
    btn.textContent = g;
    btn.onclick = () => { NEW_GENRE = g; renderNewChips(); };
    genreEl.appendChild(btn);
  });
  if (!NEW_GENRE && META.genres.length) NEW_GENRE = META.genres[0];

  regionEl.innerHTML = '';
  META.regions.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (NEW_REGION === r ? ' active' : '');
    btn.textContent = r;
    btn.onclick = () => { NEW_REGION = r; renderNewChips(); };
    regionEl.appendChild(btn);
  });
  if (!NEW_REGION && META.regions.length) NEW_REGION = META.regions[0];
}

// ── Shimmer loading skeleton ──
function renderShimmer(count = 4) {
  const list = document.getElementById('topic-list');
  list.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const li = document.createElement('li');
    li.className = 'topic-card';
    li.style.pointerEvents = 'none';
    li.innerHTML = `
      <div class="shimmer" style="height:20px;width:80%;margin-bottom:12px;border-radius:6px;"></div>
      <div class="shimmer" style="height:14px;width:40%;margin-bottom:12px;border-radius:6px;"></div>
      <div class="shimmer" style="height:6px;width:100%;border-radius:3px;"></div>
    `;
    list.appendChild(li);
  }
}

// ── Load topics ──
async function loadTopics() {
  const list = document.getElementById('topic-list');
  const countEl = document.getElementById('feed-count');
  renderShimmer();

  try {
    const params = new URLSearchParams();
    params.set('sort', SORT);
    if (FILTER.genre) params.set('genre', FILTER.genre);
    if (FILTER.region) params.set('region', FILTER.region);
    const data = await api('/topics?' + params.toString());

    list.innerHTML = '';
    countEl.textContent = data.topics ? `${data.topics.length} ${t('arguments')}` : '';

    if (!data.topics || data.topics.length === 0) {
      list.innerHTML = `<li class="empty-state"><div class="empty-state-icon">🌱</div>${t('noTopics')}</li>`;
      return;
    }

    data.topics.forEach((topic, idx) => {
      const li = document.createElement('li');
      li.className = 'topic-card';
      li.style.animationDelay = `${idx * 0.05}s`;

      const totalArgs = topic.for_count + topic.against_count;
      const forPct = totalArgs > 0 ? Math.round((topic.for_count / totalArgs) * 100) : 50;
      const againstPct = totalArgs > 0 ? 100 - forPct : 50;

      li.innerHTML = `
        <div class="topic-title">${escapeHtml(topic.title)}</div>
        <div class="topic-meta">
          <span class="meta-tag">${escapeHtml(topic.genre)}</span>
          <span class="meta-tag">${escapeHtml(topic.region)}</span>
        </div>
        <div class="balance-bar" title="${forPct}% For · ${againstPct}% Against">
          <div class="balance-for" style="width: ${forPct}%"></div>
          <div class="balance-against" style="width: ${againstPct}%"></div>
        </div>
        <div class="side-counts">
          <span class="for-count">${topic.for_count || 0} ${t('for')}</span>
          <span>·</span>
          <span class="against-count">${topic.against_count || 0} ${t('against')}</span>
          <span class="views-count">👁 ${topic.views || 0} ${t('views')}</span>
        </div>
      `;
      li.onclick = () => openTopic(topic.id);
      list.appendChild(li);
    });
  } catch (e) {
    list.innerHTML = `<li class="empty-state"><div class="empty-state-icon">⚠️</div>${t('error')}</li>`;
    console.error(e);
  }
}

// ── Open topic modal ──
async function openTopic(id) {
  try {
    const data = await api(`/topics/${id}`);
    CURRENT_TOPIC = data;
    SIDE_FILTER = 'both';
    COLLAPSED = new Set();

    const allArgs = [...(data.balanced.for || []), ...(data.balanced.against || [])];
    allArgs.forEach(a => {
      if (a.body.length > 280) COLLAPSED.add(a.id);
    });

    document.getElementById('topic-title').textContent = data.title;
    document.getElementById('topic-meta').textContent = `${data.genre} · ${data.region}`;

    // Stats
    const statsEl = document.getElementById('topic-stats');
    const totalArgs = (data.balanced.for_count || 0) + (data.balanced.against_count || 0);
    const totalLikes = allArgs.reduce((s, a) => s + (a.like_count || 0), 0);
    statsEl.innerHTML = `
      <span class="stat-pill for-pill"><span class="stat-dot"></span> ${data.balanced.for_count || 0} ${t('for')}</span>
      <span class="stat-pill against-pill"><span class="stat-dot"></span> ${data.balanced.against_count || 0} ${t('against')}</span>
      <span style="color:var(--muted);font-size:12px;">❤ ${totalLikes} · 👁 ${data.views || 0}</span>
    `;

    // Balance bar in modal
    const forPct = totalArgs > 0 ? Math.round((data.balanced.for_count / totalArgs) * 100) : 50;
    const againstPct = totalArgs > 0 ? 100 - forPct : 50;
    document.getElementById('modal-balance-for').style.width = forPct + '%';
    document.getElementById('modal-balance-against').style.width = againstPct + '%';

    // Reset side filter
    document.querySelectorAll('#side-filter .chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.side === 'both');
    });

    renderChat();
    document.getElementById('topic-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch (e) {
    showToast(t('error'), 'error');
    console.error(e);
  }
}

// ── Interleave by merit ──
function interleaveByMerit(forArr, againstArr) {
  const f = [...forArr];
  const a = [...againstArr];
  const result = [];

  let lead = 'for';
  if (f.length === 0) lead = 'against';
  else if (a.length === 0) lead = 'for';
  else {
    const fTop = f[0];
    const aTop = a[0];
    if (aTop.like_count > fTop.like_count) lead = 'against';
    else if (aTop.like_count === fTop.like_count && aTop.created_at < fTop.created_at) lead = 'against';
  }

  while (f.length || a.length) {
    if (lead === 'for') {
      if (f.length) result.push(f.shift());
      if (a.length) result.push(a.shift());
    } else {
      if (a.length) result.push(a.shift());
      if (f.length) result.push(f.shift());
    }
  }
  return result;
}

// ── Time bucket ──
function timeBucket(iso) {
  const then = new Date(iso);
  const now = new Date();
  const diff = (now - then) / 1000 / 3600;
  if (diff < 24) return 'today';
  if (diff < 168) return 'thisWeek';
  if (diff < 720) return 'thisMonth';
  return 'earlier';
}

// ── Render chat ──
function renderChat() {
  const chat = document.getElementById('chat');
  chat.innerHTML = '';

  if (!CURRENT_TOPIC || !CURRENT_TOPIC.balanced) return;

  const b = CURRENT_TOPIC.balanced;
  let args = [];

  if (SIDE_FILTER === 'for') {
    args = b.for || [];
  } else if (SIDE_FILTER === 'against') {
    args = b.against || [];
  } else {
    args = interleaveByMerit(b.for || [], b.against || []);
  }

  if (args.length === 0) {
    chat.innerHTML = `<div class="empty-state" style="padding:40px 20px;"><div class="empty-state-icon">💬</div>${t('noArgs')}</div>`;
    return;
  }

  const groups = {};
  args.forEach(a => {
    const bucket = timeBucket(a.created_at);
    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push(a);
  });

  const bucketOrder = ['today', 'thisWeek', 'thisMonth', 'earlier'];
  bucketOrder.forEach(bucket => {
    if (!groups[bucket]) return;

    const divider = document.createElement('div');
    divider.className = 'time-group';
    divider.textContent = t(bucket);
    chat.appendChild(divider);

    groups[bucket].forEach(a => {
      chat.appendChild(renderBubble(a));
    });
  });
}

// ── Render bubble ──
function renderBubble(a) {
  const div = document.createElement('div');
  div.className = 'bubble ' + a.side;

  const isCollapsed = COLLAPSED.has(a.id);
  const bodyClass = isCollapsed ? 'bubble-body collapsed' : 'bubble-body';
  const seeMoreText = isCollapsed ? t('seeFull') : t('seeLess');

  div.innerHTML = `
    <div class="bubble-header">
      <span class="bubble-tag">${a.side === 'for' ? t('for') : t('against')}</span>
      <span class="bubble-name">${makeAnonName()}</span>
      <span class="bubble-time">${formatTime(a.created_at)}</span>
    </div>
    <div class="${bodyClass}" id="body-${a.id}">${escapeHtml(a.body)}</div>
    ${a.body.length > 280 ? `<span class="see-more" data-id="${a.id}">${seeMoreText}</span>` : ''}
    <div class="bubble-footer">
      <button class="like-btn${a.liked_by_me ? ' liked' : ''}" data-id="${a.id}">
        <span class="like-icon">▲</span> ${a.liked_by_me ? t('liked') : t('like')} ${a.like_count || 0}
      </button>
      <button class="reply-btn" data-id="${a.id}">↩ ${t('reply')}</button>
    </div>
  `;

  const likeBtn = div.querySelector('.like-btn');
  likeBtn.onclick = async () => {
    const wasLiked = likeBtn.classList.contains('liked');
    const newCount = (a.like_count || 0) + (wasLiked ? -1 : 1);

    likeBtn.classList.toggle('liked');
    likeBtn.innerHTML = `<span class="like-icon">▲</span> ${wasLiked ? t('like') : t('liked')} ${newCount}`;

    try {
      const updated = await api(`/topics/${CURRENT_TOPIC.id}/arguments/${a.id}/like`, { method: 'POST' });
      a.like_count = updated.like_count;
      a.liked_by_me = updated.liked_by_me;
      likeBtn.innerHTML = `<span class="like-icon">▲</span> ${a.liked_by_me ? t('liked') : t('like')} ${a.like_count}`;
      likeBtn.classList.toggle('liked', a.liked_by_me);
    } catch (e) {
      likeBtn.classList.toggle('liked');
      likeBtn.innerHTML = `<span class="like-icon">▲</span> ${wasLiked ? t('liked') : t('like')} ${a.like_count || 0}`;
      showToast(t('likeError'), 'error');
      console.error(e);
    }
  };

  const replyBtn = div.querySelector('.reply-btn');
  replyBtn.onclick = () => showToast(t('replySoon'), 'success');

  const seeMore = div.querySelector('.see-more');
  if (seeMore) {
    seeMore.onclick = () => {
      const body = div.querySelector(`#body-${a.id}`);
      if (COLLAPSED.has(a.id)) {
        COLLAPSED.delete(a.id);
        body.classList.remove('collapsed');
        seeMore.textContent = t('seeLess');
      } else {
        COLLAPSED.add(a.id);
        body.classList.add('collapsed');
        seeMore.textContent = t('seeFull');
      }
    };
  }

  return div;
}

// ── Helpers ──
function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(LANG === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

// ── Event listeners ──
document.addEventListener('DOMContentLoaded', async () => {
  // Language
  const langSelect = document.getElementById('lang');
  langSelect.value = LANG;
  langSelect.onchange = () => {
    LANG = langSelect.value;
    localStorage.setItem('evaad.lang', LANG);
    applyI18n();
    renderFilterChips();
    renderSortBar();
  };

  // Sort
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.onclick = () => {
      SORT = btn.dataset.sort;
      localStorage.setItem('evaad.sort', SORT);
      renderSortBar();
      loadTopics();
    };
  });
  renderSortBar();

  // Meta
  try {
    META = await api('/meta');
  } catch (e) {
    console.error('Meta load failed', e);
  }

  renderFilterChips();
  loadTopics();
  applyI18n();

  // New topic modal
  const newModal = document.getElementById('new-modal');
  document.getElementById('new-topic-btn').onclick = () => {
    NEW_GENRE = META.genres[0] || null;
    NEW_REGION = META.regions[0] || null;
    renderNewChips();
    newModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
  document.getElementById('new-close').onclick = closeNewModal;
  document.getElementById('new-cancel').onclick = closeNewModal;

  function closeNewModal() {
    newModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.getElementById('new-form').onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    if (!title || !NEW_GENRE || !NEW_REGION) return;

    try {
      await api('/topics', {
        method: 'POST',
        body: JSON.stringify({ title, genre: NEW_GENRE, region: NEW_REGION })
      });
      document.getElementById('new-title').value = '';
      closeNewModal();
      showToast(t('topicCreated'));
      loadTopics();
    } catch (err) {
      showToast(t('topicError'), 'error');
    }
  };

  // Topic modal close
  document.getElementById('topic-close').onclick = closeTopicModal;

  function closeTopicModal() {
    document.getElementById('topic-modal').classList.add('hidden');
    document.body.style.overflow = '';
    CURRENT_TOPIC = null;
  }

  // Side filter
  document.querySelectorAll('#side-filter .chip').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#side-filter .chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      SIDE_FILTER = btn.dataset.side;
      renderChat();
    };
  });

  // Compose
  document.getElementById('compose').onsubmit = async (e) => {
    e.preventDefault();
    if (!CURRENT_TOPIC) return;

    const body = document.getElementById('compose-body').value.trim();
    const side = document.querySelector('input[name="side"]:checked').value;
    if (!body) return;

    try {
      await api(`/topics/${CURRENT_TOPIC.id}/arguments`, {
        method: 'POST',
        body: JSON.stringify({ side, body })
      });
      document.getElementById('compose-body').value = '';
      document.getElementById('compose-body').style.height = 'auto';
      showToast(t('argPosted'));

      const updated = await api(`/topics/${CURRENT_TOPIC.id}`);
      CURRENT_TOPIC = updated;
      const allArgs = [...(updated.balanced.for || []), ...(updated.balanced.against || [])];
      allArgs.forEach(a => {
        if (a.body.length > 280) COLLAPSED.add(a.id);
      });
      renderChat();
      loadTopics();
    } catch (err) {
      showToast(t('argError'), 'error');
    }
  };

  // Backdrop click close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.onclick = (e) => {
      if (e.target === modal) {
        if (modal.id === 'topic-modal') closeTopicModal();
        else if (modal.id === 'new-modal') closeNewModal();
      }
    };
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTopicModal();
      closeNewModal();
    }
  });

  // Auto-resize textarea
  const composeArea = document.getElementById('compose-body');
  composeArea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 140) + 'px';
  });
});
