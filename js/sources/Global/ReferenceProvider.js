(function () {
    var references = {};
    angular.module('MyMovieManager')
        .provider("Reference", function () {
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