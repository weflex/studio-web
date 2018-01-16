'use strict';
import * as types from './actionTypes';
import { client } from '../util/api';

export function getVenueById() {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.VENUE_BY_ID_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.VENUE_BY_ID_ERROR, payload: error });
      return error;
    }

    try {
      // get current user and then resolve venues
      const user = await client.user.getCurrent();
      const success = await client.user.getVenueById();
      return success;
    } catch (error) {
      return onError(error);
    }
  }
}

export function getVenueStats(venue) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.VENUE_STATS_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.VENUE_STATS_ERROR, payload: error });
      return error;
    }

    try {
      const success = await client.venue.stats(venue.id);
      return success;
    } catch (error) {
      return onError(error);
    }
  }
}
