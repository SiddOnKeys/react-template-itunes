/**
 *
 * Stories for Header
 *
 * @see https://github.com/storybookjs/storybook
 *
 */

import React from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import Header from '../index';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@app/themes';

// Mock translations
i18n.load('en', {
  wednesday_solutions: 'Wednesday Solutions'
});
i18n.activate('en');

export default {
  title: 'Components/Header',
  component: Header,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <I18nProvider i18n={i18n}>
          <Story />
        </I18nProvider>
      </ThemeProvider>
    )
  ],
  parameters: {
    layout: 'fullscreen'
  }
};

const Template = (args) => <Header {...args} />;

export const Default = Template.bind({});

export const CustomHeight = Template.bind({});
CustomHeight.args = {
  style: { height: '10rem' }
};
