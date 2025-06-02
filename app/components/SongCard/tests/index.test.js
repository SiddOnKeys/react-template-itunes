import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SongCard from '../index';

// Mock the styles import
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
  dialogLabel: 'dialogLabel',
  dialogValue: 'dialogValue',
  dialogCloseButton: 'dialogCloseButton'
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn()
  })
}));

// Mock Audio API
const mockAudio = {
  play: jest.fn(),
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
    artworkUrl100: 'https://example.com/artwork.jpg',
    previewUrl: 'https://example.com/preview.mp3',
    primaryGenreName: 'Pop',
    collectionName: 'Test Album',
    releaseDate: '2024-01-01'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render track information correctly', () => {
    render(<SongCard track={mockTrack} />);

    expect(screen.getByText(mockTrack.trackName)).toBeInTheDocument();
    expect(screen.getByText(mockTrack.artistName)).toBeInTheDocument();
    expect(screen.getByText(mockTrack.primaryGenreName)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      mockTrack.artworkUrl100.replace('100x100bb', '400x400bb')
    );
  });

  it('should handle play/pause functionality', () => {
    render(<SongCard track={mockTrack} />);

    const playButton = screen.getByRole('button', { name: 'play' });
    fireEvent.click(playButton);

    // Should create new Audio instance and play
    expect(global.Audio).toHaveBeenCalledWith(mockTrack.previewUrl);
    expect(mockAudio.play).toHaveBeenCalled();

    // Should now show pause button
    const pauseButton = screen.getByRole('button', { name: 'pause' });
    fireEvent.click(pauseButton);

    // Should pause audio
    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it('should navigate to track details on card click', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useHistory').mockImplementation(() => ({
      push: mockPush
    }));

    render(<SongCard track={mockTrack} />);

    // Click on the card
    const card = screen.getByTestId('song-card');
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith(`/tracks/${mockTrack.trackId}`);
  });

  it('should cleanup audio on unmount', () => {
    const { unmount } = render(<SongCard track={mockTrack} />);

    // Start playing
    const playButton = screen.getByRole('button', { name: 'play' });
    fireEvent.click(playButton);

    // Unmount component
    unmount();

    // Should cleanup audio
    expect(mockAudio.pause).toHaveBeenCalled();
    expect(mockAudio.removeEventListener).toHaveBeenCalled();
  });

  it('should handle audio end event', () => {
    render(<SongCard track={mockTrack} />);

    // Start playing
    const playButton = screen.getByRole('button', { name: 'play' });
    fireEvent.click(playButton);

    // Simulate audio end
    act(() => {
      const endedCallback = mockAudio.addEventListener.mock.calls.find(
        call => call[0] === 'ended'
      )[1];
      endedCallback();
    });

    // Should show play button again
    expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument();
  });

  it('should prevent event propagation on button clicks', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useHistory').mockImplementation(() => ({
      push: mockPush
    }));

    render(<SongCard track={mockTrack} />);

    const playButton = screen.getByRole('button', { name: 'play' });
    const detailsButton = screen.getByRole('button', { name: 'more details' });

    // Click buttons
    fireEvent.click(playButton);
    fireEvent.click(detailsButton);

    // Should not navigate
    expect(mockPush).not.toHaveBeenCalled();
  });
});
