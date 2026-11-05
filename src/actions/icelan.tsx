'use server';

import { directus } from '@/directus';
import { createItems, readItem, readItems } from '@directus/sdk';

export async function pseudonymAlreadyUsed(
  pseudonym: string,
  eventId: number
): Promise<boolean> {
  const registrations = await directus().request(
    readItems('registrations', {
      filter: {
        _and: [{ pseudonym: { _eq: pseudonym } }, { event: { _eq: eventId } }],
      },
    })
  );

  return registrations.length !== 0;
}

export async function discordUsernameAlreadyUsed(
  discord_username: string,
  eventId: number
): Promise<boolean> {
  const registrations = await directus().request(
    readItems('registrations', {
      filter: {
        _and: [
          { discord_username: { _eq: discord_username } },
          { event: { _eq: eventId } },
        ],
      },
    })
  );

  return registrations.length !== 0;
}

export async function sendIcelanTournamentInterests({
  registrationID,
  tournamentIDs,
}: {
  registrationID: string;
  tournamentIDs: number[];
}) {
  let tournaments = await directus().request(readItems('icelan_tournois'));

  let registration = await directus().request(
    readItem('registrations', registrationID)
  );

  await directus().request(
    createItems(
      'icelan_tournois_registrations',
      tournamentIDs.map((tournamentID) => ({
        icelan_tournois_id: tournamentID,
        registrations_id: registrationID,
      }))
    )
  );
}

export async function validateIcelanInfo(
  pseudonym: string,
  discord_username: string,
  eventId: number
) {
  if (!pseudonym || pseudonym.length === 0) {
    return 'Pseudonym required';
  }

  if (!discord_username || discord_username.length === 0) {
    return 'Discord username required';
  }

  if (await pseudonymAlreadyUsed(pseudonym, eventId)) {
    return 'Pseudonym is already used';
  }

  if (await discordUsernameAlreadyUsed(discord_username, eventId)) {
    return 'Discord username is already used';
  }
}
