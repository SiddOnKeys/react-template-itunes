import React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ProtectedRoute from '../index';
import '@testing-library/jest-dom';

// Mock the route constants
jest.mock('@utils/routeConstants', () => ({
  dashboard: {
    route: '/dashboard',
    isProtected: true
  },
  profile: {
    route: '/profile',
    isProtected: true
  },
  login: {
    route: '/login',
    isProtected: false
  },
  register: {
    route: '/register',
    isProtected: false
  }
}));

describe('<ProtectedRoute />', () => {
  // Mock component to render
  const MockComponent = () => <div data-testid="mock-component">Protected Content</div>;

  // Setup function to create router wrapper
  const renderWithRouter = (ui, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {}) => {
    return {
      ...render(
        <Router history={history}>
          {ui}
        </Router>
      ),
      history
    };
  };

  describe('Protected Routes - Logged In User', () => {
    it('should render component when logged in and accessing protected route', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={true}
          render={MockComponent}
          path="/dashboard"
          exact={true}
        />,
        { route: '/dashboard' }
      );

      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
      expect(history.location.pathname).toBe('/dashboard');
    });

    it('should redirect to dashboard when logged in and accessing login page', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={true}
          render={MockComponent}
          path="/login"
          exact={true}
        />,
        { route: '/login' }
      );

      expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();
      expect(history.location.pathname).toBe('/dashboard');
    });

    it('should redirect to dashboard when logged in and accessing any unprotected route', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={true}
          render={MockComponent}
          path="/register"
          exact={true}
        />,
        { route: '/register' }
      );

      expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();
      expect(history.location.pathname).toBe('/dashboard');
    });
  });

  describe('Protected Routes - Logged Out User', () => {
    const mockHandleLogout = jest.fn();

    beforeEach(() => {
      mockHandleLogout.mockClear();
    });

    it('should redirect to login and call handleLogout when accessing protected route', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={false}
          render={MockComponent}
          path="/dashboard"
          exact={true}
          handleLogout={mockHandleLogout}
        />,
        { route: '/dashboard' }
      );

      expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();
      expect(history.location.pathname).toBe('/login');
      expect(mockHandleLogout).toHaveBeenCalledTimes(1);
    });

    it('should render component when accessing unprotected route', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={false}
          render={MockComponent}
          path="/login"
          exact={true}
          handleLogout={mockHandleLogout}
        />,
        { route: '/login' }
      );

      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
      expect(history.location.pathname).toBe('/login');
      expect(mockHandleLogout).not.toHaveBeenCalled();
    });

    it('should handle nested protected routes correctly', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={false}
          render={MockComponent}
          path="/profile/settings"
          exact={true}
          handleLogout={mockHandleLogout}
        />,
        { route: '/profile/settings' }
      );

      expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();
      expect(history.location.pathname).toBe('/login');
      expect(mockHandleLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined handleLogout prop gracefully', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={false}
          render={MockComponent}
          path="/dashboard"
          exact={true}
        />,
        { route: '/dashboard' }
      );

      expect(history.location.pathname).toBe('/login');
    });

    it('should handle non-exact route matches correctly', () => {
      const { history } = renderWithRouter(
        <ProtectedRoute
          isLoggedIn={true}
          render={MockComponent}
          path="/dashboard"
          exact={false}
        />,
        { route: '/dashboard/summary' }
      );

      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
      expect(history.location.pathname).toBe('/dashboard/summary');
    });
  });
});
