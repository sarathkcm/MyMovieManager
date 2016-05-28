(function () {
    angular.module("MyMovieManager")
        .service("DataService", function () {
            var Service = this;

            var fs = fs || require('fs');
            Service.ReadDataFromFile = function (fileName) {
                return JSON.parse(fs.readFileSync(fileName, 'utf8'));
            };

            Service.SaveDataToFile = function (fileName, jsonObject) {
                fs.writeFileSync(fileName, angular.toJson(jsonObject, 3));
            };
        })
})();