'use strict';

(function () {
    angular.module('MyMovieManager').controller("RootController", function ($scope) {
        var path = require('path');

        $scope.Data = {
            AllMedia: [],
            DisplayedMedia: []
        };
        $scope.path = {
            sep: path.sep
        };

        var checkWatched = function checkWatched(mediaList) {
            return _(mediaList).filter(function (media) {
                switch ($scope.DisplayWatched) {
                    case 0:
                        return !media.iswatched;
                    case 1:
                        return media.iswatched;
                    default:
                        return true;
                }
            });
        };

        $scope.FilterCriteria = {
            watched: checkWatched
        };

        $scope.ScanProgress = {
            Progress: 0
        };

        $scope.RefreshMediaDisplay = function () {
            var mediaList = $scope.Data.AllMedia;
            for (var key in $scope.FilterCriteria) {
                var criteria = $scope.FilterCriteria[key];
                mediaList = criteria(mediaList);
            }
            $scope.Data.DisplayedMedia = null;
            $scope.Data.DisplayedMedia = mediaList;
        };
    });
})();
'use strict';

(function () {
    angular.module('MyMovieManager').controller('StartupController', function ($scope, $timeout, MediaService) {
        $scope.IsFirstStart = false;
        $scope.WizardStep = 0;
        $scope.newFolder = {
            Recursive: true
        };
        $scope.Folders = [];
        $scope.Initialize = function () {
            var settings = GetJSONFromFile(settingsFile);
            $scope.IsFirstStart = settings.IsFirstStart;
            if ($scope.IsFirstStart) {
                $scope.Folders = GetJSONFromFile(watchedFoldersFile);
                return;
            }
            $scope.Data.AllMedia = MediaService.GetMediaList();
            $scope.RefreshMediaDisplay();

            $timeout(triggerScanningOnStartup, 3000);
            return;
        };

        $scope.LoadMediaListFromDisk = function () {
            $scope.Data.AllMedia = MediaService.GetMediaList();
            $scope.RefreshMediaDisplay();
        };

        var triggerScanningOnStartup = function triggerScanningOnStartup() {
            MediaService.ScanMediaFiles(function (params) {
                var allMedia = MediaService.GetMediaList();
                var notUpdatedMediaList = _(allMedia).filter(function (media) {
                    return !media.isupdatedonce;
                });
                $scope.LoadMediaListFromDisk();

                var save = function save() {
                    var groups = _(allMedia).groupBy(function (media) {
                        return media.$$Folder.Path;
                    });
                    _(_(groups).keys()).each(function (key) {
                        MediaService.SaveMediaListToFile(key, groups[key]);
                    });
                    $scope.LoadMediaListFromDisk();
                };
                MediaService.UpdateMediaMetaData(notUpdatedMediaList, $scope.ScanProgress, save);
            });
        };

        $scope.SetPage = function (page) {
            $scope.WizardStep = page;
        };
        $scope.ChooseFolder = function (folder) {
            var remote = require('remote');
            var dialog = remote.require('dialog');
            var paths = dialog.showOpenDialog({
                properties: ['openDirectory']
            });
            if (paths && paths[0]) folder.Path = paths[0];
        };
        $scope.AddFolder = function (folder) {
            if (!folder.Path) return;
            $scope.Folders.push(folder);
            $scope.newFolder = {
                Recursive: true
            };
        };
        $scope.RemoveFolder = function (folder) {
            $scope.Folders.splice($scope.Folders.indexOf(folder), 1);
        };
        $scope.SaveFolderListToFile = function () {
            var folderList = GetJSONFromFile(watchedFoldersFile);
            folderList = $scope.Folders;
            SaveJSONToFile(watchedFoldersFile, folderList);
        };

        $scope.Finalize = function () {
            var settings = GetJSONFromFile(settingsFile);
            settings.IsFirstStart = undefined;
            SaveJSONToFile(settingsFile, settings);
            $scope.Data.AllMedia = MediaService.GetMediaList();
            $scope.RefreshMediaDisplay();
            $scope.IsFirstStart = false;
        };
    });
})();
"use strict";

