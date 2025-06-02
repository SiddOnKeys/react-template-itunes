import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { PlayArrow, Pause, MoreVert } from '@mui/icons-material';
import audioEventManager from '../../utils/audio-event-manager';
import styles from './styles.css';

/**
 * SongCard component displays a track's information in a card format
 * with play/pause functionality and detailed view
 * @param {Object} props - Component props
 * @param {Object} props.track - Track information object
 * @param {string} props.track.trackName - Name of the track
 * @param {string} props.track.artistName - Name of the artist
 * @param {string} props.track.artworkUrl100 - URL of the track artwork
 * @param {string} props.track.previewUrl - URL of the track preview
 * @param {string} props.track.primaryGenreName - Genre of the track
 * @param {string} [props.track.collectionName] - Name of the album
 * @param {string} [props.track.releaseDate] - Release date of the track
 * @returns {JSX.Element} SongCard component
 */
function SongCard({ track }) {
  const history = useHistory();
  const [isPlaying, setIsPlaying] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    let audio = new Audio(track.previewUrl);

    // Handle play events
    const handlePlay = async (event) => {
      if (event.detail.trackId === track.trackId) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          // Handle play() errors silently
          setIsPlaying(false);
        }
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    };

    // Handle stop events
    const handleStop = (event) => {
      if (event.detail.trackId === track.trackId) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    // Handle audio ended
    const handleEnded = () => {
      audioEventManager.emitStop(track.trackId);
    };

    // Check if this track is currently playing
    const currentTrackId = audioEventManager.getCurrentTrackId();
    if (currentTrackId === track.trackId) {
      setIsPlaying(true);
    }

    // Subscribe to events
    const unsubscribePlay = audioEventManager.onPlay(handlePlay);
    const unsubscribeStop = audioEventManager.onStop(handleStop);
    audio.addEventListener('ended', handleEnded);

    return () => {
      unsubscribePlay();
      unsubscribeStop();
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio = null;
    };
  }, [track.trackId, track.previewUrl]);

  const handlePlayPause = useCallback(
    (e) => {
      e.stopPropagation();
      if (isPlaying) {
        audioEventManager.emitStop(track.trackId);
      } else {
        audioEventManager.emitPlay(track.trackId);
      }
    },
    [isPlaying, track.trackId]
  );

  const handleDetailsClick = useCallback((e) => {
    e.stopPropagation();
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
  }, []);

  const handleCardClick = useCallback(() => {
    history.push(`/tracks/${track.trackId}`);
  }, [history, track.trackId]);

  return (
    <>
      <Card
        className={`${styles.card} ${isPlaying ? styles.playing : ''}`}
        onClick={handleCardClick}
        sx={{ cursor: 'pointer' }}
        data-testid="song-card"
      >
        <CardMedia
          className={styles.cardMedia}
          component="img"
          image={track.artworkUrl100.replace('100x100bb', '400x400bb')}
          alt={track.trackName}
        />
        <CardContent className={styles.cardContent}>
          <Box className={styles.contentWrapper}>
            <Typography className={styles.trackTitle} noWrap title={track.trackName}>
              {track.trackName}
            </Typography>
            <Typography className={styles.artistText} noWrap title={track.artistName}>
              {track.artistName}
            </Typography>
            <Typography className={styles.genreText} noWrap>
              {track.primaryGenreName}
            </Typography>
          </Box>
          <Box className={styles.buttonsContainer}>
            <IconButton
              className={styles.actionButton}
              aria-label={isPlaying ? 'pause' : 'play'}
              onClick={handlePlayPause}
              size="small"
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton
              className={styles.actionButton}
              aria-label="more details"
              onClick={handleDetailsClick}
              size="small"
            >
              <MoreVert />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: styles.dialog,
          sx: {
            borderRadius: '20px',
            '& .MuiDialogContent-root': {
              padding: '24px'
            }
          }
        }}
      >
        <DialogTitle className={styles.dialogTitle}>{track.trackName}</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <img
            src={track.artworkUrl100.replace('100x100bb', '400x400bb')}
            alt={track.trackName}
            className={styles.dialogArtwork}
            style={{ borderRadius: '16px' }}
          />
          <Box className={styles.dialogInfoSection}>
            <Box>
              <Typography variant="subtitle2" className={styles.dialogLabel}>
                Artist
              </Typography>
              <Typography variant="body1" className={styles.dialogValue}>
                {track.artistName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" className={styles.dialogLabel}>
                Album
              </Typography>
              <Typography variant="body1" className={styles.dialogValue}>
                {track.collectionName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" className={styles.dialogLabel}>
                Genre
              </Typography>
              <Typography variant="body1" className={styles.dialogValue}>
                {track.primaryGenreName}
              </Typography>
            </Box>
            {track.releaseDate && (
              <Box>
                <Typography variant="subtitle2" className={styles.dialogLabel}>
                  Release Date
                </Typography>
                <Typography variant="body1" className={styles.dialogValue}>
                  {new Date(track.releaseDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={handleCloseDetails} className={styles.dialogCloseButton} sx={{ borderRadius: '12px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

SongCard.propTypes = {
  track: PropTypes.shape({
    trackId: PropTypes.number.isRequired,
    trackName: PropTypes.string.isRequired,
    artistName: PropTypes.string.isRequired,
    artworkUrl100: PropTypes.string.isRequired,
    previewUrl: PropTypes.string.isRequired,
    primaryGenreName: PropTypes.string.isRequired,
    collectionName: PropTypes.string,
    releaseDate: PropTypes.string
  }).isRequired
};

export default SongCard;
