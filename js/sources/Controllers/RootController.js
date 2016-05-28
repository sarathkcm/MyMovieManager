(function () {
    angular.module('MyMovieManager')
        .controller("RootController", function ($scope) {
            var path = require('path');
            $scope.path = {
                sep: path.sep
            }
        });
})();