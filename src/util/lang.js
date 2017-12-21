import cookie from 'react-cookie';

function getDefaultLang() {
  let nav = window.navigator;
  const langList = ['en', 'zh'];
  let currentLang = cookie.load('weflex_lang');
  if(langList.indexOf(currentLang) === -1) {
    return 'zh';
  }
  return cookie.load('weflex_lang') || (nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage || '').split('-')[0] || 'zh'
}

export default getDefaultLang;
