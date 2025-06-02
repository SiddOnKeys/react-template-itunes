import { all } from 'redux-saga/effects';
import itunesSearchSaga from '@containers/ITunesSearch/saga';

export default function* rootSaga() {
  yield all([itunesSearchSaga()]);
}
