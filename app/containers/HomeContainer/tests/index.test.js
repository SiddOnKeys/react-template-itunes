import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HomeContainer } from '../index';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';

// Mock translations
const mockTranslations = {
  repo_search: 'Repository Search',
  get_repo_details: 'Search for a repository to see details',
  default_template: 'Search repositories...',
  stories: 'Go to Stories',
  search_query: 'Search results for: {{repoName}}',
  repo_count: 'Found {{count}} matching repositories',
  repo_search_default: 'Enter a repository name to search'
};

i18n.load('en', mockTranslations);
i18n.activate('en');

const mockStore = configureStore([]);

describe('<HomeContainer />', () => {
  const mockRepos = [
    {
      id: 1,
      name: 'test-repo',
      description: 'Test repository',
      stargazers_count: 100,
      language: 'JavaScript'
    }
  ];

  const defaultProps = {
    reposData: { items: [] },
    repoName: '',
    loading: false,
    reposError: null,
    dispatchGithubRepos: jest.fn(),
    dispatchClearRepos: jest.fn(),
    dispatchSearchRepos: jest.fn()
  };

  const renderComponent = (props = {}) => {
    const store = mockStore({
      homeContainer: {
        reposData: { items: [] },
        repoName: '',
        loading: false,
        reposError: null,
        ...props
      }
    });

    return render(
      <Provider store={store}>
        <I18nProvider i18n={i18n}>
          <BrowserRouter>
            <HomeContainer {...defaultProps} {...props} />
          </BrowserRouter>
        </I18nProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render', () => {
    renderComponent();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('should handle search input change', () => {
    const dispatchSearchRepos = jest.fn();
    renderComponent({ dispatchSearchRepos });
    const searchInput = screen.getByTestId('search-bar');

    fireEvent.change(searchInput, { target: { value: 'test-repo' } });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(dispatchSearchRepos).toHaveBeenCalledWith('test-repo');
  });

  it('should clear repos when search input is empty', () => {
    const dispatchClearRepos = jest.fn();
    renderComponent({ dispatchClearRepos });
    const searchInput = screen.getByTestId('search-bar');

    // First set a value
    fireEvent.change(searchInput, { target: { value: 'test' } });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Then clear it
    fireEvent.change(searchInput, { target: { value: '' } });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(dispatchClearRepos).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    renderComponent({ loading: true });
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should show repo list', () => {
    const reposData = { items: mockRepos };
    renderComponent({
      reposData,
      repoName: 'test'
    });
    expect(screen.getByText('test-repo')).toBeInTheDocument();
  });

  it('should show error state', () => {
    const error = 'Repository not found';
    renderComponent({
      reposError: error,
      repoName: 'invalid-repo',
      dispatchGithubRepos: jest.fn()
    });
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('should render the stories link', () => {
    renderComponent();
    expect(screen.getByText('Go to Stories')).toBeInTheDocument();
  });

  describe('Search Functionality', () => {
    it('should trigger search on mount if repoName exists', () => {
      const dispatchGithubRepos = jest.fn();
      renderComponent({
        repoName: 'test-repo',
        dispatchGithubRepos,
        reposData: { items: [] }
      });

      expect(dispatchGithubRepos).toHaveBeenCalledWith('test-repo');
    });

    it('should not trigger search on mount without repoName', () => {
      const dispatchGithubRepos = jest.fn();
      renderComponent({ dispatchGithubRepos });

      expect(dispatchGithubRepos).not.toHaveBeenCalled();
    });
  });
});
