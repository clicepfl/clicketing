import { CORS_ALLOW_ALL_HEADERS } from '@/utils';
import { NextRequest } from 'next/server';
import { toDataURL } from 'qrcode';

export async function OPTIONS() {
  return new Response('', { headers: CORS_ALLOW_ALL_HEADERS });
}

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET(request: NextRequest) {
  const value = request.nextUrl.searchParams.get('value');
  const size = request.nextUrl.searchParams.get('size');

  if (!value || (typeof size === 'string' && !size.match(/^\d+$/))) {
    return new Response('', { status: 400 });
  }

  const uri: string = await toDataURL(value, { width: parseInt(size) });
  const base64 = uri.substring('data:image/png;base64,'.length);

  return new Response(new Uint8Array(Buffer.from(base64, 'base64')), {
    status: 200,
    headers: { 'Content-Type': 'image/png', ...CORS_ALLOW_ALL_HEADERS },
  });
}
