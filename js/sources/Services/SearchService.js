(function () {
    angular.module("MyMovieManager")
        .service("SearchService", [function () {
            const score = require('string-score');
            var Score = function (source, search) {
                return score(source, search, 0.6);
            };

            var Service = this;
            var GetSearchString = {
                Title: {
                    Get: function (media) {
                        return media.metadata.title || "";
                    },
                    Weight: 90
                },
                Director: {
                    Get: function (media) {
                        return _(media.metadata.directors)
                            .valuesIn()
                            .reduce((left, right) => { return left + " ` " + right; }, "") || "";
                    },
                    Weight: 80
                },
                Cast: {
                    Get: function (media) {
                        return _(media.metadata.cast)
                            .valuesIn()
                            .reduce((left, right) => { return left + " ` " + right; }, "") || "";
                    },
                    Weight: 80
                },
                Plot: {
                    Get: function (media) {
                        return media.metadata.synopsis || "";
                    },
                    Weight: 50
                },
                Year: {
                    Get: function (media) {
                        return media.metadata.year || "";
                    },
                    Weight: 50
                },
                Language: {
                    Get: function (media) {
                        return _(media.metadata.language)
                            .valuesIn()
                            .reduce((left, right) => { return left + " ` " + right; }, "") || "";
                    },
                    Weight: 40
                },
                Country: {
                    Get: function (media) {
                        return _(media.metadata.country)
                            .valuesIn()
                            .reduce((left, right) => { return left + " ` " + right; }, "") || "";
                    },
                    Weight: 40
                },
            };

            Service.SearchByType = function (keyword, listOfMedia, type) {
                return _(listOfMedia).map(m => {
                    return {
                        Score: Score(GetSearchString[type].Get(m), keyword),
                        Media: m
                    };
                }).filter(item => item.Score > 0.4)
                    .orderBy(["Score"], ["desc"])
                    .map(item => item.Media).value();
            };


            var calculateMatchScore = function (media, keyword) {
               return _(GetSearchString).keys().reduce((prev, current) => {
                    var criteria = GetSearchString[current];
                    return prev + Score(criteria.Get(media), keyword) * criteria.Weight;
                }, 0);
            };

            Service.SearchAll = function (keyword, listOfMedia) {
                return _(listOfMedia).map(m => {
                    return {
                        Score: calculateMatchScore(m, keyword),
                        Media: m
                    };
                }).filter(item => item.Score > 45)
                    .orderBy(["Score"], ["desc"])
                    .map(item => item.Media).value();
            };

            Service.Search = function (keyword, listOfMedia, type) {
                if (type)
                    return Service.SearchByType(keyword, listOfMedia, type);
                return Service.SearchAll(keyword, listOfMedia);
            };
        }]);
})();