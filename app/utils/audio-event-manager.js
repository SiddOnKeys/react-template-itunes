// Custom event names
export const AUDIO_EVENTS = {
  PLAY: 'audio:play',
  STOP: 'audio:stop',
  QUEUE_UPDATE: 'audio:queue_update',
  PROGRESS_UPDATE: 'audio:progress_update'
};

/**
 * Creates an audio event manager instance
 * @returns {Object} Audio event manager methods
 */
const createAudioEventManager = () => {
  let currentTrackId = null;
  let queue = [];
  let currentIndex = -1;
  const duration = 30; // iTunes previews are 30 seconds
  let progressInterval = null;

  /**
   * Sets the queue of tracks
   * @param {Array} tracks - Array of track objects
   */
  const setQueue = (tracks) => {
    queue = tracks;
    currentIndex = -1;
    window.dispatchEvent(
      new CustomEvent(AUDIO_EVENTS.QUEUE_UPDATE, {
        detail: {
          queue,
          currentIndex
        }
      })
    );
  };

  /**
   * Gets the current queue state
   * @returns {Object} Queue state containing queue array and current index
   */
  const getQueue = () => ({
    queue,
    currentIndex
  });

  /**
   * Finds the index of a track in the queue
   * @param {string} trackId - ID of the track to find
   * @returns {number} Index of the track or -1 if not found
   */
  const findTrackIndex = (trackId) => queue.findIndex((track) => track.trackId === trackId);

  /**
   * Starts tracking playback progress
   */
  const startProgressTracking = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    let progress = 0;
    progressInterval = setInterval(() => {
      progress += 0.1;
      if (progress > duration) {
        clearInterval(progressInterval);
        progressInterval = null;
        emitStop(currentTrackId);
        playNext();
        return;
      }

      window.dispatchEvent(
        new CustomEvent(AUDIO_EVENTS.PROGRESS_UPDATE, {
          detail: {
            currentTime: progress,
            duration
          }
        })
      );
    }, 100);
  };

  /**
   * Stops tracking playback progress
   */
  const stopProgressTracking = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  };

  /**
   * Emits a play event for a track
   * @param {string} trackId - ID of the track to play
   */
  const emitPlay = (trackId) => {
    if (currentTrackId !== trackId) {
      // Stop current track if any
      if (currentTrackId !== null) {
        emitStop(currentTrackId);
      }

      // Update current track and index
      currentTrackId = trackId;
      const newIndex = findTrackIndex(trackId);
      if (newIndex !== -1) {
        currentIndex = newIndex;
      }

      window.dispatchEvent(new CustomEvent(AUDIO_EVENTS.PLAY, { detail: { trackId } }));
      startProgressTracking();
    }
  };

  /**
   * Emits a stop event for a track
   * @param {string} trackId - ID of the track to stop
   */
  const emitStop = (trackId) => {
    if (currentTrackId === trackId) {
      currentTrackId = null;
      stopProgressTracking();
    }
    window.dispatchEvent(new CustomEvent(AUDIO_EVENTS.STOP, { detail: { trackId } }));
  };

  /**
   * Plays the next track in the queue
   */
  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      currentIndex++;
      const nextTrack = queue[currentIndex];
      if (nextTrack) {
        emitPlay(nextTrack.trackId);
      }
    }
  };

  /**
   * Plays the previous track in the queue
   */
  const playPrevious = () => {
    if (currentIndex > 0) {
      currentIndex--;
      const prevTrack = queue[currentIndex];
      if (prevTrack) {
        emitPlay(prevTrack.trackId);
      }
    }
  };

  /**
   * Subscribes to play events
   * @param {Function} callback - Callback function for play events
   * @returns {Function} Unsubscribe function
   */
  const onPlay = (callback) => {
    window.addEventListener(AUDIO_EVENTS.PLAY, callback);
    return () => window.removeEventListener(AUDIO_EVENTS.PLAY, callback);
  };

  /**
   * Subscribes to stop events
   * @param {Function} callback - Callback function for stop events
   * @returns {Function} Unsubscribe function
   */
  const onStop = (callback) => {
    window.addEventListener(AUDIO_EVENTS.STOP, callback);
    return () => window.removeEventListener(AUDIO_EVENTS.STOP, callback);
  };

  /**
   * Subscribes to queue update events
   * @param {Function} callback - Callback function for queue updates
   * @returns {Function} Unsubscribe function
   */
  const onQueueUpdate = (callback) => {
    window.addEventListener(AUDIO_EVENTS.QUEUE_UPDATE, callback);
    return () => window.removeEventListener(AUDIO_EVENTS.QUEUE_UPDATE, callback);
  };

  /**
   * Subscribes to progress update events
   * @param {Function} callback - Callback function for progress updates
   * @returns {Function} Unsubscribe function
   */
  const onProgressUpdate = (callback) => {
    window.addEventListener(AUDIO_EVENTS.PROGRESS_UPDATE, callback);
    return () => window.removeEventListener(AUDIO_EVENTS.PROGRESS_UPDATE, callback);
  };

  /**
   * Gets the currently playing track ID
   * @returns {string|null} Current track ID or null if no track is playing
   */
  const getCurrentTrackId = () => currentTrackId;

  /**
   * Gets the currently playing track object
   * @returns {Object|null} Current track object or null if no track is playing
   */
  const getCurrentTrack = () => (currentIndex >= 0 ? queue[currentIndex] : null);

  return {
    setQueue,
    getQueue,
    playNext,
    playPrevious,
    emitPlay,
    emitStop,
    onPlay,
    onStop,
    onQueueUpdate,
    onProgressUpdate,
    getCurrentTrackId,
    getCurrentTrack
  };
};

// Export singleton instance
const audioEventManager = createAudioEventManager();
export default audioEventManager;
