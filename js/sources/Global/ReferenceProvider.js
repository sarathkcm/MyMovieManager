(function () {
    var references = {};
    angular.module('MyMovieManager')
        .provider("References", function () {
            this.$get = function () {
                return {
                    get: function (name) {
                        return references[name];
                    }
                };
            };
            this.addReference = function (name, reference) {
                references[name] = reference;
            };
        });
})();