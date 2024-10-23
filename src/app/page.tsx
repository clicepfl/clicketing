import { directus } from '@/directus';
import { readSingleton } from '@directus/sdk';

export default async function Page() {
  return (
    <p>
      {JSON.stringify(await directus().request(readSingleton('association')))}
      <img src="http://localhost/clicketing/api/qrcode?value=89d02ba9-9e4a-402a-b562-b0f3207556c6&size=1024" />
    </p>
  );
}
