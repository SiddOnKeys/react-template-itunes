/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { TrackDetails, mapDispatchToProps } from '../index';
import { searchTracks, clearTracks } from '@containers/ITunesSearch/actions';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';

// Mock translations
const mockTranslations = {
  track_not_found: 'Track not found',
  track_details: 'Track Details',
  artist: 'Artist',
  album: 'Album',
  genre: 'Genre',
  release_date: 'Release Date',
  back_to_search: 'Back to Search',
  track_album: 'Album: {{name}}',
  track_genre: 'Genre: {{name}}',
  track_release_date: 'Released: {{date}}',
  error_prefix: 'Error: {{message}}'
};

i18n.load('en', mockTranslations);
i18n.activate('en');

// Mock Audio API
const mockAudio = {
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

global.Audio = jest.fn(() => mockAudio);

const mockStore = configureStore([]);

describe('<TrackDetails />', () => {
  const mockTrack = {
    trackId: 1,
    trackName: 'Test Track',
    artistName: 'Test Artist',
    artworkUrl100: 'test-url',
    previewUrl: 'preview-url',
    primaryGenreName: 'Pop',
    collectionName: 'Test Album',
    releaseDate: '2024-01-01'
  };

  const defaultProps = {
    dispatchSearchTracks: jest.fn(),
    dispatchClearTracks: jest.fn(),
    loading: false,
    error: null,
    allTracks: [],
    track: null,
    match: {
      params: {
        trackId: '1'
      }
    }
  };

  const renderComponent = (props = {}) => {
    const store = mockStore({
      ITunesSearch: {
        tracks: props.tracks || [],
        loading: props.loading || false,
        error: props.error || null
      }
    });

    return render(
      <Provider store={store}>
        <I18nProvider i18n={i18n}>
          <MemoryRouter initialEntries={['/track/1']}>
            <Route path="/track/:trackId">
              <TrackDetails {...defaultProps} {...props} track={props.tracks?.[0] || null} />
            </Route>
          </MemoryRouter>
        </I18nProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render track not found state', () => {
    renderComponent();
    expect(screen.getByText('Track not found')).toBeInTheDocument();
  });

  it('should render track details', () => {
    const tracks = [mockTrack];
    renderComponent({ tracks });
    expect(screen.getByTestId('track-name')).toHaveTextContent(mockTrack.trackName);
    expect(screen.getByTestId('artist-name')).toHaveTextContent(mockTrack.artistName);
    expect(screen.getByTestId('album-name')).toHaveTextContent(mockTrack.collectionName);
    expect(screen.getByTestId('genre-name')).toHaveTextContent(mockTrack.primaryGenreName);
    expect(screen.getByTestId('release-date')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    renderComponent({ loading: true });
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const error = { message: 'Test error' };
    renderComponent({ error });
    expect(screen.getByText('Error: {Test error}')).toBeInTheDocument();
  });

  it('should handle back button click with single track', () => {
    const dispatchClearTracks = jest.fn();
    renderComponent({
      allTracks: [mockTrack],
      dispatchClearTracks
    });

    const backButton = screen.getByRole('button', { name: /back to search/i });
    fireEvent.click(backButton);
    expect(dispatchClearTracks).toHaveBeenCalled();
  });

  it('should handle back button click with multiple tracks', () => {
    const dispatchClearTracks = jest.fn();
    renderComponent({
      allTracks: [mockTrack, { ...mockTrack, trackId: 2 }],
      dispatchClearTracks
    });

    const backButton = screen.getByRole('button', { name: /back to search/i });
    fireEvent.click(backButton);
    expect(dispatchClearTracks).not.toHaveBeenCalled();
  });

  it('should fetch track details on mount if not available', () => {
    const dispatchSearchTracks = jest.fn();
    renderComponent({ dispatchSearchTracks });
    expect(dispatchSearchTracks).toHaveBeenCalledWith(1);
  });

  it('should not fetch track details if already loading', () => {
    const dispatchSearchTracks = jest.fn();
    renderComponent({
      dispatchSearchTracks,
      loading: true
    });
    expect(dispatchSearchTracks).not.toHaveBeenCalled();
  });

  describe('Audio playback', () => {
    it('should handle play/pause button click', () => {
      renderComponent({ tracks: [mockTrack] });
      const playButton = screen.getByTestId('playback-button');

      // Initial state
      expect(playButton).toHaveAttribute('data-playing', 'false');
      expect(playButton).toHaveTextContent('PLAY');

      // Play
      fireEvent.click(playButton);
      expect(mockAudio.play).toHaveBeenCalled();
      expect(playButton).toHaveAttribute('data-playing', 'true');
      expect(playButton).toHaveTextContent('PAUSE');

      // Pause
      fireEvent.click(playButton);
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(playButton).toHaveAttribute('data-playing', 'false');
      expect(playButton).toHaveTextContent('PLAY');
    });

    it('should handle audio end event', () => {
      renderComponent({ tracks: [mockTrack] });

      // Simulate playing
      fireEvent.click(screen.getByTestId('playback-button'));
      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'true');

      // Simulate audio end
      const endedCallback = mockAudio.addEventListener.mock.calls.find((call) => call[0] === 'ended')[1];
      act(() => {
        endedCallback();
      });

      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'false');
    });
  });

  describe('Redux integration', () => {
    it('should map search tracks action', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);
      const trackId = 123;

      props.dispatchSearchTracks(trackId);
      expect(dispatch).toHaveBeenCalledWith(searchTracks(trackId));
    });

    it('should map clear tracks action', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);

      props.dispatchClearTracks();
      expect(dispatch).toHaveBeenCalledWith(clearTracks());
    });
  });
});
