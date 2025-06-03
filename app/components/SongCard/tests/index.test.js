import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import SongCard from '../index';
import audioEventManager from '../../../utils/audio-event-manager';

// Mock audio event manager
jest.mock('../../../utils/audio-event-manager', () => ({
  emitPlay: jest.fn(),
  emitStop: jest.fn(),
  onPlay: jest.fn(() => jest.fn()),
  onStop: jest.fn(() => jest.fn()),
  getCurrentTrackId: jest.fn()
}));

// Mock styles
jest.mock('../styles.css', () => ({
  card: 'card',
  cardMedia: 'cardMedia',
  cardContent: 'cardContent',
  contentWrapper: 'contentWrapper',
  trackTitle: 'trackTitle',
  artistText: 'artistText',
  genreText: 'genreText',
  buttonsContainer: 'buttonsContainer',
  actionButton: 'actionButton',
  dialog: 'dialog',
  dialogTitle: 'dialogTitle',
  dialogContent: 'dialogContent',
  dialogArtwork: 'dialogArtwork',
  dialogInfoSection: 'dialogInfoSection',
  dialogLabel: 'dialogLabel',
  dialogValue: 'dialogValue',
  dialogActions: 'dialogActions',
  dialogCloseButton: 'dialogCloseButton'
}));

