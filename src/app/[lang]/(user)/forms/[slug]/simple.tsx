'use client';

import { Event } from '@prisma/client';
import { News } from 'directus/aliases';
import { getTranslation } from 'directus/locales';
import i18nConfig from 'i18nConfig';
import { useCurrentLocale } from 'next-i18n-router/client';

export function Simple({ event, news }: { event: Event; news: News }) {
  const locale = useCurrentLocale(i18nConfig);
  const t = getTranslation(news, locale);

  return (
    <>
      <h1>{event.name}</h1>
      <p>{t.description}</p>
      <button>Register</button>
    </>
  );
}
