import { combineReducers } from 'redux';
import auth from './authReducer';
import locales from './locales';

const rootReducer = combineReducers({
  auth,
  locales
});

export default rootReducer;
