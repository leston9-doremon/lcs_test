/**
 * LORETTO CENTRAL SCHOOL — Shared Data Loader
 * Standardized data fetching and rendering for the frontend.
 */

/* ── API BASE RESOLUTION ── */
var API_BASE_KEY = 'loretto_api_base';
var ADMIN_API_BASE_KEY = 'lorettoAdminApiBase';
var TESTIMONIALS_CACHE_KEY = 'loretto_testimonials_cache';
var CONTACT_CONTENT_CACHE_KEY = 'loretto_homepage_contact_cache';
var DEFAULT_REMOTE_API = 'https://loretto-cbse-school.onrender.com/api';
var RESOLVED_API_BASE = sessionStorage.getItem(API_BASE_KEY) || localStorage.getItem(API_BASE_KEY) || '';

function isLocalRuntime() {
  var hostname = (window.location.hostname || '').toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

async function resolveApiBase() {
  console.log('[Loretto] Resolving API Base...');
  if (isLocalRuntime()) {
    RESOLVED_API_BASE = window.location.origin + '/api';
    window.RESOLVED_API_BASE = RESOLVED_API_BASE;
    try {
      sessionStorage.setItem(API_BASE_KEY, RESOLVED_API_BASE);
      localStorage.setItem(API_BASE_KEY, RESOLVED_API_BASE);
      sessionStorage.setItem(API_BASE_KEY + '_ok', 'true');
      localStorage.setItem(API_BASE_KEY + '_ok', 'true');
    } catch (storageErr) {}
    return RESOLVED_API_BASE;
  }

  if (window.RESOLVED_API_BASE) return window.RESOLVED_API_BASE;
  const adminBase = sessionStorage.getItem(ADMIN_API_BASE_KEY);
  const candidates = [
    adminBase ? adminBase + '/api' : '',
    sessionStorage.getItem(API_BASE_KEY) || '',
    localStorage.getItem(API_BASE_KEY) || '',
    DEFAULT_REMOTE_API,
    window.location.origin + '/api',
    'http://localhost:3000/api',
    'http://127.0.0.1:3000/api',
    'http://localhost:8000/api',
    'http://127.0.0.1:8000/api'
  ].filter(function (value, index, list) {
    return value && list.indexOf(value) === index;
  });

  for (const base of candidates) {
    try {
      const res = await fetch(base + '/health', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.service === 'loretto-backend') {
          RESOLVED_API_BASE = base;
          sessionStorage.setItem(API_BASE_KEY, base);
          sessionStorage.setItem(API_BASE_KEY + '_ok', 'true');
          try {
            localStorage.setItem(API_BASE_KEY, base);
            localStorage.setItem(API_BASE_KEY + '_ok', 'true');
          } catch (storageErr) {}
          return base;
        }
      }
    } catch (e) {
      // ignore probe failures
    }

    try {
      const contentRes = await fetch(base + '/homepage/contact', { method: 'GET' });
      if (contentRes.ok) {
        RESOLVED_API_BASE = base;
        sessionStorage.setItem(API_BASE_KEY, base);
        sessionStorage.setItem(API_BASE_KEY + '_ok', 'true');
        try {
          localStorage.setItem(API_BASE_KEY, base);
          localStorage.setItem(API_BASE_KEY + '_ok', 'true');
        } catch (storageErr) {}
        return base;
      }
    } catch (e) {
      // ignore probe failures
    }
  }
  
  // Fallback: stay local when the site itself is running locally.
  RESOLVED_API_BASE = isLocalRuntime() ? (window.location.origin + '/api') : DEFAULT_REMOTE_API;
  return RESOLVED_API_BASE;
}

/**
 * Generic Fetch Helper
 */
async function fetchData(endpoint) {
  try {
    const base = await resolveApiBase();
    console.log('[Loretto] Fetching:', `${base}/${endpoint}`);
    const response = await fetch(`${base}/${endpoint}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Could not load ${endpoint} data:`, error);
    return null;
  }
}

// ── DATA FETCHERS ──────────────────────────────────────────

function normalizeNewsImages(item) {
  var urls = [];
  if (item && item.image) urls.push(item.image);
  if (item && Array.isArray(item.images)) urls = urls.concat(item.images);
  return urls.map(function (url) {
    return String(url || '').trim();
  }).filter(Boolean).filter(function (url, index, list) {
    return list.indexOf(url) === index;
  });
}

