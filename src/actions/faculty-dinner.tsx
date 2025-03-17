'use server';

import { directus } from '@/directus';
import { createItems } from '@directus/sdk';

export async function sendRegistration({
  first_name,
  last_name,
  email,
  section,
  year,
  eventId,
  meal,
}) {
  const eventRegistration = {
    event: eventId,
    email,
    first_name,
    family_name: last_name,
    year,
    section,
    meal,
  };

  const createdRegistration = await directus().request(
    createItems('registrations', [eventRegistration])
  );

  return createdRegistration[0].id;
}
