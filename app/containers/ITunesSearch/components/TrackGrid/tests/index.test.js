import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import TrackGrid from '../index';

// Mock the SongCard component
jest.mock('@components/SongCard', () => {
  const SongCard = ({ track }) => <div data-testid={`song-card-${track.trackId}`}>{track.trackName}</div>;
  return SongCard;
});

// Mock audio event manager
jest.mock('@app/utils/audio-event-manager', () => ({
  setQueue: jest.fn(),
  getCurrentTrackId: jest.fn(),
  emitStop: jest.fn()
}));

const mockStore = configureStore([]);

describe('<TrackGrid />', () => {
  const mockTracks = [
    {
      trackId: 1,
      trackName: 'Test Track 1',
      artistName: 'Test Artist 1',
      artworkUrl100: 'test-url-1',
      previewUrl: 'preview-url-1'
    },
    {
      trackId: 2,
      trackName: 'Test Track 2',
      artistName: 'Test Artist 2',
      artworkUrl100: 'test-url-2',
      previewUrl: 'preview-url-2'
    }
  ];

  const store = mockStore({
    audio: {
      currentTrack: null,
      isPlaying: false
    }
  });

  const renderComponent = (props = {}) => {
    return render(
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <TrackGrid tracks={[]} loading={false} {...props} />
        </Provider>
      </I18nProvider>
    );
  };

  it('should render tracks correctly', () => {
    renderComponent({ tracks: mockTracks });
    expect(screen.getByTestId('song-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('song-card-2')).toBeInTheDocument();
    expect(screen.getByText('Test Track 1')).toBeInTheDocument();
    expect(screen.getByText('Test Track 2')).toBeInTheDocument();
  });

  it('should render no tracks message when tracks array is empty', () => {
    renderComponent({ tracks: [], loading: false });
    expect(screen.getByText('Search for tracks to see results')).toBeInTheDocument();
  });

  it('should not render no tracks message when loading', () => {
    renderComponent({ tracks: [], loading: true });
    expect(screen.queryByText('Search for tracks to see results')).not.toBeInTheDocument();
  });
});
