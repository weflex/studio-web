module.exports = {
  local: {
    name: 'local',
    NODE_ENV: 'local',
    GIAN_GATEWAY: 'local',
  },
  dev: {
    name: 'dev',
    NODE_ENV: 'dev',
    GIAN_GATEWAY: 'dev',
  },
  staging: {
    name: 'staging',
    NODE_ENV: 'staging',
    GIAN_GATEWAY: 'staging',
  },
  prod: {
    name: 'prod',
    NODE_ENV: 'prod',
    GIAN_GATEWAY: 'prod',
  }
}
