// Admin Panel JS — Panel switching and basic UI logic
const ADMIN_TOKEN = sessionStorage.getItem('adminToken') || 'loretto-admin-2026';
function show(panelName, navEl) {
  // Hide all panels
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  // Show the selected panel
  const panel = document.getElementById('panel-' + panelName);
  if(panel) panel.classList.add('active');
  // Highlight nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if(navEl && navEl.classList) {
    const ni = navEl.classList.contains('nav-item') ? navEl : navEl.closest('.nav-item');
    if (ni) ni.classList.add('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// ...other admin panel JS functions to be added as needed

// ── TOAST ─────────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast-el');
  document.getElementById('toast-msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

// ── SAVE (static pages) ───────────────────────────────────
function save(section) {
  // Save to backend for all editable sections
  let data = {};
  let endpoint = '';
  const panel = document.querySelector('.panel.active');
  if (!panel) {
    toast('⚠ No active panel');
    return;
  }
  if (section === 'News Article' || section === 'News') {
    data = {
      title: panel.querySelector('input[style*="font-weight:700"]')?.value || '',
      date: panel.querySelector('input[type="date"]')?.value || '',
      excerpt: panel.querySelector('textarea')?.value || ''
    };
    endpoint = '/api/news';
  } else if (section === 'Faculty') {
    const row = panel.querySelector('tr:last-child');
    if (row) {
      const tds = row.querySelectorAll('input');
      data = {
        name: tds[0]?.value || '',
        subject: tds[1]?.value || '',
        qualification: tds[2]?.value || '',
        experience: tds[3]?.value || ''
      };
    }
    endpoint = '/api/faculty';
  } else if (section === 'Document') {
    const row = panel.querySelector('tr:last-child');
    if (row) {
      const tds = row.querySelectorAll('td');
      data = {
        name: tds[0]?.textContent.trim() || '',
        category: tds[1]?.querySelector('select')?.value || '',
        date: tds[2]?.textContent.trim() || ''
      };
    }
    endpoint = '/api/documents';
  } else if (section === 'Management' || section === 'Member') {
    const row = panel.querySelector('tr:last-child');
    if (row) {
      const tds = row.querySelectorAll('input');
      data = {
        name: tds[0]?.value || '',
        designation: tds[1]?.value || '',
        email: tds[2]?.value || ''
      };
    }
    endpoint = '/api/management';
  } else if (section === 'Testimonial') {
    data = {
      name: panel.querySelector('input[placeholder="Reviewer Name"]')?.value || '',
      role: panel.querySelector('input[placeholder="Role"]')?.value || '',
      rating: panel.querySelector('select')?.value || '',
      text: panel.querySelector('textarea')?.value || ''
    };
    endpoint = '/api/testimonials';
  } else if (section === 'Contact') {
    data = {
      name: panel.querySelector('input[placeholder="Name"]')?.value || '',
      email: panel.querySelector('input[placeholder="Email"]')?.value || '',
      message: panel.querySelector('textarea')?.value || ''
    };
    endpoint = '/api/contact';
  }
  if (endpoint) {
    fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': ADMIN_TOKEN
      },
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    })
    .then(() => toast('✓ ' + section + ' saved to website!'))
    .catch(() => toast('⚠ Error saving ' + section));
  } else {
    toast('✓ ' + section + ' updated (no backend endpoint set)');
  }
}

function saveStaticPage(section, filename) {
  const panel = document.querySelector('.panel.active');
  if (panel) {
    const fields = [];
    panel.querySelectorAll('input:not([type=file]):not([type=checkbox]):not([type=date]), textarea, select').forEach(el => {
      const label = el.closest('.fg')?.querySelector('label')?.textContent?.trim() || el.id || '';
      if (label && el.value) fields.push({ label, val: el.value });
    });
    console.log('[Admin] ' + section + ' (' + filename + ') fields:', fields);
  }
  toast('✓ ' + section + ' saved — update ' + filename + ' on the server');
}

