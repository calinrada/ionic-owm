angular.module('ionic.utils', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    has: function(key) {
        if (typeof $window.localStorage[key] !== 'undefined') {
            return true;
        }

        return false;
    },
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);

angular.module('owm', [])
.service('$owm', ['$http', '$localstorage', '$rootScope', function($http, $localstorage, $rootScope) {

    this.$scope = $rootScope;

    var _this = this;

    this.getConfig = function(key) {
        var config = {
            api_key:'1bf58975a34f1a1beb6d3df67217ddf0'
        };

        return config[key];
    };

    this.getIcon = function(resp) {
        return $http.get('js/icons.json').success(function(data, status, headers, config) {

        }).error(function(data, status, headers, config) {

        });
    };

    this.getWeatherCondition = function(location_name) {

        if (typeof location_name == 'undefined') {
            location_name = 'Arad,Romania';
        }

        var api_key = this.getConfig('api_key');
        var unit = $localstorage.get('owm.settings.unit', 'imperial');

        _this.$scope.settings = {
            deg_letter: unit == 'imperial' ? 'F' : 'C',
            speed: unit == 'imperial' ? 'mph' : 'km/h',
        }

        _this.$scope.weatherItems = [];

        $http.get('http://api.openweathermap.org/data/2.5/weather?q='+location_name+'&appid='+api_key+'&units='+unit).success(
            function(data, status, headers, config) {

                 _this.getIcon(data).then(function(d){
                    var prefix = 'wi wi-';
                    var code = data.weather[0].id;
                    var icon = d.data[code].icon;

                    if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
                        icon = 'day-' + icon;
                    }

                    icon = prefix + icon;

                    data.weatherIcon = icon;
                    data.realName = location_name;
                    _this.$scope.weatherItems.push(data);
                });
        }).error(function(data, status, headers, config) {

        }).finally(function() {
            //$scope.hide();
        });
    };

    this.getMonthName = function(dt) {
        var objDate = new Date(dt),
        locale = "en-us",
        month = objDate.toLocaleString(locale, { month: "short" });

        return month
    };

    this.getDayName = function(dt) {
        var objDate = new Date(dt),
        locale = "en-us",
        month = objDate.toLocaleString(locale, { weekday: "long" });

        return month
    };
}]);
