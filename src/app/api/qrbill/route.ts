import { directus } from '@/directus';
import { Event, Registration, type Commission } from '@/types/aliases';
import { CORS_ALLOW_ALL_HEADERS } from '@/utils';
import { readItem } from '@directus/sdk';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new Response('', { headers: CORS_ALLOW_ALL_HEADERS });
}

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');
  let registration: Registration;
  let event: Event;
  let organiser: Commission;

  if (!uid) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing UID' },
      { status: 400 } // This forces the 400 Bad Request status code
    );
  }

  try {
    registration = await directus().request(
      readItem('registrations', uid, {
        fields: ['*', { event: ['*', { organiser: ['*'] }] }],
      })
    );
    event = registration.event as Event;
    organiser = event.organiser as Commission;
  } catch (e) {
    notFound();
  }

  if (!registration) {
    notFound();
  }

  if (event.price_model === 'free') {
    NextResponse.json(
      { error: 'Bad Request', message: 'Event is free' },
      { status: 400 }
    );
  }

  if (
    registration.price_to_pay !== 'first_price' &&
    registration.price_to_pay !== 'second_price'
  ) {
    NextResponse.json(
      { error: 'Bad Request', message: 'Price to pay does not exist' },
      { status: 400 }
    );
  }

  if (
    registration.price_to_pay === 'second_price' &&
    event.price_model !== 'two_prices'
  ) {
    NextResponse.json(
      { error: 'Bad Request', message: 'Event only has one price' },
      { status: 400 }
    );
  }

  if (
    organiser !== null &&
    (!organiser.name ||
      organiser.name.length === 0 ||
      !organiser.bank_account ||
      organiser.bank_account.length === 0 ||
      !organiser.street ||
      organiser.street.length === 0 ||
      !organiser.town ||
      organiser.town.length === 0 ||
      !organiser.country_code ||
      organiser.country_code.length === 0)
  ) {
    NextResponse.json(
      { error: 'Bad Request', message: 'Billing information not found' },
      { status: 404 }
    );
  }

  const total_price =
    (registration.price_to_pay === 'first_price'
      ? event.first_price
      : event.second_price) *
    (1 + (registration.plusOnes ?? 0)) *
    (registration.number_purchased ?? 1);

  let res;
  if (organiser !== null) {
    res = await fetch('https://clic.epfl.ch/qrbill-generator', {
      method: 'POST',
      body: JSON.stringify({
        account: organiser.bank_account,
        amount: total_price,
        currency: 'CHF',
        message: `${event.name} - ${registration.first_name} ${registration.family_name} ${registration.donation !== null && registration.donation > 0 ? ' - Le don de CHF' + registration.donation + ' sera facturé séparément' : ''}`,
        creditor: {
          name: organiser.name,
          street: organiser.street,
          houseNo: '',
          postalCode: organiser.postal_code,
          town: organiser.town,
          countryCode: organiser.country_code,
        },
      }),
    });
  } else {
    res = await fetch('https://clic.epfl.ch/qrbill-generator', {
      method: 'POST',
      body: JSON.stringify({
        account: 'CH7704835177498341000',
        amount: total_price,
        currency: 'CHF',
        message: `${event.name} - ${registration.first_name} ${registration.family_name} ${registration.donation !== null && registration.donation > 0 ? ' - Le don de CHF' + registration.donation + ' sera facturé séparément' : ''}`,
        creditor: {
          name: 'CLIC',
          street: 'Station 14, EPFL',
          houseNo: '',
          postalCode: '1015',
          town: 'Lausanne',
          countryCode: 'CH',
        },
      }),
    });
  }

  if (!res) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return new NextResponse(await res.text(), {
    headers: { 'content-type': 'image/svg+xml' },
  });
}
