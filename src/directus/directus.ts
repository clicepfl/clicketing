import { createDirectus, rest, staticToken } from '@directus/sdk';
import { DIRECTUS_TOKEN } from '../config';
import { components, Schema } from './schema';

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
