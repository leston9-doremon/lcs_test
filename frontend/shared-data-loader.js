/**
 * LORETTO CENTRAL SCHOOL — Shared Data Loader
 * Standardized data fetching and rendering for the frontend.
 */

const API_BASE = window.location.hostname === 'localhost' ? '/api' : 'https://loretto-cbse-school.onrender.com/api';

/**
 * Generic Fetch Helper
 */
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Could not load ${endpoint} data:`, error);
    return null;
  }
}

// ── DATA FETCHERS ──────────────────────────────────────────

async function loadNewsData() { return await fetchData('news') || []; }
async function loadFacultyData() { return await fetchData('faculty') || []; }
async function loadManagementData() { return await fetchData('management') || []; }
async function loadDocumentsData() { return await fetchData('documents') || []; }
async function loadTestimonialsData() { return await fetchData('testimonials') || []; }
async function loadContactData() { return await fetchData('contact'); }

// ── RENDERING HELPERS ──────────────────────────────────────

async function renderNewsList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const news = await loadNewsData();
  
  if (news.length === 0) {
    container.innerHTML = '<div class="empty-msg">No news articles found.</div>';
    return;
  }

  container.innerHTML = news.map(item => `
    <article class="news-card">
      ${item.image ? `<img src="${item.image}" class="news-img" alt="${item.title}">` : `<div class="news-img-placeholder n${(item.id % 6) + 1}">📰</div>`}
      <div class="news-body">
        <div class="news-meta">
          <span class="news-date">${item.date || ''}</span>
          <span class="news-tag">${item.category || 'General'}</span>
        </div>
        <h3>${item.title || 'Untitled'}</h3>
        <p class="news-excerpt">${item.excerpt || ''}</p>
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
      <div class="doc-icon">📄</div>
      <div class="doc-info">
        <div class="doc-category">${item.category || ''}</div>
        <div class="doc-title">${item.name || item.title || 'Untitled Document'}</div>
        <div class="doc-date">${item.date || ''}</div>
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

  container.innerHTML = faculty.map(item => `
    <div class="faculty-card">
      <div class="faculty-info">
        <h3>${item.name || ''}</h3>
        <p class="subject">${item.subject || ''}</p>
        <p class="qual">${item.qualification || ''}</p>
        <p class="exp">Experience: ${item.experience || '0'} Years</p>
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
        <div class="stars">${'★'.repeat(item.rating || 5)}</div>
      </div>
    </div>
  `).join('');
}

// ── MODAL HELPER for News ──────────────────────────────────

function openNewsModal(item) {
  const modalHtml = `
    <div class="modal-overlay open" id="news-modal" onclick="if(event.target==this) closeNewsModal()">
      <div class="modal">
        <button class="modal-close" onclick="closeNewsModal()">✕</button>
        ${item.image ? `<img src="${item.image}" class="modal-img" alt="${item.title}">` : `<div class="modal-img-placeholder n${(item.id % 6) + 1}">📰</div>`}
        <div class="modal-body">
          <div class="modal-meta">
            <span class="modal-date">${item.date || ''}</span>
            <span class="modal-tag">${item.category || 'General'}</span>
          </div>
          <h2 class="modal-title">${item.title || ''}</h2>
          <div class="modal-divider"></div>
          <div class="modal-content">
            <p>${item.content || item.excerpt || ''}</p>
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

function closeNewsModal() {
  const modal = document.getElementById('news-modal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(() => {
      document.getElementById('modal-container').innerHTML = '';
      document.body.style.overflow = '';
    }, 300);
  }
}
