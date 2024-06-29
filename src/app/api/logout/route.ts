import { deleteAdminSession } from '../../../session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/logout
 *
 * ### Admin
 * Request to terminate the current admin session
 *
 * Query parameters:
 * - type: "admin"
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const searchParams = new URL(request.url).searchParams;
    const type = searchParams.get('type');

    if (type === 'admin') {
      return deleteAdminSession();
    } else {
      throw new Response('Invalid logout type', { status: 500 });
    }
  } catch (_e: any) {
    const e: Response = _e;
    return e;
  }
}
