import React from 'react';
import { render, screen } from '@testing-library/react';
import PropTypes from 'prop-types';
import TrackGrid from '../index';

// Mock the SongCard component
jest.mock('@app/components/SongCard', () => {
  const MockSongCard = ({ track }) => (
    <div data-testid="song-card">{track.trackName}</div>
  );

  MockSongCard.propTypes = {
    track: PropTypes.shape({
      trackName: PropTypes.string.isRequired
    }).isRequired
  };

  return MockSongCard;
});

// Mock the styles
jest.mock('../../../styles/Grid.css', () => ({
  gridContainer: 'gridContainer',
  gridItem: 'gridItem',
  emptyMessage: 'emptyMessage'
}));

describe('<TrackGrid />', () => {
  const mockTracks = [
    {
      trackId: 1,
      trackName: 'Track One',
      artistName: 'Artist One',
      artworkUrl100: 'https://example.com/art1.jpg',
      previewUrl: 'https://example.com/preview1.mp3'
    },
    {
      trackId: 2,
      trackName: 'Track Two',
      artistName: 'Artist Two',
      artworkUrl100: 'https://example.com/art2.jpg',
      previewUrl: 'https://example.com/preview2.mp3'
    }
  ];

  it('should render tracks correctly', () => {
    render(<TrackGrid tracks={mockTracks} loading={false} />);

    // Check if all tracks are rendered
    const songCards = screen.getAllByTestId('song-card');
    expect(songCards).toHaveLength(2);

    // Check if track names are displayed
    expect(screen.getByText('Track One')).toBeInTheDocument();
    expect(screen.getByText('Track Two')).toBeInTheDocument();
  });

  it('should show empty message when no tracks and not loading', () => {
    render(<TrackGrid tracks={[]} loading={false} />);

    expect(screen.getByText('Search for tracks to see results')).toBeInTheDocument();
  });

  it('should not show empty message when loading', () => {
    render(<TrackGrid tracks={[]} loading={true} />);

    expect(screen.queryByText('Search for tracks to see results')).not.toBeInTheDocument();
  });

  it('should render grid items with correct class names', () => {
    const { container } = render(<TrackGrid tracks={mockTracks} loading={false} />);

    expect(container.firstChild).toHaveClass('gridContainer');
    expect(container.getElementsByClassName('gridItem')).toHaveLength(2);
  });
});
