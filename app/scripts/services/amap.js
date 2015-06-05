'use strict';

angular.module('wechatApp')
.factory('amap', ['$translate', function($translate) {

  function _AMap(id) {
    this._aMap = new AMap.Map(id || 'studio-geocoder',{
      resizeEnable: true,
      view: new AMap.View2D({
        center: new AMap.LngLat(121.473942, 31.222197),
        zoom: 13
      }),
      lang: $translate.use() || 'zh' //TODO: Consider replace $translate to remove dependency on third party lib.
    });
  }

  _AMap.prototype.setFitView = function() {
      this._aMap.setFitView();
  };

  _AMap.prototype.panTo = function(loc) {
    this._aMap.panTo(loc);
  };

  _AMap.prototype.getCenter = function(){
    return this._aMap.getCenter();
  };

  _AMap.prototype.destroy = function() {
    this._aMap.destroy();
  };

  _AMap.prototype.addMarker = function(lng, lat) {
      var icon = new AMap.Icon({
        image: 'images/map-pin-red.png',
        imageSize: new AMap.Size(24, 36)
      });
      return new AMap.Marker({
        map: this._aMap,
        position: new AMap.LngLat(lng, lat),
        icon: icon
      });
  };

  _AMap.prototype.searchAddress = function(address, clickHandler) {

    var self = this;

    this._aMap.clearMap();

    AMap.service(['AMap.Geocoder'], function() {
      var MGeocoder = new AMap.Geocoder();

      MGeocoder.getLocation(address, function(status, result) {

        if (status === 'complete' && result.info === 'OK') {

          angular.forEach(result.geocodes, function(geocode) {
            var lng = geocode.location.lng,
                lat = geocode.location.lat,
                marker = self.addMarker(lng, lat);

            AMap.event.addListener(marker, 'click', function(){
              clickHandler(lng, lat);
            });
          });

          self._aMap.setFitView();
        };
      });
    });

  };

  _AMap.prototype.setZoom = function(level) {
    this._aMap.setZoom(level);
  }

  return {
    initMap: function(id) {
      return new _AMap(id);
    }
  }
}]);
