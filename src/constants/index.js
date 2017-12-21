import * as config from './config';

let configuration = {
  // add app wide confg constants

};

configuration = Object.assign(configuration, config);

export default configuration;
export * from './config';
