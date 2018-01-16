import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './authReducer';
import locales from './localeReducer';
import venue from './venueReducer';
import user from './userReducer';

const rootReducer = combineReducers({
  routing: routerReducer,
  auth,
  locales,
  venue,
  user
});

export default rootReducer;
