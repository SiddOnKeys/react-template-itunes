import { generateApiClient, API_TYPES } from '@utils/apiUtils';
import { getRepos } from '../repoApi';

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

describe('Repository API Service', () => {
  let apiUtils;

  beforeEach(() => {
    jest.clearAllMocks();
    apiUtils = require('@utils/apiUtils');

    // Setup default successful response
    apiUtils.mockGet.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        data: { items: [] }
      })
    );
  });

  describe('getRepos', () => {
    it('should make a search request with the correct URL', async () => {
      const repoName = 'react';
      const mockResponse = {
        data: {
          totalCount: 1,
          incompleteResults: false,
          items: [
            {
              id: 123,
              name: 'react',
              fullName: 'facebook/react',
              owner: {
                login: 'facebook',
                avatarUrl: 'https://github.com/facebook.png'
              },
              htmlUrl: 'https://github.com/facebook/react',
              description: 'A JavaScript library for building user interfaces',
              stargazersCount: 200000,
              language: 'JavaScript',
              forksCount: 40000,
              openIssuesCount: 1000,
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ]
        },
        ok: true,
        status: 200
      };

      apiUtils.mockGet.mockResolvedValueOnce(mockResponse);

      const result = await getRepos(repoName);

      expect(apiUtils.mockGet).toHaveBeenCalledWith(`search/repositories?q=${repoName}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle special characters in repository name', async () => {
      const repoName = 'react & redux + typescript';
      const mockResponse = {
        data: { items: [] },
        ok: true,
        status: 200
      };

      apiUtils.mockGet.mockResolvedValueOnce(mockResponse);

      const result = await getRepos(repoName);

      expect(apiUtils.mockGet).toHaveBeenCalledWith(`search/repositories?q=${repoName}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const repoName = 'react';
      const error = {
        ok: false,
        status: 400,
        data: { message: 'Bad Request' }
      };

      apiUtils.mockGet.mockResolvedValueOnce(error);

      const result = await getRepos(repoName);
      expect(result).toEqual(error);
    });

    it('should handle empty responses', async () => {
      const repoName = 'nonexistent-repo-123456';
      const mockResponse = {
        data: {
          totalCount: 0,
          incompleteResults: false,
          items: []
        },
        ok: true,
        status: 200
      };

      apiUtils.mockGet.mockResolvedValueOnce(mockResponse);

      const result = await getRepos(repoName);
      expect(result).toEqual(mockResponse);
    });

    it('should handle rate limiting errors', async () => {
      const repoName = 'react';
      const error = {
        ok: false,
        status: 403,
        data: { message: 'API rate limit exceeded' }
      };

      apiUtils.mockGet.mockResolvedValueOnce(error);

      const result = await getRepos(repoName);
      expect(result).toEqual(error);
    });

    it('should handle network errors', async () => {
      const repoName = 'react';
      const error = {
        ok: false,
        status: 0,
        data: { message: 'Network Error' }
      };

      apiUtils.mockGet.mockResolvedValueOnce(error);

      const result = await getRepos(repoName);
      expect(result).toEqual(error);
    });
  });
});
