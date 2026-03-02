'use server';

import { directus } from '@/directus';

import { createItems, updateItem } from '@directus/sdk';

export async function sendClothesOrders({ orderID, clothes }) {
  await directus().request(
    createItems(
      'clothes_orders',
      clothes.map((a) => {
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
