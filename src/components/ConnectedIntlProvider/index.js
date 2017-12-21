import { connect } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import en from 'react-intl/locale-data/en'
import zh from 'react-intl/locale-data/zh'
addLocaleData(en)
addLocaleData(zh)

function mapStateToProps(state) {
  const {
    lang,
    messages
  } = state.locales
  
  return {
    key:lang,
    locale: lang,
    messages
  }
}

export default connect(mapStateToProps)(IntlProvider)
