'use server';

import { directus } from '@/directus';

import { createItems, readItems, updateItem } from '@directus/sdk';

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

export async function getOrderItems({ eventID, orderID }) {
  let orders = await directus().request(
    readItems('clothes_orders', {
      filter: { order: { _eq: orderID } },
    })
  );
  let sweaters = await directus().request(
    readItems('clothes', {
      filter: { sale_event: { _eq: eventID } },
    })
  );

  const sweaterToColorName: Record<number, string> = {};
  for (const sweater of sweaters) {
    sweaterToColorName[sweater.id] = sweater.name;
  }

  return orders.map((order) => {
    return {
      size: order.size,
      color:
        typeof order.color != 'number'
          ? 'Unknown color'
          : sweaterToColorName[order.color],
    };
  });
}

export async function completeOrder({ orderID, orderCount }) {
  await directus().request(
    updateItem('registrations', orderID, {
      order_complete: true,
      number_purchased: orderCount,
    })
  );
}
