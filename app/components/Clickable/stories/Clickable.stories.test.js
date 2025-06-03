import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { Default, CustomText, WithCustomStyle } from './Clickable.stories';
import { composeStories } from '@storybook/react';
import * as stories from './Clickable.stories';

const { DefaultStory } = composeStories(stories);

describe('Clickable Stories', () => {
  beforeAll(() => {
    i18n.load('en', {
      stories: 'Click me!',
      custom_text: 'Custom clickable text'
    });
    i18n.activate('en');
  });

  const renderWithI18n = (component) => render(<I18nProvider i18n={i18n}>{component}</I18nProvider>);

  it('should render Default story correctly and handle click', () => {
    const mockClick = jest.fn();
    const { getByText, getByTestId } = renderWithI18n(<Default {...Default.args} onClick={mockClick} />);

    expect(getByText('Click me!')).toBeInTheDocument();
    expect(getByTestId('clickable')).toBeInTheDocument();

    fireEvent.click(getByTestId('clickable'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should render CustomText story correctly', () => {
    const { getByText } = renderWithI18n(<CustomText {...CustomText.args} />);
    expect(getByText('Custom clickable text')).toBeInTheDocument();
  });

  it('should render WithCustomStyle story correctly', () => {
    const { getByTestId } = renderWithI18n(<WithCustomStyle {...WithCustomStyle.args} />);
    const element = getByTestId('clickable');
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyle({
      fontSize: '20px',
      fontWeight: 'bold',
      padding: '10px'
    });
  });
});