function newsSortValue(item) {
  var dt = item && (item.updatedAt || item.createdAt || item.date) ? new Date(item.updatedAt || item.createdAt || item.date) : null;
  return dt && !isNaN(dt.getTime()) ? dt.getTime() : 0;
}

function getNewsItemId(item, fallbackIndex) {
  if (item && item._id != null) return String(item._id);
  if (item && item.id != null) return String(item.id);
  if (typeof fallbackIndex === 'number') return 'news-' + fallbackIndex;
  return '';
}

function buildNewsDetailUrl(item) {
  var itemId = getNewsItemId(item);
  return itemId ? '/news.html?news=' + encodeURIComponent(itemId) : '/news.html';
}

async function loadNewsData() {
  var items = await fetchData('news') || [];
  if (!Array.isArray(items)) return [];
  return items.slice().sort(function (a, b) {
    return newsSortValue(b) - newsSortValue(a);
  }).filter(function (item) {
    return item && item.visible !== false;
  }).map(function (item) {
    var images = normalizeNewsImages(item);
    return Object.assign({}, item, {
      images: images,
      image: images[0] || item.image || ''
    });
  });
}
async function loadFacultyData() { return await fetchData('faculty') || []; }
async function loadManagementData() { return await fetchData('management') || []; }
async function loadDocumentsData() { return await fetchData('documents') || []; }
function normalizeTestimonialText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function testimonialsMatch(a, b) {
  if (!a || !b) return false;
  if (a._id && b._id && a._id === b._id) return true;
  return normalizeTestimonialText(a.name) === normalizeTestimonialText(b.name)
    && normalizeTestimonialText(a.role) === normalizeTestimonialText(b.role)
    && normalizeTestimonialText(a.text) === normalizeTestimonialText(b.text);
}

async function loadTestimonialsData() {
  var apiItems = await fetchData('testimonials');
  var items = Array.isArray(apiItems) ? apiItems : [];
  var cachedItems = [];
  try {
    cachedItems = JSON.parse(localStorage.getItem(TESTIMONIALS_CACHE_KEY) || '[]');
    cachedItems = Array.isArray(cachedItems) ? cachedItems : [];
  } catch (storageErr) {
    cachedItems = [];
  }

  if (!items.length && cachedItems.length) {
    return cachedItems.slice().sort(function (a, b) {
      return newsSortValue(b) - newsSortValue(a);
    });
  }

  if (items.length && cachedItems.length) {
    return items.map(function (item) {
      var cached = cachedItems.find(function (entry) {
        return testimonialsMatch(entry, item);
      });
      return cached ? Object.assign({}, item, cached, { photo: item.photo || cached.photo || item.image || cached.image || '' }) : item;
    }).sort(function (a, b) {
      return newsSortValue(b) - newsSortValue(a);
    });
  }

  return items.slice().sort(function (a, b) {
    return newsSortValue(b) - newsSortValue(a);
  });
}
function splitContactList(value) {
  if (Array.isArray(value)) {
    return value.map(function (item) { return String(item || '').trim(); }).filter(Boolean);
  }
  return String(value || '')
    .split(/[|,]/)
    .map(function (item) { return item.trim(); })
    .filter(Boolean);
}

function normalizeContactData(payload) {
  var source = payload && payload.data && typeof payload.data === 'object' ? payload.data : payload;
  if (!source || typeof source !== 'object') return null;

  var phones = splitContactList(source.phones || source.phone);
  var emails = splitContactList(source.emails || source.email);
  var address = String(source.address || '').trim();
  var officeHours = String(source.officeHours || '').trim();
  var sundayHours = String(source.sundayHours || '').trim();
  var website = String(source.website || '').trim();
  var mapEmbedUrl = String(source.mapEmbedUrl || source.mapsEmbedUrl || '').trim();
  var hasUsefulData = address || phones.length || emails.length || officeHours || sundayHours || website || mapEmbedUrl;
  if (!hasUsefulData) return null;

  return Object.assign({}, source, {
    address: address,
    phone: String(source.phone || phones[0] || '').trim(),
    phones: phones,
    email: String(source.email || emails[0] || '').trim(),
    emails: emails,
    officeHours: officeHours,
    sundayHours: sundayHours,
    website: website,
    mapEmbedUrl: mapEmbedUrl,
    mapsEmbedUrl: mapEmbedUrl
  });
}