// ── DELETE ROW ────────────────────────────────────────────
function delItem(btn, type) {
  if (!confirm('Delete this ' + type + '?')) return;
  const row = btn.closest('tr') || btn.closest('.item-card');
  if (row) {
    row.style.transition = 'all 0.3s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(40px)';
    setTimeout(() => row.remove(), 300);
    toast('🗑 ' + type.charAt(0).toUpperCase() + type.slice(1) + ' deleted');
  }
}

// ── FILE INPUT TRIGGER ────────────────────────────────────
function trigUp(id) {
  const el = document.getElementById(id);
  if (el) el.click();
}

// ── IMAGE PREVIEW IN UPLOAD ZONE ─────────────────────────
function previewZone(input, zoneId) {
  if (!input.files?.[0]) return;
  const f = input.files[0];
  const zone = document.getElementById(zoneId);
  const reader = new FileReader();
  reader.onload = function(e) {
    zone.style.backgroundImage = 'url(' + e.target.result + ')';
    zone.style.backgroundSize = 'cover';
    zone.style.backgroundPosition = 'center';
    zone.style.minHeight = '140px';
    const p = zone.querySelector('p');
    if (p) { p.textContent = '✓ ' + f.name; p.style.background = 'rgba(0,0,0,0.55)'; p.style.color = '#fff'; p.style.padding = '2px 8px'; p.style.borderRadius = '4px'; }
    toast('✓ Image ready: ' + f.name);
  };
  reader.readAsDataURL(f);
}

function fileDrop(input, zoneId) {
  previewZone(input, zoneId);
}

// ── GALLERY ───────────────────────────────────────────────
function addGallery(input) {
  const preview = document.getElementById('gallery-preview') || input.nextElementSibling;
  if (!preview) return;
  Array.from(input.files).forEach(function(f) {
    const r = new FileReader();
    r.onload = function(e) {
      const item = document.createElement('div'); item.className = 'img-preview-item';
      item.innerHTML = '<img src="' + e.target.result + '" alt="' + f.name + '"><button class="del-btn" onclick="this.parentElement.remove()">✕</button>';
      preview.appendChild(item);
    };
    r.readAsDataURL(f);
  });
  if (input.files.length) toast('✓ ' + input.files.length + ' photo(s) added');
}

