import React, { useState, useEffect } from 'react';
import { AppBar, Box, IconButton, Typography, Slider, Paper, Avatar } from '@mui/material';
import { PlayArrow, Pause, SkipPrevious, SkipNext } from '@mui/icons-material';
import audioEventManager from '../../utils/audio-event-manager';
import styles from './styles.css';

/**
 * @typedef {Object} Track
 * @property {string} trackId - The unique identifier for the track
 * @property {string} trackName - The name of the track
 * @property {string} artistName - The name of the artist
 * @property {string} artworkUrl100 - URL for the track's artwork
 */

/**
 * PlaybackBar component - Displays and controls the music player's playback interface
 * Features include play/pause, skip controls, progress bar, and track information display
 * @returns {React.ReactElement|null} Returns the playback bar UI or null if no track is playing
 */
function PlaybackBar() {
  const [currentTrack, setCurrentTrack] = useState(/** @type {Track|null} */ (null));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration] = useState(30); // iTunes previews are 30 seconds
  const [hasQueue, setHasQueue] = useState(false);

  useEffect(() => {
    // Initial queue check
    const { queue } = audioEventManager.getQueue();
    setHasQueue(queue.length > 0);

    /**
     * Handles play events from the audio manager
     */
    const handlePlay = () => {
      const track = audioEventManager.getCurrentTrack();
      setCurrentTrack(track);
      setIsPlaying(true);
    };

    /**
     * Handles stop events from the audio manager
     */
    const handleStop = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    /**
     * Handles progress update events from the audio manager
     * @param {CustomEvent} event - Progress update event containing currentTime
     */
    const handleProgress = (event) => {
      setProgress(event.detail.currentTime);
    };

    /**
     * Handles queue update events from the audio manager
     * @param {CustomEvent} event - Queue update event containing the new queue
     */
    const handleQueueUpdate = (event) => {
      setHasQueue(event.detail.queue.length > 0);
    };

    // Subscribe to events
    const unsubscribePlay = audioEventManager.onPlay(handlePlay);
    const unsubscribeStop = audioEventManager.onStop(handleStop);
    const unsubscribeProgress = audioEventManager.onProgressUpdate(handleProgress);
    const unsubscribeQueue = audioEventManager.onQueueUpdate(handleQueueUpdate);

    return () => {
      unsubscribePlay();
      unsubscribeStop();
      unsubscribeProgress();
      unsubscribeQueue();
    };
  }, []);

  /**
   * Toggles play/pause state for the current track
   */
  const handlePlayPause = () => {
    if (!currentTrack) {
      return;
    }

    if (isPlaying) {
      audioEventManager.emitStop(currentTrack.trackId);
    } else {
      audioEventManager.emitPlay(currentTrack.trackId);
    }
  };

  /**
   * Plays the previous track in the queue
   */
  const handlePrevious = () => {
    audioEventManager.playPrevious();
  };

  /**
   * Plays the next track in the queue
   */
  const handleNext = () => {
    audioEventManager.playNext();
  };

  /**
   * Formats time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if there's no queue or no current track
  if (!hasQueue || !currentTrack) {
    return null;
  }

  return (
    <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
      <Paper elevation={3} className={styles.playbackBar} data-testid="playback-bar">
        <Box className={styles.trackInfo}>
          <Avatar
            src={currentTrack.artworkUrl100.replace('100x100bb', '400x400bb')}
            alt={currentTrack.trackName}
            variant="rounded"
            className={styles.artwork}
          />
          <Box className={styles.trackText}>
            <Typography variant="subtitle1" noWrap data-testid="track-title">
              {currentTrack.trackName}
            </Typography>
            <Typography variant="caption" color="textSecondary" noWrap data-testid="artist-text">
              {currentTrack.artistName}
            </Typography>
          </Box>
        </Box>

        <Box className={styles.playbackControls}>
          <IconButton onClick={handlePrevious} size="small">
            <SkipPrevious />
          </IconButton>
          <IconButton onClick={handlePlayPause} size="medium" data-testid={isPlaying ? 'pause-button' : 'play-button'}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton onClick={handleNext} size="small">
            <SkipNext />
          </IconButton>
        </Box>

        <Box className={styles.progressContainer}>
          <Typography variant="caption" color="textSecondary">
            {formatTime(progress)}
          </Typography>
          <Slider value={progress} max={duration} className={styles.progressBar} size="small" />
          <Typography variant="caption" color="textSecondary">
            {formatTime(duration)}
          </Typography>
        </Box>
      </Paper>
    </AppBar>
  );
}

PlaybackBar.propTypes = {};

export default PlaybackBar;
