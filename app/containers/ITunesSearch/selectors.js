import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the itunesSearch state domain
 * @param {object} state - Global Redux state
 * @returns {object} iTunes search state
 */
const selectITunesSearchDomain = (state) => {
  return state.itunesSearch || initialState;
};

/**
 * Select the tracks by ID mapping
 * @returns {Object} Object with trackId as key and track as value
 */
export const selectTracksById = createSelector(selectITunesSearchDomain, (substate) => {
  return substate.tracksById;
});

/**
 * Select all tracks in order
 * @returns {Array} List of track objects
 */
export const selectTracks = createSelector(selectTracksById, (tracksById) => {
  return Object.values(tracksById);
});

/**
 * Select the loading state
 * @returns {boolean} Loading state
 */
export const selectLoading = createSelector(selectITunesSearchDomain, (substate) => substate.loading);

/**
 * Select the error state
 * @returns {object} Error object
 */
export const selectError = createSelector(selectITunesSearchDomain, (substate) => substate.error);

/**
 * Select the query state
 * @returns {string} Current search query
 */
export const selectQuery = createSelector(selectITunesSearchDomain, (substate) => substate.query);

/**
 * Creates a selector to find a track by ID
 * @returns {Function} Selector that takes state and trackId and returns matching track
 */
export const makeSelectTrackById = () =>
  createSelector(
    selectTracksById,
    (_, trackId) => trackId,
    (tracksById, trackId) => tracksById[Number(trackId)]
  );
