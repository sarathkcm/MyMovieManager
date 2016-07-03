(function () {
    angular.module("MyMovieManager")
        .service("MediaStore", ["MediaService", "$rootScope", function (MediaService, $rootScope) {
            var Service = this;
            Service.AllMedia = [];

            Service.Initialize = function () {
                try {
                    Service.AllMedia = MediaService.GetMediaList();
                    $rootScope.$broadcast('media-list-changed', Service.AllMedia);
                }
                catch (ex) {
                    Service.AllMedia = [];
                    $rootScope.$broadcast('media-list-changed', Service.AllMedia);
                }
            };

            Service.Reload = function () {
                try {
                    Service.AllMedia = MediaService.GetMediaList();
                    $rootScope.$broadcast('media-list-changed', Service.AllMedia);
                }
                catch (ex) {
                    Service.AllMedia = [];
                    $rootScope.$broadcast('media-list-changed', Service.AllMedia);
                }
            };

            Service.Save = function () {
                var groups = _(Service.AllMedia).groupBy(media => media.$$Folder.Path).value();
                _(groups).keys().each(key => {
                    MediaService.SaveMediaListToFile(key, groups[key]);
                });
            };

            Service.UpdateMediaList = function (mediaList) {
                _(mediaList).each(element => {
                    var movie = Service.AllMedia.find(m => m.$$Folder.Path + m.filename === element.$$Folder.Path + element.filename);
                    if (movie) {
                        if (!movie.metadata)
                            movie.metadata = {};
                        _(movie.metadata).extend(element.metadata).value();
                        movie.isupdatedonce = element.isupdatedonce;
                        movie.poster = element.poster;
                        movie.postersmall = element.postersmall;
                    }
                    else {
                        Service.AllMedia.push(element);
                    }
                });
            };

            Service.Initialize();
        }]);
})();