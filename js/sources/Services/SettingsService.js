(function () {
    angular.module("MyMovieManager")
        .service("SettingsService", ["DataService", function (DataService) {
            this.Settings  = DataService.ReadDataFromFile(settingsFile)
        }]);
})();