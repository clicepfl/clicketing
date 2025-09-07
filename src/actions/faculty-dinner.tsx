'use server';

import { directus } from '@/directus';
import { createItems, readItem } from '@directus/sdk';

export async function sendRegistration({
  first_name,
  last_name,
  email,
  section,
  year,
  eventId,
  meal,
  comments,
  plus_ones,
  guest,
}) {
  const event = await directus().request(readItem('events', eventId));

  if (!event.opened) {
    throw new Error('Not opened');
  }

  const eventRegistration = {
    event: eventId,
    email,
    first_name,
    family_name: last_name,
    year,
    section,
    meal,
    comments,
    plusOnes: plus_ones,
    guest,
  };

  const createdRegistration = await directus().request(
    createItems('registrations', [eventRegistration])
  );

  return createdRegistration[0].id;
}
