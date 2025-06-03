import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import ProtectedRoute from './index';
import routeConstants from '@utils/routeConstants';

// Mock translations
const mockTranslations = {
  protectedContent: 'Protected Content',
  loginPage: 'Login Page'
};

const mockStore = configureStore([]);

const TEST_PATH = '/protected';
const REDIRECT_PATH = '/login';
const LOGIN_PAGE_TEST_ID = 'login-page';
const PROTECTED_CONTENT_TEST_ID = 'protected-content';

const MOCK_COMPONENT = () => (
  <div data-testid={PROTECTED_CONTENT_TEST_ID}>{i18n._(mockTranslations.protectedContent)}</div>
);

describe('<ProtectedRoute />', () => {
  let store;

  beforeAll(() => {
    i18n.load('en', mockTranslations);
    i18n.activate('en');
  });

  beforeEach(() => {
    store = mockStore({
      global: {
        isAuthenticated: false
      }
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <MemoryRouter initialEntries={[TEST_PATH]}>
            <ProtectedRoute path={TEST_PATH} component={MOCK_COMPONENT} redirectPath={REDIRECT_PATH} {...props} />
            <Route path={REDIRECT_PATH}>
              <div data-testid={LOGIN_PAGE_TEST_ID}>{i18n._(mockTranslations.loginPage)}</div>
            </Route>
          </MemoryRouter>
        </Provider>
      </I18nProvider>
    );
  };

  it('should redirect to login when not authenticated', () => {
    renderComponent();
    expect(screen.getByTestId(LOGIN_PAGE_TEST_ID)).toBeInTheDocument();
  });

  it('should render protected component when authenticated', () => {
    store = mockStore({
      global: {
        isAuthenticated: true
      }
    });
    renderComponent();
    expect(screen.getByTestId(PROTECTED_CONTENT_TEST_ID)).toBeInTheDocument();
  });

  it('should handle custom redirect path', () => {
    const customRedirectPath = '/custom-login';
    renderComponent({ redirectPath: customRedirectPath });
    expect(window.location.pathname).toBe(customRedirectPath);
  });

  it('should allow access to unprotected routes when not logged in', () => {
    const { queryByTestId } = renderComponent({ redirectPath: routeConstants.home.route });
    expect(queryByTestId(LOGIN_PAGE_TEST_ID)).not.toBeInTheDocument();
  });

  it('should handle logout when session expires', () => {
    const { rerender } = renderComponent({ redirectPath: TEST_PATH });
    rerender(
      <I18nProvider i18n={i18n}>
        <Provider
          store={mockStore({
            global: {
              isAuthenticated: true
            }
          })}
        >
          <MemoryRouter initialEntries={[TEST_PATH]}>
            <ProtectedRoute path={TEST_PATH} component={MOCK_COMPONENT} redirectPath={REDIRECT_PATH} />
            <Route path={REDIRECT_PATH}>
              <div data-testid={LOGIN_PAGE_TEST_ID}>{i18n._(mockTranslations.loginPage)}</div>
            </Route>
          </MemoryRouter>
        </Provider>
      </I18nProvider>
    );
    expect(screen.getByTestId(LOGIN_PAGE_TEST_ID)).toBeInTheDocument();
  });
});
