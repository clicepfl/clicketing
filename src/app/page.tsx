import { directus } from '@/directus';
import { readSingleton } from '@directus/sdk';

export default async function Page() {
  return (
    <p>
      {JSON.stringify(await directus().request(readSingleton('association')))}
    </p>
  );
}
