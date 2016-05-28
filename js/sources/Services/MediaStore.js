(function () {
    angular.module("MyMovieManager")
        .service("MediaStore", ["MediaService", "$rootScope", function (MediaService, $rootScope) {
            this.AllMedia = [];
            this.Initialize();

            this.Initialize = function () {
                this.AllMedia = MediaService.GetMediaList();
                $rootScope.$broadcast('media-list-changed', this.AllMedia);
            };

            this.Reload = function () {
                this.AllMedia = MediaService.GetMediaList();
                $rootScope.$broadcast('media-list-changed', this.AllMedia);
            };

            this.Save = function () {
                var groups = _(this.AllMedia).groupBy(media => media.$$Folder.Path);
                _(_(groups).keys()).each(key => {
                    MediaService.SaveMediaListToFile(key, groups[key])
                });
            };

            this.UpdateMediaList = function (mediaList) {
                _(mediaList).each(element => {
                    var movie = this.AllMedia.find(m => m.$$Folder.Path + m.filename === element.$$Folder.Path + element.filename);
                    if (movie) {
                        if (!movie.metadata)
                            movie.metadata = {};
                        _(movie.metadata).extend(element.metadata);
                    }
                    else {
                        this.AllMedia.push(element);
                    }
                });
            };
        }]);
})();