'use strict';
import * as types from './actionTypes';
import { client } from '../util/api';
import { configuration } from '../constants';

export function getCurrentUser() {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.GET_CURRENT_USER_SUCCESS, payload: success });
      dispatch({ type: types.SET_CURRENT_USER_DETAIL, payload: success });
      dispatch({ type: types.SET_VENUE_ID, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.GET_CURRENT_USER_ERROR, payload: error });
      return error;
    }
    try {
      let success = null;
      // if (localStorage.getItem(configuration.venueIdKey) === '') {
        success = await client.user.getCurrent();
      // } else {
      //   success = dispatch({ type: types.STORE_GET_CURRENT_USER, {} });
      // }
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  }
}
