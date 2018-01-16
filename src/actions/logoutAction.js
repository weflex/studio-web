'use strict';
import * as types from './actionTypes';
import { configuration } from '../constants';

export function logout() {
  return dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.LOGOUT_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.LOGOUT_ERROR, payload: error });
      return error;
    }

    try {
      localStorage.removeItem(configuration.userTokenKey);
      localStorage.removeItem(configuration.venueIdKey);
      const success = localStorage.getItem(configuration.userTokenKey) === '';
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  }
}
