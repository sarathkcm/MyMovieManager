(function () {
    angular.module("MyMovieManager")
        .service("SettingsService", ["DataService", function (DataService) {
            var Service = this;

            const SettingsFile = './data/settings.json';
            const WatchedFoldersFile = './data/settings/watchedFolders.json';

            Service.Settings = DataService.ReadDataFromFile(SettingsFile);
            Service.WatchedFolders = DataService.ReadDataFromFile(WatchedFoldersFile);

            Service.SaveSettings = function () {
                DataService.SaveDataToFile(SettingsFile, Service.Settings);
            };
            Service.SaveWatchedFolders = function () {
                DataService.SaveDataToFile(WatchedFoldersFile, Service.WatchedFolders);
            };
            Service.LoadSettings = function () {
               Service.Settings = DataService.ReadDataFromFile(SettingsFile);
            };
            Service.LoadWatchedFolders = function () {
                Service.WatchedFolders = DataService.ReadDataFromFile(WatchedFoldersFile);
            };
        }]);
})();