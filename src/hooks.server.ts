import { redirect, type Handle } from '@sveltejs/kit';

// Extend App.Locals to include 'authenticated'
declare global {
  namespace App {
    interface Locals {
      authenticated: boolean;
    }
  }
}

const dev = process.env.NODE_ENV === 'development';
const COOKIE_NAME = 'auth';
const COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  sameSite: 'strict',
  secure: !dev,                 // secure in prod, plain in dev
  maxAge: 60 * 60 * 24 * 7
};

export const handle: Handle = async ({ event, resolve }) => {
  // true/false for the whole request

  event.locals.authenticated = event.cookies.get(COOKIE_NAME) === 'yes';

  /* ── PROTECT JUST /settings ───────────────────────────── */
  if (!event.locals.authenticated && event.url.pathname.startsWith('/settings')) {
    // optional: remember where the user tried to go
    throw redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
  }
  /* ─────────────────────────────────────────────────────── */

  return resolve(event);
};