(function () {
    angular.module("MyMovieManager").controller("ThumbnailViewController", function ($scope) {
        $scope.SelectMedia = function (media) {
            _($scope.Data.DisplayedMedia).each(function (item) {
                return item.$$Selected = false;
            });
            media.$$Selected = true;
            $scope.SelectedMedia = media;
        };
        $scope.ShowPoster = function () {
            $scope.SelectedMedia.$$ShowPoster = !$scope.SelectedMedia.$$ShowPoster;
        };

        $scope.searchCast = function (query) {
            alert(query);
        };
    });
})();
"use strict";

(function (params) {
    angular.module("MyMovieManager").directive("tagDisplay", function () {
        return {
            require: ['ngModel'],
            restrict: 'E',
            template: '<span ng-repeat="item in model"><span ng-click="onClick()(item)">{{item}}</span><span ng-if="!$last">, </span></span>',
            scope: {
                onClick: '&',
                model: "=ngModel"
            }
        };
    });
})();
"use strict";

(function () {
    angular.module("MyMovieManager").filter('displayDictionary', function () {
        return function (dict) {
            return _(_(dict).values()).reduce(function (item1, item2) {
                return item1 + ", " + item2;
            });
        };
    });
})();
"use strict";

(function () {
    angular.module("MyMovieManager").filter('escape', function () {
        return window.encodeURIComponent;
    });
})();
'use strict';

var GetJSONFromFile = function GetJSONFromFile(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
};

var SaveJSONToFile = function SaveJSONToFile(fileName, jsonObject) {
    fs.writeFileSync(fileName, angular.toJson(jsonObject, 3));
};
"use strict";

var angular = require('angular');
var _ = require('underscore');
var fs = require('fs');
require("babel-polyfill");
var request = require('request');
'use strict';

(function () {
    angular.module('MyMovieManager', []);
})();
'use strict';

var settingsFile = './data/settings.json';
var watchedFoldersFile = './data/settings/watchedFolders.json';
"use strict";

