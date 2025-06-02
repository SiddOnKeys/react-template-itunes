import React, { useEffect, memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Paper } from '@mui/material';
import { compose } from 'redux';
import debounce from 'lodash/debounce';
import { searchTracks, clearTracks } from './actions';
import { selectTracks, selectLoading, selectError, selectQuery } from './selectors';
import SearchInput from './components/SearchInput';
import TrackGrid from './components/TrackGrid';
import containerStyles from './styles/Container.css';
import PlaybackBar from '@app/components/PlaybackBar/index';

/**
 * ITunesSearch Container Component
 * Provides a search interface for iTunes tracks with real-time search functionality
 * @param {Object} props - Component props
 * @param {Function} props.dispatchSearchTracks - Function to dispatch search action
 * @param {Function} props.dispatchClearTracks - Function to clear search results
 * @param {Array} props.tracks - List of tracks from search results
 * @param {boolean} props.loading - Loading state indicator
 * @param {Object} props.error - Error object if search fails
 * @param {string} props.savedQuery - Previously saved search query
 */
export function ITunesSearch({ dispatchSearchTracks, dispatchClearTracks, tracks, loading, error, savedQuery }) {
  const [inputValue, setInputValue] = useState(savedQuery || '');
  const [isFirstMount, setIsFirstMount] = useState(true);

  // Clear tracks only on first mount if there's no saved query
  useEffect(() => {
    if (isFirstMount) {
      setIsFirstMount(false);
      if (!savedQuery) {
        dispatchClearTracks();
      }
    }
  }, [isFirstMount, savedQuery, dispatchClearTracks]);

  /**
   * Creates a debounced version of the search function
   * @param {string} searchQuery - The search term to look up
   */
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim()) {
        dispatchSearchTracks(searchQuery);
      } else {
        dispatchClearTracks();
      }
    }, 300),
    [dispatchSearchTracks, dispatchClearTracks]
  );

  /**
   * Effect to handle cleanup on component unmount
   * Only cancels pending debounced searches
   */
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  /**
   * Handles changes to the search input
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event
   */
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  /**
   * Handles manual search button clicks
   * Cancels any pending debounced searches and performs immediate search
   */
  const handleSearchClick = () => {
    debouncedSearch.cancel();
    if (inputValue.trim()) {
      dispatchSearchTracks(inputValue);
    }
  };

  /**
   * Handles clearing the search input
   * Cancels any pending searches and clears the results
   */
  const handleClear = () => {
    setInputValue('');
    debouncedSearch.cancel();
    dispatchClearTracks();
  };

  return (
    <div className={containerStyles.mainContainer}>
      <Paper className={containerStyles.searchContainer} elevation={0}>
        <h1 className={containerStyles.title}>iTunes Search</h1>
        <SearchInput
          value={inputValue}
          onChange={handleInputChange}
          onClear={handleClear}
          onSearch={handleSearchClick}
          loading={loading}
        />
        {error && <div className={containerStyles.errorMessage}>Error: {error.message}</div>}
      </Paper>

      <Paper className={containerStyles.resultsContainer} elevation={0}>
        <TrackGrid tracks={tracks} loading={loading} />
      </Paper>
      <PlaybackBar />
    </div>
  );
}

ITunesSearch.propTypes = {
  dispatchSearchTracks: PropTypes.func.isRequired,
  dispatchClearTracks: PropTypes.func.isRequired,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      trackId: PropTypes.number,
      trackName: PropTypes.string,
      artistName: PropTypes.string,
      artworkUrl100: PropTypes.string,
      previewUrl: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  savedQuery: PropTypes.string
};

ITunesSearch.defaultProps = {
  tracks: [],
  loading: false,
  error: null,
  savedQuery: ''
};

/**
 * Maps Redux state to component props using reselect
 * @returns {Object} Object containing tracks, loading, error and saved query state
 */
const mapStateToProps = createStructuredSelector({
  tracks: selectTracks,
  loading: selectLoading,
  error: selectError,
  savedQuery: selectQuery
});

/**
 * Maps dispatch functions to props
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Object} Object containing dispatch functions
 */
export function mapDispatchToProps(dispatch) {
  return {
    dispatchSearchTracks: (query) => dispatch(searchTracks(query)),
    dispatchClearTracks: () => dispatch(clearTracks())
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), memo)(ITunesSearch);
