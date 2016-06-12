(function () {
    var Configured = false;
    angular.module("MyMovieManager")
        .service("Photon.RouteService", ["References", function (References) {
            this.Configure = function () {
                if (Configured)
                    return;
                var $stateProvider = References.get("$stateProvider");
                var $urlProvider = References.get("$urlProvider");

                $stateProvider
                    .state('Home.View', {
                        url: '/Home/View',
                        views: {
                            grid: {
                                templateUrl: './pages/Views/Themes/Photon/Home/grid.html'
                            },
                            details: {
                                templateUrl: './pages/Views/Themes/Photon/Home/detailsPanel.html'
                            },
                            toolbar: {
                                templateUrl: './pages/Views/Themes/Photon/Home/toolbar.html'
                            }
                        }
                    });

                console.log($stateProvider, $urlProvider);
                Configured = true;
            };

        }]);
})();