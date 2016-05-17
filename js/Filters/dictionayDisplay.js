(function () {
    angular.module("MyMovieManager")
        .filter('displayDictionary', function () {
            return function (dict) {
                return _(_(dict).values()).reduce(function (item1, item2) { return item1 + ", " + item2 });
            };
        });
})();