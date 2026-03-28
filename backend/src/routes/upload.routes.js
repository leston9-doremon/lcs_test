import { Router } from 'express';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { cloudinary } from '../config/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

function sanitizeFilenamePart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'file';
}

function looksLikePdf(buffer) {
  if (!buffer || buffer.length < 5) return false;
  return buffer.slice(0, 5).toString('ascii') === '%PDF-';
}

function getFileExtension(filename) {
  const ext = path.extname(String(filename || '')).trim().toLowerCase();
  return ext || '';
}

async function uploadToCloudinary(file) {
  const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
  const folder = isPdf ? 'loretto-uploads/loretto/documents' : 'loretto/images';
  const resourceType = 'image';
  const originalName = file.originalname || '';
  const safeBase = sanitizeFilenamePart(originalName);
  const publicId = `${safeBase}-${crypto.randomUUID().slice(0, 8)}`;
  const tempExt = isPdf ? '.pdf' : getFileExtension(originalName);
  const tempPath = path.join(os.tmpdir(), `${safeBase}-${crypto.randomUUID()}${tempExt}`);

  await fs.writeFile(tempPath, file.buffer);
  try {
    return await cloudinary.uploader.upload(tempPath, {
      resource_type: resourceType,
      asset_folder: folder,
      folder: folder,
      public_id: publicId,
      format: isPdf ? 'pdf' : undefined,
      type: 'upload'
    });
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}

function deleteFromCloudinary({ publicId, resourceType, type }) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType || 'raw',
    type: type || 'upload'
  });
}

/**
 * If the URL is a Cloudinary URL, generate a signed version using our API secret.
 * This ensures the backend can fetch even "authenticated" or restricted public resources.
 */
function signCloudinaryUrl(target) {
  try {
    const url = new URL(target);
    if (!url.hostname.endsWith('cloudinary.com')) return target;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 5) return target;

    // Path structure: /<cloud_name>/<resource_type>/<type>/v<version>/<public_id...>
    let resourceType = parts[1]; // 'image', 'raw', etc.
    const type = parts[2];         // 'upload', 'authenticated', etc.
    let publicId = parts.slice(4).join('/');
    const isPdf = /\.pdf(?:$|[?#])/i.test(publicId);

    if (isPdf && resourceType === 'raw') {
      resourceType = 'image';
    }

    if (isPdf) {
      publicId = publicId.replace(/\.pdf$/i, '');
    }

    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: type,
      sign_url: true,
      secure: true,
      format: isPdf ? 'pdf' : undefined
    });
  } catch (e) {
    console.error('[Sign Error]', e.message);
    return target;
  }
}

function isAllowedDownloadHost(hostname) {
  const value = String(hostname || '').toLowerCase();
  return value === 'res.cloudinary.com'
    || value === 'school.edu'
    || value.endsWith('.school.edu');
}

router.get(
  '/download',
  asyncHandler(async (req, res) => {
    const target = String((req.query && req.query.url) || '').trim();
    const requestedFilename = String((req.query && req.query.filename) || '').trim();
    const inline = String((req.query && req.query.inline) || '').trim() === '1';

    if (!target) {
      return res.status(400).json({ error: 'url is required' });
    }

    let parsed;
    try {
      parsed = new URL(target);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid download URL' });
    }

    // Allow Cloudinary and any school domain
    const isCloudinary = parsed.hostname.endsWith('cloudinary.com');
    if (!['http:', 'https:'].includes(parsed.protocol) || (!isCloudinary && !isAllowedDownloadHost(parsed.hostname))) {
      return res.status(400).json({ error: 'Download URL is not allowed' });
    }

    try {
      // FIX: Sign the URL if it's from Cloudinary to avoid 401 Unauthorized
      const finalUrl = isCloudinary ? signCloudinaryUrl(target) : target;
      console.log('[Download Proxy] Fetching:', finalUrl);
      
      const response = await fetch(finalUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (LorettoBackendProxy)' }
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('[Download Proxy Error]', response.status, errorText);
        return res.status(response.status).json({ 
          error: 'Failed to fetch the file from upstream', 
          status: response.status,
          details: errorText || 'Empty response from Cloudinary',
          target: parsed.toString()
        });
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const rawName = requestedFilename || parsed.pathname.split('/').pop() || 'document.pdf';
      const cleanFilename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      const arrayBuffer = await response.arrayBuffer();
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${cleanFilename}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error('[Download Proxy Exception]', err);
      res.status(500).json({ error: 'Proxy download failed', details: err.message });
    }
  })
);

router.post(
  '/',
  requireAdmin,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const isPdfUpload = req.file.mimetype === 'application/pdf'
      || /\.pdf$/i.test(req.file.originalname || '');

    if (isPdfUpload && !looksLikePdf(req.file.buffer)) {
      return res.status(400).json({
        error: 'Uploaded file is not a valid PDF. Please choose a proper PDF document and try again.'
      });
    }

    const result = await uploadToCloudinary(req.file);
    const publicUrl = isPdfUpload
      ? cloudinary.url(result.public_id, {
          resource_type: 'image',
          type: 'upload',
          secure: true,
          format: 'pdf'
        })
      : result.secure_url;
    res.status(201).json({
      url: publicUrl,
      publicId: result.public_id,
      resourceType: isPdfUpload ? 'image' : result.resource_type,
      type: result.type,
      format: result.format,
      bytes: result.bytes,
      originalFilename: req.file.originalname || '',
      storedFilename: result.public_id ? result.public_id.split('/').pop() : ''
    });
  })
);

router.post(
  '/delete',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const publicId = (req.body && req.body.publicId) || '';
    const resourceType = (req.body && req.body.resourceType) || 'image';
    const type = (req.body && req.body.type) || 'upload';

    if (!publicId) {
      return res.status(400).json({ error: 'publicId is required' });
    }

    const result = await deleteFromCloudinary({ publicId, resourceType, type });
    res.json({
      ok: result.result === 'ok' || result.result === 'not found',
      result: result.result,
      publicId,
      resourceType,
      type
    });
  })
);

export default router;
