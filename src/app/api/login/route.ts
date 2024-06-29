import { createAdminSession } from '../../../session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/login
 *
 * ### Admin
 * Request an admin session, to access the administration page (event/staff managment).
 *
 * Query parameters:
 * - type: "admin"
 * - token: token provided by the user, must match the `ADMIN_TOKEN` provided in the configuration.
 *
 * Returns: An error message, or an empty OK response with the session as a cookie.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const searchParams = new URL(request.url).searchParams;
    const type = searchParams.get('type');

    if (type === 'admin') {
      const token = searchParams.get('token');
      if (token === null) {
        throw new Response('Missing token parameter', { status: 400 });
      }

      return createAdminSession(token);
    } else {
      throw new Response('Invalid login type', { status: 500 });
    }
  } catch (_e: any) {
    const e: Response = _e;
    return e;
  }
}
