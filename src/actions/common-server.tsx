'use server';

import { directus } from '@/directus';
import { Registration } from '@/types/aliases';
import { createItems, readItem, readItems, updateItem } from '@directus/sdk';
import { ParticipantState } from './common-client';

export async function emailAlreadyUsed(
  email: string,
  eventId: number
): Promise<boolean> {
  const registrations = await directus().request(
    readItems('registrations', {
      filter: {
        _and: [{ email: { _eq: email } }, { event: { _eq: eventId } }],
      },
    })
  );

  return registrations.length !== 0;
}

export async function getRegistrations(eventId: number) {
  return await directus().request(
    readItems('registrations', { filter: { event: { _eq: eventId } } })
  );
}

export async function getRegistration(id: string) {
  try {
    return await directus().request(readItem('registrations', id));
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function checkInRegistration(
  registrationId: string
): Promise<Registration> {
  return await directus().request(
    updateItem('registrations', registrationId, { checked_in: true })
  );
}

export async function markPayment(
  registrationId: string,
  payment: string,
  sendConfirmationMail = true
): Promise<Registration> {
  return await directus().request(
    updateItem('registrations', registrationId, {
      payment,
      confirmation_email_sent: !sendConfirmationMail,
    })
  );
}

export type BasicRegistrationInfo = {
  eventId: number;
  participant: ParticipantState;
  comments: string | null;
};

export type FacultyDinnerInfo = {
  meal;
  allergies;
  plus_ones;
  guest;
};

export type HelloWorldInfo = {
  team;
};

export type RegistrationInfo = BasicRegistrationInfo &
  (FacultyDinnerInfo | HelloWorldInfo | {});

export async function sendRegistration(
  { eventId, participant, comments }: RegistrationInfo,
  { meal, allergies, plus_ones, guest }: FacultyDinnerInfo = {
    meal: null,
    allergies: null,
    plus_ones: null,
    guest: null,
  },
  { team }: HelloWorldInfo = { team: null }
) {
  const event = await directus().request(readItem('events', eventId));

  if (!event.opened) {
    throw new Error('Not opened');
  }

  const eventRegistration: Registration = {
    event: eventId,
    email: participant.email.toLowerCase(),
    first_name: participant.firstName,
    family_name: participant.lastName,
    year: participant.year,
    section: participant.section,
    comments,
    // Faculty Dinner
    meal,
    allergies,
    plusOnes: plus_ones,
    guest,
    // Hello World
    team,
    // ICBD
    checked_in: false,
    retreived_deposit: false,
    can_retreive_deposit: false,
    registration_complete: false,
  };

  const createdRegistration = await directus().request(
    createItems('registrations', [eventRegistration])
  );

  return createdRegistration[0].id;
}
