import React from 'react';
import { render } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { WithTranslationId, WithDirectText, WithMargin, WithValues } from './T.stories';
import { composeStories } from '@storybook/react';
import * as stories from './T.stories';

const { Default } = composeStories(stories);

describe('T Stories', () => {
  beforeAll(() => {
    i18n.load('en', {
      repo_search: 'Repository Search',
      sample_text: 'Sample Text'
    });
    i18n.activate('en');
  });

  const renderWithI18n = (component) => render(<I18nProvider i18n={i18n}>{component}</I18nProvider>);

  it('should render WithTranslationId story correctly', () => {
    const { getByText } = renderWithI18n(<WithTranslationId {...WithTranslationId.args} />);
    expect(getByText('Repository Search')).toBeInTheDocument();
  });

  it('should render WithDirectText story correctly', () => {
    const { getByText } = renderWithI18n(<WithDirectText {...WithDirectText.args} />);
    expect(getByText('Direct text without translation')).toBeInTheDocument();
  });

  it('should render WithMargin story correctly', () => {
    const { getByText } = renderWithI18n(<WithMargin {...WithMargin.args} />);
    const element = getByText('Sample Text');
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveStyle({ marginBottom: '20px' });
  });

  it('should render WithValues story correctly', () => {
    const { getByText } = renderWithI18n(<WithValues {...WithValues.args} />);
    expect(getByText('Sample Text')).toBeInTheDocument();
  });
});