async function loadContactData() {
  var homepageContact = normalizeContactData(await fetchData('homepage/contact'));
  if (homepageContact) {
    try {
      localStorage.setItem(CONTACT_CONTENT_CACHE_KEY, JSON.stringify(homepageContact));
      sessionStorage.setItem(CONTACT_CONTENT_CACHE_KEY, JSON.stringify(homepageContact));
    } catch (writeErr) {}
    return homepageContact;
  }

  try {
    var cachedRaw = sessionStorage.getItem(CONTACT_CONTENT_CACHE_KEY) || localStorage.getItem(CONTACT_CONTENT_CACHE_KEY) || 'null';
    var cachedContact = normalizeContactData(JSON.parse(cachedRaw));
    if (cachedContact) return cachedContact;
  } catch (storageErr) {}

  return normalizeContactData(await fetchData('contact'));
}
async function loadAboutSection(section) { return await fetchData(`about/${section}`); }
async function loadSettingData(key) { return await fetchData(`settings/${key}`); }
async function loadContentBlock(key) { return await fetchData(`content/${key}`); }

// ── RENDERING HELPERS ──────────────────────────────────────

function formatDisplayDate(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function extractStructuredContent(data) {
  if (!data || typeof data !== 'object') return null;

  if (typeof data.html === 'string' && data.html.trim()) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.html, 'text/html');
    const heading = (doc.querySelector('h1, h2, h3') || {}).textContent || '';
    const paragraphs = Array.from(doc.querySelectorAll('p'))
      .map(node => (node.textContent || '').trim())
      .filter(Boolean);
    const features = Array.from(doc.querySelectorAll('li, .feat-item, .card, .pill'))
      .map(node => (node.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, 8);
    const image = (doc.querySelector('img') || {}).src || '';

    return {
      title: heading.trim(),
      paragraphs,
      features,
      image
    };
  }

  const paragraphs = Array.isArray(data.paragraphs)
    ? data.paragraphs.filter(Boolean)
    : [data.description, data.body, data.content].filter(Boolean);

  const featureSource = Array.isArray(data.features)
    ? data.features
    : Array.isArray(data.items)
      ? data.items
      : [];

  const features = featureSource
    .map(item => {
      if (!item) return '';
      if (typeof item === 'string') return item.trim();
      return (item.label || item.title || item.name || item.text || '').trim();
    })
    .filter(Boolean)
    .slice(0, 8);

  return {
    title: data.title || data.heading || data.name || '',
    subtitle: data.subtitle || data.tag || '',
    paragraphs,
    features,
    image: data.image || data.photo || data.bannerImage || ''
  };
}

