function escapeActivityHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderActivityList(items) {
  return (items || []).map(function (item) {
    return '<li>' + escapeActivityHtml(item || '') + '</li>';
  }).join('');
}

function activitySlugFromPath() {
  var file = (window.location.pathname.split('/').pop() || '').replace(/\.html$/i, '');
  return file.replace(/^\d+-/, '');
}

document.addEventListener('DOMContentLoaded', async function () {
  if (typeof fetchData !== 'function') return;

  var slug = activitySlugFromPath();
  if (!slug) return;

  try {
    var item = await fetchData('activities-clubs/' + slug);
    var data = item && item.data ? item.data : null;
    if (!data || typeof data !== 'object') return;

    var hero = data.hero || {};
    var tiles = Array.isArray(data.infoTiles) ? data.infoTiles : [];
    var content = data.content || {};
    var section1 = content.section1 || {};
    var section2 = content.section2 || {};
    var noticeBox = content.noticeBox || {};

    var pageTitleEl = document.querySelector('.page-banner-content h1');
    if (pageTitleEl && hero.title) pageTitleEl.textContent = hero.title;

    var breadcrumbCurrent = document.querySelector('.breadcrumb span:last-child');
    if (breadcrumbCurrent && hero.title) breadcrumbCurrent.textContent = hero.title;

    if (hero.title) {
      document.title = hero.title + ' | Activities & Clubs | Loretto Central School';
    }

    var iconEl = document.querySelector('.ac-hero-icon');
    if (iconEl) iconEl.textContent = hero.icon || '';

    var badgeEl = document.querySelector('.ac-hero-badge');
    if (badgeEl && hero.badge) badgeEl.textContent = hero.badge;

    var heroTitleEl = document.querySelector('.ac-hero-text h2');
    if (heroTitleEl && hero.title) heroTitleEl.textContent = hero.title;

    var heroDescEl = document.querySelector('.ac-hero-text p');
    if (heroDescEl && hero.description) heroDescEl.textContent = hero.description;

    var tileEls = document.querySelectorAll('.ac-info-grid .ac-info-tile');
    tiles.slice(0, 3).forEach(function (tile, index) {
      var root = tileEls[index];
      if (!root) return;
      var labelEl = root.querySelector('.tile-label');
      var valueEl = root.querySelector('.tile-value');
      if (labelEl) labelEl.textContent = tile.label || '';
      if (valueEl) valueEl.textContent = tile.value || '—';
    });

    var headings = document.querySelectorAll('.content-card h3');
    var lists = document.querySelectorAll('.content-card ul');

    if (headings[0] && section1.heading) headings[0].textContent = section1.heading;
    if (lists[0] && Array.isArray(section1.items) && section1.items.length) {
      lists[0].innerHTML = renderActivityList(section1.items);
    }

    if (headings[1] && section2.heading) headings[1].textContent = section2.heading;
    if (lists[1] && Array.isArray(section2.items) && section2.items.length) {
      lists[1].innerHTML = renderActivityList(section2.items);
    }

    var existingNotice = document.querySelector('.content-card .notice-box');
    if (noticeBox.visible && noticeBox.text) {
      var noticeHtml = '<div class="notice-box"><p>' + escapeActivityHtml(noticeBox.text) + '</p></div>';
      if (existingNotice) {
        existingNotice.innerHTML = '<p>' + escapeActivityHtml(noticeBox.text) + '</p>';
      } else if (lists[1]) {
        lists[1].insertAdjacentHTML('afterend', noticeHtml);
      } else if (document.querySelector('.content-card')) {
        document.querySelector('.content-card').insertAdjacentHTML('beforeend', noticeHtml);
      }
    } else if (existingNotice) {
      existingNotice.remove();
    }
  } catch (error) {
    console.warn('Could not load activity/club content:', error);
  }
});
