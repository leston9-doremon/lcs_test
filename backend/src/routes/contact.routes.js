import { Router } from 'express';
import { Contact } from '../models/Contact.js';
import { ContactInquiry } from '../models/ContactInquiry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { env } from '../config/env.js';

const router = Router();

async function getSingleton() {
  let item = await Contact.findOne();
  if (!item) {
    item = await Contact.create({});
  }
  return item;
}

async function sendResendEmail(payload) {
  if (!env.resendApiKey) {
    return { skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Resend request failed');
  }
  return data;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const item = await getSingleton();
    res.json(item);
  })
);

router.put(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const current = await getSingleton();
    Object.assign(current, req.body);
    await current.save();
    res.json(current);
  })
);

router.post(
  '/enquiry',
  asyncHandler(async (req, res) => {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const phone = (req.body.phone || '').trim();
    const subject = (req.body.subject || 'General Enquiry').trim();
    const message = (req.body.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }

    const settings = await getSingleton();
    if (!settings.formEnabled) {
      return res.status(403).json({ error: 'Contact form is currently disabled' });
    }

    const inquiry = await ContactInquiry.create({
      name,
      email,
      phone,
      subject,
      message
    });

    const recipient = settings.recipientEmail || env.contactEmail || settings.email;
    let adminEmailSent = false;
    let autoReplySent = false;

    if (settings.emailNotifications && recipient) {
      try {
        await sendResendEmail({
          from: env.resendFromEmail,
          to: [recipient],
          reply_to: email,
          subject: `New Contact Form: ${subject}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
              <h2 style="color:#094f4f">New Contact Enquiry</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background:#f7f7f7;padding:16px;border-radius:8px;white-space:pre-wrap">${message}</div>
            </div>
          `
        });
        adminEmailSent = true;
      } catch (error) {
        adminEmailSent = false;
      }
    }

    if (env.resendApiKey) {
      try {
        await sendResendEmail({
          from: env.resendFromEmail,
          to: [email],
          subject: 'We received your message | Loretto Central School',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
              <h2 style="color:#094f4f">Thank you for contacting Loretto Central School</h2>
              <p>Dear ${name},</p>
              <p>We have received your message regarding <strong>${subject}</strong>.</p>
              <p>Our team will get back to you soon.</p>
              <p style="margin-top:24px">Regards,<br/>Loretto Central School</p>
            </div>
          `
        });
        autoReplySent = true;
      } catch (error) {
        autoReplySent = false;
      }
    }

    inquiry.adminEmailSent = adminEmailSent;
    inquiry.autoReplySent = autoReplySent;
    await inquiry.save();

    res.status(201).json({
      ok: true,
      message: 'Your message has been sent successfully',
      emailSent: adminEmailSent || autoReplySent
    });
  })
);

router.get(
  '/inquiries',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const items = await ContactInquiry.find().sort({ createdAt: -1 });
    res.json(items);
  })
);

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const current = await getSingleton();
    Object.assign(current, req.body);
    await current.save();
    res.json(current);
  })
);

export default router;
