(function () {
    angular.module('MyMovieManager')
        .controller('InitialSetupController', function ($scope, $state, DataService) {
            $scope.WizardStep = 0;
            $scope.newFolder = {
                Recursive: true
            };
            $scope.Folders = [];
            $scope.Initialize = function () {
                $scope.Folders = DataService.ReadDataFromFile(watchedFoldersFile);
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
                var folderList = DataService.ReadDataFromFile(watchedFoldersFile);
                folderList = $scope.Folders;
                DataService.SaveDataToFile(watchedFoldersFile, folderList);
            }

            $scope.Finalize = function () {
                var settings = DataService.ReadDataFromFile(settingsFile);
                settings.IsFirstStart = undefined;
                DataService.SaveDataToFile(settingsFile, settings);
                $state.go('/');
            };
        });

})();