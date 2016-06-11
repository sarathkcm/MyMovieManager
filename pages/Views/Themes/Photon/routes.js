(function () {
    angular.module("MyMovieManager")
        .service("Photon.RouteService", ["Reference", function (Reference) {
            this.Configured = false;
            this.Configure = function () {
                if (this.Configured)
                    return;
                var $stateProvider = Reference.get("$stateProvider");
                var $urlProvider = Reference.get("$urlProvider");
                console.log($stateProvider, $urlProvider);
                this.Configured = true;
            };

        }]);
})();