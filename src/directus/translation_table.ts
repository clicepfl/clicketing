import React, { useContext } from 'react';

export type TranslationTable = { [lang: string]: { [key: string]: string } };

export const TranslationTableContext = React.createContext(
  {} as { [key: string]: string }
);

export const useTranslationTable = () => useContext(TranslationTableContext);
