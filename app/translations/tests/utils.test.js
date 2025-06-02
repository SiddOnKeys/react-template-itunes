import { translate } from '../../utils';
import { messages } from '../en';

describe('Translation Utils', () => {
  describe('translate', () => {
    it('should handle missing translations', () => {
      const result = translate('non_existent_key');
      expect(result).toBe('non_existent_key');
    });
  });

  describe('messages structure', () => {
    const parsedMessages = JSON.parse(JSON.stringify(messages));

    it('should have all required keys', () => {
      const requiredKeys = [
        'get_repo_details',
        'matching_repos',
        'repo_search',
        'something_went_wrong',
        'search_tracks_error',
        'track_not_found',
        'audio_not_supported'
      ];

      requiredKeys.forEach(key => {
        expect(parsedMessages).toHaveProperty(key);
      });
    });

    it('should have valid interpolation format', () => {
      const interpolatedKeys = [
        'matching_repos',
        'repository_full_name',
        'repository_name',
        'repository_stars',
        'search_query',
        'track_album',
        'track_genre',
        'track_release_date',
        'error_prefix'
      ];

      interpolatedKeys.forEach(key => {
        const value = parsedMessages[key];
        expect(Array.isArray(value)).toBe(true);
        expect(value.length).toBe(2);
        expect(typeof value[0]).toBe('string');
        expect(Array.isArray(value[1])).toBe(true);
        value[1].forEach(param => {
          expect(typeof param).toBe('string');
        });
      });
    });

    it('should have consistent formatting for interpolated strings', () => {
      const testCases = {
        matching_repos: ['totalCount'],
        repository_name: ['name'],
        track_album: ['name'],
        error_prefix: ['message']
      };

      Object.entries(testCases).forEach(([key, expectedVars]) => {
        const value = parsedMessages[key];
        expect(Array.isArray(value)).toBe(true);
        expect(value[1]).toEqual(expectedVars);
      });
    });
  });
});
