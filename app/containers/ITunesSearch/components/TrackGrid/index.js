import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import SongCard from '@app/components/SongCard';
import gridStyles from '../../styles/Grid.css';

/**
 * Grid component for displaying track results
 * @param {Object} props - Component props
 * @param {Array} props.tracks - Array of track objects
 * @param {boolean} props.loading - Loading state
 */
const TrackGrid = ({ tracks, loading }) => {
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
