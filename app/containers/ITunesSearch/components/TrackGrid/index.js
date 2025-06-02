import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import SongCard from '@app/components/SongCard';
import audioEventManager from '@app/utils/audio-event-manager';
import gridStyles from '../../styles/Grid.css';

/**
 * Grid component for displaying track results
 * @param {Object} props - Component props
 * @param {Array} props.tracks - Array of track objects
 * @param {boolean} props.loading - Loading state
 */
const TrackGrid = ({ tracks, loading }) => {
  // Set or clear the queue whenever tracks change
  useEffect(() => {
    if (tracks.length > 0) {
      audioEventManager.setQueue(tracks);
    } else {
      // Clear the queue when there are no tracks
      audioEventManager.setQueue([]);
      // Also stop any currently playing track
      const currentTrackId = audioEventManager.getCurrentTrackId();
      if (currentTrackId) {
        audioEventManager.emitStop(currentTrackId);
      }
    }
  }, [tracks]);

  return (
    <div className={gridStyles.gridContainer}>
      {tracks.map((track) => (
        <div className={gridStyles.gridItem} key={track.trackId}>
          <SongCard track={track} />
        </div>
      ))}
      {tracks.length === 0 && !loading && (
        <div className={gridStyles.emptyMessage}>
          <Typography variant="body1">Search for tracks to see results</Typography>
        </div>
      )}
    </div>
  );
};

TrackGrid.propTypes = {
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      trackId: PropTypes.number,
      trackName: PropTypes.string,
      artistName: PropTypes.string,
      artworkUrl100: PropTypes.string,
      previewUrl: PropTypes.string
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired
};

export default TrackGrid;
