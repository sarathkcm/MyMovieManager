(function () {
    angular.module("MyMovieManager")
        .controller("ThumbnailViewController", function ($scope) {
            $scope.SelectMedia = function (media) {
                _($scope.Data.DisplayedMedia).each(item => item.$$Selected = false);
                media.$$Selected = true;
                $scope.SelectedMedia = media;
            }
            $scope.ShowPoster = function () {
                $scope.SelectedMedia.$$ShowPoster = !$scope.SelectedMedia.$$ShowPoster;
            };

            $scope.searchCast = function (query) {
                alert(query);
            };
        });

})();