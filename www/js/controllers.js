angular.module('owm.start.ctrl', [])

.controller('DashCtrl', function($scope, $http, $localstorage, $owm, $ionicPopup, $timeout, $ionicSlideBoxDelegate, $ionicLoading, $state) {
    var loadWeather = function() {
        var weatherLocations = $localstorage.getObject('owm.weather.locations') || {};

        if (Object.keys(weatherLocations).length == 0) {
            $state.go("tab.locations");
        } else {
            $ionicLoading.show({
                template: 'Loading weather...'
            });

            angular.forEach(weatherLocations, function(wloc){
                if (typeof wloc.name != 'undefined') {
                    $owm.getWeatherCondition(wloc.name);
                }
            });

            $scope.Math = window.Math;

            $timeout(function(){
                $ionicSlideBoxDelegate.update();
                $ionicLoading.hide();
            }, 1000);
        };
    };

    $scope.doRefresh = function() {
        loadWeather();
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$apply()
    };

    $scope.getMonthName = function(dt) {
        return $owm.getMonthName(dt);
    };

    $scope.getDayName = function(dt) {
        return $owm.getDayName(dt);
    };

    loadWeather();
})

.controller('SettingsCtrl', function($scope, $localstorage) {
    var unit = $localstorage.get('owm.settings.unit', 'imperial');

    $scope.settings = {
        units: [{
            id:'metric',
            value:'Metric'
        },
        {
            id:'imperial',
            value:'Imperial'
        }],
        unitsDefault: unit,
        changeUnit: function(item) {
            $localstorage.set('owm.settings.unit', item);
        }
    };
})

.controller('LocationsCtrl', function($scope, $localstorage, $ionicPopup) {

    $scope.disableTap = function(){
        container = document.getElementsByClassName('pac-container');
        // disable ionic data tab
        angular.element(container).attr('data-tap-disabled', 'true');
        // leave input field if google-address-entry is selected
        angular.element(container).on("click", function(){
            document.getElementById('autocomplete').blur();
        });
    }

    $scope.model = {place:null};

    $scope.$watch("model.place", function(newValue, oldValue){
        if (typeof newValue == 'object') {
            var place = newValue;

            try {
                var gLocation = place.formatted_address;
            }catch(e) {
                console.log(e);
                return false;
            }

            var gLocationExists = false;
            var weatherLocations = $localstorage.getObject('owm.weather.locations') || {};
            angular.forEach(weatherLocations, function(wloc){
                if (wloc.name == gLocation) {
                    gLocationExists = true;
                }
            });

            if (!gLocationExists) {

                if (Object.keys(weatherLocations).length == 0) {
                    weatherLocations = [{'name':gLocation}];
                } else {
                    weatherLocations.push({'name':gLocation});
                }
                $localstorage.setObject('owm.weather.locations', weatherLocations);
            }

            $scope.weatherLocations = $localstorage.getObject('owm.weather.locations');

            $scope.model = {place:null};
        }
    });

    var weatherLocations = $localstorage.getObject('owm.weather.locations');
    $scope.weatherLocations = weatherLocations;

    $scope.deleteLocation = function(item, index) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Remove location',
            template: 'Are you sure you want to delete '+item.name+' ?'
        });

        confirmPopup.then(function(res) {
            if(res) {
                var weatherLocations = $localstorage.getObject('owm.weather.locations');
                weatherLocations.splice(index, 1);

                $scope.weatherLocations = weatherLocations;

                $localstorage.setObject('owm.weather.locations', weatherLocations);
            } else {
                // Do not remove location
            }
        });
    }

});