// ── MEMBER PHOTO PREVIEW ──────────────────────────────────
function previewMemberPhoto(input, avatarId) {
  if (!input.files?.[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  const avatar = document.getElementById(avatarId);
  reader.onload = function(e) {
    if (avatar) avatar.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
    toast('✓ Photo ready: ' + file.name);
  };
  reader.readAsDataURL(file);
}

// ── MODALS ────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

// ── ADD NEWS CARD (static) ────────────────────────────────
function addNewsCard() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="item-card-img" style="background:linear-gradient(135deg,var(--navy-dark),var(--navy))"><span>📰</span></div>
    <div class="item-card-body">
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <input class="editable" style="font-size:0.65rem;width:auto;" value="Events">
        <input type="date" style="border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:0.75rem;font-family:'Nunito',sans-serif;outline:none;">
      </div>
      <input class="editable" style="font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--navy);display:block;width:100%;margin-bottom:6px;" value="New Article Title">
      <textarea class="editable-area">Article excerpt...</textarea>
    </div>
    <div class="item-card-footer">
      <button class="btn btn-gold btn-sm" onclick="save('News Article')">✓ Save</button>
      <button class="btn btn-danger btn-sm" onclick="delItem(this,'article')" style="margin-left:auto;">🗑</button>
    </div>`;
  grid.prepend(card);
  closeModal('modal-news');
  toast('✓ New article added — fill in and click Save');
}

// ── ADD DOCUMENT ROW ─────────────────────────────────────
function addDocRows(input, src) {
  if (src === 'modal') {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>📄 New Document.pdf</td><td><select class="editable" style="width:140px;border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-size:0.8rem;outline:none;"><option>Mandatory Disclosure</option><option>CBSE Circulars</option><option>School Circulars</option><option>Fee Structure</option><option>Results</option></select></td><td>—</td><td><span style="color:#aaa;font-size:0.78rem;">No file</span></td><td><input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--navy);"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Document\')">✓</button><button class="btn btn-outline btn-sm" onclick="trigUp(\'doc-replace-\'+Date.now())">📁 File</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'document\')">🗑</button></td>';
    const tbody = document.getElementById('docs-tbody');
    if (tbody) tbody.appendChild(tr);
    toast('✓ Document entry added — upload a file');
    closeModal('modal-doc');
    return;
  }
  if (!input?.files) return;
  const tbody = document.getElementById('docs-tbody');
  if (!tbody) return;
  Array.from(input.files).forEach(f => {
    const size = (f.size / 1024).toFixed(0) + ' KB';
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>📄 ' + f.name + '</td><td><select class="editable" style="width:140px;border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-size:0.8rem;outline:none;"><option>School Circulars</option><option>CBSE Circulars</option><option>Mandatory Disclosure</option></select></td><td>' + new Date().toLocaleDateString('en-IN') + '</td><td><span style="color:var(--navy);font-weight:700;font-size:0.8rem;">' + size + '</span></td><td><input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--navy);"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Document\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'document\')">🗑</button></td>';
    tbody.appendChild(tr);
  });
  if (input.files.length) toast('✓ ' + input.files.length + ' document(s) added');
}

// ── ADD TEACHER ───────────────────────────────────────────
function addTeacher() {
  const tbody = document.getElementById('teachers-tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="Teacher Name"></td><td><input class="editable" value="TGT"></td><td><input class="editable" value="B.Ed"></td><td><input class="editable" value="Yes"></td><td><input class="editable" value="1" style="width:55px;"></td><td><input type="date" style="border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-size:0.78rem;outline:none;"></td><td><input type="date" style="border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-size:0.78rem;outline:none;"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Teacher\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'teacher\')">🗑</button></td>';
  tbody.appendChild(tr);
  closeModal('modal-teacher');
  toast('✓ Teacher row added');
}

// ── ADD FACULTY ROW ───────────────────────────────────────
function addFaculty() {
  const tbody = document.getElementById('faculty-tbody'); if (!tbody) return;
  const uid = 'faculty-av-' + Date.now(), fid = 'faculty-photo-' + Date.now();
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>
      <div style="position:relative;width:54px;">
        <div class="staff-avatar" id="${uid}" style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--navy-dark),var(--navy));display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;overflow:hidden;border:2px solid var(--border);">👤</div>
        <label for="${fid}" style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.7rem;border:2px solid #fff;" title="Upload photo">📷</label>
        <input type="file" id="${fid}" accept="image/*" style="display:none" onchange="previewMemberPhoto(this,'${uid}')">
      </div>
    </td>
    <td><input class="editable" value="Teacher Name"></td>
    <td><input class="editable" value="Subject / Role"></td>
    <td><input class="editable" value="Qualification"></td>
    <td><input class="editable" value="Experience" style="width:70px;"></td>
    <td class="actions"><button class="btn btn-icon btn-sm" onclick="save('Faculty')">✓</button><button class="btn btn-danger btn-sm" onclick="deleteFaculty(this)">🗑</button></td>
  `;
  tbody.prepend(tr);
  closeModal('modal-faculty');
  toast('✓ Faculty row added — fill in and click ✓ to save');
}

function addFacultyRow() { addFaculty(); }

function deleteFaculty(btn) {
  if (!confirm('Delete this faculty member?')) return;
  const tr = btn.closest('tr');
  if (!tr) return;
  tr.style.transition = 'all 0.3s';
  tr.style.opacity = '0';
  tr.style.transform = 'translateX(40px)';
  setTimeout(() => tr.remove(), 300);
  toast('🗑 Faculty member removed');
}

// ── ADD PROGRAMME ─────────────────────────────────────────
function addProgram() {
  const tbody = document.getElementById('programs-tbody'); if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="New Programme"></td><td><input class="editable" value="Classes I–X"></td><td><input class="editable" value="Description..."></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Programme\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'programme\')">🗑</button></td>';
  tbody.appendChild(tr);
  toast('✓ Programme added');
}

// ── ADD MANAGEMENT MEMBER ROW ─────────────────────────────
function addMgmtRow() {
  const tbody = document.getElementById('mgmt-tbody'); if (!tbody) return;
  const uid = 'mgmt-av-' + Date.now(), fid = 'mgmt-photo-' + Date.now();
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><div style="position:relative;width:54px;"><div id="' + uid + '" style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--navy-dark),var(--navy));display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;overflow:hidden;border:2px solid var(--border);">👤</div><label for="' + fid + '" style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.7rem;border:2px solid #fff;" title="Upload photo">📷</label><input type="file" id="' + fid + '" accept="image/*" style="display:none" onchange="previewMemberPhoto(this,\'' + uid + '\')"></div></td><td><input class="editable" value="Member Name"></td><td><input class="editable" value="Designation"></td><td><input class="editable" value="email@example.com"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Member\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'member\')">🗑</button></td>';
  tbody.appendChild(tr);
  toast('✓ Member added — fill in details and upload photo');
}

