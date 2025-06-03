import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HomeContainer } from '../index';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);

describe('HomeContainer', () => {
  const defaultProps = {
    dispatchGithubRepos: jest.fn(),
    dispatchClearGithubRepos: jest.fn(),
    reposData: null,
    reposError: null,
    repoName: '',
    maxwidth: 1200,
    padding: 20,
    loading: false
  };

  const renderComponent = (props = {}) => {
    const store = mockStore({});
    return render(
      <Provider store={store}>
        <HomeContainer {...defaultProps} {...props} />
      </Provider>
    );
  };

  it('should render without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('should handle search input change', () => {
    renderComponent();
    const searchInput = screen.getByTestId('search-bar');
    fireEvent.change(searchInput, { target: { value: 'test-repo' } });
    // Due to debounce, we need to wait for the callback
    setTimeout(() => {
      expect(defaultProps.dispatchGithubRepos).toHaveBeenCalledWith('test-repo');
    }, 300);
  });

  it('should clear repos when search input is empty', () => {
    renderComponent();
    const searchInput = screen.getByTestId('search-bar');
    fireEvent.change(searchInput, { target: { value: '' } });
    // Due to debounce, we need to wait for the callback
    setTimeout(() => {
      expect(defaultProps.dispatchClearGithubRepos).toHaveBeenCalled();
    }, 300);
  });

  it('should show loading state', () => {
    renderComponent({ loading: true });
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('should show repo list when data is available', () => {
    const reposData = {
      items: [{ id: 1, name: 'repo1', fullName: 'user/repo1', stars: 100 }],
      totalCount: 1
    };
    renderComponent({ reposData, repoName: 'repo1' });
    expect(screen.getByText('repo1')).toBeInTheDocument();
  });

  it('should show error state when there is an error', () => {
    renderComponent({ reposError: 'Not found', repoName: 'invalid-repo' });
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });
});
