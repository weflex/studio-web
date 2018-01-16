'use strict';
import types from './actionTypes';
import { client } from '../util/api';

export function getClassPackageList(data) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.CLASS_PACKAGE_LIST_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.CLASS_PACKAGE_LIST_ERROR, payload: error });
      return error;
    }

    try {
      const success = await client.classPackage.list({
        where: {
          venueId: data.venue.id
        },
      });
      return success;
    } catch (error) {
      return onError(error);
    }
  }
}
