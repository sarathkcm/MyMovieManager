(function () {
    angular.module('MyMovieManager')
        .controller('StartupController',
        function ($scope, $timeout, $state, MediaService, DataService, MediaStore, SettingsService) {
            $scope.Initialize = function () {
                if (SettingsService.Settings.IsFirstStart) {
                    $state.go('Configuration.InitialSetup');
                    return;
                }
                $timeout($scope.TriggerScanning, 2000);
                $state.go('Home');
            };

            $scope.TriggerScanning = function () {
                MediaService.ScanMediaFiles()
                    .then(() => {
                        MediaStore.Reload();
                        var notUpdatedMediaList = _(MediaStore.AllMedia).filter(media => !media.isupdatedonce).value();
                        return MediaService.UpdateMediaMetaData(notUpdatedMediaList);
                    }).then(mediaList => {
                        MediaStore.UpdateMediaList(mediaList);
                        MediaStore.Save();
                        MediaStore.Reload();
                    });
            };

        });
})();