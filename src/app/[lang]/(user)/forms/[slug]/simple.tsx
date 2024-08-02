'use client';

import { Event } from '@prisma/client';
import { News } from 'directus/aliases';
import { getTranslation } from 'directus/locales';
import i18nConfig from 'i18nConfig';
import { useCurrentLocale } from 'next-i18n-router/client';
import { registerParticipant } from './db-registration';

export function Simple({ event, news }: { event: Event; news: News }) {
  const locale = useCurrentLocale(i18nConfig);
  const t = getTranslation(news, locale);

  return (
    <>
      <h1>{event.name}</h1>
      <p>{t.description}</p>
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
    </>
  );
}
