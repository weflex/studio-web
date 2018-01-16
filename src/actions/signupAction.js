'use strict';
import * as types from './actionTypes';
import { client } from '../util/api';

export function setCurrentUser(user) {
  return {
    type: types.SET_CURRENT_USER,
    user
  };
}

export function requestSMSCode(data) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.REGISTER_SMS_CODE_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.REGISTER_SMS_CODE_ERROR, payload: error });
      return error;
    }

    try {
      const success = await client.user.smsRequest(data.phone);
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  }
}

export function smsRegisterNewOrgAndVenue(data) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.REGISTER_NEW_ORG_AND_VENUE_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.REGISTER_NEW_ORG_AND_VENUE_ERROR, payload: error });
      return error;
    }
    
    try {
      const success = client.user.smsRegisterNewOrgAndVenue(
        data.phone,
        data.smscode,
        {
          name: data.name,
          username: data.username,
        }
      );
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  }
}
