(function () {
    angular.module("MyMovieManager")
        .service("SettingsService", ["DataService", function (DataService) {
            const SettingsFile = './data/settings.json';
            const WatchedFoldersFile = './data/settings/watchedFolders.json';

            this.Settings = DataService.ReadDataFromFile(SettingsFile);
            this.WatchedFolders = DataService.ReadDataFromFile(WatchedFoldersFile);

            this.SaveSettings = function () {
                DataService.SaveDataToFile(SettingsFile, this.Settings);
            };
            this.SaveWatchedFolders = function () {
                DataService.SaveDataToFile(WatchedFoldersFile, this.WatchedFolders);
            };
        }]);
})();