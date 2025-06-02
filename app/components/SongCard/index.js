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
  const [audio, setAudio] = useState(null);

  const handlePlayPause = useCallback(
    (e) => {
      e.stopPropagation();
      if (!audio) {
        const newAudio = new Audio(track.previewUrl);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        setAudio(newAudio);
        newAudio.play();
      } else if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    },
    [isPlaying, track.previewUrl, audio]
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

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, [audio]);

  return (
    <>
      <Card className={styles.card} onClick={handleCardClick} sx={{ cursor: 'pointer' }} data-testid="song-card">
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
        PaperProps={{ className: styles.dialog }}
      >
        <DialogTitle className={styles.dialogTitle}>{track.trackName}</DialogTitle>
        <DialogContent className={styles.dialogContent}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} className={styles.dialogCloseButton}>
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
