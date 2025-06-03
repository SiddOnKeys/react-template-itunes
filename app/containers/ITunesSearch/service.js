import { generateApiClient, API_TYPES } from '@utils/apiUtils';

const itunesClient = generateApiClient(API_TYPES.ITUNES);

/**
 * Search tracks in iTunes
 * @param {string} query - Search query
 * @returns {Promise} Response from iTunes API
 */
export const searchTracks = (query) =>
  itunesClient.get(`/search?term=${encodeURIComponent(query)}&media=music&limit=25`);

/**
 * Get track details by ID
 * @param {number} trackId - Track ID
 * @returns {Promise} Track details
 */
export const getTrackById = (trackId) => itunesClient.get(`/lookup?id=${trackId}`);

/**
 * Search iTunes with custom parameters
 * @param {string} term - Search term
 * @returns {Promise} Search results
 */
export const searchITunes = (term) => itunesClient.get(`/search?term=${encodeURIComponent(term)}&entity=song&limit=50`);
