/*
 *
 * LanguageProvider reducer
 *
 */
import { createReducer, createActions } from 'reduxsauce';
import { produce } from 'immer';
import { DEFAULT_LOCALE } from '@utils/i18n';

export const { Types: languageProviderTypes, Creators: languageProviderActions } = createActions({
  changeLocale: ['locale']
});

export const INITIAL_STATE = {
  locale: DEFAULT_LOCALE
};

const changeLocale = (state = INITIAL_STATE, { locale }) =>
  produce(state, (draft) => {
    draft.locale = locale;
  });

export const HANDLERS = {
  [languageProviderTypes.CHANGE_LOCALE]: changeLocale
};

export default createReducer(INITIAL_STATE, HANDLERS);
