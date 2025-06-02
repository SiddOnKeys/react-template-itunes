import {
  selectTracks,
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
    itunesSearch: {
      tracks: [mockTrack],
      loading: true,
      error: { message: 'Test error' },
      query: 'test query'
    }
  };

  it('should select tracks', () => {
    const selected = selectTracks(mockState);
    expect(selected).toEqual([mockTrack]);

    const emptyState = { itunesSearch: initialState };
    const emptySelected = selectTracks(emptyState);
    expect(emptySelected).toEqual(initialState.tracks);
  });

  it('should select loading state', () => {
    const selected = selectLoading(mockState);
    expect(selected).toBe(true);

    const emptyState = { itunesSearch: initialState };
    const emptySelected = selectLoading(emptyState);
    expect(emptySelected).toBe(initialState.loading);
  });

  it('should select error state', () => {
    const selected = selectError(mockState);
    expect(selected).toEqual({ message: 'Test error' });

    const emptyState = { itunesSearch: initialState };
    const emptySelected = selectError(emptyState);
    expect(emptySelected).toBe(initialState.error);
  });

  it('should select query', () => {
    const selected = selectQuery(mockState);
    expect(selected).toBe('test query');

    const emptyState = { itunesSearch: initialState };
    const emptySelected = selectQuery(emptyState);
    expect(emptySelected).toBe(initialState.query);
  });

  describe('makeSelectTrackById', () => {
    const selectTrackById = makeSelectTrackById();

    it('should find track by ID', () => {
      const selected = selectTrackById(mockState, '123');
      expect(selected).toEqual(mockTrack);
    });

    it('should return undefined if track not found', () => {
      const selected = selectTrackById(mockState, '456');
      expect(selected).toBeUndefined();
    });

    it('should handle empty tracks array', () => {
      const emptyState = { itunesSearch: { ...initialState, tracks: [] } };
      const selected = selectTrackById(emptyState, '123');
      expect(selected).toBeUndefined();
    });

    it('should handle string IDs', () => {
      const stateWithStringId = {
        itunesSearch: {
          tracks: [{ ...mockTrack, trackId: '123' }]
        }
      };
      const selected = selectTrackById(stateWithStringId, 123);
      expect(selected).toEqual({ ...mockTrack, trackId: '123' });
    });
  });
});
