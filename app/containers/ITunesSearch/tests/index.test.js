import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('should render the search input', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('Search for tracks...')).toBeInTheDocument();
  });

  it('should initialize with saved query if provided', () => {
    const savedQuery = 'test query';
    renderComponent({ savedQuery });
    expect(screen.getByDisplayValue(savedQuery)).toBeInTheDocument();
  });

  it('should dispatch clearTracks on first mount if no saved query', () => {
    const dispatchClearTracks = jest.fn();
    renderComponent({ dispatchClearTracks });
    expect(dispatchClearTracks).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch clearTracks on first mount if there is a saved query', () => {
    const dispatchClearTracks = jest.fn();
    renderComponent({ dispatchClearTracks, savedQuery: 'test' });
    expect(dispatchClearTracks).not.toHaveBeenCalled();
  });

  it('should dispatch searchTracks action on input change with non-empty value', () => {
    const dispatchSearchTracks = jest.fn();
    renderComponent({ dispatchSearchTracks });

    const input = screen.getByPlaceholderText('Search for tracks...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(dispatchSearchTracks).toHaveBeenCalledWith('test');
  });

  it('should dispatch clearTracks action on empty input', () => {
    const dispatchClearTracks = jest.fn();
    renderComponent({ dispatchClearTracks });

    const input = screen.getByPlaceholderText('Search for tracks...');
    fireEvent.change(input, { target: { value: '' } });

    expect(dispatchClearTracks).toHaveBeenCalled();
  });

  it('should handle search button click', () => {
    const dispatchSearchTracks = jest.fn();
    renderComponent({ dispatchSearchTracks });

    const input = screen.getByPlaceholderText('Search for tracks...');
    const searchButton = screen.getByRole('button', { name: 'Search tracks' });

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(searchButton);

    expect(dispatchSearchTracks).toHaveBeenCalledWith('test');
  });

  it('should handle clear button click', () => {
    const dispatchClearTracks = jest.fn();
    renderComponent({ dispatchClearTracks });

    const input = screen.getByPlaceholderText('Search for tracks...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clearButton);

    expect(dispatchClearTracks).toHaveBeenCalled();
    expect(input.value).toBe('');
  });

  it('should show error message when there is an error', () => {
    const error = new Error('Test error');
    renderComponent({ error });
    expect(screen.getByText(`Error: ${error.message}`)).toBeInTheDocument();
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
    it('should map searchTracks action to dispatchSearchTracks prop', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);
      const query = 'test';

      props.dispatchSearchTracks(query);
      expect(dispatch).toHaveBeenCalledWith(searchTracks(query));
    });

    it('should map clearTracks action to dispatchClearTracks prop', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);

      props.dispatchClearTracks();
      expect(dispatch).toHaveBeenCalledWith(clearTracks());
    });
  });
});
