'use strict';

describe('Resource Users', function() {
  var $httpBackend;
  var baseUrl;
  var Users;

  beforeEach(module('weflexAdmin'));

  beforeEach(inject(function(_$httpBackend_, _Users_) {
    $httpBackend = _$httpBackend_;
    Users = _Users_;
  }));

  beforeEach(function() {
    baseUrl = weflex.env.API_URL + '/api';
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it ('should login with username and password', function() {
    $httpBackend.whenPOST(baseUrl + '/users/login', {username: 'username', password: 'password'}).respond(200);
    $httpBackend.expectPOST(baseUrl + '/users/login');

    Users.login({username: 'username', password: 'password'});

    $httpBackend.flush();
  });

  it ('should save access token after login', function() {
    var responseData = JSON.stringify({
      "id": "5o4DHDu70w1DnuvrhA9zCT9LDnWmc0h7nPBVmBQ7KP5v2D2yJJSPPkRZBXqzGJCi",
      "ttl": 1209600,
      "created": "2015-07-01T10:17:57.644Z",
      "userId": "5593bc29a056960300261cea"
    });
    $httpBackend.whenPOST(baseUrl + '/users/login', {username: 'username', password: 'password'}).respond(200, responseData);
    $httpBackend.expectPOST(baseUrl + '/users/login');

    expect(Users.accessToken()).not.toBeDefined();

    Users.login({username: 'username', password: 'password'});

    $httpBackend.flush();

    expect(Users.accessToken()).toBe('5o4DHDu70w1DnuvrhA9zCT9LDnWmc0h7nPBVmBQ7KP5v2D2yJJSPPkRZBXqzGJCi');
  });
});