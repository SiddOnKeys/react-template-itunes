import { produce } from 'immer';
import { SEARCH_TRACKS, SEARCH_TRACKS_SUCCESS, SEARCH_TRACKS_ERROR, CLEAR_TRACKS } from './constants';

export const initialState = {
  tracksById: {}, // Normalized tracks with trackId as key
  loading: false,
  error: null,
  query: ''
};

/**
 * Normalize tracks array into an object with trackId as key
 * @param {Array} tracks - Array of track objects
 * @returns {Object} Normalized tracks object
 */
const normalizeTracksById = (tracks) =>
  tracks.reduce((acc, track) => Object.assign(acc, { [track.trackId]: { ...track } }), {});

/**
 * iTunes search reducer
 * @param {object} state - The current state
 * @param {object} action - The action to handle
 * @returns {object} The new state
 */
const itunesSearchReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case SEARCH_TRACKS:
        draft.loading = true;
        draft.error = null;
        draft.query = action.query;
        break;

      case SEARCH_TRACKS_SUCCESS:
        draft.tracksById = normalizeTracksById(action.tracks);
        draft.loading = false;
        break;

      case SEARCH_TRACKS_ERROR:
        draft.error = action.error;
        draft.loading = false;
        break;

      case CLEAR_TRACKS:
        draft.tracksById = {};
        draft.error = null;
        draft.query = '';
        break;
    }
  });

export default itunesSearchReducer;
