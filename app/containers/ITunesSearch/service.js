import request from '@utils/request';

/**
 * Search tracks in iTunes
 * @param {string} query - Search query
 * @returns {Promise} Response from iTunes API
 */
export const searchTracks = async (query) => {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=25`;
  const response = await request(url);
  return response.results;
};

/**
 * Get track details by ID
 * @param {number} trackId - Track ID
 * @returns {Promise} Track details
 */
export const getTrackById = async (trackId) => {
  const url = `https://itunes.apple.com/lookup?id=${trackId}`;
  const response = await request(url);
  return response.results[0];
};
