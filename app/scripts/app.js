'use strict';

/**
 * @ngdoc overview
 * @name weflexAdmin
 * @description
 * # weflexAdmin
 *
 * Main module of the application.
 */
angular
.module('weflexAdmin', [
  'ngCookies',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'angularMoment',
  'pascalprecht.translate'
])
.run(['$location', 'amMoment', '$translate', function($location, amMoment, $translate) {
  if ($location.search().lang) {
    $translate.use($location.search().lang);
  }

  amMoment.changeLocale($translate.use());
}]);
