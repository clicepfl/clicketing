import PullFacForm from '@/components/forms/PullFacForm';
import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';

export default async function Pulls({ event }: { event: Event }) {
  let pulls = await directus().request(
    readItems('pulls', {
      filter: { sale_event: { _eq: event.id } },
      fields: ['id', 'front_image', 'back_image', 'name'],
    })
  );

  return <PullFacForm event={event} pulls={pulls} location="INM177" />;
}