async function renderNewsList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const news = await loadNewsData();
  
  if (news.length === 0) {
    container.innerHTML = '<div class="empty-msg">No news articles found.</div>';
    return;
  }

  container.innerHTML = news.map((item, index) => `
    <article class="news-card" id="news-item-${encodeURIComponent(getNewsItemId(item, index))}" data-news-id="${getNewsItemId(item, index)}">
      ${item.image
        ? `<button type="button" class="news-img-btn" aria-label="Open ${item.title || 'news article'}" onclick="openNewsModal(${JSON.stringify(item).replace(/"/g, '&quot;')})"><img src="${item.image}" class="news-img" alt="${item.title}"></button>`
        : `<button type="button" class="news-img-btn" aria-label="Open ${item.title || 'news article'}" onclick="openNewsModal(${JSON.stringify(item).replace(/"/g, '&quot;')})"><div class="news-img-placeholder n${(item.id % 6) + 1}"></div></button>`}
      <div class="news-body">
        <div class="news-meta">
          <span class="news-date">${formatDisplayDate(item.date)}</span>
          <span class="news-tag">${item.category || 'General'}</span>
        </div>
        <h3>${item.title || 'Untitled'}</h3>
        <p class="news-excerpt"><strong>Excerpt:</strong> ${item.excerpt || ''}</p>
        <button class="read-more-btn" onclick="openNewsModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
          Read Story 
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    </article>
  `).join('');
  
  if (container.style.display === 'none') container.style.display = 'grid';
  const loader = document.getElementById('news-loading');
  if (loader) loader.style.display = 'none';

  var selectedNewsId = new URLSearchParams(window.location.search).get('news');
  if (selectedNewsId) {
    var selectedItem = news.find(function (item, index) {
      return getNewsItemId(item, index) === selectedNewsId;
    });
    if (selectedItem) {
      var selectedCard = document.getElementById('news-item-' + encodeURIComponent(selectedNewsId));
      if (selectedCard) {
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      openNewsModal(selectedItem);
    }
  }
}

async function renderDocumentsList(containerId, filter = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;
  let docs = await loadDocumentsData();
  
  if (filter !== 'all') {
    docs = docs.filter(d => d.category === filter);
  }

  if (docs.length === 0) {
    container.innerHTML = '<div class="empty-msg">No documents found for this category.</div>';
    return;
  }

  container.innerHTML = docs.map(item => `
    <div class="doc-card">
      <div class="doc-icon"></div>
      <div class="doc-info">
        <div class="doc-category">${item.category || ''}</div>
        <div class="doc-title">${item.name || item.title || 'Untitled Document'}</div>
        <div class="doc-date">${formatDisplayDate(item.date)}</div>
        ${item.url ? `<a href="${item.url}" class="doc-download" target="_blank">Download</a>` : ''}
      </div>
    </div>
  `).join('');

  if (container.style.display === 'none') container.style.display = 'grid';
  const loader = document.getElementById('docs-loading');
  if (loader) loader.style.display = 'none';
}

async function renderFacultyList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const faculty = await loadFacultyData();
  
  if (faculty.length === 0) {
    container.innerHTML = '<div class="empty-msg">No faculty data available.</div>';
    return;
  }

  const getInitials = (name) =>
    name
      ? name
          .split(' ')
          .map((part) => part[0] || '')
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : '?';

  container.innerHTML = faculty.map(item => `
    <div class="faculty-card">
      ${item.photo
        ? `<img class="faculty-avatar faculty-avatar-photo" src="${item.photo}" alt="${item.name || 'Faculty member'}" />`
        : `<div class="faculty-avatar faculty-avatar-fallback">${getInitials(item.name)}</div>`
      }
      <div class="faculty-info">
        <h3 class="faculty-name">${item.name || ''}</h3>
        <p class="faculty-subject">${item.subject || ''}</p>
        <p class="faculty-qual">${item.qualification || ''}</p>
        <p class="faculty-exp">Experience: ${item.experience || '0'} Years</p>
      </div>
    </div>
  `).join('');
}

async function renderManagementList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const mgmt = await loadManagementData();
  
  if (mgmt.length === 0) {
    container.innerHTML = '<div class="empty-msg">No management data available.</div>';
    return;
  }

  container.innerHTML = mgmt.map(item => `
    <div class="mgmt-card">
      <h3>${item.name || ''}</h3>
      <p class="role">${item.designation || item.role || ''}</p>
      ${item.email ? `<p class="email">${item.email}</p>` : ''}
    </div>
  `).join('');
}

async function renderTestimonialsList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const testimonials = await loadTestimonialsData();
  
  if (testimonials.length === 0) {
    container.innerHTML = '<div class="empty-msg">No testimonials found.</div>';
    return;
  }

  container.innerHTML = testimonials.map(item => `
    <div class="testimonial-card">
      <div class="quote-icon">"</div>
      <p class="text">${item.text || ''}</p>
      <div class="meta">
        <strong>${item.name || ''}</strong>
        <span>${item.role || ''}</span>
        <div class="stars">${'★'.repeat(Math.max(0, Math.min(5, Number(item.rating) || 5)))}${'☆'.repeat(5 - Math.max(0, Math.min(5, Number(item.rating) || 5)))}</div>
      </div>
    </div>
  `).join('');
}

// ── MODAL HELPER for News ──────────────────────────────────

function openNewsModal(item) {
  if (typeof item === 'string') {
    const existingModal = document.getElementById(item);
    if (existingModal) {
      existingModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    return;
  }

  const gallery = Array.isArray(item.images) ? item.images.filter(Boolean) : (item.image ? [item.image] : []);
  const paragraphs = String(item.content || item.excerpt || '')
    .split(/\n\s*\n|\n/)
    .map(function (line) { return line.trim(); })
    .filter(Boolean)
    .map(function (line) { return `<p>${line}</p>`; })
    .join('');

  const modalHtml = `
    <div class="modal-overlay open" id="news-modal" onclick="if(event.target==this) closeNewsModal()">
      <div class="modal">
        <button class="modal-close" onclick="closeNewsModal()">×</button>
        ${item.image ? `<img src="${item.image}" class="modal-img" alt="${item.title}">` : `<div class="modal-img-placeholder n${(item.id % 6) + 1}"></div>`}
        <div class="modal-body">
          <div class="modal-meta">
            <span class="modal-date">${formatDisplayDate(item.date)}</span>
            <span class="modal-tag">${item.category || 'General'}</span>
          </div>
          <h2 class="modal-title">${item.title || ''}</h2>
          ${item.excerpt ? `<div class="modal-excerpt-highlight">${item.excerpt}</div>` : ''}
          <div class="modal-divider"></div>
          ${gallery.length > 1 ? `<div class="modal-gallery">${gallery.map(function (url) {
            return `<button type="button" class="modal-gallery-btn" onclick="openNewsImageViewer('${String(url).replace(/'/g, '&#39;')}')" aria-label="View image"><img src="${url}" class="modal-gallery-img" alt="${item.title || 'News image'}"></button>`;
          }).join('')}</div>` : ''}
          <div class="modal-content">
            ${paragraphs || '<p></p>'}
          </div>
          <div style="margin-top: 25px; pt: 15px; border-top: 1px solid #eee; text-align: center;">
            <a href="/news.html" style="color: var(--navy); font-size: 0.85rem; font-weight: 700; text-decoration: none;">View All News & Events →</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  let container = document.getElementById('modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-container';
    document.body.appendChild(container);
  }
  container.innerHTML = modalHtml;
  document.body.style.overflow = 'hidden';
}

