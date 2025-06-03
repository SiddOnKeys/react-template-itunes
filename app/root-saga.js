import { all } from 'redux-saga/effects';
import itunesSearchSaga from '@containers/ITunesSearch/saga';

/**
 * Root saga that combines all other sagas in the application.
 * This is the entry point for all Redux-Saga side effects.
 * @generator
 * @yields {Array} An array of all saga watchers in the application
 */
export default function* rootSaga() {
  yield all([itunesSearchSaga()]);
}
