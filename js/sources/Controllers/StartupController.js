(function () {
    angular.module('MyMovieManager')
        .controller('StartupController', function ($scope, $timeout,$location, MediaService) {
            $scope.IsFirstStart = false;
            $scope.Initialize = function () {
                var settings = GetJSONFromFile(settingsFile);
                $scope.IsFirstStart = settings.IsFirstStart;
                if ($scope.IsFirstStart) {
                    $location.path('/Configure/InitialSetup');
                    return;
                }
                $scope.Data.AllMedia = MediaService.GetMediaList();
                $scope.RefreshMediaDisplay();
                $timeout(triggerScanningOnStartup, 2000)
                return;
            };

            $scope.LoadMediaListFromDisk = function () {
                $scope.Data.AllMedia = MediaService.GetMediaList();
                $scope.RefreshMediaDisplay();
            };

            var triggerScanningOnStartup = function () {
                MediaService.ScanMediaFiles(function () {
                    var allMedia = MediaService.GetMediaList();
                    var notUpdatedMediaList = _(allMedia).filter(media => !media.isupdatedonce);
                    $scope.LoadMediaListFromDisk();

                    var save = function (listOfUpdatedMovies) {
                        listOfUpdatedMovies.forEach(function (element) {
                            var movie = allMedia.find(m => m.$$Folder.Path + m.filename === element.$$Folder.Path + element.filename);
                            if (movie) {
                                if(!movie.metadata)
                                    movie.metadata ={};
                                _(movie.metadata).extend(element.metadata);
                                element = movie;
                            }
                            else {
                                allMedia.push(element);
                            }
                        }, this);

                        var groups = _(allMedia).groupBy(media => media.$$Folder.Path);
                        _(_(groups).keys()).each(function (key) {
                            MediaService.SaveMediaListToFile(key, groups[key])
                        });
                        $scope.LoadMediaListFromDisk();
                    };
                    MediaService.UpdateMediaMetaData(notUpdatedMediaList, save);
                });

            };

        });

})();