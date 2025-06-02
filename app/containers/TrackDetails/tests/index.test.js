import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { TrackDetails, mapDispatchToProps } from '../index';
import { searchTracks, clearTracks } from '@containers/ITunesSearch/actions';

// Mock react-router-dom's useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ trackId: '123' })
}));

// Mock the styles import to avoid CSS module issues in tests
jest.mock('../styles.css', () => ({
  container: 'container',
  paper: 'paper',
  imageContainer: 'imageContainer',
  artwork: 'artwork',
  detailsContainer: 'detailsContainer',
  backButton: 'backButton',
  backButtonContainer: 'backButtonContainer',
  playButtonLarge: 'playButtonLarge'
}));

// Mock Audio API
const mockAudio = {
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

global.Audio = jest.fn(() => mockAudio);

// Mock i18n
i18n.loadLocaleData('en', {
  plurals: {
    select: (n) => {
      if (n === 1) return 'one';
      return 'other';
    }
  }
});

i18n.activate('en');
i18n.load('en', {
  error_prefix: 'Error: {message}',
  back_to_search: 'Back to Search',
  track_not_found: 'Track not found',
  track_album: 'Album: {name}',
  track_genre: 'Genre: {name}',
  track_release_date: 'Release Date: {date}'
});

const mockTrack = {
  trackId: 123,
  trackName: 'Test Track',
  artistName: 'Test Artist',
  collectionName: 'Test Album',
  artworkUrl100: 'https://example.com/artwork.jpg',
  previewUrl: 'https://example.com/preview.mp3',
  primaryGenreName: 'Pop',
  releaseDate: '2024-01-01'
};

describe('<TrackDetails />', () => {
  let history;
  let store;
  const mockStore = configureStore([]);
  const theme = createTheme();

  beforeEach(() => {
    history = createMemoryHistory();
    store = mockStore({
      itunesSearch: {
        tracks: [],
        loading: false,
        error: null
      }
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      dispatchSearchTracks: jest.fn(),
      dispatchClearTracks: jest.fn(),
      selectTrackById: jest.fn(),
      loading: false,
      error: null,
      allTracks: [],
      ...props
    };

    return render(
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <Router history={history}>
            <ThemeProvider theme={theme}>
              <TrackDetails {...defaultProps} />
            </ThemeProvider>
          </Router>
        </Provider>
      </I18nProvider>
    );
  };

  describe('Initial Load and Data Fetching', () => {
    it('should fetch track details on mount if track is not available', () => {
      const dispatchSearchTracks = jest.fn();
      const selectTrackById = jest.fn().mockReturnValue(null);

      renderComponent({ dispatchSearchTracks, selectTrackById });

      expect(dispatchSearchTracks).toHaveBeenCalledWith(123);
    });

    it('should not fetch track details if track is already available', () => {
      const dispatchSearchTracks = jest.fn();
      const selectTrackById = jest.fn().mockReturnValue(mockTrack);

      renderComponent({ dispatchSearchTracks, selectTrackById });

      expect(dispatchSearchTracks).not.toHaveBeenCalled();
    });

    it('should not fetch track details if already loading', () => {
      const dispatchSearchTracks = jest.fn();
      const selectTrackById = jest.fn().mockReturnValue(null);

      renderComponent({ dispatchSearchTracks, selectTrackById, loading: true });

      expect(dispatchSearchTracks).not.toHaveBeenCalled();
    });
  });

  describe('View States', () => {
    it('should show loading state with centered spinner', () => {
      renderComponent({ loading: true });

      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeInTheDocument();
      expect(spinner.closest('div')).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      });
    });

    it('should show error state with message and back button', () => {
      const errorMessage = 'Failed to load track';
      renderComponent({ error: { message: errorMessage } });

      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      const backButton = screen.getByRole('button', { name: 'Back to Search' });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveClass('MuiButton-containedPrimary');
    });

    it('should show track not found state with message and back button', () => {
      const selectTrackById = jest.fn().mockReturnValue(null);
      renderComponent({ selectTrackById });

      expect(screen.getByText('Track not found')).toBeInTheDocument();
      const backButton = screen.getByRole('button', { name: 'Back to Search' });
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveClass('MuiButton-containedPrimary');
    });
  });

  describe('Track Details Display', () => {
    it('should render all track information correctly', () => {
      const selectTrackById = jest.fn().mockReturnValue(mockTrack);
      renderComponent({ selectTrackById });

      // Basic track info
      expect(screen.getByText(mockTrack.trackName)).toBeInTheDocument();
      expect(screen.getByText(mockTrack.artistName)).toBeInTheDocument();
      expect(screen.getByText(`Album: ${mockTrack.collectionName}`)).toBeInTheDocument();
      expect(screen.getByText(`Genre: ${mockTrack.primaryGenreName}`)).toBeInTheDocument();

      // Release date formatting
      const formattedDate = new Date(mockTrack.releaseDate).toLocaleDateString();
      expect(screen.getByText(`Release Date: ${formattedDate}`)).toBeInTheDocument();

      // Artwork
      const artwork = screen.getByRole('img');
      expect(artwork).toHaveAttribute('src', mockTrack.artworkUrl100.replace('100x100', '400x400'));
      expect(artwork).toHaveAttribute('alt', mockTrack.trackName);
      expect(artwork).toHaveClass('artwork');

      // Play button
      const playButton = screen.getByRole('button', { name: /play/i });
      expect(playButton).toHaveClass('playButtonLarge');
    });

    it('should handle missing optional track properties gracefully', () => {
      const incompleteTrack = {
        ...mockTrack,
        artworkUrl100: undefined,
        collectionName: undefined
      };
      const selectTrackById = jest.fn().mockReturnValue(incompleteTrack);

      renderComponent({ selectTrackById });

      const artwork = screen.getByRole('img');
      expect(artwork).toHaveAttribute('src', 'placeholder.jpg');
      expect(screen.getByText('Album: -')).toBeInTheDocument();
    });
  });

  describe('Audio Playback', () => {
    it('should handle play/pause button clicks', async () => {
      const selectTrackById = jest.fn().mockReturnValue(mockTrack);
      renderComponent({ selectTrackById });

      const playButton = screen.getByRole('button', { name: /play/i });

      // Test play
      await act(async () => {
        fireEvent.click(playButton);
      });
      expect(mockAudio.play).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();

      // Test pause
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await act(async () => {
        fireEvent.click(pauseButton);
      });
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('should handle audio end event', async () => {
      const selectTrackById = jest.fn().mockReturnValue(mockTrack);
      renderComponent({ selectTrackById });

      // Simulate play
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /play/i }));
      });

      // Get the event handler and simulate ended event
      const [[eventName, handler]] = mockAudio.addEventListener.mock.calls;
      expect(eventName).toBe('ended');

      await act(async () => {
        handler();
      });

      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('should cleanup audio resources on unmount', () => {
      const selectTrackById = jest.fn().mockReturnValue(mockTrack);
      const { unmount } = renderComponent({ selectTrackById });

      unmount();

      expect(mockAudio.removeEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back and clear tracks if only one track exists', () => {
      const dispatchClearTracks = jest.fn();
      const selectTrackById = jest.fn().mockReturnValue(mockTrack);
      renderComponent({
        allTracks: [mockTrack],
        dispatchClearTracks,
        selectTrackById
      });

      fireEvent.click(screen.getByText('Back to Search'));

      expect(dispatchClearTracks).toHaveBeenCalled();
      expect(history.location.pathname).toBe('/');
    });

    it('should navigate back without clearing tracks if multiple tracks exist', () => {
      const dispatchClearTracks = jest.fn();
      const selectTrackById = jest.fn().mockReturnValue(mockTrack);
      renderComponent({
        allTracks: [mockTrack, { ...mockTrack, trackId: 456 }],
        dispatchClearTracks,
        selectTrackById
      });

      fireEvent.click(screen.getByText('Back to Search'));

      expect(dispatchClearTracks).not.toHaveBeenCalled();
      expect(history.location.pathname).toBe('/');
    });

    it('should handle back navigation from error state', () => {
      const dispatchClearTracks = jest.fn();
      renderComponent({
        error: { message: 'Error occurred' },
        dispatchClearTracks
      });

      fireEvent.click(screen.getByText('Back to Search'));

      expect(history.location.pathname).toBe('/');
    });

    it('should handle back navigation from not found state', () => {
      const dispatchClearTracks = jest.fn();
      const selectTrackById = jest.fn().mockReturnValue(null);
      renderComponent({
        selectTrackById,
        dispatchClearTracks
      });

      fireEvent.click(screen.getByText('Back to Search'));

      expect(history.location.pathname).toBe('/');
    });
  });

  describe('Redux Integration', () => {
    it('should map searchTracks action to dispatchSearchTracks prop', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);
      const trackId = '123';

      props.dispatchSearchTracks(trackId);

      expect(dispatch).toHaveBeenCalledWith(searchTracks(trackId));
    });

    it('should map clearTracks action to dispatchClearTracks prop', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);

      props.dispatchClearTracks();

      expect(dispatch).toHaveBeenCalledWith(clearTracks());
    });
  });
});
