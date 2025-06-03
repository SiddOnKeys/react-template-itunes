import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TrackGrid from './index';

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
      <Provider store={store}>
        <TrackGrid tracks={[]} loading={false} {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    store.clearActions();
  });

  it('should render and match the snapshot', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should render loading skeleton when loading', () => {
    renderComponent({ loading: true });
    expect(screen.getAllByTestId('track-skeleton')).toHaveLength(8);
  });

  it('should render tracks when provided', () => {
    renderComponent({ tracks: mockTracks });
    expect(screen.getAllByTestId('song-card')).toHaveLength(mockTracks.length);
  });

  it('should render track information correctly', () => {
    renderComponent({ tracks: mockTracks });

    mockTracks.forEach((track) => {
      expect(screen.getByText(track.trackName)).toBeInTheDocument();
      expect(screen.getByText(track.artistName)).toBeInTheDocument();
    });
  });

  it('should render no results message when no tracks and not loading', () => {
    renderComponent({ tracks: [] });
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it('should not render no results message when loading', () => {
    renderComponent({ tracks: [], loading: true });
    expect(screen.queryByText(/no results found/i)).not.toBeInTheDocument();
  });

  it('should render track artwork', () => {
    renderComponent({ tracks: mockTracks });
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(mockTracks.length);
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('src', mockTracks[index].artworkUrl100);
      expect(img).toHaveAttribute('alt', `${mockTracks[index].trackName} artwork`);
    });
  });
});
