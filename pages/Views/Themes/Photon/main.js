(function () {
    angular.module('MyMovieManager')
        .controller('Photon.MainController', ['Photon.RouteService', '$state',
            function name(RouteService, $state) {
                RouteService.Configure();
                $state.go("Home.View");
            }]);
})();