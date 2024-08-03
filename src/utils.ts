import { readTranslations } from '@directus/sdk';
import { join } from 'path';
import nextConfig from '../next.config';
import { directus } from './directus/directus';

/**
 * @returns The full current URL. Works both on server and client side.
 */
export function getUrl(): string {
  if (typeof window === 'undefined') {
    const h = require('next/headers'); // Dirty trick since including `next/headers` is not allowed on client-side.
    return h.headers().get('next-url'); // Added by the middleware.
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
export function buildUrl(
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

/**
 * Encapsulate a result from a server action into either a value or an error message.
 */
export type ApiResult<R> =
  | { ok: true; data: R }
  | {
      ok: false;
      error: string;
      localized_message: { [locale: string]: string };
    };
/**
 * Creates an `ApiResult` for success.
 * @param data The data to return in the ApiResult
 */
export function Ok<R>(data: R): ApiResult<R> {
  return { ok: true, data };
}
/**
 * Creates an `ApiResult` for error.
 * @param error The error message to return in the ApiResult
 */
export async function Err<R>(error: ApiError): Promise<ApiResult<R>> {
  let res = await directus().request(
    readTranslations({
      filter: {
        key: { _eq: `clicketing.error.${error}` },
      },
    })
  );

  return {
    ok: false,
    error,
    localized_message: res.reduce(
      (acc, v) => ({ ...acc, [v.language]: v.value }),
      {}
    ),
  };
}

export enum ApiError {
  AlreadyRegistered = 'already_registered',
}
