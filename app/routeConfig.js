/**
 * Route configuration
 */

import NotFound from '@containers/NotFoundPage/loadable';
import ITunesSearch from '@containers/ITunesSearch/loadable';
import TrackDetails from '@containers/TrackDetails/loadable';

export const routeConfig = {
  itunes: {
    component: ITunesSearch,
    route: '/',
    exact: true
  },
  trackDetails: {
    component: TrackDetails,
    route: '/tracks/:trackId',
    exact: true
  },
  notFoundPage: {
    component: NotFound,
    route: ''
  }
};
