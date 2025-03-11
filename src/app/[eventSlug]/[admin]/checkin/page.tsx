import { ParticipantInfos } from '@/components/Dialog';
import { directus } from '@/directus';
import { Registration } from '@/types/aliases';
import { readItems } from '@directus/sdk';
import { CheckIn } from './CheckIn';

function mapRegistration(r: Registration): ParticipantInfos {
  return {
    uid: r.id,
    firstName: r.first_name,
    lastName: r.family_name,
    email: r.email,
    checkedIn: r.checked_in,
    depositMade: r.payment != null,
    depositCanBeReturned: r.can_retreive_deposit,
    depositReturned: r.retreived_deposit,
  };
}

export default async function Page(props) {
  const eventId = props.eventId;

  const registrations = await directus().request(
    readItems('registrations', {
      filter: { event: { _eq: eventId } },
      limit: -1,
    })
  );

  const participants: ParticipantInfos[] = registrations.map((v) =>
    mapRegistration(v)
  );

  return <CheckIn participants={participants} />;
}
