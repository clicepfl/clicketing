import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import { CheckIn } from './CheckIn';

export default async function Page(props) {
  const eventId = props.eventId;

  const registrations = await directus().request(
    readItems('registrations', { filter: { event: { _eq: eventId } } })
  );

  const participants = registrations.map((r) => {
    return {
      uid: r.id,
      firstName: r.first_name,
      lastName: r.family_name,
      email: r.email,
      checkedIn: r.checked_in,
      depositMade: r.payment != null,
    };
  });

  return <CheckIn participants={participants} />;
}
