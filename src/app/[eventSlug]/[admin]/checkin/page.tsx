import { ParticipantInfos } from '@/components/Dialog';
import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import { CheckIn, mapRegistration } from './CheckIn';

export default async function Page(props) {
  const eventId = props.eventId;

  const registrations = await directus().request(
    readItems('registrations', { filter: { event: { _eq: eventId } } })
  );

  const participants: ParticipantInfos[] = registrations.map(mapRegistration);

  return <CheckIn participants={participants} />;
}
