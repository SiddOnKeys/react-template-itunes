import React from 'react';
import { render } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@app/themes';
import { Default, CustomHeight } from './Header.stories';
import { composeStories } from '@storybook/react';
import * as stories from './Header.stories';

const { DefaultStory } = composeStories(stories);

describe('Header Stories', () => {
  beforeAll(() => {
    i18n.load('en', {
      wednesday_solutions: 'Wednesday Solutions'
    });
    i18n.activate('en');
  });

  const renderWithProviders = (component) =>
    render(
      <ThemeProvider theme={theme}>
        <I18nProvider i18n={i18n}>{component}</I18nProvider>
      </ThemeProvider>
    );

  it('should render Default story correctly', () => {
    const { getByTestId, getByText, getByAltText } = renderWithProviders(<Default {...Default.args} />);
    expect(getByTestId('header')).toBeInTheDocument();
    expect(getByText('Wednesday Solutions')).toBeInTheDocument();
    expect(getByAltText('logo')).toBeInTheDocument();
  });

  it('should render CustomHeight story correctly', () => {
    const { getByTestId } = renderWithProviders(<CustomHeight {...CustomHeight.args} />);
    const header = getByTestId('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveStyle({ height: '10rem' });
  });
});
