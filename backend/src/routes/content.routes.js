import { Router } from 'express';
import { ContentBlock } from '../models/ContentBlock.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

async function upsertContent({ section, slug, key, data }) {
  return ContentBlock.findOneAndUpdate(
    { key },
    { section, slug, key, data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

function resolvePayload(body) {
  if (body && typeof body === 'object' && 'data' in body && body.data && typeof body.data === 'object') {
    return body.data;
  }
  return body;
}

async function getContentByKey(key) {
  return ContentBlock.findOne({ key });
}

async function saveContentByKey(key, body) {
  const parts = key.split('.');
  const section = parts[0] || 'content';
  const slug = parts.slice(1).join('.') || key;
  return upsertContent({ section, slug, key, data: resolvePayload(body) });
}

router.get(
  '/homepage/hero',
  asyncHandler(async (req, res) => {
    const key = 'homepage.hero';
    const item = await getContentByKey(key);
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/homepage/hero',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.hero', req.body);
    res.json(item);
  })
);

router.post(
  '/homepage/hero',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.hero', req.body);
    res.json(item);
  })
);

router.get(
  '/homepage/about',
  asyncHandler(async (req, res) => {
    const key = 'homepage.about';
    const item = await getContentByKey(key);
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/homepage/about',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.about', req.body);
    res.json(item);
  })
);

router.post(
  '/homepage/about',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.about', req.body);
    res.json(item);
  })
);

router.get(
  '/homepage/why-us',
  asyncHandler(async (req, res) => {
    const key = 'homepage.why-us';
    const item = await getContentByKey(key);
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/homepage/why-us',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.why-us', req.body);
    res.json(item);
  })
);

router.post(
  '/homepage/why-us',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.why-us', req.body);
    res.json(item);
  })
);

router.get(
  '/homepage/gallery',
  asyncHandler(async (req, res) => {
    const key = 'homepage.gallery';
    const item = await getContentByKey(key);
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/homepage/gallery',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.gallery', req.body);
    res.json(item);
  })
);

router.post(
  '/homepage/gallery',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.gallery', req.body);
    res.json(item);
  })
);

router.get(
  '/homepage/cta',
  asyncHandler(async (req, res) => {
    const key = 'homepage.cta';
    const item = await getContentByKey(key);
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/homepage/cta',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.cta', req.body);
    res.json(item);
  })
);

router.post(
  '/homepage/cta',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.cta', req.body);
    res.json(item);
  })
);

router.get(
  '/homepage/contact',
  asyncHandler(async (req, res) => {
    const key = 'homepage.contact';
    const item = await getContentByKey(key);
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/homepage/contact',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.contact', req.body);
    res.json(item);
  })
);

router.post(
  '/homepage/contact',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey('homepage.contact', req.body);
    res.json(item);
  })
);

router.get(
  '/content/:key',
  asyncHandler(async (req, res) => {
    const item = await getContentByKey(req.params.key);
    res.json(item || { key: req.params.key, data: {} });
  })
);

router.put(
  '/content/:key',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await saveContentByKey(req.params.key, req.body);
    res.json(item);
  })
);

router.post('/content/:key', requireAdmin, asyncHandler(async (req, res) => {
  const item = await saveContentByKey(req.params.key, req.body);
  res.json(item);
}));

router.get(
  '/about/:section',
  asyncHandler(async (req, res) => {
    const key = `about.${req.params.section}`;
    const item = await ContentBlock.findOne({ key });
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/about/:section',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = req.params.section;
    const item = await upsertContent({
      section: 'about',
      slug,
      key: `about.${slug}`,
      data: resolvePayload(req.body)
    });
    res.json(item);
  })
);

router.post('/about/:section', requireAdmin, asyncHandler(async (req, res) => {
  const slug = req.params.section;
  const item = await upsertContent({
    section: 'about',
    slug,
    key: `about.${slug}`,
    data: resolvePayload(req.body)
  });
  res.json(item);
}));

router.get(
  '/school-info/:section',
  asyncHandler(async (req, res) => {
    const key = `school-info.${req.params.section}`;
    const item = await ContentBlock.findOne({ key });
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/school-info/:section',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = req.params.section;
    const item = await upsertContent({
      section: 'school-info',
      slug,
      key: `school-info.${slug}`,
      data: resolvePayload(req.body)
    });
    res.json(item);
  })
);

router.post('/school-info/:section', requireAdmin, asyncHandler(async (req, res) => {
  const slug = req.params.section;
  const item = await upsertContent({
    section: 'school-info',
    slug,
    key: `school-info.${slug}`,
    data: resolvePayload(req.body)
  });
  res.json(item);
}));

router.put(
  '/school-info',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = req.body.section || req.query.section;
    if (!slug) {
      return res.status(400).json({ error: 'section is required' });
    }
    const payload = resolvePayload(req.body);
    const item = await upsertContent({
      section: 'school-info',
      slug,
      key: `school-info.${slug}`,
      data: payload
    });
    res.json(item);
  })
);

router.post('/school-info', requireAdmin, asyncHandler(async (req, res) => {
  const slug = req.body.section || req.query.section;
  if (!slug) {
    return res.status(400).json({ error: 'section is required' });
  }
  const item = await upsertContent({
    section: 'school-info',
    slug,
    key: `school-info.${slug}`,
    data: resolvePayload(req.body)
  });
  res.json(item);
}));

router.get(
  '/activities-clubs/:slug',
  asyncHandler(async (req, res) => {
    const key = `activities-clubs.${req.params.slug}`;
    const item = await ContentBlock.findOne({ key });
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/activities-clubs/:slug',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const item = await upsertContent({
      section: 'activities-clubs',
      slug,
      key: `activities-clubs.${slug}`,
      data: resolvePayload(req.body)
    });
    res.json(item);
  })
);

router.post('/activities-clubs/:slug', requireAdmin, asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  const item = await upsertContent({
    section: 'activities-clubs',
    slug,
    key: `activities-clubs.${slug}`,
    data: resolvePayload(req.body)
  });
  res.json(item);
}));

router.get(
  '/settings/:key',
  asyncHandler(async (req, res) => {
    const key = `settings.${req.params.key}`;
    const item = await ContentBlock.findOne({ key });
    res.json(item || { key, data: {} });
  })
);

router.put(
  '/settings/:key',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = req.params.key;
    const item = await upsertContent({
      section: 'settings',
      slug,
      key: `settings.${slug}`,
      data: resolvePayload(req.body)
    });
    res.json(item);
  })
);

router.post('/settings/:key', requireAdmin, asyncHandler(async (req, res) => {
  const slug = req.params.key;
  const item = await upsertContent({
    section: 'settings',
    slug,
    key: `settings.${slug}`,
    data: resolvePayload(req.body)
  });
  res.json(item);
}));

export default router;
