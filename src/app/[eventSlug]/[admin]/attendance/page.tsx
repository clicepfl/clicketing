import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import Attendance from './Attendance';

export default async function Page({ params }) {
  const { eventSlug } = params;

  const activities = await directus().request(
    readItems('icbd_activities', {
      // @ts-expect-error
      fields: ['*', { translations: ['*'] }],
      filter: { type: { _in: ['interview', 'cv_correction'] } },
    })
  );

  const registrations = await directus().request(
    readItems('icbd_activities_registrations', {
      fields: ['*', { registration: ['*'] }],
      filter: { icbd_activity: { _in: activities.map((a) => a.id) } },
    })
  );

  return <Attendance activities={activities} registrations={registrations} />;
}
