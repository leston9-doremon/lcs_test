# Loretto Central School — Admin Panel Setup

## Overview
This is a **fully static website admin panel** with no external CMS dependencies. All content is managed through JSON files and served directly from your web server.

✅ **No Strapi**  
✅ **No External Database**  
✅ **No Complex Dependencies**  
✅ **Complete Control**  

---

## Quick Start

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) if you don't have it installed.

### 2. Install Dependencies
```bash
cd "/Users/lestoncoelho/Downloads/LORETTO WEBZ 6"
npm install
```

### 3. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### 4. Access the Admin Panel
Navigate to: **http://localhost:3000/admin-panel.html**

---

## File Structure

```
LORETTO WEBZ 6/
├── admin-panel.html       ← Admin interface (OPEN THIS IN BROWSER)
├── server.js              ← Node.js API server
├── package.json           ← Dependencies list
│
├── data/                  ← All website content stored here
│   ├── news.json
│   ├── faculty.json
│   ├── management.json
│   ├── documents.json
│   ├── testimonials.json
│   └── contact.json
│
├── api/                   ← API endpoints
│
├── index.html
├── components/
├── about-us/
├── academics/
└── ... (other website files)
```

---

## Data Files Format

### news.json
```json
[
  {
    "id": 1234567890,
    "title": "Article Title",
    "category": "Events|Achievement|Celebration",
    "date": "2024-01-15",
    "excerpt": "Short summary",
    "content": "Full article content",
    "image": null
  }
]
```

### faculty.json
```json
[
  {
    "id": 1234567890,
    "name": "Teacher Name",
    "subject": "Mathematics",
    "qualification": "M.Sc, B.Ed",
    "experience": 10
  }
]
```

### management.json
```json
[
  {
    "id": 1234567890,
    "name": "Manager Name",
    "role": "Principal",
    "contact": "email@example.com",
    "group": "Diocese Leadership|Local Management|PTA Executive|Finance Committee"
  }
]
```

### documents.json
```json
[
  {
    "id": 1234567890,
    "title": "Document Title",
    "category": "Circular|Fee|Report|Certificate",
    "date": "2024-01-15",
    "url": null
  }
]
```

### testimonials.json
```json
[
  {
    "id": 1234567890,
    "name": "Parent/Student Name",
    "role": "Parent|Student",
    "text": "Testimonial text",
    "rating": 5
  }
]
```

### contact.json
```json
{
  "address": "Full School Address",
  "phone1": "+91-80-XXXX-XXXX",
  "phone2": "+91-80-XXXX-XXXX",
  "email": "school@example.edu.in",
  "hours": "Monday-Saturday: 9:00 AM - 4:00 PM"
}
```

---

## API Endpoints

The admin panel makes requests to these endpoints:

```
POST   /api/save-news              ← Save news articles
POST   /api/save-faculty           ← Save faculty members
POST   /api/save-management        ← Save management committee
POST   /api/save-documents         ← Save documents
POST   /api/save-testimonials      ← Save testimonials
POST   /api/save-contact           ← Save contact info
GET    /api/health                 ← Server health check
```

---

## Usage Guide

### Adding News/Articles
1. Click **"📰 News & Events"** in the navbar
2. Click **"+ Add Article"** button
3. Enter title, category, excerpt, and content
4. Click **"Save"** — automatically saved to `data/news.json`

### Managing Faculty
1. Click **"👨‍🏫 Faculty"** in the navbar
2. Click **"+ Add Faculty"** to add new teacher
3. Fill in name, subject, qualification, experience
4. Changes saved automatically

### Managing Management Committee
1. Click **"👥 Management"** in the navbar
2. Click **"+ Add Member"** for new committee member
3. Enter name, role, contact, and group
4. Automatically saved to `data/management.json`

### Managing Documents
1. Click **"📄 Documents"** in the navbar
2. Click **"+ Add Document"** for new document
3. Enter title, category, and document details
4. Saved to `data/documents.json`

### Editing Contact Information
1. Click **"📞 Contact Info"** in the navbar
2. Update address, phone numbers, email, office hours
3. Click **"✓ Save Contact Info"**

---

## Deployment Instructions

### For Shared Hosting (cPanel/Plesk)
1. Upload all files to your web host
2. Install Node.js support (or use PHP wrapper)
3. Point domain to the public folder
4. Start the server

### For Dedicated Server
1. Install Node.js on the server
2. Upload files via FTP/SSH
3. Use PM2 to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   pm2 startup
   ```

### For Vercel/Heroku
1. Push code to GitHub
2. Connect repository to Vercel/Heroku
3. Deploy — automatic setup

---

## Important Notes

⚠️ **Backup Your Data**
- Keep regular backups of the `data/` folder
- All content is stored in JSON files — no database

⚠️ **Access Control**
- Currently uses simple localStorage authentication
- For production, implement proper authentication
- See "Security" section below

⚠️ **File Upload**
- Image/PDF uploads currently stored as Base64 in JSON
- For large files, use external storage (AWS S3, etc.)

---

## Security Considerations

### Current Setup
- Admin panel accessible to anyone with URL knowledge
- No password protection
- Not suitable for public internet

### Recommended Improvements
1. **Add Authentication**
   ```javascript
   // Check password on login
   const ADMIN_PASSWORD = 'your-secret-password';
   ```

2. **Use HTTPS Only**
   - Always use SSL certificate in production
   - Never send credentials over HTTP

3. **Restrict Admin Panel Access**
   - Password protect `/admin-panel.html`
   - Use basic auth on `/api/` endpoints
   - IP whitelist if behind firewall

4. **Rate Limiting**
   - Add rate limits to API endpoints
   - Prevent brute force attacks

---

## Troubleshooting

### Admin panel not loading
- Ensure Node.js server is running: `npm start`
- Check if port 3000 is already in use
- Try different port: `PORT=8080 npm start`

### Changes not saving
- Check browser console for errors (F12)
- Verify `data/` folder exists and is writable
- Check server logs for error messages

### Data not appearing on website
- Website pages need to be updated to load from `data/` files
- Currently just showing empty placeholders
- See "Website Integration" section

### Server won't start
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm start
```

---

## Website Integration

The website pages (about-us, faculty, news, etc.) are currently set up to display data from the admin panel. Here's how they work:

### Faculty Page (`academics/1-faculty.html`)
```javascript
const FACULTY_DATA = []; // Populated by admin panel
```

### Management Page (`about-us/2-management.html`)
```javascript
const MGMT_DATA = []; // Populated by admin panel
```

To enable automatic loading, update these files to fetch from the data files:

```javascript
// Load faculty from admin panel data
fetch('../../data/faculty.json')
  .then(r => r.json())
  .then(data => {
    FACULTY_DATA.splice(0, FACULTY_DATA.length, ...data);
    loadFaculty();
  });
```

---

## Support

**Developer:** appvertex.in  
**Email:** info@appvertex.in  
**Support Hours:** Monday-Friday, 10 AM - 6 PM IST

For issues or questions, contact the support team through the admin panel's **Support** section.

---

## License

© 2024 Loretto Central School. All rights reserved.

Developed by **appvertex.in**
