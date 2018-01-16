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
      dispatch({ type: types.LOGIN_SMS_CODE_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.LOGIN_SMS_CODE_ERROR, payload: error });
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

export function loginThroughSmsCode(data) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.LOGIN_THROUGH_SMSCODE_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.LOGIN_THROUGH_SMSCODE_ERROR, payload: error });
      return error;
    }

    try {
      const success = await client.user.smsLogin(data.phone, data.smscode);
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  };
}

export function loginThroughUsernamePassword(data) {
  return async dispatch => {
    function onSuccess(success) {
      dispatch({ type: types.LOGIN_THROUGH_USERNAME_PASS_SUCCESS, payload: success });
      return success;
    }
    function onError(error) {
      dispatch({ type: types.LOGIN_THROUGH_USERNAME_PASS_ERROR, payload: error });
      return error;
    }

    try {
      const success = await client.user.login(data.username, data.password);
      return onSuccess(success);
    } catch (error) {
      return onError(error);
    }
  };
}
