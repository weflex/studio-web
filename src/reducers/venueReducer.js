import initialState from './initialState';
import * as types from '../actions/actionTypes';
import isEmpty from 'lodash/isEmpty';

export default function venueReducer(state = initialState.venue, action) {
  switch (action.type) {
    case types.SET_VENUE_ID:
      return action.payload.collaborators[0].venue;

    default:
      return state;
  }
}
