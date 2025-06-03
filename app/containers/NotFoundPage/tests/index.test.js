import React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import NotFound from '../index';

// Mock translations
const mockTranslations = {
  not_found_page_container: '404 - Page Not Found'
};

describe('<NotFound />', () => {
  beforeAll(() => {
    i18n.load('en', mockTranslations);
    i18n.activate('en');
  });

  const renderComponent = () => {
    return render(
      <I18nProvider i18n={i18n}>
        <NotFound />
      </I18nProvider>
    );
  };

  it('should render the 404 message', () => {
    renderComponent();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });

  it('should use the correct heading level', () => {
    renderComponent();
    const heading = screen.getByRole('heading');
    expect(heading.tagName).toBe('H1');
  });

  it('should render with translation key', () => {
    renderComponent();
    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe(mockTranslations.not_found_page_container);
  });
});
