module.exports = {
  local: {
    name: 'local',
    NODE_ENV: 'local',
    GIAN_GATEWAY: 'local',
    mixpanelToken: '',
  },
  dev: {
    name: 'dev',
    NODE_ENV: 'dev',
    GIAN_GATEWAY: 'dev',
    mixpanelToken: '5ff1de113483b576e824f9404d702947',
  },
  staging: {
    name: 'staging',
    NODE_ENV: 'staging',
    GIAN_GATEWAY: 'staging',
    mixpanelToken: '',
  },
  prod: {
    name: 'prod',
    NODE_ENV: 'prod',
    GIAN_GATEWAY: 'prod',
    mixpanelToken: '32645523306cf30153661bcd228fd894',
  }
}
