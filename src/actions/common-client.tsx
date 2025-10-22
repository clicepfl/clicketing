'use client';

import CalendarIcon from '@/components/icons/CalendarIcon';
import MapPinIcon from '@/components/icons/MapPinIcon';
import PriceIcon from '@/components/icons/PriceIcon';
import { Event } from '@/types/aliases';
import { ElementType, ReactNode } from 'react';
import { emailAlreadyUsed } from './common-server';

export enum FormStates {
  Form,
  Loading,
  Confirmation,
  Error,
}

export const IC_SECTIONS = [
  'Computer Science',
  'Communication Systems',
  'Data Science',
  'Cyber Security',
] as const;
export type ICSections = (typeof IC_SECTIONS)[number];

export const SECTIONS = [
  'Computer Science',
  'Communication Systems',
  'Data Science',
  'Cyber Security',
  'Other',
] as const;
export type Sections = (typeof SECTIONS)[number];

export const SPRING_YEARS = [
  'MAN',
  'BA2',
  'BA4',
  'BA6',
  'MA2',
  'MA4',
  'Other',
] as const;
export type SpringYears = (typeof SPRING_YEARS)[number];

export const AUTUMN_YEARS = [
  'BA1',
  'BA3',
  'BA5',
  'MA1',
  'MA3',
  'Other',
] as const;
export type AutumnYears = (typeof AUTUMN_YEARS)[number];

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
 * Validate Participant
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
    return IC_SECTIONS.includes(section as ICSections);
  }
  function isAnySection(section) {
    return SECTIONS.includes(section as Sections);
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
    return AUTUMN_YEARS.includes(year as AutumnYears);
  }
  function isSpringYear(year) {
    return SPRING_YEARS.includes(year as SpringYears);
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

export function formatDate(event: Event) {
  return new Date(event.from).toLocaleDateString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(event: Event) {
  return `${event.price ?? 0}CHF`;
}

export function formatDeposit(event: Event) {
  return `${event.price ?? 0}CHF deposit`;
}

export function makeInfoItems(
  event: Event,
  location: string,
  isDeposit: boolean = false
): [ElementType, ReactNode][] {
  return [
    [CalendarIcon, formatDate(event)],
    [MapPinIcon, location],
    [PriceIcon, isDeposit ? formatDeposit(event) : formatPrice(event)],
  ];
}
