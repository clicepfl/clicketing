import { sign, verify } from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { JWT_SECRET, ADMIN_TOKEN, SESSION_LIFE } from './config';
import { buildURL } from './url';

export interface AdminSession {
  type: 'admin';
}

const ADMIN_SESSION_COOKIE = 'admin-session';

/**
 * Validate and return a session from the cookies.
 * @param cookieName (string) the name of the cookie containing the session
 * @returns the session, or null if there is none.
 */
function getSession(cookieName: string) {
  try {
    const payload = verify(cookies().get(cookieName).value, JWT_SECRET);

    return typeof payload === 'string' ? JSON.parse(payload) : payload;
  } catch {
    return null;
  }
}

/**
 * Validates and returns an `AdminSession` contained in the cookies. If there is none (or it is invalid/expired), automatically redirects to the login page.
 * @returns the current `AdminSession`, if there is none.
 */
function getAdminSession(): AdminSession | null {
  return getSession(ADMIN_SESSION_COOKIE);
}

/**
 * Validates and returns an `AdminSession`. If there is none (or it is invalid/expired), automatically redirects to the login page.
 * @returns the current `AdminSession`.
 */
export function verifyAdminSession(): AdminSession {
  const session = getAdminSession();
  if (session === null) {
    const currentUrl = headers().get('next-url');

    redirect(
      buildURL('/login', {
        type: 'admin',
        returnUrl: currentUrl,
      }).toString()
    );
  }

  return session;
}

/**
 * Validates a token for the admin session, and returns an HTTP response.
 * @param token (string) the token provided by the user
 * @returns An HTTP response containing either an error or an appropriate Set-Cookie header.
 */
export function createAdminSession(token: string): Response {
  if (token === ADMIN_TOKEN) {
    const jwt = sign(JSON.stringify({ type: 'admin' }), JWT_SECRET);

    cookies().set(ADMIN_SESSION_COOKIE, jwt, {
      secure: true, // Only allow on HTTPS connections
      maxAge: SESSION_LIFE,
    });

    return new Response('');
  } else {
    return new Response('Invalid token', {
      status: 400,
    });
  }
}

export function deleteAdminSession() {
  cookies().delete(ADMIN_SESSION_COOKIE);
  return new Response('');
}
