(function () {
  'use strict';

  var CONTENT_KEY = 'mandatoryDisclosure.pages';
  var LOCAL_CACHE_KEY = 'loretto_content_' + CONTENT_KEY;
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

  function getDisclosurePageId() {
    var match = window.location.pathname.match(/\/(\d+)-[^/]+\.html$/);
    return match ? Number(match[1]) : null;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderKeyValueTable(rows, headers) {
    if (!Array.isArray(rows) || !rows.length) return '';
    var head = Array.isArray(headers) && headers.length
      ? headers.map(function (label) { return '<th>' + escapeHtml(label) + '</th>'; }).join('')
      : '<th>Particulars</th><th>Details</th>';

    return '<table class="info-table"><thead><tr>' + head + '</tr></thead><tbody>'
      + rows.map(function (row) {
        return '<tr>' + row.map(function (cell) {
          return '<td>' + escapeHtml(cell) + '</td>';
        }).join('') + '</tr>';
      }).join('')
      + '</tbody></table>';
  }

  function renderLinkTable(rows, headers) {
    if (!Array.isArray(rows) || !rows.length) return '';
    return '<table class="info-table"><thead><tr>'
      + headers.map(function (label) { return '<th>' + escapeHtml(label) + '</th>'; }).join('')
      + '</tr></thead><tbody>'
      + rows.map(function (row) {
        var cells = row.slice();
        if (cells[2]) {
          cells[2] = '<a href="' + escapeHtml(cells[2]) + '" style="color:var(--navy);font-weight:600;">View &#8594;</a>';
        }
        return '<tr>' + cells.map(function (cell, index) {
          return '<td>' + (index === 2 ? cell : escapeHtml(cell)) + '</td>';
        }).join('') + '</tr>';
      }).join('')
      + '</tbody></table>';
  }

  function renderPdfBox(page, documentsByCategory) {
    var category = page.pdfCategory;
    var pdfUrl = page.pdfUrl || (category && documentsByCategory[category] && documentsByCategory[category].url) || '';
    if (!pdfUrl) return '';

    var docTitle = page.title || 'Document';
    var docText = page.docText || 'Download or view the latest published document.';
    var downloadLabel = page.downloadLabel || 'Download PDF';
    var viewLabel = page.viewLabel || 'View Document';

    return '<div class="doc-display">'
      + '<div class="doc-icon"></div>'
      + '<h3>' + escapeHtml(docTitle) + '</h3>'
      + '<p>' + escapeHtml(docText) + '</p>'
      + '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'
      + '<a href="' + escapeHtml(pdfUrl) + '" target="_blank" class="btn-doc">'
      + '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M8 10L5 7m3 3 3-3M2 12v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + escapeHtml(downloadLabel)
      + '</a>'
      + '<a href="' + escapeHtml(pdfUrl) + '" target="_blank" class="btn-doc btn-doc-gold">'
      + '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2h12v12H2z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 8h6M5 5h6M5 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      + escapeHtml(viewLabel)
      + '</a>'
      + '</div>'
      + '</div>';
  }

  function buildFallbackPage(pageId, documentsByCategory) {
    var category = 'disclosure-' + pageId;
    var doc = documentsByCategory[category];
    if (!doc) return null;

    return {
      id: pageId,
      title: PAGE_TITLES[pageId] || doc.title || doc.name || 'Mandatory Disclosure',
      live: true,
      kind: 'document',
      description: doc.description || 'View the latest uploaded disclosure document.',
      pdfCategory: category,
      pdfUrl: doc.url || '',
      docText: 'Download or view the latest published document.'
    };
  }

  function hasRows(rows) {
    return Array.isArray(rows) && rows.some(function (row) {
      return Array.isArray(row) && row.some(function (cell) {
        return String(cell == null ? '' : cell).trim();
      });
    });
  }

  function hasPageContent(page, documentsByCategory) {
    if (!page || typeof page !== 'object') return false;

    var category = page.pdfCategory;
    var hasPdf = !!(page.pdfUrl || (category && documentsByCategory[category] && documentsByCategory[category].url));

    switch (page.kind) {
      case 'document':
        return !!(page.description || page.highlight || page.extraText || hasRows(page.details) || hasRows(page.extraTable) || hasPdf);
      case 'linkTable':
        return !!(page.intro || hasRows(page.generalInfo) || hasRows(page.documentLinks) || hasPdf);
      case 'calendar':
        return !!(page.intro || page.holidaysNote || hasRows(page.events) || hasPdf);
      case 'committee':
        return !!(page.intro || hasRows(page.rows) || hasPdf);
      case 'fee':
        return !!(hasRows(page.feeStructure) || hasRows(page.feeComponents) || hasRows(page.feePolicy) || hasPdf);
      case 'results':
        return !!(hasRows(page.boardResults) || hasRows(page.subjectResults) || hasPdf);
      case 'teachers':
        return !!(page.intro || hasRows(page.summary) || hasRows(page.subjectAllocation) || hasRows(page.qualifications) || hasPdf);
      default:
        return hasPdf;
    }
  }

  function normalizePage(pageId, page, documentsByCategory) {
    var fallback = buildFallbackPage(pageId, documentsByCategory);
    var source = page && typeof page === 'object' ? Object.assign({}, page) : null;

    if (!source) return fallback;
    if (!source.title && fallback && fallback.title) source.title = fallback.title;
    if ((!source.pdfUrl && !source.pdfCategory) && fallback) {
      source.pdfUrl = fallback.pdfUrl;
      source.pdfCategory = fallback.pdfCategory;
      source.docText = source.docText || fallback.docText;
    }

    if (!hasPageContent(source, documentsByCategory) && fallback) {
      return Object.assign({}, fallback, {
        live: source.live !== false
      });
    }

    return source;
  }

  function renderDocumentPage(page, documentsByCategory) {
    var html = '';
    if (page.description) html += '<p>' + escapeHtml(page.description) + '</p>';
    if (page.highlight) html += '<div class="highlight-box"><p>' + escapeHtml(page.highlight) + '</p></div>';
    html += renderPdfBox(page, documentsByCategory);
    if (Array.isArray(page.details) && page.details.length) {
      html += '<h3>Document Details</h3>' + renderKeyValueTable(page.details, ['Particulars', 'Details']);
    }
    if (page.extraHeading && Array.isArray(page.extraTable) && page.extraTable.length) {
      html += '<h3>' + escapeHtml(page.extraHeading) + '</h3>' + renderKeyValueTable(page.extraTable, page.extraHeaders);
    } else if (page.extraHeading && page.extraText) {
      html += '<h3>' + escapeHtml(page.extraHeading) + '</h3><p>' + escapeHtml(page.extraText) + '</p>';
    } else if (page.extraText) {
      html += '<p>' + escapeHtml(page.extraText) + '</p>';
    }
    return html;
  }

  function renderPageContent(page, documentsByCategory) {
    switch (page.kind) {
      case 'document':
        return renderDocumentPage(page, documentsByCategory);
      case 'linkTable':
        return '<p>' + escapeHtml(page.intro || '') + '</p>'
          + '<h3>A - General Information</h3>'
          + renderKeyValueTable(page.generalInfo || [], ['Sl. No.', 'Particulars', 'Details'])
          + '<h3>B - Documents & Information</h3>'
          + renderLinkTable(page.documentLinks || [], ['Sl. No.', 'Document', 'Link']);
      case 'calendar':
        return '<p>' + escapeHtml(page.intro || '') + '</p>'
          + renderPdfBox(page, documentsByCategory)
          + '<h3>Key Academic Events</h3>'
          + renderKeyValueTable(page.events || [], ['Event / Activity', 'Approx. Period', 'Remarks'])
          + (page.holidaysNote ? '<p>' + escapeHtml(page.holidaysNote) + '</p>' : '');
      case 'committee':
        return '<p>' + escapeHtml(page.intro || '') + '</p>'
          + renderPdfBox(page, documentsByCategory)
          + renderKeyValueTable(page.rows || [], page.headers || []);
      case 'fee':
        return renderPdfBox(page, documentsByCategory)
          + renderKeyValueTable(page.feeStructure || [], ['Class', 'Tuition Fee (per term)', 'Annual / Dev. Fee', 'Other Charges', 'Approx. Annual Total'])
          + '<h3>Fee Components</h3>' + renderKeyValueTable(page.feeComponents || [], ['Component', 'Description'])
          + '<h3>Payment Policy</h3>' + renderKeyValueTable(page.feePolicy || [], ['Particulars', 'Details']);
      case 'results':
        return renderPdfBox(page, documentsByCategory)
          + '<h3>Class X Board Results - Last 3 Years</h3>'
          + renderKeyValueTable(page.boardResults || [], ['Academic Year', 'Registered', 'Appeared', 'Passed', 'Pass %', 'Distinction / 90%+'])
          + '<h3>Subject-wise Performance (Latest Year)</h3>'
          + renderKeyValueTable(page.subjectResults || [], ['Subject', 'Average Marks / Grade', 'Pass %']);
      case 'teachers':
        return renderPdfBox(page, documentsByCategory)
          + renderKeyValueTable(page.summary || [], ['Particulars', 'Details'])
          + '<h3>Subject-wise Allocation</h3>' + renderKeyValueTable(page.subjectAllocation || [], ['Subject / Department', 'No. of Teachers', 'Level'])
          + '<h3>Qualifications Profile</h3>' + renderKeyValueTable(page.qualifications || [], ['Qualification', 'No. of Staff'])
          + (page.intro ? '<p>' + escapeHtml(page.intro) + '</p>' : '');
      default:
        return '<p>Disclosure content is not available yet.</p>';
    }
  }

  async function initMandatoryDisclosurePage() {
    var pageId = getDisclosurePageId();
    if (!pageId) return;

    try {
      var docs = typeof loadDocumentsData === 'function' ? await loadDocumentsData() : [];
      var documentsByCategory = {};
      (Array.isArray(docs) ? docs : []).forEach(function (doc) {
        if (doc && doc.category && doc.url) documentsByCategory[doc.category] = doc;
      });

      var data = null;
      try {
        if (typeof loadContentBlock === 'function') {
          var payload = await loadContentBlock(CONTENT_KEY);
          data = payload && payload.data ? payload.data : {};
          if (data && data.pages) {
            try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data)); } catch (writeErr) {}
          }
        }
      } catch (fetchErr) {
        try {
          data = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || 'null');
        } catch (storageError) {
          data = null;
        }
      }

      if (!data) {
        try {
          data = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || 'null');
        } catch (storageError) {
          data = null;
        }
      }

      var pages = data && data.pages ? data.pages : {};
      var page = normalizePage(pageId, pages[String(pageId)] || pages[pageId], documentsByCategory);
      if (!page || page.live === false) return;

      document.title = (page.title || 'Mandatory Disclosure') + ' | Loretto Central School';

      var titleEl = document.getElementById('disclosurePageTitle');
      if (titleEl) titleEl.textContent = page.title || 'Mandatory Disclosure';

      var crumbEl = document.getElementById('disclosureBreadcrumbTitle');
      if (crumbEl) crumbEl.textContent = page.title || 'Mandatory Disclosure';

      var container = document.getElementById('mandatoryDisclosureContent');
      if (container) {
        var html = renderPageContent(page, documentsByCategory);
        container.innerHTML = html && String(html).trim()
          ? html
          : '<div class="highlight-box"><p>Disclosure content is being updated. Please use the available document link below.</p></div>' + renderPdfBox(page, documentsByCategory);
      }
    } catch (e) {
      console.error('Failed to load mandatory disclosure page content', e);
    }
  }

  window.initMandatoryDisclosurePage = initMandatoryDisclosurePage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMandatoryDisclosurePage);
  } else {
    initMandatoryDisclosurePage();
  }
})();
