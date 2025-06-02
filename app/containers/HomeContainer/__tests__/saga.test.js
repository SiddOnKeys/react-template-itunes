import { put, call } from 'redux-saga/effects';
import { getRepos } from '@services/repoApi';
import { getGithubRepos } from '../saga';
import { homeContainerCreators } from '../reducer';

describe('HomeContainer saga', () => {
  const repoName = 'test-repo';
  const action = { repoName };

  it('should handle successful API response', () => {
    const generator = getGithubRepos(action);
    const response = {
      data: { items: [{ id: 1 }] },
      ok: true
    };

    expect(generator.next().value).toEqual(call(getRepos, repoName));

    expect(generator.next(response).value).toEqual(put(homeContainerCreators.successGetGithubRepos(response.data)));

    expect(generator.next().done).toBe(true);
  });

  it('should handle API error response', () => {
    const generator = getGithubRepos(action);
    const response = {
      data: { message: 'Not found' },
      ok: false
    };

    expect(generator.next().value).toEqual(call(getRepos, repoName));

    expect(generator.next(response).value).toEqual(put(homeContainerCreators.failureGetGithubRepos(response.data)));

    expect(generator.next().done).toBe(true);
  });
});
