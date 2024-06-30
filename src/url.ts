import { join } from 'path';
import nextConfig from '../next.config';

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
 * Builds an URL for the given path.
 * @param path path of the URL to build. If it is relative,
 * it will either be appended at the back of `BASE_URL`, if defined,
 * or at the end of the current host.
 * @param searchParams dictionary of search parameters to add to the URL.
 * The entries will be URL encoded.
 * @param absolute wether the URL must be absolute. If true (default), it will
 * use the current host and the basepath specified in `next.config.js`. Should be
 * set to `false` when used for NextJs's links and routers.
 * @returns An absolute url with the path and given search parameters.
 */
export function buildURL(
  path: string,
  searchParams?: { [key: string]: string },
  absolute?: boolean
): URL {
  var u: URL;

  if (absolute !== false && path.startsWith('/')) {
    u = new URL(join(nextConfig.basePath, path), getUrl());
  } else {
    u = new URL(path);
  }

  if (searchParams) {
    Object.entries(searchParams).forEach((e) =>
      u.searchParams.append(e[0], e[1])
    );
  }

  return u;
}
