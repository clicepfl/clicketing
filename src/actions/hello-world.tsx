'use server';
import { directus } from '@/directus';
import { createItems, readItem, readItems } from '@directus/sdk';

export async function teamAlreadyUsed(team: string, eventId: string) {
  const registrations = await directus().request(
    readItems('registrations', {
      filter: {
        _and: [{ team: { _eq: team } }, { event: { _eq: eventId } }],
      },
    })
  );

  return registrations.length !== 0;
}

export async function getTeamMembers(team: string, eventId: string) {
  return await directus().request(
    readItems('registrations', {
      filter: {
        _and: [{ team: { _eq: team } }, { event: { _eq: eventId } }],
      },
    })
  );
}

export async function sendRegistration({
  first_name,
  last_name,
  email,
  section,
  year,
  team,
  eventId,
  comments,
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
    team,
    comments,
  };

  const createdRegistration = await directus().request(
    createItems('registrations', [eventRegistration])
  );

  return createdRegistration[0].id;
}
