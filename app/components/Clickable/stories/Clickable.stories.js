/**
 *
 * Stories for Clickable
 *
 * @see https://github.com/storybookjs/storybook
 *
 */

import React from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { Clickable } from '../index';
import { action } from '@storybook/addon-actions';

// Mock translations
i18n.load('en', {
  stories: 'Click me!',
  custom_text: 'Custom clickable text'
});
i18n.activate('en');

export default {
  title: 'Components/Clickable',
  component: Clickable,
  decorators: [
    (Story) => (
      <I18nProvider i18n={i18n}>
        <Story />
      </I18nProvider>
    )
  ],
  argTypes: {
    onClick: { action: 'clicked' }
  }
};

const Template = (args) => <Clickable {...args} />;

export const Default = Template.bind({});
Default.args = {
  onClick: action('clicked'),
  textId: 'stories'
};

export const CustomText = Template.bind({});
CustomText.args = {
  onClick: action('clicked'),
  textId: 'custom_text'
};

export const WithCustomStyle = Template.bind({});
WithCustomStyle.args = {
  onClick: action('clicked'),
  textId: 'stories',
  style: {
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '10px'
  }
};
