(function () {
    angular.module('MyMovieManager')
        .controller("RootController", function ($scope) {
            var path = require('path');

            $scope.Data = {
                AllMedia: [],
                DisplayedMedia: []
            };
            $scope.path = {
                sep: path.sep
            }

            var checkWatched = function (mediaList) {
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
            };

            $scope.FilterCriteria = {
                watched: checkWatched
            };

            $scope.ScanProgress = {
                Progress: 0
            }

            $scope.RefreshMediaDisplay = function () {
                var mediaList = $scope.Data.AllMedia;
                for (var key in $scope.FilterCriteria) {
                    var criteria = $scope.FilterCriteria[key];
                    mediaList = criteria(mediaList);
                }
                mediaList.forEach(function(element) {
                    var movie =  $scope.Data.DisplayedMedia.find(m=> m.$$Folder.Path+ m.filename === element.$$Folder.Path+element.filename);
                    if(movie)
                    {
                        _(movie).extend(element);
                        element= movie;
                    }
                    else
                    {
                        $scope.Data.DisplayedMedia.push(element);
                    }
                }, this);
            };
        });
})();