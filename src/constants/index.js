import * as config from './config';

let configuration = {
  // add app wide confg constants
  userTokenKey: 'weflex.user',
  venueIdKey: 'weflex.venueId',
};

configuration = Object.assign(configuration, config);

export { configuration };
export * from './config';