function closeNewsModal(id) {
  if (id) {
    const existingModal = document.getElementById(id);
    if (existingModal) {
      existingModal.classList.remove('open');
      document.body.style.overflow = '';
    }
    return;
  }

  const modal = document.getElementById('news-modal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(() => {
      const container = document.getElementById('modal-container');
      if (container) container.innerHTML = '';
      document.body.style.overflow = '';
    }, 300);
  }
}

function openNewsImageViewer(url) {
  if (!url) return;
  var viewerHtml = `
    <div class="modal-overlay open" id="news-image-viewer" onclick="if(event.target==this) closeNewsImageViewer()">
      <div class="modal" style="max-width: 980px; background: transparent; box-shadow: none; overflow: visible;">
        <button class="modal-close" onclick="closeNewsImageViewer()">×</button>
        <img src="${url}" alt="News image" style="display:block; width:100%; max-height:88vh; object-fit:contain; border-radius:16px; background:#111;">
      </div>
    </div>
  `;

  var container = document.getElementById('modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-container';
    document.body.appendChild(container);
  }
  container.insertAdjacentHTML('beforeend', viewerHtml);
  document.body.style.overflow = 'hidden';
}

function closeNewsImageViewer() {
  var viewer = document.getElementById('news-image-viewer');
  if (viewer) viewer.remove();
  if (!document.getElementById('news-modal')) {
    document.body.style.overflow = '';
  }
}

window.resolveApiBase = resolveApiBase;
window.fetchData = fetchData;
window.loadNewsData = loadNewsData;
window.loadFacultyData = loadFacultyData;
window.loadManagementData = loadManagementData;
window.loadDocumentsData = loadDocumentsData;
window.loadTestimonialsData = loadTestimonialsData;
window.loadContactData = loadContactData;
window.loadAboutSection = loadAboutSection;
window.loadSettingData = loadSettingData;
window.loadContentBlock = loadContentBlock;
window.formatDisplayDate = formatDisplayDate;
window.getNewsItemId = getNewsItemId;
window.buildNewsDetailUrl = buildNewsDetailUrl;
window.extractStructuredContent = extractStructuredContent;
window.openNewsModal = openNewsModal;
window.closeNewsModal = closeNewsModal;
window.openNewsImageViewer = openNewsImageViewer;
window.closeNewsImageViewer = closeNewsImageViewer;
