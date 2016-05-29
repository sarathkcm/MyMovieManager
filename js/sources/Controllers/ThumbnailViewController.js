(function () {
    angular.module("MyMovieManager")
        .controller("ThumbnailViewController", ["$scope", "$rootScope", "MediaStore",
            function ($scope, $rootScope, MediaStore) {

                $scope.DisplayedMedia = [];
                $scope.Filters = {
                    Watched: function (mediaList) {
                        return _(mediaList).filter(function (media) {
                            switch ($scope.DisplayWatched) {
                                case 0:
                                    return !media.iswatched;
                                case 1:
                                    return media.iswatched;
                                default:
                                    return true;
                            }
                        });
                    }
                };

                $scope.Initialize = function () {
                    $scope.DisplayedMedia = MediaStore.AllMedia;
                };

                $scope.ApplyFilters = function () {
                    var allMedia = MediaStore.AllMedia;
                    for (var key in $scope.Filters) {
                        allMedia = $scope.Filters[key](allMedia);
                    }
                    _(allMedia).each(element => {
                        var movie = $scope.DisplayedMedia.find(m => m.$$Folder.Path + m.filename === element.$$Folder.Path + element.filename);
                        if (movie) {
                            _(movie).extend(element);
                            element = movie;
                        }
                        else {
                            $scope.DisplayedMedia.push(element);
                        }
                    });
                    $rootScope.$broadcast('displayed-list-changed', $scope.DisplayedMedia);
                };


                $rootScope.$on('media-list-changed', function () {
                    $scope.ApplyFilters();
                    if (!$scope.DisplayedMedia && !$scope.DisplayedMedia.length)
                        return;
                    if (!$scope.SelectedMedia) {
                        $scope.SelectedMedia = $scope.DisplayedMedia[0];
                        $scope.SelectedMedia.$$Selected = true;
                        return;
                    }
                    var selectedMedia = $scope.DisplayedMedia.find(m => m.$$Folder.Path + m.filename === $scope.SelectedMedia.$$Folder.Path + $scope.SelectedMedia.filename)
                    if (!selectedMedia)
                        $scope.SelectedMedia = $scope.DisplayedMedia[0];
                    else
                        $scope.SelectedMedia = selectedMedia;

                    $scope.SelectedMedia.$$Selected = true;
                });
            }]);

})();