import { put, call, takeLatest } from 'redux-saga/effects';
import { searchTracksSuccess, searchTracksError } from '../actions';
import { SEARCH_TRACKS } from '../constants';
import { searchTracksSaga, getTrackDetails } from '../saga';
import { searchTracks as searchTracksAPI } from '../service';

describe('ITunesSearch Saga', () => {
  describe('searchTracksSaga', () => {
    let searchGenerator;

    beforeEach(() => {
      searchGenerator = searchTracksSaga({ query: 'test' });
    });

    it('should dispatch searchTracksSuccess action on successful API call', () => {
      const response = {
        results: [
          {
            trackId: 123,
            trackName: 'Test Track',
            artistName: 'Test Artist'
          }
        ]
      };

      expect(searchGenerator.next().value).toEqual(
        call(searchTracksAPI, 'test')
      );

      expect(searchGenerator.next(response).value).toEqual(
        put(searchTracksSuccess(response.results))
      );

      expect(searchGenerator.next().done).toBe(true);
    });

    it('should dispatch searchTracksError action on API error', () => {
      const error = new Error('API Error');

      expect(searchGenerator.next().value).toEqual(
        call(searchTracksAPI, 'test')
      );

      expect(searchGenerator.throw(error).value).toEqual(
        put(searchTracksError(error))
      );

      expect(searchGenerator.next().done).toBe(true);
    });
  });

  describe('getTrackDetails', () => {
    let detailsGenerator;

    beforeEach(() => {
      detailsGenerator = getTrackDetails({ trackId: '123' });
    });

    it('should dispatch searchTracksSuccess action on successful API call', () => {
      const response = {
        results: [
          {
            trackId: 123,
            trackName: 'Test Track',
            artistName: 'Test Artist'
          }
        ]
      };

      expect(detailsGenerator.next().value).toEqual(
        call(searchTracksAPI, '123')
      );

      expect(detailsGenerator.next(response).value).toEqual(
        put(searchTracksSuccess(response.results))
      );

      expect(detailsGenerator.next().done).toBe(true);
    });

    it('should dispatch searchTracksError action on API error', () => {
      const error = new Error('API Error');

      expect(detailsGenerator.next().value).toEqual(
        call(searchTracksAPI, '123')
      );

      expect(detailsGenerator.throw(error).value).toEqual(
        put(searchTracksError(error))
      );

      expect(detailsGenerator.next().done).toBe(true);
    });

    it('should handle empty results', () => {
      const response = { results: [] };

      expect(detailsGenerator.next().value).toEqual(
        call(searchTracksAPI, '123')
      );

      expect(detailsGenerator.next(response).value).toEqual(
        put(searchTracksSuccess([]))
      );

      expect(detailsGenerator.next().done).toBe(true);
    });
  });

  describe('root saga', () => {
    const rootSaga = searchTracksSaga();

    it('should fork watcher saga', () => {
      const takeLatestDescriptor = rootSaga.next().value;
      expect(takeLatestDescriptor).toEqual(
        takeLatest(SEARCH_TRACKS, searchTracksSaga)
      );
    });
  });
});
