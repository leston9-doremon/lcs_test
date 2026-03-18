# Admin Panel & Frontend Integration Guide

## 📋 What Changed?

### ✅ Completed Tasks:

1. **✓ Removed Strapi** - No external CMS needed
   - All data stored locally in JSON files
   - No cloud dependencies
   - Complete control over your data

2. **✓ Split CSS into Separate File** - `admin-panel.css`
   - Admin panel HTML reduced from 1068 lines to ~450 lines
   - CSS now in dedicated file for better maintainability
   - Easy to customize colors and styles

3. **✓ Connected Admin Panel with Frontend**
   - New `shared-data-loader.js` file for frontend integration
   - Frontend pages can load data managed in the admin panel
   - Changes in admin panel automatically available to frontend

---

## 🎯 File Structure

```
LORETTO WEBZ 6/
├── admin-panel.html              ← Admin interface (cleaner now!)
├── admin-panel.css               ← All admin styles (NEW FILE)
├── shared-data-loader.js         ← Frontend data loader (NEW FILE)
├── server.js                     ← Backend API
├── package.json                  ← Dependencies
│
├── data/                         ← All website content (managed by admin)
│   ├── news.json                ← News articles
│   ├── faculty.json             ← Teachers & staff
│   ├── management.json          ← Management committee
│   ├── documents.json           ← PDFs & files
│   ├── testimonials.json        ← Parent/student reviews
│   └── contact.json             ← School contact info
│
├── index.html                    ← Homepage
├── news.html                     ← News page
├── about-us/                     ← About section pages
├── academics/                    ← Academics pages
└── ... (other pages)
```

---

## 🚀 How to Use

### 1️⃣ Start the Server

```bash
cd "/Users/lestoncoelho/Downloads/LORETTO WEBZ 6"
npm start
```

Server runs on: `http://localhost:3000`

### 2️⃣ Access Admin Panel

Open in your browser: **http://localhost:3000/admin-panel.html**

### 3️⃣ Manage Content

In the admin panel, you can:
- 📰 Add/Edit/Delete News
- 👨‍🏫 Manage Faculty
- 👥 Manage Management Committee
- 📄 Upload Documents
- 💬 Manage Testimonials
- 📞 Update Contact Info

All changes are **saved to JSON files** and **synced to your frontend**.

---

## 💻 How Frontend Uses Data

### Option 1: Simple Data Loading

Load data in any frontend page using `shared-data-loader.js`:

```html
<!-- In your HTML file header -->
<script src="shared-data-loader.js"></script>

<script>
  // Load news when page loads
  document.addEventListener('DOMContentLoaded', async () => {
    const newsData = await loadNewsData();
    console.log('News:', newsData);
    
    // Now use newsData to display on your page
    displayNews(newsData);
  });
</script>
```

### Option 2: Load All Data at Once

```javascript
const allData = await loadAllData();

// Access any data type:
console.log(allData.news);
console.log(allData.faculty);
console.log(allData.testimonials);
console.log(allData.contact);
```

### Option 3: Individual Data Loaders

```javascript
// Load specific data types:
const news = await loadNewsData();              // News articles
const faculty = await loadFacultyData();        // Teachers
const management = await loadManagementData();  // Management
const documents = await loadDocumentsData();    // PDFs/Files
const testimonials = await loadTestimonialsData(); // Reviews
const contact = await loadContactData();        // Contact info
```

---

## 📊 Data Structure (What Each File Contains)

### `news.json`
```json
[
  {
    "id": 1234567890,
    "title": "School Wins Science Fair",
    "category": "Achievement",
    "date": "2026-03-15",
    "excerpt": "Short summary...",
    "content": "Full article content...",
    "image": null
  }
]
```

### `faculty.json`
```json
[
  {
    "id": 1234567890,
    "name": "Mrs. Sharma",
    "subject": "Mathematics",
    "qualification": "B.Sc, B.Ed",
    "experience": 8
  }
]
```

### `management.json`
```json
[
  {
    "id": 1234567890,
    "name": "Mr. John Doe",
    "role": "Principal",
    "contact": "principal@loretto.edu"
  }
]
```

### `documents.json`
```json
[
  {
    "id": 1234567890,
    "title": "Admission Form 2026",
    "category": "Admission",
    "date": "2026-03-01",
    "url": "path/to/file.pdf"
  }
]
```

### `testimonials.json`
```json
[
  {
    "id": 1234567890,
    "name": "Mrs. Patel",
    "role": "Parent",
    "text": "Great school with excellent teachers...",
    "rating": 5
  }
]
```

### `contact.json`
```json
{
  "address": "123 School Road, City",
  "phone1": "+91 9876543210",
  "phone2": "+91 9876543211",
  "email": "info@loretto.edu",
  "hours": "Monday-Saturday: 9:00 AM - 4:00 PM"
}
```

