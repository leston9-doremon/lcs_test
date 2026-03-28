import { Router } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/', (req, res) => {
  const token = req.header('x-admin-token');
  const identifier = (req.header('x-admin-identifier') || '').trim().toLowerCase();
  
  const authConfigured = Boolean(env.adminToken);
  const identifierConfigured = Boolean(env.adminUsername || env.adminEmail);
  const identifierMatches = !identifierConfigured
    ? true
    : (identifier === env.adminUsername || identifier === env.adminEmail);
  const authenticated = authConfigured && token === env.adminToken && identifierMatches;

  console.log('[DEBUG] Health Check:', {
    hasToken: !!token,
    authConfigured,
    identifierConfigured,
    identifierMatches,
    authenticated,
    envTokenSet: !!env.adminToken,
    headers: req.headers
  });

  res.status(authConfigured || !token ? 200 : 503).json({
    ok: true,
    service: 'loretto-backend',
    time: new Date().toISOString(),
    authConfigured,
    identifierConfigured,
    authenticated
  });
});

export default router;
