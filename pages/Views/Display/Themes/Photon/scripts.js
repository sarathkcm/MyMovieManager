(function () {
    angular.module('MyMovieManager')
        .controller('ThumbnailViewController.Photon', ['$scope', '$rootScope', function name($scope, $rootScope) {
            $scope.Genres = [];
            $scope.SelectMedia = function (media) {
                _($scope.DisplayedMedia).each(item => item.$$Selected = false);
                media.$$Selected = true;
                $scope.SelectedMedia = media;
            };

            $scope.ShowPoster = function () {
                $scope.SelectedMedia.$$ShowPoster = !$scope.SelectedMedia.$$ShowPoster;
            };

            $rootScope.$on('displayed-list-changed', function () {


                var genres = _.flatten(_($scope.DisplayedMedia).map(item => {
                    return item.genres;
                }));
                var uniqueGenres = _.unique(genres);
                $scope.Genres = _.compact(uniqueGenres);
                $scope.Genres.unshift("All");
                $scope.Genres.push("No Category");

            });
        }]);
})();