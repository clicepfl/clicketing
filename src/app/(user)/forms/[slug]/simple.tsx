'use client';

import { Event } from '@prisma/client';

export function Simple({ event }: { event: Event }) {
  return (
    <>
      <h1>{event.name}</h1>
      <button>Register</button>
    </>
  );
}
