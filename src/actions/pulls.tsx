'use server';

import { directus } from '@/directus';

import { createItems, updateItem } from '@directus/sdk';

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

export async function completeOrder({ orderID }) {
  await directus().request(
    updateItem('registrations', orderID, { order_complete: true })
  );
}
