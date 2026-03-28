(function () {
  'use strict';

  var LOGIN_PAGE = 'admin-login.html';
  var TOKEN_KEY = 'lorettoAdminToken';
  var IDENTIFIER_KEY = 'lorettoAdminIdentifier';
  var RETURN_KEY = 'lorettoAdminReturnTo';
  var RESOLVED_API_BASE_KEY = 'lorettoAdminApiBase';
  var SHARED_API_BASE_KEY = 'loretto_api_base';
  var DEFAULT_REMOTE_ORIGIN = 'https://loretto-cbse-school.onrender.com';
  var path = window.location.pathname;
  var isLoginPage = /\/admin\/admin-login\.html$/i.test(path) || /\/admin-login\.html$/i.test(path);

  function normalizeOrigin(value) {
    return (value || '').replace(/\/+$/, '');
  }

  function injectAdminUiFixes() {
    if (document.getElementById('loretto-admin-ui-fixes')) return;

    var style = document.createElement('style');
    style.id = 'loretto-admin-ui-fixes';
    style.textContent = [
      '.ic:empty::before,.icon:empty::before,.ql-icon:empty::before{content:"•";display:inline-block;color:currentColor;opacity:.95;font-weight:800;}',
      '.sb-ic:empty::before,.sidebar-brand-icon:empty::before{content:"A";display:inline-flex;align-items:center;justify-content:center;color:var(--navy-deep,#062f2f);font-weight:800;line-height:1;}',
      '.modal-close:empty::before{content:"×";display:inline-block;font-size:1rem;font-weight:800;line-height:1;color:currentColor;}',
      'button.ab:empty::before{content:"E";display:inline-block;font-size:.62rem;font-weight:800;line-height:1;color:var(--navy-dark,#094f4f);}',
      'button.ab.del:empty::before{content:"×";font-size:.92rem;color:var(--red,#e74c3c);}',
      'button.ab.pub:empty::before{content:"P";font-size:.6rem;color:var(--green,#27ae60);}',
      'a.ab:empty::before{content:"V";display:inline-block;font-size:.62rem;font-weight:800;line-height:1;color:var(--navy-dark,#094f4f);}',
      '.act-btn:empty::before{content:"E";display:inline-flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;line-height:1;color:currentColor;}',
      '.act-btn.del:empty::before,.del-row:empty::before{content:"×";font-size:.95rem;color:var(--red,#e74c3c);}',
      '.ab:empty,.modal-close:empty,.act-btn:empty,.del-row:empty{color:inherit;}',
      '.ab:empty,.modal-close:empty,.ic:empty,.icon:empty,.ql-icon:empty,.act-btn:empty,.del-row:empty,.sb-ic:empty,.sidebar-brand-icon:empty{min-width:1em;min-height:1em;}'
    ].join('');
    document.head.appendChild(style);
  }

  function trimText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function inferControlLabel(el) {
    var title = (el.getAttribute('title') || '').toLowerCase();
    var aria = (el.getAttribute('aria-label') || '').toLowerCase();
    var onclick = (el.getAttribute('onclick') || '').toLowerCase();
    var classes = (el.className || '').toLowerCase();
    var text = (title + ' ' + aria + ' ' + onclick + ' ' + classes).trim();

    if (el.classList.contains('sb-ic') || el.classList.contains('sidebar-brand-icon')) return 'A';
    if (el.classList.contains('del') || el.classList.contains('del-row') || /delete|remove/.test(text)) return '×';
    if (el.classList.contains('pub') || /publish/.test(text)) return 'P';
    if (/preview|view|open|pdf|download/.test(text)) return 'V';
    if (/add|\+ row|new|create/.test(text)) return '+';
    if (/close/.test(text) || el.classList.contains('modal-close')) return '×';
    if (el.classList.contains('act-btn')) return 'E';
    if (/save|update/.test(text)) return 'S';
    if (/edit/.test(text)) return 'E';
    return '•';
  }

  function applyVisibleFallback(el) {
    if (!el || el.dataset.lorettoFixed === 'true') return;
    if (trimText(el.textContent)) return;

    var label = inferControlLabel(el);
    el.textContent = label;
    el.dataset.lorettoFixed = 'true';
    el.setAttribute('aria-label', el.getAttribute('aria-label') || el.getAttribute('title') || label);

    if (el.classList.contains('ab') || el.classList.contains('act-btn') || el.classList.contains('del-row')) {
      el.style.display = el.style.display || 'inline-flex';
      el.style.alignItems = el.style.alignItems || 'center';
      el.style.justifyContent = el.style.justifyContent || 'center';
      el.style.fontWeight = el.style.fontWeight || '800';
      el.style.lineHeight = el.style.lineHeight || '1';
      if (!el.style.color) {
        el.style.color = (el.classList.contains('del') || el.classList.contains('del-row'))
          ? 'var(--red, #e74c3c)'
          : 'var(--navy-dark, #094f4f)';
      }
    } else if (el.classList.contains('modal-close')) {
      el.style.display = el.style.display || 'inline-flex';
      el.style.alignItems = el.style.alignItems || 'center';
      el.style.justifyContent = el.style.justifyContent || 'center';
      el.style.fontWeight = el.style.fontWeight || '800';
      el.style.lineHeight = el.style.lineHeight || '1';
    } else if (
      el.classList.contains('ic') ||
      el.classList.contains('icon') ||
      el.classList.contains('ql-icon') ||
      el.classList.contains('sb-ic') ||
      el.classList.contains('sidebar-brand-icon')
    ) {
      el.style.display = el.style.display || 'inline-flex';
      el.style.alignItems = el.style.alignItems || 'center';
      el.style.justifyContent = el.style.justifyContent || 'center';
      el.style.fontWeight = el.style.fontWeight || '800';
    }
  }

  function repairAdminUi(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var selectors = [
      '.modal-close',
      'button.ab',
      'a.ab',
      '.act-btn',
      '.del-row',
      '.ic',
      '.icon',
      '.ql-icon',
      '.sb-ic',
      '.sidebar-brand-icon'
    ].join(',');

    scope.querySelectorAll(selectors).forEach(function (el) {
      applyVisibleFallback(el);
    });
  }

  function watchAdminUi() {
    if (window.__lorettoAdminUiObserver) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches('.modal-close,button.ab,a.ab,.act-btn,.del-row,.ic,.icon,.ql-icon,.sb-ic,.sidebar-brand-icon')) {
            applyVisibleFallback(node);
          }
          if (node.querySelectorAll) repairAdminUi(node);
        });
      });
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    window.__lorettoAdminUiObserver = observer;
  }

  function getCandidateApiBases() {
    var localRuntime = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    var candidates = [
      localRuntime ? window.location.origin : DEFAULT_REMOTE_ORIGIN,
      localRuntime ? DEFAULT_REMOTE_ORIGIN : window.location.origin,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ].map(normalizeOrigin);

    return candidates.filter(function (value, index, list) {
      return value && list.indexOf(value) === index;
    });
  }

  async function probeApiBase(base) {
    try {
      var res = await nativeFetch(base + '/api/health');
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok && res.status !== 200) return null;
      if (data && data.service === 'loretto-backend') {
        return {
          base: base,
          authConfigured: !!data.authConfigured,
          identifierConfigured: !!data.identifierConfigured
        };
      }
    } catch (err) {}
    return null;
  }

  async function resolveApiBase(forceRefresh) {
    var localRuntime = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    var cached = sessionStorage.getItem(RESOLVED_API_BASE_KEY);
    var cachedConfigured = sessionStorage.getItem(RESOLVED_API_BASE_KEY + '_ok') === 'true';
    
    if (cached && cachedConfigured && !forceRefresh) {
      return cached;
    }
 
    var candidates = getCandidateApiBases();
    var results = [];
    for (var i = 0; i < candidates.length; i++) {
      var result = await probeApiBase(candidates[i]);
      if (result) results.push(result);
    }
 
    var preferred = results.find(function (item) { return item.authConfigured; }) || results[0];
    var resolved = preferred ? preferred.base : normalizeOrigin(localRuntime ? window.location.origin : DEFAULT_REMOTE_ORIGIN);
    
    sessionStorage.setItem(RESOLVED_API_BASE_KEY, resolved);
    try {
      localStorage.setItem(SHARED_API_BASE_KEY, resolved + '/api');
      localStorage.setItem(SHARED_API_BASE_KEY + '_ok', 'true');
    } catch (storageErr) {}
    if (preferred && preferred.authConfigured) {
      sessionStorage.setItem(RESOLVED_API_BASE_KEY + '_ok', 'true');
    } else {
      sessionStorage.removeItem(RESOLVED_API_BASE_KEY + '_ok');
    }
    
    return resolved;
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function getIdentifier() {
    return sessionStorage.getItem(IDENTIFIER_KEY) || '';
  }

  function persistSession(token, identifier) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(IDENTIFIER_KEY, identifier || '');
    window.ADMIN_TOKEN = token;
    window.ADMIN_IDENTIFIER = identifier || '';
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(IDENTIFIER_KEY);
    window.ADMIN_TOKEN = '';
    window.ADMIN_IDENTIFIER = '';
  }

  function getReturnUrl() {
    return sessionStorage.getItem(RETURN_KEY) || 'admin-panel.html';
  }

  function setReturnUrl(url) {
    sessionStorage.setItem(RETURN_KEY, url);
  }

  function clearReturnUrl() {
    sessionStorage.removeItem(RETURN_KEY);
  }

  function redirectToLogin() {
    if (isLoginPage) return;
    var current = path.split('/').pop() || 'admin-panel.html';
    setReturnUrl(current + window.location.search + window.location.hash);
    window.location.replace(LOGIN_PAGE);
  }

  async function verifyToken(token, identifier) {
    if (!token) return { ok: false, authenticated: false };
    try {
      var apiBase = await resolveApiBase();
      var res = await nativeFetch(apiBase + '/api/health', {
        headers: {
          'x-admin-token': token,
          'x-admin-identifier': identifier || ''
        }
      });
      var data = await res.json().catch(function () { return {}; });
      return {
        ok: res.ok,
        authenticated: !!data.authenticated,
        authConfigured: !!data.authConfigured,
        identifierConfigured: !!data.identifierConfigured,
        apiBase: apiBase,
        data: data
      };
    } catch (err) {
      return { ok: false, authenticated: false, error: err };
    }
  }

  function withAuthHeaders(headers) {
    var finalHeaders = headers ? new Headers(headers) : new Headers();
    var token = getToken();
    var identifier = getIdentifier();
    if (token && !finalHeaders.has('x-admin-token')) {
      finalHeaders.set('x-admin-token', token);
    }
    if (identifier && !finalHeaders.has('x-admin-identifier')) {
      finalHeaders.set('x-admin-identifier', identifier);
    }
    return finalHeaders;
  }

  var nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var isRelativeApiRequest = /^\/api\//.test(url);
    var sameOriginAbsoluteApiRequest = url.indexOf(window.location.origin + '/api/') === 0;
    var isAbsoluteApiRequest = /\/api\//.test(url);
    var isApiRequest = isRelativeApiRequest || isAbsoluteApiRequest;
    if (!isApiRequest) {
      return nativeFetch(input, init);
    }

    return resolveApiBase().then(function (apiBase) {
      var resolvedUrl = url;
      if (isRelativeApiRequest) {
        resolvedUrl = apiBase + url;
      } else if (sameOriginAbsoluteApiRequest && apiBase !== normalizeOrigin(window.location.origin)) {
        resolvedUrl = url.replace(normalizeOrigin(window.location.origin), apiBase);
      }

      var nextInit = Object.assign({}, init || {});
      nextInit.headers = withAuthHeaders(nextInit.headers);
      return nativeFetch(resolvedUrl, nextInit).then(function (res) {
        if (res.status === 401 && !isLoginPage) {
          clearToken();
          redirectToLogin();
        }
        return res;
      });
    });
  };

  window.AdminAuth = {
    getToken: getToken,
    getIdentifier: getIdentifier,
    persistSession: persistSession,
    clearToken: clearToken,
    getReturnUrl: getReturnUrl,
    clearReturnUrl: clearReturnUrl,
    verifyToken: verifyToken,
    resolveApiBase: resolveApiBase,
    redirectToLogin: redirectToLogin,
    apiHeaders: function (base) {
      var headers = withAuthHeaders(base || {});
      var obj = {};
      headers.forEach(function (value, key) { obj[key] = value; });
      return obj;
    },
    logout: function () {
      clearToken();
      clearReturnUrl();
      window.location.replace(LOGIN_PAGE);
    }
  };

  window.ADMIN_TOKEN = getToken();
  window.ADMIN_IDENTIFIER = getIdentifier();
  window.apiHeaders = window.apiHeaders || function (base) {
    return window.AdminAuth.apiHeaders(base || { 'Content-Type': 'application/json' });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectAdminUiFixes();
      repairAdminUi(document);
      watchAdminUi();
    });
  } else {
    injectAdminUiFixes();
    repairAdminUi(document);
    watchAdminUi();
  }

  if (!isLoginPage) {
    var token = getToken();
    if (!token) {
      redirectToLogin();
      return;
    }

    verifyToken(token, getIdentifier()).then(function (result) {
      if (!result.authenticated) {
        clearToken();
        redirectToLogin();
      }
    });
  }
})();
