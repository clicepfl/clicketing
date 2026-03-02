import PullFacForm from '@/components/forms/PullFacForm';
import { directus } from '@/directus';
import { Event } from '@/types/aliases';
import { readItems } from '@directus/sdk';

export default async function Clothes({ event }: { event: Event }) {
  let clothes = await directus().request(
    readItems('clothes', {
      filter: { sale_event: { _eq: event.id } },
      fields: ['id', 'front_image', 'back_image', 'name'],
    })
  );

  return <PullFacForm event={event} clothes={clothes} location="INM177" />;
}
