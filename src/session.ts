'use server';

import { sign, verify } from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_TOKEN, JWT_SECRET, SESSION_LIFE } from './config';
import { buildUrl } from './url-utils';

export interface AdminSession {
  type: 'admin';
}

const ADMIN_SESSION_COOKIE = 'admin-session';

/**
 * Validate and return a session from the cookies.
 * @param cookieName (string) the name of the cookie containing the session
 * @returns the session, or null if there is none.
 */
async function getVerifiedSession(cookieName: string) {
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
export async function getVerifiedAdminSession(): Promise<AdminSession | null> {
  return await getVerifiedSession(ADMIN_SESSION_COOKIE);
}

/**
 * Validates and returns an `AdminSession`. If there is none (or it is invalid/expired), automatically redirects to the login page.
 * @returns the current `AdminSession`.
 */
export async function verifyAdminSession(): Promise<AdminSession> {
  const session = getVerifiedAdminSession();
  if (session === null) {
    const currentUrl = headers().get('next-url');

    redirect(
      buildUrl('/login', {
        type: 'admin',
        returnUrl: currentUrl,
      }).toString()
    );
  }

  return session;
}

/**
 * Validates a token for the admin session.
 * @param token (string) the token provided by the user
 * @returns Whether the authentication was sucessful.
 */
export async function createAdminSession(token: string): Promise<boolean> {
  if (token === ADMIN_TOKEN) {
    const jwt = sign(JSON.stringify({ type: 'admin' }), JWT_SECRET);

    cookies().set(ADMIN_SESSION_COOKIE, jwt, {
      secure: true, // Only allow on HTTPS connections
      maxAge: SESSION_LIFE,
    });

    revalidatePath('/admin', 'layout');
    return true;
  } else {
    cookies().delete(ADMIN_SESSION_COOKIE);
    return false;
  }
}

/**
 * Deletes the admin session, if any.
 */
export async function deleteAdminSession() {
  cookies().delete(ADMIN_SESSION_COOKIE);
  revalidatePath('/admin', 'layout');
}
