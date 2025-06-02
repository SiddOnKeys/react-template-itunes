import { put } from 'redux-saga/effects';
import { getGithubRepos } from '../saga';
import { homeContainerCreators } from '../reducer';

// Mock the API client
jest.mock('@services/repoApi', () => ({
  getRepos: jest.fn()
}));

describe('HomeContainer saga', () => {
  const repoName = 'test-repo';
  const action = { repoName };

  it('should handle successful API response', () => {
    const generator = getGithubRepos(action);
    const response = {
      data: { items: [{ id: 1 }] },
      ok: true
    };

    // First yield should be the API call
    generator.next();

    // Mock successful response
    const result = generator.next(response).value;
    expect(result).toEqual(put(homeContainerCreators.successGetGithubRepos(response.data)));

    expect(generator.next().done).toBe(true);
  });

  it('should handle API error response', () => {
    const generator = getGithubRepos(action);
    const response = {
      data: { message: 'Not found' },
      ok: false
    };

    // First yield should be the API call
    generator.next();

    // Mock error response
    const result = generator.next(response).value;
    expect(result).toEqual(put(homeContainerCreators.failureGetGithubRepos(response.data)));

    expect(generator.next().done).toBe(true);
  });
});
