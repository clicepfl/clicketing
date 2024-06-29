import { join } from 'path';
import { BASE_URL } from './config';

/**
 * @returns The full current URL. Works both on server and client side.
 */
export function getUrl(): string {
  if (typeof window === 'undefined') {
    const h = require('next/headers');
    return h.headers().get('next-url');
  } else {
    return window.location.href;
  }
}

/**
 *  Builds an absolute URL for the given path.
 * @param path path of the URL to build. If it is relative,
 * it will either be appended at the back of `BASE_URL`, if defined,
 * or at the end of the current host.
 * @param searchParams dictionary of search parameters to add to the URL.
 * The entries will be URL encoded.
 * @returns An absolute url with the path and given search parameters.
 */
export function buildURL(
  path: string,
  searchParams?: { [key: string]: string }
): URL {
  var u;

  if (BASE_URL) {
    if (path.startsWith('/')) {
      u = new URL(join(BASE_URL, path));
    } else {
      u = new URL(path);
    }
  } else {
    u = new URL(path, getUrl());
  }

  if (searchParams) {
    Object.entries(searchParams).forEach((e) =>
      u.searchParams.append(e[0], e[1])
    );
  }

  return u;
}
