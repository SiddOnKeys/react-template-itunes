import { homeContainerReducer, initialState, homeContainerTypes } from '../reducer';

describe('HomeContainer reducer', () => {
  it('should return the initial state', () => {
    expect(homeContainerReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle REQUEST_GET_GITHUB_REPOS', () => {
    const repoName = 'test-repo';
    const action = {
      type: homeContainerTypes.REQUEST_GET_GITHUB_REPOS,
      repoName
    };
    const expectedState = {
      ...initialState,
      repoName,
      loading: true
    };
    expect(homeContainerReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle SUCCESS_GET_GITHUB_REPOS', () => {
    const data = {
      items: [{ id: 1, name: 'repo1' }],
      totalCount: 1
    };
    const action = {
      type: homeContainerTypes.SUCCESS_GET_GITHUB_REPOS,
      data
    };
    const expectedState = {
      ...initialState,
      reposData: data,
      reposError: null,
      loading: false
    };
    expect(homeContainerReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FAILURE_GET_GITHUB_REPOS', () => {
    const error = { message: 'Not found' };
    const action = {
      type: homeContainerTypes.FAILURE_GET_GITHUB_REPOS,
      error
    };
    const expectedState = {
      ...initialState,
      reposError: error.message,
      reposData: null,
      loading: false
    };
    expect(homeContainerReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_GITHUB_REPOS', () => {
    const action = {
      type: homeContainerTypes.CLEAR_GITHUB_REPOS
    };
    const stateWithData = {
      ...initialState,
      repoName: 'test',
      reposData: { items: [] },
      loading: false
    };
    expect(homeContainerReducer(stateWithData, action)).toEqual(initialState);
  });
});
