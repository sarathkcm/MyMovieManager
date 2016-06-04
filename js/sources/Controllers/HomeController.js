(function () {
    angular.module("MyMovieManager")
        .controller("HomeController", ["$scope", "$rootScope", "MediaStore", "$timeout",
            function ($scope, $rootScope, MediaStore, $timeout) {

                $scope.DisplayedMedia = [];
                $scope.Filters = {
                    Watched: function (mediaList) {
                        return _(mediaList).filter( media => {
                            switch ($scope.NowShowing) {
                                case "NotWatched":
                                    return !media.iswatched;
                                case "Watched":
                                    return media.iswatched;
                                default:
                                    return true;
                            }
                        }).value();
                    }
                };

                $scope.Initialize = function () {
                    $scope.DisplayedMedia = MediaStore.AllMedia;
                    $rootScope.$broadcast('displayed-list-changed', $scope.DisplayedMedia);
                };

                $timeout($scope.Initialize, 50);
                
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