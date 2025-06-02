import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
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
  backButtonContainer: 'backButtonContainer'
}));

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

  beforeEach(() => {
    history = createMemoryHistory();
    // Initialize store with default state
    store = mockStore({
      itunesSearch: {
        tracks: [],
        loading: false,
        error: null
      }
    });
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
      <Provider store={store}>
        <Router history={history}>
          <TrackDetails {...defaultProps} />
        </Router>
      </Provider>
    );
  };

  it('should fetch track details on mount if track is not available', () => {
    // Arrange
    const dispatchSearchTracks = jest.fn();
    const selectTrackById = jest.fn().mockReturnValue(null);

    // Act
    renderComponent({ dispatchSearchTracks, selectTrackById });

    // Assert
    expect(dispatchSearchTracks).toHaveBeenCalledWith('123');
  });

  it('should not fetch track details if track is already available', () => {
    // Arrange
    const dispatchSearchTracks = jest.fn();
    const selectTrackById = jest.fn().mockReturnValue(mockTrack);

    // Act
    renderComponent({ dispatchSearchTracks, selectTrackById });

    // Assert
    expect(dispatchSearchTracks).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    // Act
    renderComponent({ loading: true });

    // Assert
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error state', () => {
    // Arrange
    const errorMessage = 'Failed to load track';

    // Act
    renderComponent({ error: { message: errorMessage } });

    // Assert
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    expect(screen.getByText('Back to Search')).toBeInTheDocument();
  });

  it('should show track not found state', () => {
    // Arrange
    const selectTrackById = jest.fn().mockReturnValue(null);

    // Act
    renderComponent({ selectTrackById });

    // Assert
    expect(screen.getByText('Track not found')).toBeInTheDocument();
    expect(screen.getByText('Back to Search')).toBeInTheDocument();
  });

  it('should render track details when track is available', () => {
    // Arrange
    const selectTrackById = jest.fn().mockReturnValue(mockTrack);

    // Act
    renderComponent({ selectTrackById });

    // Assert
    expect(screen.getByText(mockTrack.trackName)).toBeInTheDocument();
    expect(screen.getByText(mockTrack.artistName)).toBeInTheDocument();
    expect(screen.getByText(`Album: ${mockTrack.collectionName}`)).toBeInTheDocument();
    expect(screen.getByText(`Genre: ${mockTrack.primaryGenreName}`)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockTrack.artworkUrl100.replace('100x100', '400x400'));
    const audioElement = screen.getByText('Your browser does not support the audio element.').closest('audio');
    expect(audioElement).toHaveAttribute('src', mockTrack.previewUrl);
  });

  it('should navigate back and clear tracks if only one track exists', () => {
    // Arrange
    const dispatchClearTracks = jest.fn();
    const selectTrackById = jest.fn().mockReturnValue(mockTrack);
    renderComponent({
      allTracks: [mockTrack],
      dispatchClearTracks,
      selectTrackById
    });

    // Act
    fireEvent.click(screen.getByText('Back to Search'));

    // Assert
    expect(dispatchClearTracks).toHaveBeenCalled();
    expect(history.location.pathname).toBe('/');
  });

  it('should navigate back without clearing tracks if multiple tracks exist', () => {
    // Arrange
    const dispatchClearTracks = jest.fn();
    const selectTrackById = jest.fn().mockReturnValue(mockTrack);
    renderComponent({
      allTracks: [mockTrack, { ...mockTrack, trackId: 456 }],
      dispatchClearTracks,
      selectTrackById
    });

    // Act
    fireEvent.click(screen.getByText('Back to Search'));

    // Assert
    expect(dispatchClearTracks).not.toHaveBeenCalled();
    expect(history.location.pathname).toBe('/');
  });

  describe('mapDispatchToProps', () => {
    it('should map searchTracks action to dispatchSearchTracks prop', () => {
      // Arrange
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);
      const trackId = '123';

      // Act
      props.dispatchSearchTracks(trackId);

      // Assert
      expect(dispatch).toHaveBeenCalledWith(searchTracks(trackId));
    });

    it('should map clearTracks action to dispatchClearTracks prop', () => {
      // Arrange
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);

      // Act
      props.dispatchClearTracks();

      // Assert
      expect(dispatch).toHaveBeenCalledWith(clearTracks());
    });
  });
});
