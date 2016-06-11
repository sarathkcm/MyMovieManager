(function () {
    angular.module('MyMovieManager')
        .controller('Photon.HomeController', ['$scope', '$rootScope', 'MediaStore', '$timeout', 'SearchService', 'Photon.RouteService',
        function name($scope, $rootScope, MediaStore, $timeout, SearchService, RouteService) {
            RouteService.Configure();
            $scope.Genres = [];
            $scope.SelectMedia = function ($event, media) {
                if (media) {
                    _($scope.DisplayedMedia).each(item => { item.$$Selected = false; });
                    media.$$Selected = true;
                    $scope.SelectedMedia = media;
                }
            };

            $scope.ShowPoster = function () {
                $scope.SelectedMedia.$$ShowPoster = !$scope.SelectedMedia.$$ShowPoster;
            };

            $scope.DisplayWatched = function (state) {
                $scope.NowShowing = state;
                $scope.ApplyFilters();
            };
            
            $scope.DisplayedMedia = [];
                $scope.Filters = {
                    Watched: function (media) {
                        switch ($scope.NowShowing) {
                            case "NotWatched":
                                return !media.iswatched;
                            case "Watched":
                                return media.iswatched;
                            default:
                                return true;
                        }
                    }
                };

                $scope.Initialize = function () {
                    $scope.DisplayedMedia = MediaStore.AllMedia;
                    $rootScope.$broadcast('displayed-list-changed', $scope.DisplayedMedia);
                };

                $timeout($scope.Initialize, 50);

                $scope.ApplyFilters = function () {
                    var allMedia = MediaStore.AllMedia;
                    for (var key in $scope.Filters) {
                        allMedia = _(allMedia).filter(m => $scope.Filters[key](m));
                    }
                    _(allMedia).each(element => {
                        var movie = $scope.DisplayedMedia.find(m => m.$$Folder.Path + m.filename === element.$$Folder.Path + element.filename);
                        if (movie) {
                            _(movie).extend(element);
                            element = movie;
                        }
                        else {
                            $scope.DisplayedMedia.push(element);
                        }
                    });
                    _($scope.DisplayedMedia).each(el => {
                        var movie = allMedia.find(m => m.$$Folder.Path + m.filename === el.$$Folder.Path + el.filename);
                        if (!movie)
                            _($scope.DisplayedMedia).remove(item => item === el);
                    });
                    $rootScope.$broadcast('displayed-list-changed', $scope.DisplayedMedia);
                };


                $scope.Search = function (text) {
                    var movies = SearchService.Search(text, MediaStore.AllMedia, "Title");
                    $scope.Filters.Search = media => {
                        return _(movies).some(m => m.$$Folder.Path + m.filename === media.$$Folder.Path + media.filename);
                    };
                    $scope.ApplyFilters();
                    _($scope.Filters).unset("Search");
                };

                $rootScope.$on('media-list-changed', function () {
                    $scope.ApplyFilters();
                    if (!$scope.DisplayedMedia && !$scope.DisplayedMedia.length)
                        return;
                    if (!$scope.SelectedMedia) {
                        $scope.SelectedMedia = $scope.DisplayedMedia[0];
                        $scope.SelectedMedia.$$Selected = true;
                        return;
                    }
                    var selectedMedia = $scope.DisplayedMedia.find(m => m.$$Folder.Path + m.filename === $scope.SelectedMedia.$$Folder.Path + $scope.SelectedMedia.filename)
                    if (!selectedMedia)
                        $scope.SelectedMedia = $scope.DisplayedMedia[0];
                    else
                        $scope.SelectedMedia = selectedMedia;

                    $scope.SelectedMedia.$$Selected = true;
                });

            $rootScope.$on('displayed-list-changed', function () {
                $scope.Genres = _($scope.DisplayedMedia).map(media => media.metadata.genres).flatten().uniq().compact().value();
                $scope.Genres.unshift("All");
                $scope.Genres.push("No Category");
                var selectedGenre = _($scope.Genres).find(g => g === $scope.SelectedGenre);
                if (selectedGenre)
                    $scope.SelectedGenre = selectedGenre;
                else
                    $scope.SelectedGenre = $scope.Genres[0];

            });
        }]);

})();