(function () {
    angular.module('MyMovieManager')
        .controller('InitialSetupController', ['$scope', '$state', 'SettingsService', 'MediaService',
            function ($scope, $state, SettingsService, MediaService) {
                $scope.WizardStep = 0;
                $scope.newFolder = {
                    Recursive: true
                };

                $scope.Scan = {
                    Finished: false,
                    Started: false
                };

                $scope.Folders = [];
                $scope.Initialize = function () {
                    $scope.Folders = SettingsService.WatchedFolders;
                };

                $scope.SetPage = function (page) {
                    $scope.WizardStep = page;
                };
                $scope.ChooseFolder = function (folder) {
                    var dialog = require('electron').remote.dialog;
                    var paths = dialog.showOpenDialog({
                        properties: ['openDirectory']
                    });
                    if (paths && paths[0])
                        folder.Path = paths[0];
                }
                $scope.AddFolder = function (folder) {
                    if (!folder.Path)
                        return;
                    $scope.Folders.push(folder);
                    $scope.newFolder = {
                        Recursive: true
                    };
                }
                $scope.RemoveFolder = function (folder) {
                    $scope.Folders.splice($scope.Folders.indexOf(folder), 1);
                }
                $scope.SaveFolderListToFile = function () {
                    SettingsService.WatchedFolders = $scope.Folders;
                    SettingsService.SaveWatchedFolders();
                }

                $scope.Finalize = function () {
                    SettingsService.Settings.IsFirstStart = undefined;
                    SettingsService.SaveSettings();
                    $state.go('/');
                };

                $scope.BeginScan = function () {
                    $scope.Scan.Started = true;
                    MediaService.ScanMediaFiles().then(() => {
                        $scope.Scan.Finished = true;
                        $scope.$SafeApply();
                    });
                };
            }]);

})();