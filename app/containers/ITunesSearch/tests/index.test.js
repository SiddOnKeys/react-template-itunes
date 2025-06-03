import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ITunesSearch, mapDispatchToProps } from '../index';
import { searchTracks, clearTracks } from '../actions';

// Mock the styles import to avoid CSS module issues in tests
jest.mock('../styles/Container.css', () => ({
  mainContainer: 'mainContainer',
  searchContainer: 'searchContainer',
  title: 'title',
  errorMessage: 'errorMessage',
  resultsContainer: 'resultsContainer'
}));

jest.mock('../styles/Grid.css', () => ({
  gridContainer: 'gridContainer',
  gridItem: 'gridItem',
  emptyMessage: 'emptyMessage'
}));

jest.mock('@app/components/SongCard/styles.css', () => ({
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

// Mock debounce to execute immediately in tests
jest.mock('lodash/debounce', () => (fn) => {
  const debounced = (...args) => fn(...args);
  debounced.cancel = jest.fn();
  return debounced;
});

// Mock Audio API
const mockAudio = {
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

global.Audio = jest.fn(() => mockAudio);

describe('<ITunesSearch />', () => {
  let store;
  const mockStore = configureStore([]);

  beforeEach(() => {
    store = mockStore({
      itunesSearch: {
        tracks: [],
        loading: false,
        error: null,
        query: ''
      }
    });
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      dispatchSearchTracks: jest.fn(),
      dispatchClearTracks: jest.fn(),
      tracks: [],
      loading: false,
      error: null,
      savedQuery: '',
      ...props
    };

    return render(
      <Provider store={store}>
        <ITunesSearch {...defaultProps} />
      </Provider>
    );
  };

  it('should render and match the snapshot', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should clear tracks on mount if no saved query exists', () => {
    renderComponent();
    expect(defaultProps.dispatchClearTracks).toHaveBeenCalled();
  });

  it('should not clear tracks on mount if saved query exists', () => {
    renderComponent({ savedQuery: 'test query' });
    expect(defaultProps.dispatchClearTracks).not.toHaveBeenCalled();
  });

  it('should update input value and trigger search on change', () => {
    renderComponent();
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test search' } });

    expect(input.value).toBe('test search');
    expect(defaultProps.dispatchSearchTracks).toHaveBeenCalledWith('test search');
  });

  it('should clear search when input is cleared', () => {
    renderComponent({ tracks: mockTracks });
    const input = screen.getByRole('textbox');
    const clearButton = screen.getByTestId('clear-button');

    fireEvent.click(clearButton);

    expect(input.value).toBe('');
    expect(defaultProps.dispatchClearTracks).toHaveBeenCalled();
  });

  it('should display error message when error exists', () => {
    const error = { message: 'Test error' };
    renderComponent({ error });

    expect(screen.getByTestId('error-message')).toHaveTextContent('Error: Test error');
  });

  it('should trigger immediate search when search button is clicked', () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    const searchButton = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'test search' } });
    fireEvent.click(searchButton);

    expect(defaultProps.dispatchSearchTracks).toHaveBeenCalledWith('test search');
  });

  it('should show loading state', () => {
    renderComponent({ loading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show empty message when no tracks', () => {
    renderComponent();
    expect(screen.getByText('Search for tracks to see results')).toBeInTheDocument();
  });

  it('should render tracks in grid', () => {
    const tracks = [
      {
        trackId: 1,
        trackName: 'Test Track',
        artistName: 'Test Artist',
        artworkUrl100: 'test.jpg',
        previewUrl: 'test.mp3',
        primaryGenreName: 'Pop',
        collectionName: 'Test Album',
        releaseDate: '2024-01-01'
      }
    ];

    renderComponent({ tracks });
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Pop')).toBeInTheDocument();
  });

  describe('mapDispatchToProps', () => {
    it('should map searchTracks action', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);
      const query = 'test';

      props.dispatchSearchTracks(query);
      expect(dispatch).toHaveBeenCalledWith(searchTracks(query));
    });

    it('should map clearTracks action', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);

      props.dispatchClearTracks();
      expect(dispatch).toHaveBeenCalledWith(clearTracks());
    });
  });
});
