(function () {
    angular.module('MyMovieManager')
        .controller('HomeController.Photon', ['$scope', '$rootScope', function name($scope, $rootScope) {
            $scope.Genres = [];
            $scope.SelectMedia = function (media) {
                _($scope.DisplayedMedia).each(item => item.$$Selected = false);
                media.$$Selected = true;
                $scope.SelectedMedia = media;
            };

            $scope.ShowPoster = function () {
                $scope.SelectedMedia.$$ShowPoster = !$scope.SelectedMedia.$$ShowPoster;
            };

            $scope.DisplayWatched = function (state) {
                $scope.NowShowing = state;
                $scope.ApplyFilters();
            };

            $rootScope.$on('displayed-list-changed', function () {
                $scope.Genres =  _($scope.DisplayedMedia).map(media => media.metadata.genres).flatten().uniq().compact().value();
                $scope.Genres.unshift("All");
                $scope.Genres.push("No Category");
                var selectedGenre = _($scope.Genres).find(g => g === $scope.SelectedGenre).value();
                if (selectedGenre)
                    $scope.SelectedGenre = selectedGenre;
                else
                    $scope.SelectedGenre = $scope.Genres[0];

            });
        }]);
})();