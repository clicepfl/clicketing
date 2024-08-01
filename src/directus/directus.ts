import { createDirectus, rest, staticToken } from '@directus/sdk';
import { DIRECTUS_TOKEN } from '../config';
import { getTranslation } from './locales';
import { Schema, components } from './schema';

export const DIRECTUS_URL = 'https://clic.epfl.ch/directus';

/**
 * Creates a handle to use Directus' API. See the [official documentation](https://docs.directus.io/guides/sdk/getting-started.html).
 *
 * May only be called server-side (e.g. in [`getServerSideProps()`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)).
 *
 * @returns a handle to Directus' API.
 */
export const directus = () =>
  createDirectus<Schema>(DIRECTUS_URL)
    .with(staticToken(DIRECTUS_TOKEN || ''))
    .with(rest());

/**
 * Computes the full URL to access an image returned by the Directus instance,
 * or `undefined` if no image is given.
 * @param image the image object returned by directus
 * @returns the full URL of the image, if any
 */
export function getDirectusImageUrl(
  image: string | components['schemas']['Files'] | null | undefined
): string | undefined {
  return image
    ? `${DIRECTUS_URL}/assets/${
        typeof image === 'string' ? image : image.filename_disk
      }`
    : undefined;
}

/**
 * Remove useless translations, according to the request locale.
 * @param object The object containing the locales. The locale directory.ies can be lower in the hierarchy,
 * e.g. `object` can be a dictionary with one key being the translation dictionary.
 * @param locale The locale to keep
 */
export function cleanTranslations<T>(object: T, locale: string): T {
  function rec(value: any, locale: string | undefined): any {
    if (Array.isArray(value)) {
      return value.map((v) => rec(v, locale));
    } else if (value && typeof value === 'object') {
      return Object.entries(value)
        .map((e) => {
          if (e[0] === 'translations') {
            let t: any[] = e[1] as any[];
            try {
              t = [getTranslation(value, locale, true)];
            } catch {}
            return [e[0], t];
          } else {
            return [e[0], rec(e[1], locale)];
          }
        })
        .reduce((a, b) => ({ ...a, [b[0]]: b[1] }), {});
    } else {
      return value;
    }
  }

  return rec(object, locale);
}
