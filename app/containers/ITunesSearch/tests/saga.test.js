import { put, call, takeLatest, delay } from 'redux-saga/effects';
import { searchTracksSuccess, searchTracksError } from '../actions';
import { SEARCH_TRACKS } from '../constants';
import itunesSearchSaga, { searchTracksSaga } from '../saga';
import { searchTracks as searchTracksApi } from '@services/itunesApi';

describe('ITunesSearch Saga', () => {
  describe('searchTracksSaga', () => {
    let searchGenerator;
    const query = 'test';

    beforeEach(() => {
      searchGenerator = searchTracksSaga({ query });
    });

    it('should delay and then dispatch searchTracksSuccess action on successful API call', () => {
      const response = {
        ok: true,
        data: {
          results: [
            {
              trackId: 123,
              trackName: 'Test Track',
              artistName: 'Test Artist'
            }
          ]
        }
      };

      // First yield should be delay
      expect(searchGenerator.next().value).toEqual(delay(300));

      // Second yield should be the API call
      expect(searchGenerator.next().value).toEqual(call(searchTracksApi, query));

      // Third yield should dispatch success action
      expect(searchGenerator.next(response).value).toEqual(put(searchTracksSuccess(response.data.results)));

      // Saga should be done
      expect(searchGenerator.next().done).toBe(true);
    });

    it('should dispatch searchTracksError action on API error', () => {
      const error = new Error('API Error');

      // First yield should be delay
      expect(searchGenerator.next().value).toEqual(delay(300));

      // Second yield should be the API call
      expect(searchGenerator.next().value).toEqual(call(searchTracksApi, query));

      // On error, should dispatch error action
      expect(searchGenerator.throw(error).value).toEqual(put(searchTracksError(error)));

      // Saga should be done
      expect(searchGenerator.next().done).toBe(true);
    });

    it('should dispatch searchTracksError action on unsuccessful response', () => {
      const response = {
        ok: false,
        data: {
          message: 'Not found'
        }
      };

      // First yield should be delay
      expect(searchGenerator.next().value).toEqual(delay(300));

      // Second yield should be the API call
      expect(searchGenerator.next().value).toEqual(call(searchTracksApi, query));

      // Should dispatch error action with response message
      expect(searchGenerator.next(response).value).toEqual(put(searchTracksError(new Error(response.data.message))));

      // Saga should be done
      expect(searchGenerator.next().done).toBe(true);
    });
  });

  describe('root saga', () => {
    it('should start task to watch for SEARCH_TRACKS action', () => {
      const saga = itunesSearchSaga();
      const takeLatestDescriptor = saga.next().value;
      expect(takeLatestDescriptor).toEqual(takeLatest(SEARCH_TRACKS, searchTracksSaga));
    });
  });
});