// ── ADD PTA MEMBER ROW ────────────────────────────────────
function addPTARow() {
  const tbody = document.getElementById('pta-tbody'); if (!tbody) return;
  const uid = 'pta-av-' + Date.now(), fid = 'pta-photo-' + Date.now();
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><div style="position:relative;width:54px;"><div id="' + uid + '" style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--navy-dark),var(--navy));display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;overflow:hidden;border:2px solid var(--border);">👤</div><label for="' + fid + '" style="position:absolute;bottom:-2px;right:-2px;width:20px;height:20px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.7rem;border:2px solid #fff;" title="Upload photo">📷</label><input type="file" id="' + fid + '" accept="image/*" style="display:none" onchange="previewMemberPhoto(this,\'' + uid + '\')"></div></td><td><input class="editable" value="Member Name"></td><td><input class="editable" value="PTA Member"></td><td><input class="editable" value="Class X"></td><td><input class="editable" value="+91 XXXXX XXXXX"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'PTA Member\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'member\')">🗑</button></td>';
  tbody.appendChild(tr);
  toast('✓ PTA member added — fill in details and upload photo');
}

// ── CBSE / SCHOOL CIRCULAR ROWS ──────────────────────────
function addCBSERow() {
  const tbody = document.getElementById('cbse-results-tbody'); if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="202X–2X" style="width:80px;"></td><td><input class="editable" value="0" style="width:65px;"></td><td><input class="editable" value="0" style="width:65px;"></td><td><input class="editable" value="0%" style="width:60px;"></td><td><input class="editable" value="0" style="width:65px;"></td><td><input class="editable" value="0" style="width:65px;"></td><td><input class="editable" value="0%" style="width:60px;"></td><td><button class="btn btn-icon btn-sm" onclick="save(\'Result Row\')">✓</button></td>';
  tbody.appendChild(tr);
  toast('✓ Year added');
}

function addAnnualRow() {
  const tbody = document.getElementById('annual-tbody'); if (!tbody) return;
  const id = 'ar-new-' + Date.now();
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="202X–2X" style="width:80px;"></td><td><input class="editable" value="Annual Report 202X–2X"></td><td><span style="color:var(--text-muted);font-size:0.82rem;">No file uploaded</span></td><td>' + new Date().toLocaleDateString('en-GB',{month:'short',year:'numeric'}) + '</td><td><input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--navy);"></td><td class="actions"><button class="btn btn-gold btn-sm" onclick="trigUp(\'' + id + '\')">📁 Upload<input type="file" id="' + id + '" style="display:none" accept=".pdf"></button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'report\')">🗑</button></td>';
  tbody.appendChild(tr);
  toast('✓ Year added — upload the PDF');
}

