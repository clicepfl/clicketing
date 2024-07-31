import { i18nRouter } from 'next-i18n-router';
import { NextRequest, NextResponse } from 'next/server';
import i18nConfig from './i18nConfig.js';

export function middleware(request: NextRequest) {
  // Adds a `next-url` header accessible only to the backend, to enable layouts to know the full url requested.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('next-url', request.url);

  let res = i18nRouter(request, i18nConfig);
  res.headers.set('next-url', request.url);
  return res;
}
