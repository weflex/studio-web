module.exports = {
  dev: {
    name: 'dev',
    NODE_ENV: 'dev',
    mixpanelToken: '5ff1de113483b576e824f9404d702947',
  },
  staging: {
    name: 'staging',
    NODE_ENV: 'staging',
    mixpanelToken: '',
  },
  prod: {
    name: 'prod',
    NODE_ENV: 'prod',
    mixpanelToken: '32645523306cf30153661bcd228fd894',
  }
}
