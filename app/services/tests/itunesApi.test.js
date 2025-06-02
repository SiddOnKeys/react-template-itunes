// Mock the apiUtils module
jest.mock('@utils/apiUtils', () => {
  const mockGet = jest.fn();
  const mockApiClient = { get: mockGet };

  return {
    API_TYPES: {
      GITHUB: 'github',
      ITUNES: 'itunes',
      DEFAULT: 'default'
    },
    generateApiClient: jest.fn(() => mockApiClient),
    mockGet // Expose mock for testing
  };
});

// Import after mocking
import { ITUNES_BASE_URL, searchTracks } from '../itunesApi';
import { API_TYPES } from '@utils/apiUtils';

describe('iTunes API Service', () => {
  let apiUtils;

  beforeEach(() => {
    jest.clearAllMocks();
    apiUtils = require('@utils/apiUtils');

    // Setup default successful response
    apiUtils.mockGet.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        data: { results: [] }
      })
    );
  });

  describe('Configuration', () => {
    it('should initialize with iTunes API client', () => {
      // Force re-import to trigger initialization
      jest.isolateModules(() => {
        require('../itunesApi');
        expect(apiUtils.generateApiClient).toHaveBeenCalledWith(API_TYPES.ITUNES);
      });
    });
  });

  describe('searchTracks', () => {
    const mockQuery = 'test song';

    it('should make a GET request with correct URL parameters', async () => {
      await searchTracks(mockQuery);

      expect(apiUtils.mockGet).toHaveBeenCalledWith(
        `/search?term=${encodeURIComponent(mockQuery)}&entity=song&limit=20`
      );
    });

    it('should handle successful API response', async () => {
      const mockData = {
        results: [
          {
            trackId: 1,
            trackName: 'Test Track',
            artistName: 'Test Artist',
            previewUrl: 'http://test.com/preview.mp3'
          }
        ]
      };

      apiUtils.mockGet.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          data: mockData
        })
      );

      const result = await searchTracks(mockQuery);
      expect(result).toEqual({
        ok: true,
        status: 200,
        data: mockData
      });
    });

    it('should handle API error response', async () => {
      const mockError = {
        ok: false,
        status: 404,
        data: { errorMessage: 'Not found' }
      };

      apiUtils.mockGet.mockImplementationOnce(() => Promise.resolve(mockError));

      const result = await searchTracks(mockQuery);
      expect(result).toEqual(mockError);
    });

    it('should properly encode search query parameters', async () => {
      const queryWithSpaces = 'test song with spaces & special chars';
      await searchTracks(queryWithSpaces);

      expect(apiUtils.mockGet).toHaveBeenCalledWith(
        `/search?term=${encodeURIComponent(queryWithSpaces)}&entity=song&limit=20`
      );
    });
  });
});
