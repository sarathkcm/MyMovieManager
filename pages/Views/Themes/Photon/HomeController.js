(function () {
    angular.module('MyMovieManager')
        .controller('Photon.HomeController', ['$scope', '$rootScope', 'MediaStore', 'SearchService',
            function name($scope, $rootScope, MediaStore, SearchService) {
                $scope.Genres = [];
                $scope.DisplayedMedia = [];

                $scope.Initialize = function () {
                    $scope.NowShowing = "All";
                    $scope.PopulateGenres();
                    $scope.ApplyFilters();
                    $scope.SelectDefaultMedia();
                };

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
                    $scope.SelectDefaultMedia();
                };

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
                    },
                    Genres: function (media) {
                        switch ($scope.SelectedGenre) {
                            case "All":
                                return true;
                            case "No Category":
                                return !media.metadata.genres || media.metadata.genres.length === 0;
                            default:
                                return _(media.metadata.genres).includes($scope.SelectedGenre);
                        }
                    }
                };

                $scope.ApplyFilters = function () {
                    var allMedia = MediaStore.AllMedia;

                    _($scope.Filters).keys().each(key => {
                        allMedia = _(allMedia).filter(m => $scope.Filters[key](m)).value();
                    });
                    $scope.DisplayedMedia = allMedia;
                    // _(allMedia).each(element => {
                    //     var movie = $scope.DisplayedMedia.find(m => m.$$Folder.Path + m.filename === element.$$Folder.Path + element.filename);
                    //     if (movie) {
                    //         _(movie).extend(element).value();
                    //         element = movie;
                    //     }
                    //     else {
                    //         $scope.DisplayedMedia.push(element);
                    //     }
                    // });
                    // _($scope.DisplayedMedia).each(el => {
                    //     var movie = allMedia.find(m => m.$$Folder.Path + m.filename === el.$$Folder.Path + el.filename);
                    //     if (!movie)
                    //         _($scope.DisplayedMedia).remove(item => item === el).value();
                    // });
                };


                $scope.Search = function (text) {
                    if (!text) {
                        _.unset($scope.Filters, "Search");
                    }
                    else {
                        var movies = SearchService.Search(text, MediaStore.AllMedia, "Title");
                        $scope.Filters.Search = media => {
                            return _(movies).some(m => m.$$Folder.Path + m.filename === media.$$Folder.Path + media.filename);
                        };
                    }
                    $scope.ApplyFilters();
                    $scope.SelectDefaultMedia();
                };

                $rootScope.$on('media-list-changed', function () {
                    $scope.PopulateGenres();
                    $scope.ApplyFilters();
                    $scope.SelectDefaultMedia();
                });

                $scope.SelectDefaultMedia = function () {
                    if (!$scope.DisplayedMedia || !$scope.DisplayedMedia.length)
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
                };

                $scope.PopulateGenres = function () {
                    $scope.Genres = _(MediaStore.AllMedia)
                        .map(media => media.metadata.genres)
                        .flatten()
                        .uniq()
                        .compact()
                        .value();
                    $scope.Genres.unshift("All");
                    $scope.Genres.push("No Category");
                    var selectedGenre = _($scope.Genres).find(g => g === $scope.SelectedGenre);
                    if (selectedGenre)
                        $scope.SelectedGenre = selectedGenre;
                    else
                        $scope.SelectedGenre = $scope.Genres[0];
                };
            }]);

})();