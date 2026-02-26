'use server';

import { directus } from '@/directus';

import { createItems } from '@directus/sdk';

export async function sendPullsOrders({ orderID, pulls }) {
  await directus().request(
    createItems(
      'pulls_orders',
      pulls.map((a) => {
        return {
          size: a.size,
          color: a.color,
          order: orderID,
        };
      })
    )
  );
}
