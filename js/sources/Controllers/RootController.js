(function () {
    angular.module('MyMovieManager')
        .controller("RootController", function ($scope) {
            var path = require('path');
            $scope.path = {
                sep: path.sep
            }
            $scope.$SafeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

        });
})();