'use server';

import { directus } from '@/directus';
import { Registration } from '@/types/aliases';
import { createItems, readItem, readItems, updateItem } from '@directus/sdk';

export enum FormStates {
  Form,
  Loading,
  Confirmation,
  Error,
}

export enum ICSections {
  ComputerScience = 'Computer Science',
  CommunicationSystems = 'Communication Systems',
  DataScience = 'Data Science',
  CyberSecurity = 'Cyber Security',
}

export enum Sections {
  ComputerScience = 'Computer Science',
  CommunicationSystems = 'Communication Systems',
  DataScience = 'Data Science',
  CyberSecurity = 'Cyber Security',
}

export enum SpringYears {
  MAN = 'MAN',
  BA2 = 'BA2',
  BA4 = 'BA4',
  BA6 = 'BA6',
  MA2 = 'MA2',
  MA4 = 'MA4',
  Other = 'Other',
}

export enum AutumnYears {
  BA1 = 'BA1',
  BA3 = 'BA3',
  BA5 = 'BA5',
  MA1 = 'MA1',
  MA3 = 'MA3',
  Other = 'Other',
}

export type ParticipantState = {
  firstName: string;
  lastName: string;
  email: string;
  section: string;
  year: string;
};

export const emptyParticipantState: ParticipantState = {
  firstName: '',
  lastName: '',
  email: '',
  section: '',
  year: '',
};

export enum Season {
  Autumn,
  Spring,
}

/**
 *
 * @param participant : participant to validate
 * @param eventId : event ID
 * @param season : season the event takes place in
 * @param onlyIC : whether only IC sections are allowed, or other sections as well
 * @param allowExternalEmail : allow non @epfl.ch emails
 * @param allowNoSection : allow any value for section
 * @param allowNoYear : allow any value for year
 * @returns
 */
export async function validateParticipant(
  participant: ParticipantState,
  eventId: number,
  season: Season,
  onlyIC: boolean = false,
  allowExternalEmail: boolean = false,
  allowNoSection: boolean = false,
  allowNoYear: boolean = false
) {
  if (!participant.firstName || participant.firstName.length === 0) {
    return 'First name is required';
  }

  if (!participant.lastName || participant.lastName.length === 0) {
    return 'Last name is required';
  }

  if (!participant.email) {
    return 'Email is required';
  }
  if (await emailAlreadyUsed(participant.email.toLowerCase(), eventId)) {
    return 'Email is already used';
  }

  if (
    !allowExternalEmail &&
    !/^[A-Za-z\-]+\.[A-Za-z\-]+@epfl\.ch$/.test(participant.email)
  ) {
    return 'Email must be EPFL email';
  }

  function isICSection(section) {
    return Object.values(ICSections).includes(section as ICSections);
  }
  function isAnySection(section) {
    return Object.values(Sections).includes(section as Sections);
  }

  if (
    !allowNoSection &&
    (!participant.section ||
      (onlyIC && !isICSection(participant.section)) ||
      (!onlyIC && !isAnySection(participant.section)))
  ) {
    return 'Section is required';
  }

  function isAutumnYear(year) {
    return Object.values(AutumnYears).includes(year as AutumnYears);
  }
  function isSpringYear(year) {
    return Object.values(SpringYears).includes(year as SpringYears);
  }

  if (
    !allowNoYear &&
    (!participant.year ||
      (season == Season.Autumn && !isAutumnYear(participant.year)) ||
      (season == Season.Spring && !isSpringYear(participant.year)))
  ) {
    return 'Year is required';
  }

  return null;
}

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
