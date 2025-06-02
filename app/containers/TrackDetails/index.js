import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Paper, Typography, Box, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PlayArrow, Pause } from '@mui/icons-material';
import T from '@app/components/T';
import { searchTracks, clearTracks } from '@containers/ITunesSearch/actions';
import { makeSelectTrackById, selectLoading, selectError, selectTracks } from '@containers/ITunesSearch/selectors';
import styles from './styles.css';

// Render loading state
const LoadingView = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
    <CircularProgress />
  </Box>
);

// Render error state
const ErrorView = ({ error, onBack }) => (
  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
    <Typography color="error">
      <T id="error_prefix" values={{ message: error.message }} />
    </Typography>
    <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="contained" color="primary">
      <T id="back_to_search" />
    </Button>
  </Box>
);

ErrorView.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired
  }).isRequired,
  onBack: PropTypes.func.isRequired
};

// Render not found state
const NotFoundView = ({ onBack }) => (
  <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
    <Typography>
      <T id="track_not_found" />
    </Typography>
    <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="contained" color="primary">
      <T id="back_to_search" />
    </Button>
  </Box>
);

NotFoundView.propTypes = {
  onBack: PropTypes.func.isRequired
};

// Main track details view
const TrackDetailsView = ({ track, isPlaying, onPlayPause, onBack }) => (
  <Box className={styles.container}>
    <Box mb={3} className={styles.backButtonContainer}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
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
          <Box mt={3}>
            <Button
              variant="contained"
              startIcon={isPlaying ? <Pause /> : <PlayArrow />}
              onClick={onPlayPause}
              className={styles.playButtonLarge}
              size="large"
            >
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  </Box>
);

TrackDetailsView.propTypes = {
  track: PropTypes.shape({
    trackId: PropTypes.number.isRequired,
    trackName: PropTypes.string.isRequired,
    artistName: PropTypes.string.isRequired,
    artworkUrl100: PropTypes.string.isRequired,
    previewUrl: PropTypes.string.isRequired,
    primaryGenreName: PropTypes.string.isRequired,
    collectionName: PropTypes.string.isRequired,
    releaseDate: PropTypes.string.isRequired
  }).isRequired,
  isPlaying: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

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
  const { trackId: trackIdParam } = useParams();
  const trackId = Number(trackIdParam);
  const history = useHistory();
  const track = selectTrackById(trackId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => (track ? new Audio(track.previewUrl) : null));

  // Fetch track details if needed
  useEffect(() => {
    if (trackId && !track && !loading) {
      dispatchSearchTracks(trackId);
    }
  }, [trackId, track, dispatchSearchTracks, loading]);

  // Handle audio playback
  useEffect(() => {
    if (!audio) {
      return;
    }

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audio]);

  const handlePlayPause = () => {
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleBackClick = () => {
    if (allTracks.length === 1) {
      dispatchClearTracks();
    }
    history.push('/');
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onBack={handleBackClick} />;
  }

  if (!track) {
    return <NotFoundView onBack={handleBackClick} />;
  }

  return (
    <TrackDetailsView track={track} isPlaying={isPlaying} onPlayPause={handlePlayPause} onBack={handleBackClick} />
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
