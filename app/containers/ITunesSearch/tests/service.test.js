import { searchTracks } from '../service';

describe('ITunesSearch Service', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should make a search request with the correct URL', async () => {
    const query = 'test artist';
    const mockResponse = {
      results: [
        {
          trackId: 123,
          trackName: 'Test Track',
          artistName: 'Test Artist'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await searchTracks(query);

    expect(mockFetch).toHaveBeenCalledWith(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song`,
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse);
  });

  it('should make a lookup request when searching by trackId', async () => {
    const trackId = '123';
    const mockResponse = {
      results: [
        {
          trackId: 123,
          trackName: 'Test Track',
          artistName: 'Test Artist'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await searchTracks(trackId);

    expect(mockFetch).toHaveBeenCalledWith(
      `https://itunes.apple.com/lookup?id=${trackId}`,
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error for failed requests', async () => {
    const query = 'test';
    const errorMessage = 'API Error';

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: errorMessage
    });

    await expect(searchTracks(query)).rejects.toThrow(`HTTP error! status: 400 ${errorMessage}`);
  });

  it('should throw an error for network failures', async () => {
    const query = 'test';
    const networkError = new Error('Network failure');

    mockFetch.mockRejectedValueOnce(networkError);

    await expect(searchTracks(query)).rejects.toThrow(networkError);
  });

  it('should handle empty responses', async () => {
    const query = 'nonexistent';
    const mockResponse = { results: [] };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await searchTracks(query);
    expect(result).toEqual(mockResponse);
  });
});
