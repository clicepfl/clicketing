import { getICBDActivities } from '@/actions/icbd';
import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import Attendance from './Attendance';

export default async function Page({ params }) {
  const eventSlug = params.eventSlug;

  const event = (
    await directus().request(
      readItems('events', {
        filter: { slug: { _eq: eventSlug } },
        limit: -1,
      })
    )
  )[0];

  // ICBD Only
  if (event.type !== 'icbd') {
    throw new Error('Attendance page is only available for ICBD events');
  }

  const activities = (await getICBDActivities(eventSlug)).filter(
    (a) => a.type == 'interview'
  );

  const registrations = await directus().request(
    readItems('icbd_activities_registrations', {
      fields: ['*', { registration: ['*'] }],
      filter: { icbd_activity: { _in: activities.map((a) => a.id) } },
      limit: -1,
    })
  );

  return <Attendance activities={activities} registrations={registrations} />;
}