(function () {
    angular.module("MyMovieManager").service("MediaService", function ($http) {
        var path = require('path');
        var recursiveScan = function recursiveScan(dir, filelist) {
            var fs = fs || require('fs'),
                path = require('path'),
                files = fs.readdirSync(dir);
            filelist = filelist || [];
            files.forEach(function (file) {
                if (fs.statSync(dir + path.sep + file).isDirectory()) {
                    filelist = recursiveScan(dir + path.sep + file, filelist);
                } else {
                    filelist.push(path.join(dir, path.sep, file));
                }
            });
            return filelist;
        };

        var getFilteredFiles = function getFilteredFiles(fileList) {
            var settings = GetJSONFromFile(settingsFile);
            return _(fileList).filter(function (file) {
                return _(settings.SupportedFileFormats).any(function (format) {
                    return file.endsWith(format);
                });
            });
        };

        var isDirectory = function isDirectory(path) {
            try {
                return fs.statSync(path).isDirectory;
            } catch (ex) {
                return false;
            }
        };
        var getFileIfExists = function getFileIfExists(file) {
            try {
                if (fs.statSync(file).isFile) return file;
                return undefined;
            } catch (ex) {
                return undefined;
            }
        };

        var getRelativeFilePath = function getRelativeFilePath(folder, fileName) {
            if (fileName) return path.relative(folder, fileName);
            return undefined;
        };

        this.SaveMediaListToFile = function (folder, mediaList) {
            var dataFolder = path.join(folder, '\MyMovieManager_Data_XYZ');
            var dataFilePath = path.join(dataFolder, '\data.json');
            if (!isDirectory(dataFolder)) {
                fs.mkdirSync(dataFolder);
                fs.writeFileSync(dataFilePath, '[]');
            }

            SaveJSONToFile(path.join(dataFolder, '\data.json'), mediaList);
        };
        var saveMediaListToFile = function saveMediaListToFile(folderObj, mediaList) {
            var dataFolder = path.join(folderObj.Path, '\MyMovieManager_Data_XYZ');
            var dataFilePath = path.join(dataFolder, '\data.json');
            if (!isDirectory(dataFolder)) {
                fs.mkdirSync(dataFolder);
                fs.writeFileSync(dataFilePath, '[]');
            }

            var mediaFilesInfo = GetJSONFromFile(dataFilePath);

            _(mediaList).each(function (media) {
                var relativeFileName = getRelativeFilePath(folderObj.Path, media);
                if (!mediaFilesInfo.find(function (file) {
                    return file.filename == relativeFileName;
                })) {
                    var mediaFolder = path.dirname(media);
                    var posterFile = getFileIfExists(path.join(mediaFolder, path.sep, 'folder.jpg')) || getFileIfExists(path.join(mediaFolder, path.sep, 'cover.jpg'));
                    var backdropFile = getFileIfExists(path.join(mediaFolder, path.sep, 'backdrop.jpg'));
                    var posterSmallFile = path.join(path.dirname(posterFile), path.sep, 'folderSmall.jpg');

                    var mediaFile = {
                        filename: relativeFileName,
                        iswatched: false,
                        poster: getRelativeFilePath(folderObj.Path, posterFile),
                        backdrop: getRelativeFilePath(folderObj.Path, backdropFile),
                        postersmall: getRelativeFilePath(folderObj.Path, posterSmallFile)
                    };

                    var fileNameRegEx = /([\w\s\.\,\'!#$%&@\^\~\-]+\w)[^\\]*[\'!;#$%&\(\)\-\/\@\[\]\^\{\}\|\~]*(\d{4})|(\d{4})[\W]*(\w[\w\s\.\,\'!#$%&@\^\~\-]+)/;
                    var title = fileNameRegEx.exec(path.basename(media));
                    if (title) {
                        mediaFile.title = title[1] || title[4];
                        mediaFile.year = title[2] || title[3];
                    }

                    mediaFilesInfo.push(mediaFile);
                }
            });
            SaveJSONToFile(path.join(dataFolder, '\data.json'), mediaFilesInfo);
        };

        this.GetMediaList = function () {
            var folderList = GetJSONFromFile(watchedFoldersFile);
            var mediaList = [];
            folderList.forEach(function (folder) {
                var dataFolder = path.join(folder.Path, '\MyMovieManager_Data_XYZ');
                var dataFilePath = path.join(dataFolder, '\data.json');

                var list = GetJSONFromFile(dataFilePath);
                _(list).each(function (item) {
                    item.$$Folder = folder;
                    mediaList.push(item);
                });
            }, this);
            return mediaList;
        };

        this.ScanMediaFiles = function (callBack) {
            var folderList = GetJSONFromFile(watchedFoldersFile);
            folderList.forEach(function (folder) {
                if (folder.Recursive) {
                    var fileList = recursiveScan(folder.Path);
                    var filteredFileList = getFilteredFiles(fileList);
                    saveMediaListToFile(folder, filteredFileList);
                } else {
                    var fs = fs || require('fs'),
                        files = fs.readdirSync(dir);
                    var filteredFileList = getFilteredFiles(_(fileList).map(function (file) {
                        return path.join(folder.Path, path.sep, file);
                    }));
                    saveMediaListToFile(folder, filteredFileList);
                }
            }, this);
            if (callBack) callBack();
        };

        var getImdbImageUrl = function getImdbImageUrl(url, height, width) {
            var w = width ? '._SX' + width : '';
            var h = height ? '._SY' + height : '';
            return url.split('._')[0] + "._V1" + h + w + ".jpg";
        };

        function OsIdentifyAndUpdate(mediaList, progressObj, callBack) {
            var OS, OpenSubtitles, ind, len, jimp, data, posterUrl, posterSmallUrl, folderName, posterFileName, posterSmallFileName, posterBigFileName, smallFileName, img, resizedImg;
            return regeneratorRuntime.async(function OsIdentifyAndUpdate$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            OS = require('opensubtitles-api');
                            OpenSubtitles = new OS({
                                'useragent': 'OSTestUserAgent',
                                'username': '',
                                'password': '',
                                'ssl': false
                            });
                            ind = 0, len = mediaList.length;

                        case 3:
                            if (!(ind < len)) {
                                _context.next = 56;
                                break;
                            }

                            _context.prev = 4;
                            jimp = require('jimp');
                            _context.next = 8;
                            return regeneratorRuntime.awrap(OpenSubtitles.identify({
                                path: path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].filename),
                                extend: true
                            }));

                        case 8:
                            data = _context.sent;


                            mediaList[ind].type = data.type;
                            _(mediaList[ind]).extend(data.metadata);

                            if (!(!mediaList[ind].poster && data.metadata.cover)) {
                                _context.next = 23;
                                break;
                            }

                            posterUrl = getImdbImageUrl(data.metadata.cover, 1024);
                            posterSmallUrl = getImdbImageUrl(data.metadata.cover, 180);
                            folderName = path.dirname(path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].filename));
                            posterFileName = path.join(folderName, path.sep, 'folder.jpg');
                            posterSmallFileName = path.join(folderName, path.sep, 'folderSmall.jpg');

                            request(posterUrl).pipe(fs.createWriteStream(posterFileName));
                            request(posterSmallUrl).pipe(fs.createWriteStream(posterSmallFileName));
                            mediaList[ind].poster = getRelativeFilePath(mediaList[ind].$$Folder.Path, posterFileName);
                            mediaList[ind].postersmall = getRelativeFilePath(mediaList[ind].$$Folder.Path, posterSmallFileName);
                            _context.next = 35;
                            break;

                        case 23:
                            if (!(mediaList[ind].poster && !mediaList[ind].postersmall)) {
                                _context.next = 35;
                                break;
                            }

                            posterBigFileName = path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].poster);
                            smallFileName = path.join(path.dirname(posterBigFileName), path.sep, 'folderSmall.jpg');
                            _context.next = 28;
                            return regeneratorRuntime.awrap(jimp.read(posterBigFileName));

                        case 28:
                            img = _context.sent;
                            _context.next = 31;
                            return regeneratorRuntime.awrap(img.resize(jimp.AUTO, 180));

                        case 31:
                            resizedImg = _context.sent;
                            _context.next = 34;
                            return regeneratorRuntime.awrap(resizedImg.write(smallFileName));

                        case 34:

                            mediaList[ind].postersmall = getRelativeFilePath(mediaList[ind].$$Folder.Path, smallFileName);

                        case 35:

                            mediaList[ind].isupdatedonce = true;
                            _context.next = 53;
                            break;

                        case 38:
                            _context.prev = 38;
                            _context.t0 = _context["catch"](4);

                            if (!(mediaList[ind].poster && !mediaList[ind].postersmall)) {
                                _context.next = 52;
                                break;
                            }

                            posterBigFileName = path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].poster);
                            smallFileName = path.join(path.dirname(posterBigFileName), path.sep, 'folderSmall.jpg');
                            _context.next = 45;
                            return regeneratorRuntime.awrap(jimp.read(posterBigFileName));

                        case 45:
                            img = _context.sent;
                            _context.next = 48;
                            return regeneratorRuntime.awrap(img.resize(jimp.AUTO, 180));

                        case 48:
                            resizedImg = _context.sent;
                            _context.next = 51;
                            return regeneratorRuntime.awrap(resizedImg.write(smallFileName));

                        case 51:

                            mediaList[ind].postersmall = getRelativeFilePath(mediaList[ind].$$Folder.Path, smallFileName);

                        case 52:
                            console.log(_context.t0);

                        case 53:
                            ind++;
                            _context.next = 3;
                            break;

                        case 56:
                            callBack();

                        case 57:
                        case "end":
                            return _context.stop();
                    }
                }
            }, null, this, [[4, 38]]);
        }

        this.UpdateMediaMetaData = function (mediaList, progressObj, callBack) {

            OsIdentifyAndUpdate(mediaList, progressObj, callBack);
        };
    });
})();
