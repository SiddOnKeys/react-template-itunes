import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import PlaybackBar from '../index';
import audioEventManager from '../../../utils/audio-event-manager';

// Mock Material-UI components
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    AppBar: ({ children, ...props }) => (
      <div data-testid="app-bar" {...props}>
        {children}
      </div>
    ),
    Paper: ({ children, ...props }) => (
      <div data-testid="paper" {...props}>
        {children}
      </div>
    ),
    IconButton: ({ children, 'aria-label': ariaLabel, ...props }) => (
      <button aria-label={ariaLabel} {...props}>
        {children}
      </button>
    ),
    Avatar: ({ src, alt, ...props }) => <img src={src} alt={alt} data-testid="artwork" {...props} />,
    Typography: ({ children, ...props }) => <span {...props}>{children}</span>,
    Slider: ({ value, max, onChange = () => {}, ...props }) => (
      <input type="range" value={value} max={max} onChange={onChange} data-testid="progress-slider" {...props} />
    ),
    Box: ({ children, ...props }) => <div {...props}>{children}</div>
  };
});

// Mock Material-UI icons
jest.mock('@mui/icons-material/PlayArrow', () => ({
  __esModule: true,
  default: () => <span data-testid="play-icon">play</span>
}));

jest.mock('@mui/icons-material/Pause', () => ({
  __esModule: true,
  default: () => <span data-testid="pause-icon">pause</span>
}));

jest.mock('@mui/icons-material/SkipPrevious', () => ({
  __esModule: true,
  default: () => <span data-testid="previous-icon">previous</span>
}));

jest.mock('@mui/icons-material/SkipNext', () => ({
  __esModule: true,
  default: () => <span data-testid="next-icon">next</span>
}));

// Mock the audio event manager
jest.mock('../../../utils/audio-event-manager', () => ({
  getQueue: jest.fn(),
  getCurrentTrack: jest.fn(),
  onPlay: jest.fn(() => jest.fn()),
  onStop: jest.fn(() => jest.fn()),
  onProgressUpdate: jest.fn(() => jest.fn()),
  onQueueUpdate: jest.fn(() => jest.fn()),
  emitPlay: jest.fn(),
  emitStop: jest.fn(),
  playPrevious: jest.fn(),
  playNext: jest.fn()
}));

