import '@styles/style.scss';
import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';

export default async function EventLayout({ children, params }: { children: React.ReactNode, params: any}) {
  let eventSlug = params.eventSlug;
  let event: Event = (
    await directus().request(
      readItems('events', {
        fields: [
          // Explicit list to avoid leaking the admin secret
          'background_color'
        ],
        filter: {
          slug: eventSlug,
        },
      })
    )
  )[0];

  let col = event.background_color;

  return (
    <>
      <style>
        {`:root { --bg-color: ${col}; };`}
      </style>
      <div>{children}</div>
    </>
  );
}