function addCircularRow(input, tbodyId, type) {
  const tbody = document.getElementById(tbodyId); if (!tbody) return;
  const tr = document.createElement('tr');
  if (type === 'CBSE') {
    tr.innerHTML = '<td><input class="editable" value="New CBSE Circular"></td><td><input class="editable" value="CBSE Circular · All Schools"></td><td><span class="pill live">CBSE</span></td><td><input type="date" style="border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-size:0.78rem;outline:none;"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Circular\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'circular\')">🗑</button></td>';
  } else {
    tr.innerHTML = '<td><input class="editable" value="New School Circular"></td><td><input class="editable" value="All Students"></td><td><span class="pill draft">SCHOOL</span></td><td><input type="date" style="border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-size:0.78rem;outline:none;"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Circular\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'circular\')">🗑</button></td>';
  }
  tbody.appendChild(tr);
  toast('✓ Circular row added');
}

function addBookListRow(input, mode) {
  const tbody = document.getElementById('book-tbody'); if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="Subject"></td><td><input class="editable" value="Book Title"></td><td><input class="editable" value="Publisher"></td><td><input class="editable" value="I – X"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Book\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'book\')">🗑</button></td>';
  tbody.appendChild(tr);
  toast('✓ Book row added');
}

function addFormerHeadRow() {
  const tbody = document.getElementById('former-heads-tbody'); if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><div class="staff-avatar">👤</div></td><td><input class="editable" value="Rev. Fr. [Name]"></td><td><input class="editable" value="Principal"></td><td><input class="editable" value="20XX – 20XX" style="width:130px;"></td><td><input class="editable" value=""></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Former Head\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'entry\')">🗑</button></td>';
  tbody.appendChild(tr);
  toast('✓ Entry added');
}

function addFeeRow() {
  const tbody = document.getElementById('fee-tbody') || document.getElementById('md20-fee-tbody'); if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="Class"></td><td><input class="editable" value="0" style="width:100px;"></td><td><input class="editable" value="0" style="width:100px;"></td><td><input class="editable" value="0" style="width:100px;"></td><td><button class="btn btn-icon btn-sm" onclick="save(\'Fee Row\')">✓</button></td>';
  tbody.appendChild(tr);
  toast('✓ Fee row added');
}

// ── MANDATORY DISCLOSURE HELPERS ──────────────────────────
function mdFileUpload(input, zoneId, docNum) {
  if (!input.files?.[0]) return;
  const f = input.files[0];
  const zone = document.getElementById(zoneId);
  if (zone) {
    const p = zone.querySelector('p:last-of-type');
    if (p) p.innerHTML = 'Status: <span style="color:var(--navy);font-weight:700;">✓ ' + f.name + ' ready</span>';
    zone.style.borderColor = 'var(--navy)';
    zone.style.background = 'rgba(14,107,107,0.05)';
  }
  toast('✓ Doc ' + docNum + ' file selected: ' + f.name);
}

function addMdTableRow(tbodyId) {
  const tbody = document.getElementById(tbodyId); if (!tbody) return;
  const cols = tbody.querySelector('tr') ? tbody.querySelector('tr').cells.length : 4;
  const tr = document.createElement('tr');
  let html = '<td><input class="editable" value="New Member"></td><td><input class="editable" value="Member"></td><td><input class="editable" value=""></td>';
  if (cols === 4) html += '<td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Member\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'member\')">🗑</button></td>';
  tr.innerHTML = html; tbody.appendChild(tr); toast('✓ Member added');
}

function addMdResultRow(tbodyId) {
  const tbody = document.getElementById(tbodyId); if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="202X–2X" style="width:80px;"></td><td><input class="editable" value="0" style="width:80px;"></td><td><input class="editable" value="0" style="width:80px;"></td><td><input class="editable" value="0%" style="width:70px;"></td><td><input class="editable" value=""></td><td><button class="btn btn-icon btn-sm" onclick="save(\'Result\')">✓</button></td>';
  tbody.appendChild(tr); toast('✓ Year added');
}

