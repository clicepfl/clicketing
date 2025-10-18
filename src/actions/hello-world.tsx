'use server';
import { directus } from '@/directus';
import { readItems } from '@directus/sdk';

export async function teamAlreadyUsed(team: string, eventId: number) {
  const registrations = await directus().request(
    readItems('registrations', {
      filter: {
        _and: [{ team: { _eq: team } }, { event: { _eq: eventId } }],
      },
    })
  );

  return registrations.length !== 0;
}

export async function getTeamMembers(team: string, eventId: number) {
  return await directus().request(
    readItems('registrations', {
      filter: {
        _and: [{ team: { _eq: team } }, { event: { _eq: eventId } }],
      },
    })
  );
}
