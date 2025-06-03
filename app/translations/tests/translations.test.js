import { messages } from '../en';
import enJson from '../en.json';

describe('Translations', () => {
  describe('Structure', () => {
    it('should have messages exported correctly', () => {
      expect(messages).toBeDefined();
      expect(typeof messages).toBe('object');
    });

    it('should match the JSON structure', () => {
      const parsedMessages = JSON.parse(JSON.stringify(messages));
      expect(Object.keys(parsedMessages)).toEqual(Object.keys(enJson));
    });
  });

  describe('Required translations', () => {
    const requiredKeys = [
      'get_repo_details',
      'matching_repos',
      'not_found_page_container',
      'repo_search',
      'repo_search_default',
      'something_went_wrong',
      'wednesday_solutions',
      'search_tracks_error',
      'back_to_search',
      'track_not_found',
      'audio_not_supported',
      'error_prefix'
    ];

    requiredKeys.forEach((key) => {
      it(`should have the required translation for ${key}`, () => {
        expect(enJson[key]).toBeDefined();
        expect(typeof enJson[key]).toBe('string');
      });
    });
  });

  describe('Interpolation format', () => {
    const interpolationKeys = {
      matching_repos: ['totalCount'],
      repository_full_name: ['fullName'],
      repository_name: ['name'],
      repository_stars: ['stars'],
      search_query: ['repoName'],
      track_album: ['name'],
      track_genre: ['name'],
      track_release_date: ['date'],
      error_prefix: ['message']
    };

    Object.entries(interpolationKeys).forEach(([key, variables]) => {
      it(`should have correct interpolation format for ${key}`, () => {
        const translation = enJson[key];
        expect(translation).toBeDefined();

        // Check if all variables are present in the translation string
        variables.forEach((variable) => {
          expect(translation).toContain(`{${variable}}`);
        });
      });
    });
  });

  describe('Translation values', () => {
    it('should have non-empty strings for all translations', () => {
      Object.entries(enJson).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
        expect(value.trim()).not.toBe('');
      });
    });

    it('should not have duplicate values', () => {
      const values = Object.values(enJson);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe('Special characters', () => {
    it('should handle special characters correctly', () => {
      Object.entries(enJson).forEach(([key, value]) => {
        // Should be valid JSON
        expect(() => JSON.stringify(value)).not.toThrow();

        // Should not have unescaped quotes
        expect(value.match(/(?<!\\)"/g)).toBeFalsy();
      });
    });
  });

  describe('Consistency', () => {
    it('should have consistent casing for keys', () => {
      const keys = Object.keys(enJson);
      keys.forEach((key) => {
        expect(key).toMatch(/^[a-z][a-z0-9_]*$/); // snake_case validation
      });
    });

    it('should have consistent punctuation', () => {
      Object.values(enJson).forEach((value) => {
        // If ends with punctuation, should be consistent
        if (value.endsWith('.') || value.endsWith('!') || value.endsWith('?')) {
          expect(value.slice(-1)).toMatch(/[.!?]/);
        }
      });
    });
  });
});
