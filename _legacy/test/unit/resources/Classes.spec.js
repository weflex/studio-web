'use strict';

describe('Resource Classes', function() {
  var Classes, $httpBackend;
  var baseUrl = weflex.env.API_URL;

  beforeEach(module('weflexAdmin'));

  beforeEach(inject(function(_Classes_, _$httpBackend_){
    Classes = _Classes_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('Add new class', function() {
    beforeEach(function() {
      $httpBackend.whenPOST(baseUrl + '/api/classes').respond(200);
      $httpBackend.expectPOST(baseUrl + '/api/classes');
    });

    it('should add new class to server', function() {
      Classes.save({});

      $httpBackend.flush();
    });
  });

  describe('Update a class', function() {
    beforeEach(function() {
      $httpBackend.whenPUT(baseUrl + '/api/classes/testclass').respond(200);
      $httpBackend.expectPUT(baseUrl + '/api/classes/testclass');
    });

    it('should update a classes', function() {
      Classes.update({classId: 'testclass'});

      $httpBackend.flush();
    });
  });

  describe('Get a class', function() {
    var responseData = '{"id": "testclass"}';

    beforeEach(function() {
      $httpBackend.whenGET(baseUrl + '/api/classes/testclass').respond(200, responseData);
      $httpBackend.expectGET(baseUrl + '/api/classes/testclass');
    });

    it('should get a class by id', function() {
      var clazz = Classes.get({classId: 'testclass'});

      $httpBackend.flush();

      expect(clazz.id).toEqual('testclass');
    })
  })
});