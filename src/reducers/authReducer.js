import initialState from './initialState';
import * as types from '../actions/actionTypes';
import isEmpty from 'lodash/isEmpty';

export default function authReducer(state = initialState.auth, action) {
  switch (action.type) {
    case types.SET_CURRENT_USER:
      return {
        isAuthenticated: !isEmpty(action.user),
        user: action.user
      };

    default:
      return state;
  }
}
