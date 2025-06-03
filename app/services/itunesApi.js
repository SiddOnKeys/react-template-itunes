import { generateApiClient, API_TYPES } from '@utils/apiUtils';

/**
 * iTunes API service for searching tracks
 * @see https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html
 */
export const ITUNES_BASE_URL = 'https://itunes.apple.com';

// Initialize the iTunes API client
const itunesApi = generateApiClient(API_TYPES.ITUNES);

/**
 * Search for tracks in iTunes
 * @param {string} query - The search term
 * @returns {Promise<Object>} API response with track results
 */
export const searchTracks = (query) => itunesApi.get(`/search?term=${encodeURIComponent(query)}&entity=song&limit=20`);
