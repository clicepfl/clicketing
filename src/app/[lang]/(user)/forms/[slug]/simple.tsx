'use client';

import { Event, Registration } from '@prisma/client';
import { News } from 'directus/aliases';
import { getTranslation } from 'directus/locales';
import i18nConfig from 'i18nConfig';
import { useCurrentLocale } from 'next-i18n-router/client';
import { useRouter } from 'next/navigation';
import { registerParticipant } from './db-registration';

export function Simple({
  initialValue,
  event,
  news,
}: {
  initialValue: Registration | null;
  event: Event;
  news: News;
}) {
  const locale = useCurrentLocale(i18nConfig);
  const router = useRouter();
  const t = getTranslation(news, locale);

  return (
    <>
      <h1>{event.name}</h1>
      {initialValue == null ? (
        <button
          onClick={async () => {
            const res = await registerParticipant(event.id, {
              email: 'ludovic.mermod@epfl.ch',
              name: 'Ludovic',
              surname: 'Mermod',
            });

            if ('error' in res) {
              alert(res.localized_message[locale]);
            } else {
              router.push(`/forms/${event.slug}/done`);
            }
          }}
        >
          Register
        </button>
      ) : (
        <>
          <p>You are already registered</p>
          <label>Name:</label>
          <input value={initialValue.name} readOnly />
          <br />
          <label>Surname:</label>
          <input value={initialValue.surname} readOnly />
          <br />
          <label>Email:</label>
          <input value={initialValue.email} readOnly />
        </>
      )}
    </>
  );
}
