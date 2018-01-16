import { handleActions } from 'redux-actions';
import cookie from 'react-cookie';
import getDefaultLang from '../util/lang';
import * as configuration from '../constants';
import enLocales from '../resources/locales/en.js';
import zhLocales from '../resources/locales/zh.js';

const locales = {
  en: enLocales,
  zh: zhLocales
}

let lang = getDefaultLang()

const initialState = {
  lang,
  messages: locales[lang]
}

export default handleActions({
  'change lang' (state, action) {
    cookie.save('weflex_lang', action.payload, {
      domain: configuration.BASE_DOMAIN,
      path: '/',
      expires: new Date(Date.now() + 8760*3600*1000),
    })
    document.title = locales[action.payload]['studio_web_project_title']
    return {
      lang: action.payload,
      messages: locales[action.payload]
    }
  }
}, initialState);
