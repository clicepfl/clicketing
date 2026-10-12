import { directus } from '@/directus';
import { Event, Registration, type Commission } from '@/types/aliases';
import { CORS_ALLOW_ALL_HEADERS } from '@/utils';
import { readItem } from '@directus/sdk';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new Response('', { headers: CORS_ALLOW_ALL_HEADERS });
}

async function calculatePrice(registration: Registration) {
  const event = registration.event as Event;
  return registration.price_to_pay == 'first_price'
    ? event.first_price
    : event.second_price *
        (1 + (registration.plusOnes ?? 0)) *
        (registration.number_purchased ?? 1) +
        (registration.donation ?? 0);
}

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');
  let registration: Registration;
  let event: Event;

  try {
    if (!uid) {
      return NextResponse.json({ error: 'missing uid' }, { status: 400 });
    }

    registration = await directus().request(readItem('registrations', uid));
    event = registration.event as Event;
    console.log(registration);
    console.log(event.name);

    if (!registration) {
      notFound();
    }

    if (event.price_model == 'free') {
      NextResponse.json({ error: 'event is free' }, { status: 400 });
    }

    if (
      registration.price_to_pay != 'first_price' &&
      registration.price_to_pay != 'second_price'
    ) {
      NextResponse.json(
        { error: 'target price does not exist' },
        { status: 400 }
      );
    }
    if (
      registration.price_to_pay == 'second_price' &&
      event.price_model != 'two_prices'
    ) {
      NextResponse.json({ error: 'event only has one price' }, { status: 400 });
    }
  } catch (e) {
    notFound();
  }

  let res;
  if (event.organiser != null) {
    let commission = event.organiser as Commission;
    res = await fetch('https://clic.epfl.ch/qrbill-generator', {
      method: 'POST',
      body: JSON.stringify({
        account: commission.bank_account,
        amount: calculatePrice(registration),
        currency: 'CHF',
        message: `${event.name} - ${registration.first_name} ${registration.family_name}`,
        creditor: {
          name: commission.name,
          street: commission.street,
          houseNo: '',
          postalCode: commission.postal_code,
          town: commission.town,
          countryCode: commission.country_code,
        },
      }),
    });
  } else {
    res = await fetch('https://clic.epfl.ch/qrbill-generator', {
      method: 'POST',
      body: JSON.stringify({
        account: 'CH7704835177498341000',
        amount: calculatePrice(registration),
        currency: 'CHF',
        message: `${event.name} - ${registration.first_name} ${registration.family_name}`,
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