function addTeacherRow() {
  const tbody = document.getElementById('md23-tbody'); if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="editable" value="Teacher Name"></td><td><input class="editable" value="TGT / PGT"></td><td><input class="editable" value="B.Ed"></td><td><select class="editable" style="border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-size:0.8rem;outline:none;"><option>Yes</option><option>No</option></select></td><td><input class="editable" value="1" style="width:55px;"></td><td><input type="date" style="border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-size:0.78rem;outline:none;"></td><td><input type="date" style="border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-size:0.78rem;outline:none;"></td><td class="actions"><button class="btn btn-icon btn-sm" onclick="save(\'Teacher\')">✓</button><button class="btn btn-danger btn-sm" onclick="delItem(this,\'teacher\')">🗑</button></td>';
  tbody.appendChild(tr); toast('✓ Teacher row added');
}

// ── TESTIMONIALS ──────────────────────────────────────────
function addTestimonialCard() {
  const name = document.getElementById('new-t-name')?.value || 'New Reviewer';
  const role = document.getElementById('new-t-role')?.value || 'Parent';
  const text = document.getElementById('new-t-text')?.value || 'Enter review text...';
  const rating = document.getElementById('new-t-rating')?.value || '★★★★★ (5 Stars)';
  const cat = document.getElementById('new-t-cat')?.value || 'Parent';
  const stars = rating.split(' ')[0];
  const id = 'testi-' + Date.now();
  const uid = 't-new-' + Date.now();

  const card = document.createElement('div');
  card.className = 'item-card'; card.id = id;
  card.innerHTML = `
    <div class="card-header" style="background:linear-gradient(135deg,var(--navy-dark),var(--navy));padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="t-avatar">👤</div>
        <div>
          <input class="editable" value="${name}" style="color:#fff;font-weight:700;font-size:0.95rem;display:block;">
          <input class="editable" value="${role}" style="color:rgba(255,255,255,0.65);font-size:0.75rem;display:block;margin-top:2px;">
        </div>
      </div>
      <span style="color:var(--gold-light);font-size:0.9rem;">${stars}</span>
    </div>
    <div class="card-body">
      <div class="fgrid">
        <div class="fg span2"><label>Reviewer Name</label><input value="${name}"></div>
        <div class="fg span2"><label>Role</label><input value="${role}"></div>
        <div class="fg"><label>Rating</label><select style="border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-family:'Nunito',sans-serif;font-size:0.88rem;outline:none;width:100%;"><option>★★★★★ (5 Stars)</option><option>★★★★ (4 Stars)</option><option>★★★ (3 Stars)</option></select></div>
        <div class="fg"><label>Category</label><select style="border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-family:'Nunito',sans-serif;font-size:0.88rem;outline:none;width:100%;"><option ${cat==='Parent'?'selected':''}>Parent</option><option ${cat==='Student'?'selected':''}>Student</option><option ${cat==='Alumni'?'selected':''}>Alumni</option><option ${cat==='Staff'?'selected':''}>Staff</option></select></div>
        <div class="fg span2"><label>Review Text</label><textarea class="tall">${text}</textarea></div>
        <div class="fg"><label>Show on Website</label><select style="border:1.5px solid var(--border);border-radius:9px;padding:9px 12px;font-family:'Nunito',sans-serif;font-size:0.88rem;outline:none;width:100%;"><option>✓ Visible</option><option>Hidden (Draft)</option></select></div>
      </div>
    </div>
    <div class="item-card-footer">
      <button class="btn btn-gold btn-sm" onclick="save('Testimonial')">✓ Save</button>
      <button class="btn btn-danger btn-sm" onclick="delItem(this,'testimonial')" style="margin-left:auto;">🗑 Delete</button>
    </div>`;

  document.getElementById('testimonials-grid').appendChild(card);
  ['new-t-name','new-t-role','new-t-text'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
  closeModal('modal-add-testimonial');
  toast('✓ Testimonial added! Fill in and click Save.');
}

// ── EMAIL COMPOSE (SUPPORT) ───────────────────────────────
var emailAttachFiles = [];

function addEmailAttachment(input) {
  if (!input.files) return;
  Array.from(input.files).forEach(function(f) {
    emailAttachFiles.push(f);
    const list = document.getElementById('email-attach-list');
    if (!list) return;
    const tag = document.createElement('div');
    tag.style.cssText = 'display:inline-flex;align-items:center;gap:5px;background:#fff;border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:0.75rem;font-weight:600;color:var(--navy);';
    const icon = f.type.startsWith('image/') ? '🖼' : '📄';
    tag.innerHTML = icon + ' ' + (f.name.length > 22 ? f.name.substring(0,20)+'…' : f.name)
      + ' <button onclick="removeEmailAttach(this,\'' + f.name + '\')" style="background:none;border:none;cursor:pointer;color:#999;font-size:0.8rem;padding:0;margin-left:3px;">✕</button>';
    list.appendChild(tag);
  });
  if (input.files.length) toast('✓ ' + input.files.length + ' file(s) attached');
}

function removeEmailAttach(btn, fname) {
  emailAttachFiles = emailAttachFiles.filter(f => f.name !== fname);
  btn.closest('div').remove();
}

function sendEmail() {
  const from    = document.getElementById('email-from')?.value || '';
  const subject = document.getElementById('email-subject')?.value || '';
  const type    = document.getElementById('email-type')?.value || '';
  const priority= document.getElementById('email-priority')?.value || '';
  const body    = document.getElementById('email-body')?.value || '';

  if (!from) { toast('⚠ Please enter your email address in the From field'); return; }
  if (!subject) { toast('⚠ Please enter a subject'); return; }
  if (!body.trim()) { toast('⚠ Please write your message before sending'); return; }

  const fullSubject = '[Support] [' + priority.split(' ').slice(1).join(' ') + '] ' + subject + ' — Loretto Admin';
  const fullBody = 'From: ' + from + '\nIssue Type: ' + type + '\nPriority: ' + priority + '\n\n' + body
    + (emailAttachFiles.length ? '\n\nAttachments: ' + emailAttachFiles.map(f => f.name).join(', ') : '')
    + '\n\n— Sent from Loretto Central School Admin Panel';

  window.open('mailto:info@appvertex.in?subject=' + encodeURIComponent(fullSubject) + '&body=' + encodeURIComponent(fullBody));

  const hist = document.getElementById('ticket-history-list');
  if (hist) {
    if (hist.textContent === 'No tickets sent yet') hist.innerHTML = '';
    const today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
    const item = document.createElement('div');
    item.style.cssText = 'padding:10px 14px;border-bottom:1px solid var(--border);font-size:0.78rem;';
    item.innerHTML = '<div style="font-weight:700;color:var(--navy);">' + subject + '</div><div style="color:var(--text-muted);margin-top:2px;">' + today + ' · ' + type.replace(/^[^ ]+ /, '') + ' · <span style="color:var(--navy);font-weight:600;">Sent</span></div>';
    hist.prepend(item);
  }

  toast('✓ Email opened — click Send in your mail app!');
  clearEmailForm();
}

function clearEmailForm() {
  ['email-from','email-subject','email-body'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  emailAttachFiles = [];
  const list = document.getElementById('email-attach-list');
  if (list) list.innerHTML = '';
}

// ── DRAG & DROP ───────────────────────────────────────────
['doc-drop-zone','gal-zone','hero-img-zone','about-img-zone'].forEach(function(id) {
  const z = document.getElementById(id); if (!z) return;
  z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('drag-over'); });
  z.addEventListener('dragleave', () => z.classList.remove('drag-over'));
  z.addEventListener('drop', e => {
    e.preventDefault(); z.classList.remove('drag-over');
    toast('✓ File dropped — ready to save');
  });
});