'use strict';
import * as types from './actionTypes';
import { client } from '../util/api';
import { getVenueById } from './venueAction';

export function getClassTemplateList(include) {
  if (include == undefined) {
    include = [];
  }
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.CLASS_TEMPLATE_LIST_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.CLASS_TEMPLATE_LIST_ERROR, payload: error });
      return error;
    }

    try {
      const venue = getVenueById();
      const success = await client.classTemplate.list({
        include: include,
        where: {
          venueId: venue.id
        }
      });
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  }
}
