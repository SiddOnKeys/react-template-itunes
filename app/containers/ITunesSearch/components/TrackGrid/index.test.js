import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import TrackGrid from './index';

// Mock translations
const mockTranslations = {
  errorOccurred: 'Error occurred'
};

const mockStore = configureStore([]);

describe('<TrackGrid />', () => {
  beforeAll(() => {
    i18n.load('en', mockTranslations);
    i18n.activate('en');
  });

  const mockTracks = [
    {
      trackId: 1,
      trackName: 'Test Track 1',
      artistName: 'Test Artist 1',
      artworkUrl100: 'test-url-1',
      previewUrl: 'preview-url-1',
      primaryGenreName: 'Pop'
    },
    {
      trackId: 2,
      trackName: 'Test Track 2',
      artistName: 'Test Artist 2',
      artworkUrl100: 'test-url-2',
      previewUrl: 'preview-url-2',
      primaryGenreName: 'Rock'
    }
  ];

  const renderComponent = (props = {}) => {
    const store = mockStore({
      itunesSearch: {
        currentTrackId: null
      }
    });

    return render(
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <MemoryRouter>
            <TrackGrid tracks={mockTracks} {...props} />
          </MemoryRouter>
        </Provider>
      </I18nProvider>
    );
  };

  it('should render all tracks', () => {
    renderComponent();

    for (const track of mockTracks) {
      expect(screen.getByText(track.trackName)).toBeInTheDocument();
      expect(screen.getByText(track.artistName)).toBeInTheDocument();
    }
  });

  it('should render empty message when no tracks', () => {
    renderComponent({ tracks: [] });
    expect(screen.getByTestId('no-tracks')).toBeInTheDocument();
  });

  it('should render loading skeleton when loading', () => {
    renderComponent({ loading: true });
    for (const skeleton of Array(8).fill()) {
      expect(screen.getByTestId(`loading-skeleton-${skeleton}`)).toBeInTheDocument();
    }
  });

  it('should handle error state', () => {
    const mockError = new Error();
    renderComponent({ error: mockError });
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(mockTranslations.errorOccurred)).toBeInTheDocument();
  });
});
