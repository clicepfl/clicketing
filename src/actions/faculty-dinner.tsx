import { directus } from '@/directus';
import { createItems, readItem } from '@directus/sdk';

export async function sendRegistration({
  first_name,
  last_name,
  email,
  section,
  year,
  eventId,
}) {
  const event = await directus().request(
    readItem('events', eventId, { fields: ['*'] })
  );

  const eventRegistration = {
    event,
    email,
    first_name,
    family_name: last_name,
    year,
    section,
    checked_in: false,
    retreived_deposit: false,
    can_retrieve_deposit: false,
    registration_complete: false,
  };

  const createdRegistration = await directus().request(
    createItems('registrations', [eventRegistration])
  );

  return createdRegistration[0].id;
}
