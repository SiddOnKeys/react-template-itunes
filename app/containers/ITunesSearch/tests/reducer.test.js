import produce from 'immer';
import itunesSearchReducer, { initialState } from '../reducer';
import { searchTracks, searchTracksSuccess, searchTracksError, clearTracks } from '../actions';

describe('itunesSearchReducer', () => {
  let state;
  beforeEach(() => {
    state = initialState;
  });

  it('should return the initial state', () => {
    const expectedResult = state;
    expect(itunesSearchReducer(undefined, {})).toEqual(expectedResult);
  });

  it('should handle searchTracks', () => {
    const query = 'test query';
    const expectedResult = produce(state, draft => {
      draft.loading = true;
      draft.error = null;
      draft.query = query;
    });

    expect(itunesSearchReducer(state, searchTracks(query))).toEqual(expectedResult);
  });

  it('should handle searchTracksSuccess', () => {
    const tracks = [
      {
        trackId: 123,
        trackName: 'Test Track',
        artistName: 'Test Artist'
      }
    ];

    // First set loading to true as it would be in real scenario
    state = produce(state, draft => {
      draft.loading = true;
    });

    const expectedResult = produce(state, draft => {
      draft.loading = false;
      draft.tracks = tracks;
    });

    expect(itunesSearchReducer(state, searchTracksSuccess(tracks))).toEqual(expectedResult);
  });

  it('should handle searchTracksError', () => {
    const error = new Error('Test error');

    // First set loading to true as it would be in real scenario
    state = produce(state, draft => {
      draft.loading = true;
    });

    const expectedResult = produce(state, draft => {
      draft.loading = false;
      draft.error = error;
    });

    expect(itunesSearchReducer(state, searchTracksError(error))).toEqual(expectedResult);
  });

  it('should handle clearTracks', () => {
    // First set some data in state
    state = produce(state, draft => {
      draft.tracks = [{ trackId: 123, trackName: 'Test Track' }];
      draft.query = 'test query';
      draft.error = new Error('Some error');
    });

    const expectedResult = produce(state, draft => {
      draft.tracks = [];
      draft.query = '';
      draft.error = null;
    });

    expect(itunesSearchReducer(state, clearTracks())).toEqual(expectedResult);
  });

  it('should preserve tracks array reference when no changes are made', () => {
    const tracks = [{ trackId: 123, trackName: 'Test Track' }];
    state = produce(state, draft => {
      draft.tracks = tracks;
    });

    const newState = itunesSearchReducer(state, { type: 'SOME_UNHANDLED_ACTION' });
    expect(newState.tracks).toBe(tracks); // Same reference
  });
});
