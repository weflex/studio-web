'use strict';

describe('Factory ArrayUtil', function () {

  beforeEach(module('wfUtil'));

  var arrayUtil;

  beforeEach(inject(function () {
    var $injector = angular.injector(['wfUtil']);
    arrayUtil = $injector.get('wfArrayUtil');
  }));


  it('should reject the case if parameter array is not specified',
      function () {
        expect(arrayUtil.groupBy()).toBe(undefined);
        return;
      });


  it('should not have any side effects of the array to be grouped.',
     function() {
        var fibs1 = [],
            fibs2 = [1, 2, 3],
            fibs3 = [{}, {}, {}],
            fibs4 = [{key: 'key1', value: 'valu1'}, {key: 'key2', value: 'value2'}];

        arrayUtil.groupBy(fibs1);
        expect(fibs1).toBe(fibs1);

        arrayUtil.groupBy(fibs2);
        expect(fibs2).toBe(fibs2);

        arrayUtil.groupBy(fibs3);
        expect(fibs3).toBe(fibs3);

        arrayUtil.groupBy(fibs4);
        expect(fibs4).toBe(fibs4);
     });


  it('should group a number array',
     function() {
      var fibs = [1, 1, 2, 3, 4, 5],
          result;

      result = arrayUtil.groupBy(fibs);
      expect(result.length).toBe(5);
      expect(result).toContain([1, 1]);
      expect(result).toContain([2]);
      expect(result).toContain([3]);
      expect(result).toContain([4]);
      expect(result).toContain([5]);
     });


  it('should group array elements using specified comparator',
     function () {
       var fibs = [{v:1,s:1},
                   {v:1,s:2},
                   {v:2,s:3},
                   {v:3,s:5},
                   {v:5,s:8}];
       var comp = function (f1, f2) {
         return f1.s === f2.s;
       };
       var compSpy = jasmine.createSpy('compSpy');
       var result;

       arrayUtil.groupBy(fibs, compSpy);
       expect(compSpy).toHaveBeenCalled();

       result = arrayUtil.groupBy(fibs, comp);
       expect(result.length).toBe(5);
       expect(result).toContain([{v:1, s:1}]);
       expect(result).toContain([{v:1, s:2}]);
       expect(result).toContain([{v:2, s:3}]);
       expect(result).toContain([{v:3, s:5}]);
       expect(result).toContain([{v:5, s:8}]);
     });
});