describe('PlaybackBar', () => {
  const mockTrack = {
    trackId: '123',
    trackName: 'Test Track',
    artistName: 'Test Artist',
    artworkUrl100: 'https://example.com/artwork.jpg'
  };

  const theme = createTheme();

  const renderWithTheme = (component) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    audioEventManager.getQueue.mockReturnValue({ queue: [mockTrack] });
    audioEventManager.getCurrentTrack.mockReturnValue(mockTrack);
  });

  it('should not render when there is no queue', () => {
    audioEventManager.getQueue.mockReturnValue({ queue: [] });
    renderWithTheme(<PlaybackBar />);
    expect(screen.queryByTestId('app-bar')).not.toBeInTheDocument();
  });

  it('should render track information when a track is playing', async () => {
    renderWithTheme(<PlaybackBar />);

    // Simulate play event
    await act(async () => {
      const handlePlay = audioEventManager.onPlay.mock.calls[0][0];
      handlePlay();
    });

    expect(screen.getByText(mockTrack.trackName)).toBeInTheDocument();
    expect(screen.getByText(mockTrack.artistName)).toBeInTheDocument();
    expect(screen.getByTestId('artwork')).toHaveAttribute(
      'src',
      mockTrack.artworkUrl100.replace('100x100bb', '400x400bb')
    );
  });

  it('should handle play/pause button click', async () => {
    renderWithTheme(<PlaybackBar />);

    // Initially, the play button should be visible
    const initialPlayButton = screen.getByTestId('play-icon').parentElement;
    expect(initialPlayButton).toBeInTheDocument();
    expect(screen.queryByTestId('pause-icon')).not.toBeInTheDocument();

    // Test play
    await act(async () => {
      fireEvent.click(initialPlayButton);
      const handlePlay = audioEventManager.onPlay.mock.calls[0][0];
      handlePlay();
    });

    expect(audioEventManager.emitPlay).toHaveBeenCalledWith(mockTrack.trackId);
    expect(screen.queryByTestId('play-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();

    // Test pause
    const pauseButton = screen.getByTestId('pause-icon').parentElement;
    await act(async () => {
      fireEvent.click(pauseButton);
      const handleStop = audioEventManager.onStop.mock.calls[0][0];
      handleStop();
    });

    expect(audioEventManager.emitStop).toHaveBeenCalledWith(mockTrack.trackId);
    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('pause-icon')).not.toBeInTheDocument();
  });

  it('should handle previous/next button clicks', async () => {
    renderWithTheme(<PlaybackBar />);

    // Simulate play event to show the component
    await act(async () => {
      const handlePlay = audioEventManager.onPlay.mock.calls[0][0];
      handlePlay();
    });

    const prevButton = screen.getByTestId('previous-icon').parentElement;
    const nextButton = screen.getByTestId('next-icon').parentElement;

    await act(async () => {
      fireEvent.click(prevButton);
    });
    expect(audioEventManager.playPrevious).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(nextButton);
    });
    expect(audioEventManager.playNext).toHaveBeenCalled();
  });

  it('should update progress bar', async () => {
    renderWithTheme(<PlaybackBar />);

    // Simulate play event to show the component
    await act(async () => {
      const handlePlay = audioEventManager.onPlay.mock.calls[0][0];
      handlePlay();
    });

    // Simulate progress update
    await act(async () => {
      const handleProgress = audioEventManager.onProgressUpdate.mock.calls[0][0];
      handleProgress({ detail: { currentTime: 15 } });
    });

    expect(screen.getByTestId('progress-slider')).toHaveValue('15');
    expect(screen.getByText('0:15')).toBeInTheDocument();
  });

  it('should handle queue updates', async () => {
    renderWithTheme(<PlaybackBar />);

    // Simulate play event to show the component
    await act(async () => {
      const handlePlay = audioEventManager.onPlay.mock.calls[0][0];
      handlePlay();
    });

    // Simulate queue becoming empty
    await act(async () => {
      const handleQueueUpdate = audioEventManager.onQueueUpdate.mock.calls[0][0];
      handleQueueUpdate({ detail: { queue: [] } });
    });

    expect(screen.queryByTestId('app-bar')).not.toBeInTheDocument();
  });

  it('should handle stop event', async () => {
    renderWithTheme(<PlaybackBar />);

    // Simulate play event
    await act(async () => {
      const handlePlay = audioEventManager.onPlay.mock.calls[0][0];
      handlePlay();
    });

    // Simulate stop
    await act(async () => {
      const handleStop = audioEventManager.onStop.mock.calls[0][0];
      handleStop();
    });

    expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('pause-icon')).not.toBeInTheDocument();
  });

  it('should format time correctly', async () => {
    renderWithTheme(<PlaybackBar />);

    // Simulate play event to show the component
    await act(async () => {
      const handlePlay = audioEventManager.onPlay.mock.calls[0][0];
      handlePlay();
    });

    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderWithTheme(<PlaybackBar />);

    // Get the cleanup functions
    const unsubscribePlay = audioEventManager.onPlay.mock.results[0].value;
    const unsubscribeStop = audioEventManager.onStop.mock.results[0].value;
    const unsubscribeProgress = audioEventManager.onProgressUpdate.mock.results[0].value;
    const unsubscribeQueue = audioEventManager.onQueueUpdate.mock.results[0].value;

    // Unmount component
    unmount();

    // Verify cleanup functions were called
    expect(unsubscribePlay).toHaveBeenCalled();
    expect(unsubscribeStop).toHaveBeenCalled();
    expect(unsubscribeProgress).toHaveBeenCalled();
    expect(unsubscribeQueue).toHaveBeenCalled();
  });
});
