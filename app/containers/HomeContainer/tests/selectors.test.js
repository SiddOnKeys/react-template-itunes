import { selectReposData, selectLoading, selectReposError, selectRepoName } from '../selectors';
import { initialState } from '../reducer';

describe('HomeContainer selectors', () => {
  const reposData = { items: [{ id: 1 }] };
  const loading = true;
  const reposError = 'Error message';
  const repoName = 'test-repo';

  const mockedState = {
    homeContainer: {
      reposData,
      loading,
      reposError,
      repoName
    }
  };

  it('should select repos data', () => {
    const reposSelector = selectReposData();
    expect(reposSelector(mockedState)).toEqual(reposData);
  });

  it('should select loading state', () => {
    const loadingSelector = selectLoading();
    expect(loadingSelector(mockedState)).toEqual(loading);
  });

  it('should select error state', () => {
    const errorSelector = selectReposError();
    expect(errorSelector(mockedState)).toEqual(reposError);
  });

  it('should select repo name', () => {
    const repoNameSelector = selectRepoName();
    expect(repoNameSelector(mockedState)).toEqual(repoName);
  });

  it('should return undefined when state is empty', () => {
    const emptyState = { homeContainer: {} };
    const reposSelector = selectReposData();
    const loadingSelector = selectLoading();
    const errorSelector = selectReposError();
    const repoNameSelector = selectRepoName();

    expect(reposSelector(emptyState)).toBeUndefined();
    expect(loadingSelector(emptyState)).toBeUndefined();
    expect(errorSelector(emptyState)).toBeUndefined();
    expect(repoNameSelector(emptyState)).toBeUndefined();
  });

  it('should return undefined when homeContainer is not present', () => {
    const stateWithoutHomeContainer = {};
    const reposSelector = selectReposData();
    const loadingSelector = selectLoading();
    const errorSelector = selectReposError();
    const repoNameSelector = selectRepoName();

    expect(reposSelector(stateWithoutHomeContainer)).toBeUndefined();
    expect(loadingSelector(stateWithoutHomeContainer)).toBeUndefined();
    expect(errorSelector(stateWithoutHomeContainer)).toBeUndefined();
    expect(repoNameSelector(stateWithoutHomeContainer)).toBeUndefined();
  });
});
