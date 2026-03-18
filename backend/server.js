require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!ADMIN_TOKEN) {
  console.warn('\n⚠️  WARNING: ADMIN_TOKEN environment variable is not set!');
  console.warn('   Admin write operations will be disabled for security.\n');
}

// Data directory
const dataDir = path.join(__dirname, 'data');
const backupsDir = path.join(dataDir, 'backups');

// Ensure directories exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
      "font-src": ["'self'", "fonts.gstatic.com", "data:", "https:"],
      "img-src": ["'self'", "data:", "blob:", "https:"],
    },
  },
})); // Security headers

app.use(morgan('dev')); // Request logging

// Restricted CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://loretto-cbse-school.pages.dev',
  'https://loretto-cbse-school.onrender.com'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' })); // Support larger base64 uploads

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));


// Alias for common typo
app.get('/admin-pannel.html', (req, res) => {
  res.redirect('/admin/admin-panel.html');
});

// Redirect root to frontend/index.html if needed (though express.static handles index.html by default)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'] || req.headers['x-admin-token'];
  if (req.method !== 'GET' && token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin token' });
  }
  next();
};

// Helper: Backup data file
function backupFile(filename) {
  try {
    const src = path.join(dataDir, filename);
    if (!fs.existsSync(src)) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = path.join(backupsDir, `${path.basename(filename, '.json')}_${timestamp}.json`);
    fs.copyFileSync(src, dest);

    // Cleanup old backups (keep last 10)
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith(path.basename(filename, '.json')))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupsDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 10) {
      files.slice(10).forEach(f => fs.unlinkSync(path.join(backupsDir, f.name)));
    }
  } catch (err) {
    console.error('Backup failed:', err);
  }
}

// Helper: Read/Write JSON
function readData(filename) {
  try {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Read error (${filename}):`, err);
    return null;
  }
}

function writeData(filename, data) {
  try {
    backupFile(filename);
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Write error (${filename}):`, err);
    return false;
  }
}

// ==================== GENERIC API HANDLER ====================
const createHandler = (filename) => ({
  get: (req, res) => {
    const data = readData(filename);
    if (data === null) return res.status(500).json({ error: 'Failed to read data' });
    res.json(data);
  },
  post: (req, res) => {
    const data = readData(filename) || [];
    // Ensure it's an array if unshift is used
    if (Array.isArray(data)) {
      data.unshift({ ...req.body, id: Date.now() });
    } else {
      // For object-based storage like contact.json
      Object.assign(data, req.body);
    }

    if (writeData(filename, data)) {
      res.json({ success: true, message: 'Data saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to write data' });
    }
  }
});

// Register Endpoints
const entities = ['news', 'faculty', 'management', 'documents', 'testimonials'];
entities.forEach(entity => {
  const handler = createHandler(`${entity}.json`);
  app.get(`/api/${entity}`, handler.get);
  app.post(`/api/${entity}`, authenticate, handler.post);
});

// Special handler for Contact (Public POST, sends Email)
const contactHandler = createHandler('contact.json');
app.get('/api/contact', contactHandler.get);
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // 1. Save to JSON (existing logic)
  const data = readData('contact.json') || [];
  const entry = { ...req.body, id: Date.now(), timestamp: new Date().toISOString() };
  data.unshift(entry);

  const saved = writeData('contact.json', data);
  if (!saved) return res.status(500).json({ error: 'Failed to save contact data' });

  // 2. Send Email via Resend
  if (resend && CONTACT_EMAIL) {
    try {
      // Email to School
      await resend.emails.send({
        from: 'Loretto School Website <onboarding@resend.dev>',
        to: CONTACT_EMAIL,
        subject: `New Contact Form Submission: ${subject || 'Enquiry'}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `
      });

      // Confirmation to Visitor
      if (email) {
        await resend.emails.send({
          from: 'Loretto Central School <onboarding@resend.dev>',
          to: email,
          subject: 'Thank you for contacting Loretto Central School',
          html: `
            <h3>Message Received</h3>
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to Loretto Central School. We have received your message regarding "<strong>${subject || 'General Enquiry'}</strong>" and will get back to you shortly.</p>
            <br>
            <p>Best Regards,</p>
            <p><strong>Loretto Central School Administration</strong></p>
          `
        });
      }

      console.log(`Email sent for contact form submission from ${name}`);
    } catch (err) {
      console.error('Error sending email via Resend:', err);
      // We don't fail the request if email fails, as the data is already saved
    }
  }

  res.json({ success: true, message: 'Message sent successfully' });
});

// Health check (used for login validation)
app.get('/api/health', (req, res) => {
  const token = req.headers['authorization'] || req.headers['x-admin-token'];
  if (token && token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
  res.json({ status: 'ok', authenticated: !!token, time: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Loretto Admin Server
  -----------------------
  URL:    http://localhost:${PORT}
  Panel:  http://localhost:${PORT}/admin/admin-panel.html
  Data:   ${dataDir}
  Auth:   ${ADMIN_TOKEN ? 'Enabled' : 'Disabled (No token set)'}
  `);
});
