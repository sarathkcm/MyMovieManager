(function () {
    angular.module("MyMovieManager")
        .controller("ThumbnailViewController", function ($scope, $rootScope) {
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
            $rootScope.$on('refresh-display', function () {
                if (!$scope.Data.DisplayedMedia && !$scope.Data.DisplayedMedia.length)
                    return;
                if (!$scope.SelectedMedia) {
                    $scope.SelectedMedia = $scope.Data.DisplayedMedia[0];
                    $scope.SelectedMedia.$$Selected = true;
                    return;
                }
                var selectedMedia = $scope.Data.DisplayedMedia.find(m => m.$$Folder.Path + m.filename === $scope.SelectedMedia.$$Folder.Path + $scope.SelectedMedia.filename)
                if (!selectedMedia)
                    $scope.SelectedMedia = $scope.Data.DisplayedMedia[0];
                else
                    $scope.SelectedMedia = selectedMedia;

                $scope.SelectedMedia.$$Selected = true;

            });
        });

})();