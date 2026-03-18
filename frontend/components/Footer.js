// ============================================================
//  Loretto Central School — Footer Component
//  Drop this script at the end of <body> in every HTML page.
//  Auto-detects depth for correct relative paths.
// ============================================================
(function () {

  function getRootPrefix() {
    var path = window.location.pathname;
    var parts = path.split('/').filter(Boolean);
    if (parts.length > 0 && parts[parts.length - 1].indexOf('.html') > -1) parts.pop();
    var prefix = '';
    for (var i = 0; i < parts.length; i++) prefix += '../';
    return prefix || './';
  }

  var R = getRootPrefix();

  async function loadContact() {
    try {
      const res = await fetch(R + 'api/contact');
      if (res.ok) return await res.json();
    } catch(e) {}
    return null;
  }

  /* ── HTML ── */
  var FOOTER_HTML = [
    '<footer id="lcs-footer">',
    '  <div class="container">',
    '    <div class="footer-main">',

    '      <!-- Brand -->',
    '      <div class="footer-brand">',
    '        <a class="footer-logo-wrap" href="' + R + 'index.html">',
    '          <img src="' + R + 'logo.png" alt="Loretto Central School Crest" style="width:52px;height:52px;border-radius:50%;border:2px solid var(--gold);object-fit:cover;" />',
    '          <div style="margin-left:12px;">',
    '            <div style="color:#fff;font-family:\'Playfair Display\',serif;font-size:1rem;font-weight:700;line-height:1.2;">Loretto Central School</div>',
    '            <div style="font-size:0.7rem;color:var(--gold-light);font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">CBSE Affiliated</div>',
    '          </div>',
    '        </a>',
    '        <p>Loretto Central School has been shaping young minds for over three decades. We are committed to delivering excellence in education with values, innovation, and care.</p>',
    '        <div class="social-links">',
    '          <a class="social-link" href="#" aria-label="Facebook" target="_blank" rel="noopener">',
    '            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    '          </a>',
    '          <a class="social-link" href="#" aria-label="Instagram" target="_blank" rel="noopener">',
    '            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    '          </a>',
    '          <a class="social-link" href="#" aria-label="Twitter" target="_blank" rel="noopener">',
    '            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    '          </a>',
    '          <a class="social-link" href="#" aria-label="YouTube" target="_blank" rel="noopener">',
    '            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0a3535"/></svg>',
    '          </a>',
    '        </div>',
    '      </div>',

    '      <!-- Quick Links -->',
    '      <div class="footer-col">',
    '        <h4>Quick Links</h4>',
    '        <ul>',
    '          <li><a href="' + R + 'index.html">Home</a></li>',
    '          <li><a href="' + R + 'about-us/1-school-profile.html">About Us</a></li>',
    '          <li><a href="' + R + 'admissions/1-admissions.html">Admissions</a></li>',
    '          <li><a href="' + R + 'academics/1-faculty.html">Academics</a></li>',
    '          <li><a href="' + R + 'news.html">News &amp; Events</a></li>',
    '          <li><a href="' + R + 'e-magazine.html">E-Magazine</a></li>',
    '          <li><a href="' + R + 'contact.html">Contact Us</a></li>',
    '        </ul>',
    '      </div>',

    '      <!-- Academics -->',
    '      <div class="footer-col">',
    '        <h4>Academics</h4>',
    '        <ul>',
    '          <li><a href="' + R + 'school-information/1-curriculum.html">Curriculum</a></li>',
    '          <li><a href="' + R + 'academics/1-faculty.html">Faculty</a></li>',
    '          <li><a href="' + R + 'school-information/6-facilities.html">Facilities</a></li>',
    '          <li><a href="' + R + 'academics/5-book-list.html">Book List</a></li>',
    '          <li><a href="' + R + 'academics/3-cbse-circulars.html">CBSE Circulars</a></li>',
    '          <li><a href="' + R + 'mandatory-disclosure.html">Mandatory Disclosure</a></li>',
    '        </ul>',
    '      </div>',

    '      <!-- Contact -->',
    '      <div class="footer-col">',
    '        <h4>Contact</h4>',
    '        <ul>',
    '          <li><a href="#">&#128205; Main Road, Bantwal, Karnataka</a></li>',
    '          <li><a href="tel:+919876543210">&#128222; +91 98765 43210</a></li>',
    '          <li><a href="mailto:info@school.edu">&#9993;&#65039; info@school.edu</a></li>',
    '          <li><a href="#">&#128336; Mon&#8211;Sat: 8:00 AM &#8211; 4:00 PM</a></li>',
    '          <li><a href="' + R + 'login/parent-login.html">&#128106; Parent Login Portal</a></li>',
    '        </ul>',
    '      </div>',

    '    </div>',

    '    <!-- Bottom bar -->',
    '    <div class="footer-bottom">',
    '      <span>&#169; <span id="lcs-footer-year"></span> Loretto Central School, Bantwal. All rights reserved. &nbsp;&#183;&nbsp; CBSE Affiliation No. 831368</span>',
    '      <div style="display:flex;gap:16px;flex-wrap:wrap;">',
    '        <a href="' + R + 'school-information/9-website-privacy-policy.html">Privacy Policy</a>',
    '        <a href="' + R + 'mandatory-disclosure.html">Mandatory Disclosure</a>',
    '      </div>',
    '    </div>',

    '    <!-- Credits -->',
    '    <div class="footer-credits">',
    '      <span class="footer-credits-dev">Developed by <a href="https://appvertex.in" target="_blank" rel="noopener" class="footer-credits-brand">AppVertex</a></span>',
    '      <span class="footer-credits-built">Built by <strong>Leston</strong> &amp; <strong>Lenstar</strong></span>',
    '    </div>',

    '  </div>',
    '</footer>'
  ].join('\n');

  /* ── CSS ── */
  var FOOTER_CSS = [
    '<style id="lcs-footer-styles">',
    'footer#lcs-footer{background:#0a3535;color:rgba(255,255,255,0.7);}',
    '.footer-main{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;padding:60px 0 40px;}',
    '.footer-logo-wrap{display:flex;align-items:center;text-decoration:none;margin-bottom:16px;}',
    '.footer-brand p{font-size:0.85rem;line-height:1.7;color:rgba(255,255,255,0.6);margin-bottom:20px;}',
    '.social-links{display:flex;gap:10px;}',
    '.social-link{width:36px;height:36px;background:rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);text-decoration:none;transition:background 0.2s,color 0.2s;}',
    '.social-link:hover{background:var(--gold);color:#054040;}',
    '.footer-col h4{color:var(--gold-light);font-size:0.88rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;border-bottom:1px solid rgba(200,150,12,0.25);padding-bottom:8px;}',
    '.footer-col ul{list-style:none;}',
    '.footer-col ul li{margin-bottom:10px;}',
    '.footer-col ul li a{color:rgba(255,255,255,0.6);text-decoration:none;font-size:0.85rem;transition:color 0.2s;}',
    '.footer-col ul li a:hover{color:var(--gold);}',
    '.footer-bottom{border-top:1px solid rgba(255,255,255,0.08);padding:20px 0 10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:0.8rem;}',
    '.footer-bottom a{color:var(--gold);text-decoration:none;font-size:0.8rem;transition:color 0.2s;}',
    '.footer-bottom a:hover{color:#fff;}',

    /* Credits row - centered and stacked */
    '.footer-credits{padding:12px 0 24px;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:0.78rem;color:rgba(255,255,255,0.45);font-family:\'Courier New\',monospace;letter-spacing:0.03em;text-align:center;}',
    '.footer-credits-dev{color:rgba(255,255,255,0.6);}',
    '.footer-credits-brand{color:var(--gold-light);font-weight:700;text-decoration:none;transition:color 0.2s;}',
    '.footer-credits-brand:hover{color:#fff;}',
    '.footer-credits-built{color:rgba(255,255,255,0.6);}',
    '.footer-credits-built strong{color:rgba(255,255,255,0.75);font-weight:700;}',

    /* Responsive - improved mobile layout */
    '@media(max-width:900px){.footer-main{grid-template-columns:repeat(2,1fr);gap:24px;padding:40px 0 30px;}}',
    '@media(max-width:600px){',
    '.footer-main{grid-template-columns:1fr;gap:24px;padding:30px 0 20px;}',
    '.footer-brand{grid-column:1;}',
    '.footer-col:nth-child(2),.footer-col:nth-child(3){display:none;}',
    '.footer-brand p{font-size:0.8rem;margin-bottom:16px;}',
    '.footer-col h4{font-size:0.8rem;margin-bottom:12px;padding-bottom:6px;}',
    '.footer-col ul li{margin-bottom:8px;}',
    '.footer-col ul li a{font-size:0.8rem;}',
    '.footer-bottom{flex-direction:column;align-items:center;gap:10px;padding:12px 0;border-top:1px solid rgba(255,255,255,0.08);}',
    '.footer-bottom span,.footer-bottom div{width:100%;text-align:center;}',
    '.footer-bottom div{display:flex;flex-direction:column;gap:8px;}',
    '.footer-credits{padding:8px 0 16px;gap:4px;}',
    '.social-links{gap:8px;}',
    '.social-link{width:32px;height:32px;}',
    '.social-link svg{width:13px;height:13px;}',
    '}',
    '</style>'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById('lcs-footer-styles')) return;
    document.head.insertAdjacentHTML('beforeend', FOOTER_CSS);
  }

  async function injectHTML() {
    if (document.getElementById('lcs-footer')) return;
    const contact = await loadContact();
    
    // Replace placeholders in FOOTER_HTML if contact data exists
    let html = FOOTER_HTML;
    if (contact) {
      if (contact.address) html = html.replace('Main Road, Bantwal, Karnataka', contact.address);
      if (contact.phone) html = html.replace('+91 98765 43210', contact.phone);
      if (contact.email) html = html.replace('info@school.edu', contact.email);
    }

    document.body.insertAdjacentHTML('beforeend', html);
    var yr = document.getElementById('lcs-footer-year');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  async function boot() {
    injectStyles();
    await injectHTML();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.LCSFooter = { init: boot };
})();