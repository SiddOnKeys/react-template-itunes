import {
  selectTracks,
  selectTracksById,
  selectLoading,
  selectError,
  selectQuery,
  makeSelectTrackById
} from '../selectors';
import { initialState } from '../reducer';

describe('ITunesSearch selectors', () => {
  const mockTrack = {
    trackId: 123,
    trackName: 'Test Track'
  };

  const mockState = {
    iTunesSearch: {
      tracksById: {
        123: mockTrack,
        456: {
          trackId: 456,
          trackName: 'Another Track'
        }
      },
      loading: true,
      error: { message: 'Test error' },
      query: 'test query'
    }
  };

  it('should select tracksById', () => {
    const selected = selectTracksById(mockState);
    expect(selected).toEqual(mockState.iTunesSearch.tracksById);

    const emptyState = { iTunesSearch: initialState };
    const emptySelected = selectTracksById(emptyState);
    expect(emptySelected).toEqual(initialState.tracksById);
  });

  it('should select tracks as array', () => {
    const selected = selectTracks(mockState);
    expect(selected).toEqual([mockState.iTunesSearch.tracksById[123], mockState.iTunesSearch.tracksById[456]]);

    const emptyState = { iTunesSearch: initialState };
    const emptySelected = selectTracks(emptyState);
    expect(emptySelected).toEqual([]);
  });

  it('should select loading state', () => {
    const selected = selectLoading(mockState);
    expect(selected).toBe(true);

    const emptyState = { iTunesSearch: initialState };
    const emptySelected = selectLoading(emptyState);
    expect(emptySelected).toBe(initialState.loading);
  });

  it('should select error state', () => {
    const selected = selectError(mockState);
    expect(selected).toEqual({ message: 'Test error' });

    const emptyState = { iTunesSearch: initialState };
    const emptySelected = selectError(emptyState);
    expect(emptySelected).toBe(initialState.error);
  });

  it('should select query', () => {
    const selected = selectQuery(mockState);
    expect(selected).toBe('test query');

    const emptyState = { iTunesSearch: initialState };
    const emptySelected = selectQuery(emptyState);
    expect(emptySelected).toBe(initialState.query);
  });

  describe('makeSelectTrackById', () => {
    const selectTrackById = makeSelectTrackById();

    it('should select track by id', () => {
      const selected = selectTrackById(mockState, '123');
      expect(selected).toEqual(mockTrack);
    });

    it('should return undefined if track not found', () => {
      const selected = selectTrackById(mockState, '789');
      expect(selected).toBeUndefined();
    });

    it('should handle empty state', () => {
      const emptyState = { iTunesSearch: initialState };
      const selected = selectTrackById(emptyState, '123');
      expect(selected).toBeUndefined();
    });

    it('should handle string IDs', () => {
      const stateWithStringId = {
        iTunesSearch: {
          tracksById: {
            123: { ...mockTrack, trackId: '123' }
          }
        }
      };
      const selected = selectTrackById(stateWithStringId, 123);
      expect(selected).toEqual({ ...mockTrack, trackId: '123' });
    });
  });
});
