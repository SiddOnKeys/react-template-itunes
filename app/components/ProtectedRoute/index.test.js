import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import ProtectedRoute from './index';
import routeConstants from '@utils/routeConstants';

describe('<ProtectedRoute />', () => {
  const mockProps = {
    render: () => <div>Protected Content</div>,
    isLoggedIn: false,
    handleLogout: jest.fn()
  };

  const renderWithRouter = (props, initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ProtectedRoute {...props} path="/protected" exact />
        <Route path={routeConstants.login.route} render={() => <div>Login Page</div>} />
      </MemoryRouter>
    );
  };

  it('should redirect to login when accessing protected route while not logged in', () => {
    const { queryByText } = renderWithRouter(mockProps, '/protected');
    expect(queryByText('Protected Content')).not.toBeInTheDocument();
    expect(queryByText('Login Page')).toBeInTheDocument();
  });

  it('should render protected content when user is logged in', () => {
    const { queryByText } = renderWithRouter({ ...mockProps, isLoggedIn: true }, '/protected');
    expect(queryByText('Protected Content')).toBeInTheDocument();
    expect(queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('should allow access to unprotected routes when not logged in', () => {
    const { queryByText } = renderWithRouter(mockProps, routeConstants.home.route);
    expect(queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('should handle logout when session expires', () => {
    const { rerender } = renderWithRouter({ ...mockProps, isLoggedIn: true }, '/protected');
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute {...mockProps} path="/protected" exact />
        <Route path={routeConstants.login.route} render={() => <div>Login Page</div>} />
      </MemoryRouter>
    );
    expect(mockProps.handleLogout).toHaveBeenCalled();
  });
});
