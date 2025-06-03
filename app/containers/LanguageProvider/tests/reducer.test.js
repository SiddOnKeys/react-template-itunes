import reducer, { INITIAL_STATE as initialState, languageProviderTypes } from '../reducer';

/* eslint-disable default-case, no-param-reassign */
describe('Tests for LanguageProvider actions', () => {
  let mockedState;
  beforeEach(() => {
    mockedState = initialState;
  });

  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toEqual(mockedState);
  });

  it('changes the locale', () => {
    const locale = 'de';
    mockedState = { ...mockedState, locale };
    expect(
      reducer(undefined, {
        type: languageProviderTypes.CHANGE_LOCALE,
        locale
      })
    ).toEqual(mockedState);
  });
});
