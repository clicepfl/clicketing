import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  // Adds a `next-url` header accessible only to the backend, to enable layouts to know the full url requested.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('next-url', request.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
