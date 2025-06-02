import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Paper, Typography, Box, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import T from '@app/components/T';
import { searchTracks, clearTracks } from '@containers/ITunesSearch/actions';
import { makeSelectTrackById, selectLoading, selectError, selectTracks } from '@containers/ITunesSearch/selectors';
import styles from './styles.css';

/**
 * TrackDetails Component
 * Displays detailed information about a specific track
 * @param {Object} props Component props
 * @param {Function} props.dispatchSearchTracks Function to fetch track details
 * @param {Function} props.dispatchClearTracks Function to clear tracks from store
 * @param {Function} props.selectTrackById Function to select track by ID
 * @param {boolean} props.loading Loading state
 * @param {Object} props.error Error state
 * @param {Array} props.allTracks All tracks in the store
 */
export function TrackDetails({
  dispatchSearchTracks,
  dispatchClearTracks,
  selectTrackById,
  loading,
  error,
  allTracks
}) {
  const { trackId } = useParams();
  const history = useHistory();
  const track = selectTrackById(trackId);

  useEffect(() => {
    // If we don't have the track details, search for it using the iTunes API
    if (trackId && !track && !loading) {
      dispatchSearchTracks(trackId);
    }
  }, [trackId, track, dispatchSearchTracks, loading]);

  const handleBackClick = () => {
    // If there's only one track in the store, it means user came directly to this page
    // So we should clear the tracks before going back
    if (allTracks.length === 1) {
      dispatchClearTracks();
    }
    history.push('/');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
        <Typography color="error">
          <T id="error_prefix" values={{ message: error.message }} />
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} variant="contained" color="primary">
          <T id="back_to_search" />
        </Button>
      </Box>
    );
  }

  if (!track) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
        <Typography>
          <T id="track_not_found" />
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} variant="contained" color="primary">
          <T id="back_to_search" />
        </Button>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <Box mb={3} className={styles.backButtonContainer}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          variant="contained"
          color="primary"
          size="large"
          className={styles.backButton}
        >
          <T id="back_to_search" />
        </Button>
      </Box>
      <Paper elevation={3} className={styles.paper}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <Box className={styles.imageContainer}>
            <img
              src={track.artworkUrl100?.replace('100x100', '400x400')}
              alt={track.trackName}
              className={styles.artwork}
            />
          </Box>
          <Box className={styles.detailsContainer}>
            <Typography variant="h4" component="h1" gutterBottom>
              {track.trackName}
            </Typography>
            <Typography variant="h5" component="h2" color="textSecondary" gutterBottom>
              {track.artistName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <T id="track_album" values={{ name: track.collectionName }} />
            </Typography>
            <Typography variant="body1" gutterBottom>
              <T id="track_genre" values={{ name: track.primaryGenreName }} />
            </Typography>
            <Typography variant="body1" gutterBottom>
              <T id="track_release_date" values={{ date: new Date(track.releaseDate).toLocaleDateString() }} />
            </Typography>
            {track.previewUrl && (
              <Box mt={2}>
                <audio controls src={track.previewUrl}>
                  <T id="audio_not_supported" />
                </audio>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

TrackDetails.propTypes = {
  dispatchSearchTracks: PropTypes.func.isRequired,
  dispatchClearTracks: PropTypes.func.isRequired,
  selectTrackById: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  allTracks: PropTypes.array.isRequired
};

/**
 * Maps Redux state to component props
 * @param {Object} state Global Redux state
 * @returns {Object} Props for component
 */
const mapStateToProps = (state) => {
  const selectTrackById = makeSelectTrackById();
  return {
    selectTrackById: (id) => selectTrackById(state, id),
    loading: selectLoading(state),
    error: selectError(state),
    allTracks: selectTracks(state)
  };
};

/**
 * Maps dispatch functions to props
 * @param {Function} dispatch Redux dispatch function
 * @returns {Object} Object containing dispatch functions
 */
export function mapDispatchToProps(dispatch) {
  return {
    dispatchSearchTracks: (trackId) => dispatch(searchTracks(trackId)),
    dispatchClearTracks: () => dispatch(clearTracks())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TrackDetails);
