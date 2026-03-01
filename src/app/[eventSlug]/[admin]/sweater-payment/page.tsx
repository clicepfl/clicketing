import { directus } from '@/directus';
import { readItems } from '@directus/sdk';
import SweaterPayment from './SweaterPayment';

export default async function Page({ params }) {
  const eventSlug = params.eventSlug;

  const event = (
    await directus().request(
      readItems('events', {
        filter: { slug: { _eq: eventSlug } },
        limit: -1,
      })
    )
  )[0];

  const registrations = await directus().request(
    readItems('registrations', {
      filter: { event: { slug: { _eq: eventSlug } } },
      limit: -1,
    })
  );

  const orders = await directus().request(
    readItems('pulls_orders', {
      filter: { order: { event: { slug: { _eq: eventSlug } } } },
      limit: -1,
    })
  );

  const sweaters = await directus().request(
    readItems('pulls', {
      filter: { sale_event: { slug: { _eq: eventSlug } } },
      limit: -1,
    })
  );

  // orders and pulls are raw arrays
  // we want a map from order -> list of sweaters
  const sweaterToColorName: Record<number, string> = {};
  for (const sweater of sweaters) {
    sweaterToColorName[sweater.id] = sweater.name;
  }

  const orderToSweaters: Record<string, { color?: string; size?: string }[]> =
    {};
  for (const order of orders) {
    if (typeof order.order != 'string' || typeof order.color != 'number')
      continue;

    if (orderToSweaters[order.order] === undefined) {
      orderToSweaters[order.order] = [];
    }
    orderToSweaters[order.order].push({
      color: sweaterToColorName[order.color],
      size: order.size,
    });
  }

  return (
    <SweaterPayment
      event={event}
      participants={registrations}
      orders={orderToSweaters}
    />
  );
}
