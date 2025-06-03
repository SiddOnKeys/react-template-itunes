/**
 *
 * Stories for T
 *
 * @see https://github.com/storybookjs/storybook
 *
 */

import React from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import T from '../index';
import { fonts } from '@app/themes';

// Mock translations
i18n.load('en', {
  repo_search: 'Repository Search',
  sample_text: 'Sample Text'
});
i18n.activate('en');

export default {
  title: 'Components/T',
  component: T,
  decorators: [
    (Story) => (
      <I18nProvider i18n={i18n}>
        <Story />
      </I18nProvider>
    )
  ],
  argTypes: {
    type: {
      control: 'select',
      options: Object.keys(fonts.style)
    },
    marginBottom: {
      control: 'number'
    }
  }
};

const Template = (args) => <T {...args} />;

export const WithTranslationId = Template.bind({});
WithTranslationId.args = {
  id: 'repo_search',
  type: 'standard'
};

export const WithDirectText = Template.bind({});
WithDirectText.args = {
  text: 'Direct text without translation',
  type: 'heading'
};

export const WithMargin = Template.bind({});
WithMargin.args = {
  id: 'sample_text',
  marginBottom: 20,
  type: 'standard'
};

export const WithValues = Template.bind({});
WithValues.args = {
  id: 'sample_text',
  values: { value: 'Dynamic Value' },
  type: 'standard'
};