---

## 🔗 Real-World Example

### Display News on Your Homepage

Create a section in `index.html`:

```html
<!-- In your index.html -->
<section id="news-section">
  <h2>Latest News</h2>
  <div id="news-container"></div>
</section>

<script src="shared-data-loader.js"></script>
<script>
  async function displayNews() {
    const news = await loadNewsData();
    const container = document.getElementById('news-container');
    
    news.slice(0, 3).forEach(article => {
      const articleHTML = `
        <div class="news-card">
          <h3>${article.title}</h3>
          <p class="date">${article.date}</p>
          <p>${article.excerpt}</p>
          <span class="category">${article.category}</span>
        </div>
      `;
      container.innerHTML += articleHTML;
    });
  }
  
  // Load on page load
  document.addEventListener('DOMContentLoaded', displayNews);
</script>
```

### Display Faculty on Faculty Page

```html
<!-- In academics/1-faculty.html -->
<section id="faculty-section">
  <h2>Our Faculty</h2>
  <div id="faculty-grid"></div>
</section>

<script src="../shared-data-loader.js"></script>
<script>
  async function displayFaculty() {
    const faculty = await loadFacultyData();
    const grid = document.getElementById('faculty-grid');
    
    faculty.forEach(member => {
      const cardHTML = `
        <div class="faculty-card">
          <h3>${member.name}</h3>
          <p><strong>Subject:</strong> ${member.subject}</p>
          <p><strong>Qualification:</strong> ${member.qualification}</p>
          <p><strong>Experience:</strong> ${member.experience} years</p>
        </div>
      `;
      grid.innerHTML += cardHTML;
    });
  }
  
  document.addEventListener('DOMContentLoaded', displayFaculty);
</script>
```

---

## 🔄 How Auto-Sync Works

When you save data in the admin panel:

1. **Admin Panel** saves to JSON file via API
2. **Frontend** can immediately load the new data
3. **No page refresh needed** - data is fetched fresh each time

To ensure your frontend always gets fresh data, pages should load data when they're displayed:

```javascript
// Good: Loads fresh data on page load
document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadFacultyData();
  displayData(data);
});

// Better: Refresh every 30 seconds if needed
setInterval(async () => {
  const data = await loadFacultyData();
  updateDisplay(data);
}, 30000);
```

---

## 📁 File Size Comparison

### Before (With Inline CSS)
- `admin-panel.html`: 1068 lines
- CSS + HTML mixed
- Hard to maintain

### After (With Separate CSS)
- `admin-panel.html`: ~450 lines (59% smaller!)
- `admin-panel.css`: ~450 lines
- Cleaner, more maintainable
- Easy to customize

---

## ⚙️ Customization

### Change Admin Panel Colors

Edit `admin-panel.css`:

```css
:root {
  --navy: #0e6b6b;              /* Main color */
  --gold: #c8960c;              /* Accent color */
  --light-bg: #f9f6ef;          /* Background */
  /* Change these values to customize */
}
```

### Change Data Path

If your data folder is in a different location, update in `shared-data-loader.js`:

```javascript
const DATA_PATH = './data';  // Change this path if needed
```

---

## 🆘 Troubleshooting

### "Cannot find data file" Error?
- Make sure server is running: `npm start`
- Check that `./data/` folder exists
- Verify file names match (case-sensitive on Mac/Linux)

### Admin panel shows "No data"?
- Click the "+ Add" button to create your first entry
- Data will be saved to JSON automatically
- Refresh frontend pages to see changes

### Frontend not showing updated data?
- Hard refresh browser: `Cmd + Shift + R`
- Check browser console for errors: `Cmd + Option + J`
- Verify data file exists in `./data/` folder

### Can't access admin panel at localhost:3000?
- Is server running? Run: `npm start`
- Wrong port? Check server.js for `PORT` variable
- Try: `http://localhost:3000/admin-panel.html`

---

## 🔐 Security Notes

### Current Setup (Development)
- No authentication on API endpoints
- Admin panel accessible to anyone
- Good for development/internal use

### For Production
You should add:
1. Authentication (username/password)
2. API key protection
3. HTTPS encryption
4. Regular backups of JSON files

---

## 📞 Support

- **Developer**: appvertex.in
- **Email**: info@appvertex.in
- **Response Time**: 24-48 working hours

---

## ✨ Summary

✅ **No Strapi needed** - Pure JSON-based system  
✅ **Admin panel split** - Cleaner, smaller files  
✅ **Frontend connected** - Easy data loading  
✅ **100% under your control** - No external dependencies  
✅ **Fast & lightweight** - Optimized for performance  

Happy managing! 🎓
