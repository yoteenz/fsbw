/**
 * POST /api/send-email — alias for POST /api/email/send
 * Server-side transactional email via Resend (admin session, EMAIL_SEND_SECRET, or preview mode).
 */
export { default } from './email/send.js';
