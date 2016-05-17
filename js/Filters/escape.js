(function () {
    angular.module("MyMovieManager")
        .filter('escape', function () {
            return window.encodeURIComponent;
        });
})();