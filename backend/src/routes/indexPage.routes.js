import { Router } from 'express';
import { ContentBlock } from '../models/ContentBlock.js';
import { News } from '../models/News.js';
import { Testimonial } from '../models/Testimonial.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

const SECTION_MAP = {
  hero: 'homepage.hero',
  about: 'homepage.about',
  whyUs: 'homepage.why-us',
  gallery: 'homepage.gallery',
  cta: 'homepage.cta',
  contact: 'homepage.contact'
};

function resolvePayload(body) {
  if (body && typeof body === 'object' && body.data && typeof body.data === 'object') {
    return body.data;
  }
  return body;
}

async function getSectionData() {
  const keys = Object.values(SECTION_MAP);
  const blocks = await ContentBlock.find({ key: { $in: keys } });
  const byKey = new Map(blocks.map((item) => [item.key, item.data || {}]));

  return {
    hero: byKey.get(SECTION_MAP.hero) || {},
    about: byKey.get(SECTION_MAP.about) || {},
    whyUs: byKey.get(SECTION_MAP.whyUs) || {},
    gallery: byKey.get(SECTION_MAP.gallery) || {},
    cta: byKey.get(SECTION_MAP.cta) || {},
    contact: byKey.get(SECTION_MAP.contact) || {}
  };
}

async function saveSection(sectionName, data) {
  const key = SECTION_MAP[sectionName];
  if (!key) return null;

  const parts = key.split('.');
  const section = parts[0];
  const slug = parts.slice(1).join('.');

  return ContentBlock.findOneAndUpdate(
    { key },
    { key, section, slug, data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

router.get(
  '/index-page',
  asyncHandler(async (req, res) => {
    const [sections, latestNews, testimonials] = await Promise.all([
      getSectionData(),
      News.find({ visible: { $ne: false } }).sort({ updatedAt: -1, createdAt: -1, date: -1 }).limit(3),
      Testimonial.find({ visible: { $ne: false } }).sort({ order: 1, createdAt: -1 }).limit(4)
    ]);

    res.json({
      ok: true,
      sections,
      latestNews,
      testimonials
    });
  })
);

router.get(
  '/index-page/:section',
  asyncHandler(async (req, res) => {
    const sectionName = req.params.section;
    const key = SECTION_MAP[sectionName];
    if (!key) return res.status(404).json({ error: 'Unknown index page section' });

    const item = await ContentBlock.findOne({ key });
    res.json({
      ok: true,
      section: sectionName,
      key,
      data: item && item.data && typeof item.data === 'object' ? item.data : {}
    });
  })
);

router.put(
  '/index-page',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = resolvePayload(req.body) || {};
    const sections = payload.sections && typeof payload.sections === 'object' ? payload.sections : payload;

    const sectionNames = Object.keys(SECTION_MAP).filter((name) => sections[name] && typeof sections[name] === 'object');
    await Promise.all(sectionNames.map((name) => saveSection(name, sections[name])));

    const refreshedSections = await getSectionData();
    res.json({ ok: true, sections: refreshedSections });
  })
);

router.put(
  '/index-page/:section',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const sectionName = req.params.section;
    if (!SECTION_MAP[sectionName]) {
      return res.status(404).json({ error: 'Unknown index page section' });
    }

    const data = resolvePayload(req.body);
    const item = await saveSection(sectionName, data && typeof data === 'object' ? data : {});

    res.json({
      ok: true,
      section: sectionName,
      key: SECTION_MAP[sectionName],
      data: item.data || {}
    });
  })
);

export default router;
