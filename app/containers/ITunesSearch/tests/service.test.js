import { generateApiClient, API_TYPES } from '@utils/apiUtils';
import { searchTracks, ITUNES_BASE_URL } from '@services/itunesApi';

// Mock the API client generator
jest.mock('@utils/apiUtils', () => ({
  generateApiClient: jest.fn(() => ({
    get: jest.fn()
  })),
  API_TYPES: {
    ITUNES: 'itunes'
  }
}));

describe('iTunes API Service', () => {
  let apiClient;

  beforeEach(() => {
    // Get the mocked API client
    apiClient = generateApiClient(API_TYPES.ITUNES);
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('searchTracks', () => {
    it('should make a search request with the correct URL and parameters', async () => {
      const query = 'test artist';
      const mockResponse = {
        resultCount: 1,
        results: [
          {
            trackId: 123,
            trackName: 'Test Track',
            artistName: 'Test Artist',
            previewUrl: 'https://example.com/preview.mp3',
            artworkUrl100: 'https://example.com/artwork.jpg',
            collectionName: 'Test Album',
            primaryGenreName: 'Pop',
            releaseDate: '2024-01-01'
          }
        ]
      };

      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await searchTracks(query);

      expect(apiClient.get).toHaveBeenCalledWith(`/search?term=${encodeURIComponent(query)}&entity=song&limit=20`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in search query', async () => {
      const query = 'test & artist + song';
      const mockResponse = { results: [] };

      apiClient.get.mockResolvedValueOnce(mockResponse);

      await searchTracks(query);

      expect(apiClient.get).toHaveBeenCalledWith(`/search?term=${encodeURIComponent(query)}&entity=song&limit=20`);
    });

    it('should handle API errors', async () => {
      const query = 'test';
      const error = new Error('API Error');

      apiClient.get.mockRejectedValueOnce(error);

      await expect(searchTracks(query)).rejects.toThrow('API Error');
    });

    it('should handle empty responses', async () => {
      const query = 'nonexistent';
      const mockResponse = { resultCount: 0, results: [] };

      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await searchTracks(query);
      expect(result).toEqual(mockResponse);
    });

    it('should use the correct base URL', () => {
      expect(ITUNES_BASE_URL).toBe('https://itunes.apple.com');
    });
  });
});
