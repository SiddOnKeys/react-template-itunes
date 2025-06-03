/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 *
 */

import get from 'lodash/get';

const enTranslationMessages =
  process.env.NODE_ENV === 'production' ? require('../translations/en').messages : require('../translations/en.json');

export const DEFAULT_LOCALE = 'en';

// prettier-ignore
export const appLocales = [
  'en',
];

export const formatTranslationMessages = (locale, messages) => {
  if (!messages || typeof messages !== 'object') {
    return {};
  }

  const defaultFormattedMessages =
    locale !== DEFAULT_LOCALE ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages) : {};

  // Convert to entries, map them safely, and convert back to object
  return Object.fromEntries(
    Object.entries(messages).map(([key, value]) => [key, value || get(defaultFormattedMessages, key, '')])
  );
};

export const translationMessages = {
  en: formatTranslationMessages('en', enTranslationMessages)
};
