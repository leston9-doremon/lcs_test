(function () {
  'use strict';

  var CONTENT_KEY = 'mandatoryDisclosure.overview';
  var LOCAL_CACHE_KEY = 'loretto_content_' + CONTENT_KEY;
  var PAGE_FILES = {
    1: '1-school-name-change-order.html',
    2: '2-affiliation-letter.html',
    3: '3-saras-mandatory-document.html',
    4: '4-building-plan.html',
    5: '5-affidavit.html',
    6: '6-building-safety.html',
    7: '7-land-certificate.html',
    8: '8-fire-safety.html',
    9: '9-deo-certificate.html',
    10: '10-recognition-renewal-certificate.html',
    11: '11-mandatory-disclosure-link.html',
    12: '12-no-objection-certificate.html',
    13: '13-lease-deed-certificate.html',
    14: '14-safe-drinking-water.html',
    15: '15-society-registration.html',
    16: '16-water-health-sanitation.html',
    17: '17-calendar.html',
    18: '18-management-committee.html',
    19: '19-pta-committee.html',
    20: '20-school-fee-structure.html',
    21: '21-sslc-results.html',
    22: '22-school-local-management-committee.html',
    23: '23-teachers-information.html'
  };
  var PAGE_TITLES = {
    1: 'School Name Change Order',
    2: 'Affiliation Letter',
    3: 'SARAS Mandatory Document',
    4: 'Building Plan',
    5: 'Affidavit',
    6: 'Building Safety Certificate',
    7: 'Land Certificate',
    8: 'Fire Safety Certificate',
    9: 'DEO Certificate',
    10: 'Recognition Renewal',
    11: 'Mandatory Disclosure Link',
    12: 'No Objection Certificate',
    13: 'Lease Deed Certificate',
    14: 'Safe Drinking Water Certificate',
    15: 'Society Registration',
    16: 'Water, Health & Sanitation',
    17: 'Academic Calendar',
    18: 'Management Committee',
    19: 'PTA Committee',
    20: 'Fee Structure',
    21: 'Board Results (3 Years)',
    22: 'Local Management Committee',
    23: 'Teachers Information'
  };

  function renderItems(items) {
    var grid = document.getElementById('mandatoryDisclosureGrid');
    if (!grid) return;

    if (!Array.isArray(items) || !items.length) {
      grid.innerHTML = '<div class="doc-card official" style="grid-column:1/-1;pointer-events:none;"><div class="doc-icon-box">i</div><div class="doc-title">No disclosure items published yet</div><div class="doc-desc">Save or publish the disclosure overview from the admin panel to show items here.</div></div>';
      return;
    }

    var visible = items.filter(function (item) {
      return item && item.live !== false;
    });

    grid.innerHTML = visible.map(function (item) {
      return '<a href="' + item.href + '" class="doc-card ' + (item.className || 'official') + '">'
        + '<div class="doc-icon-box">' + (item.icon || '📄') + '</div>'
        + '<div class="doc-title">' + (item.title || '') + '</div>'
        + '<div class="doc-desc">' + (item.description || '') + '</div>'
        + '</a>';
    }).join('');
  }

  function buildFallbackItems(documents) {
    var docs = Array.isArray(documents) ? documents : [];
    return docs
      .filter(function (doc) {
        return doc && doc.category && /^disclosure-\d+$/.test(doc.category) && doc.visible !== false;
      })
      .map(function (doc) {
        var id = Number(String(doc.category).replace('disclosure-', ''));
        if (!id || !PAGE_FILES[id]) return null;
        return {
          id: id,
          title: PAGE_TITLES[id] || doc.title || doc.name || 'Mandatory Disclosure',
          description: doc.description || 'View the latest uploaded disclosure document.',
          href: 'mandatory-disclosure/' + PAGE_FILES[id],
          className: 'official',
          icon: '📄',
          live: true
        };
      })
      .filter(Boolean)
      .sort(function (a, b) { return a.id - b.id; });
  }

  async function loadItems() {
    if (typeof loadContentBlock === 'function') {
      try {
        var payload = await loadContentBlock(CONTENT_KEY);
        var data = payload && payload.data ? payload.data : {};
        if (Array.isArray(data.items)) {
          try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data)); } catch (storageError) {}
          return data.items;
        }
      } catch (e) {}
    }

    try {
      var cached = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || 'null');
      if (cached && Array.isArray(cached.items)) return cached.items;
    } catch (e) {}

    try {
      if (typeof loadDocumentsData === 'function') {
        return buildFallbackItems(await loadDocumentsData());
      }
    } catch (e) {}

    return [];
  }

  async function initMandatoryDisclosureOverview() {
    var items = await loadItems();
    renderItems(items);
  }

  window.initMandatoryDisclosureOverview = initMandatoryDisclosureOverview;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMandatoryDisclosureOverview);
  } else {
    initMandatoryDisclosureOverview();
  }
})();
