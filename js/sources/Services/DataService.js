(function () {
    angular.module("MyMovieManager")
        .service("DataService", function ($http) {
            
            var fs = fs || require('fs');
            this.ReadDataFromFile = function (fileName) {
                return JSON.parse(fs.readFileSync(fileName, 'utf8'));
            };

            this.SaveDataToFile = function (fileName, jsonObject) {
                fs.writeFileSync(fileName, angular.toJson(jsonObject, 3));
            };
        })
})();