// Mock Audio API
const mockAudio = {
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

global.Audio = jest.fn(() => mockAudio);

describe('<SongCard />', () => {
  const mockTrack = {
    trackId: 1,
    trackName: 'Test Track',
    artistName: 'Test Artist',
    artworkUrl100: 'test-url/100x100bb.jpg',
    previewUrl: 'preview-url',
    primaryGenreName: 'Pop',
    collectionName: 'Test Album',
    releaseDate: '2024-01-01'
  };

  const history = createMemoryHistory();

  const renderComponent = (props = {}) => {
    return render(
      <Router history={history}>
        <SongCard track={{ ...mockTrack, ...props }} />
      </Router>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    audioEventManager.getCurrentTrackId.mockReturnValue(null);
  });

  it('should render basic track information', () => {
    renderComponent();
    expect(screen.getByTestId('track-title')).toHaveTextContent(mockTrack.trackName);
    expect(screen.getByTestId('artist-text')).toHaveTextContent(mockTrack.artistName);
    expect(screen.getByText(mockTrack.primaryGenreName)).toBeInTheDocument();
  });

  it('should render with correct artwork', () => {
    renderComponent();
    const artwork = screen.getByRole('img', { name: mockTrack.trackName });
    expect(artwork).toHaveAttribute('src', mockTrack.artworkUrl100.replace('100x100bb', '400x400bb'));
  });

  describe('Track Data Handling', () => {
    it('should handle missing optional fields', () => {
      const trackWithoutOptionals = {
        ...mockTrack,
        collectionName: undefined,
        releaseDate: undefined
      };
      renderComponent(trackWithoutOptionals);

      fireEvent.click(screen.getByTestId('details-button'));
      expect(screen.queryByText('Release Date')).not.toBeInTheDocument();
    });

    it('should handle different artwork URL formats', () => {
      const trackWithDifferentArtwork = {
        ...mockTrack,
        artworkUrl100: 'test-url/100x100.jpg'
      };
      renderComponent(trackWithDifferentArtwork);

      const artwork = screen.getByRole('img', { name: mockTrack.trackName });
      expect(artwork).toHaveAttribute('src', trackWithDifferentArtwork.artworkUrl100.replace('100x100', '400x400bb'));
    });

    it('should truncate long track names', () => {
      const longTrackName = 'A'.repeat(100);
      renderComponent({ trackName: longTrackName });

      const titleElement = screen.getByTestId('track-title');
      expect(titleElement).toHaveAttribute('title', longTrackName);
    });

    it('should truncate long artist names', () => {
      const longArtistName = 'A'.repeat(100);
      renderComponent({ artistName: longArtistName });

      const artistElement = screen.getByTestId('artist-text');
      expect(artistElement).toHaveAttribute('title', longArtistName);
    });
  });

  describe('Playback controls', () => {
    it('should show play button initially', () => {
      renderComponent();
      const playButton = screen.getByTestId('playback-button');
      expect(playButton).toHaveAttribute('data-playing', 'false');
    });

    it('should emit play event when clicking play', () => {
      renderComponent();
      const playButton = screen.getByTestId('playback-button');
      fireEvent.click(playButton);
      expect(audioEventManager.emitPlay).toHaveBeenCalledWith(mockTrack.trackId);
    });

    it('should emit stop event when clicking pause', () => {
      audioEventManager.getCurrentTrackId.mockReturnValue(mockTrack.trackId);
      renderComponent();
      const playButton = screen.getByTestId('playback-button');
      fireEvent.click(playButton);
      expect(audioEventManager.emitStop).toHaveBeenCalledWith(mockTrack.trackId);
    });

    it('should handle play event from audio manager', () => {
      renderComponent();
      const playHandler = audioEventManager.onPlay.mock.calls[0][0];

      act(() => {
        playHandler({ detail: { trackId: mockTrack.trackId } });
      });

      expect(mockAudio.play).toHaveBeenCalled();
      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'true');
    });

    it('should handle stop event from audio manager', () => {
      renderComponent();
      const stopHandler = audioEventManager.onStop.mock.calls[0][0];

      act(() => {
        stopHandler({ detail: { trackId: mockTrack.trackId } });
      });

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'false');
    });

    it('should handle play event for different track', () => {
      renderComponent();
      const playHandler = audioEventManager.onPlay.mock.calls[0][0];

      act(() => {
        playHandler({ detail: { trackId: mockTrack.trackId + 1 } });
      });

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'false');
    });

    it('should handle stop event for different track', () => {
      renderComponent();
      const stopHandler = audioEventManager.onStop.mock.calls[0][0];

      act(() => {
        stopHandler({ detail: { trackId: mockTrack.trackId + 1 } });
      });

      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'false');
    });

    it('should handle audio play failure', async () => {
      mockAudio.play.mockRejectedValueOnce(new Error('Play failed'));
      renderComponent();
      const playHandler = audioEventManager.onPlay.mock.calls[0][0];

      await act(async () => {
        await playHandler({ detail: { trackId: mockTrack.trackId } });
      });

      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'false');
    });

    it('should handle audio end event', () => {
      renderComponent();
      const endedHandler = mockAudio.addEventListener.mock.calls.find((call) => call[0] === 'ended')[1];

      act(() => {
        endedHandler();
      });

      expect(audioEventManager.emitStop).toHaveBeenCalledWith(mockTrack.trackId);
    });

    it('should initialize with currently playing track', () => {
      audioEventManager.getCurrentTrackId.mockReturnValue(mockTrack.trackId);
      renderComponent();
      expect(screen.getByTestId('playback-button')).toHaveAttribute('data-playing', 'true');
    });
  });

  describe('Details dialog', () => {
    it('should open details dialog when clicking more button', async () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('details-button'));
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should show all track details in dialog', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('details-button'));

      expect(screen.getByTestId('dialog-title')).toHaveTextContent(mockTrack.trackName);
      expect(screen.getByText('Artist')).toBeInTheDocument();
      expect(screen.getAllByText(mockTrack.artistName)[1]).toBeInTheDocument(); // Get dialog text
      expect(screen.getByText('Album')).toBeInTheDocument();
      expect(screen.getByText(mockTrack.collectionName)).toBeInTheDocument();
      expect(screen.getByText('Genre')).toBeInTheDocument();
      expect(screen.getAllByText(mockTrack.primaryGenreName)[1]).toBeInTheDocument(); // Get dialog text
      expect(screen.getByText('Release Date')).toBeInTheDocument();
      expect(screen.getByText(new Date(mockTrack.releaseDate).toLocaleDateString())).toBeInTheDocument();
    });

    it('should close dialog when clicking close button', async () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('details-button'));

      fireEvent.click(screen.getByTestId('dialog-close'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should render dialog artwork with correct size', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('details-button'));

      const artwork = screen.getByTestId('dialog-artwork');
      expect(artwork).toHaveAttribute('src', mockTrack.artworkUrl100.replace('100x100bb', '400x400bb'));
    });

    it('should handle dialog close via backdrop click', async () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('details-button'));

      const backdrop = document.querySelector('.MuiBackdrop-root');
      fireEvent.click(backdrop);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should handle dialog close via escape key', async () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('details-button'));

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Event Propagation', () => {
    it('should prevent card click when clicking play button', () => {
      renderComponent();
      const playButton = screen.getByTestId('playback-button');
      const mockStopPropagation = jest.fn();

      fireEvent.click(playButton, { stopPropagation: mockStopPropagation });
      expect(mockStopPropagation).toHaveBeenCalled();
    });

    it('should prevent card click when clicking details button', () => {
      renderComponent();
      const detailsButton = screen.getByTestId('details-button');
      const mockStopPropagation = jest.fn();

      fireEvent.click(detailsButton, { stopPropagation: mockStopPropagation });
      expect(mockStopPropagation).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to track details page when clicking card', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId(`song-card-${mockTrack.trackId}`));
      expect(history.location.pathname).toBe(`/tracks/${mockTrack.trackId}`);
    });

    it('should not navigate when clicking play button', () => {
      renderComponent();
      const initialPath = history.location.pathname;
      fireEvent.click(screen.getByTestId('playback-button'));
      expect(history.location.pathname).toBe(initialPath);
    });

    it('should not navigate when clicking details button', () => {
      renderComponent();
      const initialPath = history.location.pathname;
      fireEvent.click(screen.getByTestId('details-button'));
      expect(history.location.pathname).toBe(initialPath);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup audio and event listeners on unmount', () => {
      const { unmount } = renderComponent();
      unmount();

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.removeEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
    });

    it('should cleanup event subscriptions on unmount', () => {
      const unsubscribePlay = jest.fn();
      const unsubscribeStop = jest.fn();
      audioEventManager.onPlay.mockReturnValueOnce(unsubscribePlay);
      audioEventManager.onStop.mockReturnValueOnce(unsubscribeStop);

      const { unmount } = renderComponent();
      unmount();

      expect(unsubscribePlay).toHaveBeenCalled();
      expect(unsubscribeStop).toHaveBeenCalled();
    });

    it('should handle multiple unmounts gracefully', () => {
      const { unmount } = renderComponent();
      unmount();
      unmount(); // Should not throw
    });
  });
});
