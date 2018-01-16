import initialState from './initialState';
import * as types from '../actions/actionTypes';
import isEmpty from 'lodash/isEmpty';

export default function userReducer(state = initialState.user, action) {
  switch (action.type) {
    case types.SET_CURRENT_USER_DETAIL:
        return action.payload;

    case types.STORE_GET_CURRENT_USER:
      return {
        user: state.user
      };

    default:
      return state;
  }
}
