(function () {
    angular.module("MyMovieManager")
        .filter('displayDictionary', function () {
            return function (dict) {
                return _(dict).values().reduce((item1, item2) => item1 + ", " + item2);
            };
        });
})();