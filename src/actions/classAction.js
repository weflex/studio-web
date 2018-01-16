'use strict';
import * as types from './actionTypes';
import { client } from '../util/api';
import {startOfDay, endOfDay} from 'date-fns';

export function getClassList(data) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.CLASS_LIST_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.CLASS_LIST_ERROR, payload: error });
      return error;
    }

    try {
      const success = await client.class.list({
        where: {
          startsAt: {
            between: [startOfDay(data.startsAt), endOfDay(data.endsAt)]
          },
          venueId: data.venue.id
        },
        include: [
          'trainer',
          'template',
          {
            'orders': ['user']
          },
        ],
        order: 'startsAt ASC'
      });
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  }
}

export function getPtSessions(data) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.CLASS_PT_SESSIONS_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.CLASS_PT_SESSIONS_ERROR, payload: error });
      return error;
    }
    try {
      const success = await client.ptSession.list({
        where: {
          startsAt: {
            between: [data.startsAt.toDate(), data.endsAt.toDate()]
          },
          venueId: data.venue.id,
          cancelledAt: {
            exists: false,
          },
        },
        include: [
          'trainer',
          'user',
        ],
      });
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  }
}
