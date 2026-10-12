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

export type RegistrationInfo = {
  eventId: number;
  participant: ParticipantState;
  comments: string | null;
  price_to_pay: string;
  additionalInfos?: FoodInfo | FacultyDinnerInfo | HelloWorldInfo | IcelanInfo;
};

export type FoodInfo = {
  meal: number;
  allergies: string;
};

export type FacultyDinnerInfo = {
  plusOnes: number;
  guest: boolean;
};

export type HelloWorldInfo = {
  team: string;
};
export type IcelanInfo = {
  pseudonym: string;
  discord_username: string;
  student: boolean;
  donation: number;
};

export async function sendRegistration(info: RegistrationInfo) {
  const event = await directus().request(readItem('events', info.eventId));

  if (!event.opened) {
    throw new Error('Not opened');
  }

  const createdRegistration = await directus().request(
    createItems('registrations', [
      {
        event: info.eventId,
        email: info.participant.email.toLowerCase(),
        first_name: info.participant.firstName,
        family_name: info.participant.lastName,
        year: info.participant.year,
        section: info.participant.section,
        comments: info.comments,
        price_to_pay: info.price_to_pay,
        // ICBD
        checked_in: false,
        retreived_deposit: false,
        can_retreive_deposit: false,
        registration_complete: false,
        // Clothes
        order_complete: false,
        ...(info.additionalInfos || {}),
      },
    ])
  );

  return createdRegistration[0].id;
}
