require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const MONGODB_URI = process.env.MONGODB_URI;

// ==================== RESEND ====================
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ==================== CLOUDINARY ====================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// ==================== MONGODB ====================
if (!ADMIN_TOKEN) {
  console.warn('\n⚠️  WARNING: ADMIN_TOKEN not set!\n');
}

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));
} else {
  console.warn('⚠️  MONGODB_URI not set!');
}

// ==================== SCHEMAS ====================
const newsSchema = new mongoose.Schema({ title: String, category: String, date: String, excerpt: String, content: String, image: String }, { timestamps: true });
const facultySchema = new mongoose.Schema({ name: String, subject: String, qualification: String, experience: String, photo: String }, { timestamps: true });
const managementSchema = new mongoose.Schema({ name: String, role: String, photo: String, contact: String }, { timestamps: true });
const documentSchema = new mongoose.Schema({ title: String, category: String, url: String, date: String }, { timestamps: true });
const testimonialSchema = new mongoose.Schema({ name: String, role: String, text: String, rating: Number }, { timestamps: true });
const contactSchema = new mongoose.Schema({ name: String, email: String, phone: String, subject: String, message: String }, { timestamps: true });

const News = mongoose.model('News', newsSchema);
const Faculty = mongoose.model('Faculty', facultySchema);
const Management = mongoose.model('Management', managementSchema);
const Document = mongoose.model('Document', documentSchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema);
const Contact = mongoose.model('Contact', contactSchema);

const models = { news: News, faculty: Faculty, management: Management, documents: Document, testimonials: Testimonial };

// ==================== MIDDLEWARE ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
      "font-src": ["'self'", "fonts.gstatic.com", "data:", "https:"],
      "img-src": ["'self'", "data:", "blob:", "https:", "res.cloudinary.com"],
    },
  },
}));

app.use(morgan('dev'));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://lorettocentralschool.com',
  'https://loretto-cbse-school.pages.dev',
  'https://lorettoschool.pages.dev',
  'https://loretto-cbse-school.onrender.com',
  process.env.FRONTEND_URL || '',
  process.env.RENDER_URL || ''
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== BASIC ROUTES ====================
app.get('/admin-pannel.html', (req, res) => res.redirect('/admin/admin-panel.html'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } });
app.use('/api/', limiter);

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'] || req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// ==================== IMAGE UPLOAD ====================
app.post('/api/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'loretto-school', resource_type: 'auto' },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });
    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.delete('/api/upload/:public_id', authenticate, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(decodeURIComponent(req.params.public_id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// ==================== CRUD API ====================
Object.entries(models).forEach(([name, Model]) => {
  app.get(`/api/${name}`, async (req, res) => {
    try { res.json(await Model.find().sort({ createdAt: -1 })); }
    catch (err) { res.status(500).json({ error: `Failed to fetch ${name}` }); }
  });

  app.post(`/api/${name}`, authenticate, async (req, res) => {
    try { const doc = await new Model(req.body).save(); res.json({ success: true, data: doc }); }
    catch (err) { res.status(500).json({ error: `Failed to save ${name}` }); }
  });

  app.put(`/api/${name}/:id`, authenticate, async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true, data: doc });
    } catch (err) { res.status(500).json({ error: `Failed to update ${name}` }); }
  });

  app.delete(`/api/${name}/:id`, authenticate, async (req, res) => {
    try { await Model.findByIdAndDelete(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: `Failed to delete ${name}` }); }
  });
});

// ==================== CONTACT ====================
app.get('/api/contact', authenticate, async (req, res) => {
  try { res.json(await Contact.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch contacts' }); }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  try {
    await new Contact({ name, email, phone, subject, message }).save();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save message' });
  }

  if (resend && CONTACT_EMAIL) {
    try {
      await resend.emails.send({
        from: 'Loretto School Website <onboarding@resend.dev>',
        to: CONTACT_EMAIL,
        subject: `New Contact Form: ${subject || 'Enquiry'}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#094f4f;padding:20px;text-align:center;">
            <h2 style="color:#e8b020;margin:0;">New Contact Form Submission</h2>
          </div>
          <div style="background:#fff;padding:20px;border-left:4px solid #c8960c;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p style="background:#f5f5f5;padding:12px;white-space:pre-wrap;">${message}</p>
          </div>
        </div>`
      });

      if (email) {
        await resend.emails.send({
          from: 'Loretto Central School <onboarding@resend.dev>',
          to: email,
          subject: 'Thank you for contacting Loretto Central School',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#094f4f;padding:20px;text-align:center;">
              <h2 style="color:#e8b020;margin:0;">Loretto Central School</h2>
            </div>
            <div style="background:#fff;padding:20px;">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for reaching out. We have received your message regarding <strong>"${subject || 'General Enquiry'}"</strong> and will get back to you within 24–48 working hours.</p>
              <br/>
              <p>Best Regards,<br/><strong>Loretto Central School Administration</strong></p>
            </div>
          </div>`
        });
      }
    } catch (err) {
      console.error('Email error:', err);
    }
  }

  res.json({ success: true, message: 'Message sent successfully' });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  const token = req.headers['authorization'] || req.headers['x-admin-token'];
  if (token && token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Invalid admin token' });
  res.json({
    status: 'ok',
    authenticated: !!token,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`
  🚀 Loretto Central School Server
  ----------------------------------
  URL:        http://localhost:${PORT}
  Admin:      http://localhost:${PORT}/admin/admin-login.html
  MongoDB:    ${MONGODB_URI ? '✅ Configured' : '❌ Not configured'}
  Resend:     ${RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}
  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Not configured'}
  `);
});