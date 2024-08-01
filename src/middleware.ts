import { i18nRouter } from 'next-i18n-router';
import { NextRequest } from 'next/server';
import i18nConfig from './i18nConfig.js';

export function middleware(request: NextRequest) {
  // Adds a `next-url` header accessible only to the backend, to enable layouts to know the full url requested.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('next-url', request.url);

  let res = i18nRouter(request, i18nConfig);
  res.headers.set('next-url', request.url);
  return res;
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
