'use strict';
import types from './actionTypes';
import { client } from '../util/api';

export function getCollaboratorList(data, include) {
  if (include == undefined) {
    include = [];
  }
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.COLLABORATOR_LIST_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.COLLABORATOR_LIST_ERROR, payload: error });
      return error;
    }

    try {
      const success = await client.collaborator.list({
        where: {
          or: [
            {
              orgId: data.venue.orgId,
            },
            {
              venueId: data.venue.id,
            },
          ],
        },
        include: include,
      });;
      return success;
    } catch (error) {
      return onError(error);
    }
  }
}
