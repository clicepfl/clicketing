import { directus } from '@/directus';
import { Event, Registration } from '@/types/aliases';
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

  try {
    registration = await directus().request(
      readItem('registrations', uid, { fields: ['*', { event: ['*'] }] })
    );
    event = registration.event as Event;

    if (!registration) {
      notFound();
    }
  } catch (e) {
    notFound();
  }

  console.log(registration);

  const res = await fetch('https://clic.epfl.ch/qrbill-generator', {
    method: 'POST',
    body: JSON.stringify({
      account: 'CH7704835177498341000',
      amount: event.price,
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

  return new NextResponse(await res.text(), {
    headers: { 'content-type': 'image/svg+xml' },
  });
}
