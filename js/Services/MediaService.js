(function () {
    angular.module("MyMovieManager")
        .service("MediaService", function ($http) {
            var path = require('path');
            var recursiveScan = function (dir, filelist) {
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

            var getFilteredFiles = function (fileList) {
                var settings = GetJSONFromFile(settingsFile);
                return _(fileList).filter(function (file) {
                    return _(settings.SupportedFileFormats).any(function (format) {
                        return file.endsWith(format);
                    });
                });
            }

            var isDirectory = function (path) {
                try {
                    return fs.statSync(path).isDirectory;
                } catch (ex) {
                    return false;
                }
            };
            var getFileIfExists = function (file) {
                try {
                    if (fs.statSync(file).isFile)
                        return file;
                    return undefined;
                } catch (ex) {
                    return undefined;
                }
            };

            var getRelativeFilePath = function (folder, fileName) {
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
            var saveMediaListToFile = function (folderObj, mediaList) {
                var dataFolder = path.join(folderObj.Path, '\MyMovieManager_Data_XYZ');
                var dataFilePath = path.join(dataFolder, '\data.json');
                if (!isDirectory(dataFolder)) {
                    fs.mkdirSync(dataFolder);
                    fs.writeFileSync(dataFilePath, '[]');
                }

                var mediaFilesInfo = GetJSONFromFile(dataFilePath);

                _(mediaList).each(function (media) {
                    var relativeFileName = getRelativeFilePath(folderObj.Path, media);
                    if (!mediaFilesInfo.find(file => file.filename == relativeFileName)) {
                        var mediaFolder = path.dirname(media);
                        var posterFile = getFileIfExists(path.join(mediaFolder, path.sep, 'folder.jpg')) || getFileIfExists(path.join(mediaFolder, path.sep, 'cover.jpg'));
                        var backdropFile = getFileIfExists(path.join(mediaFolder, path.sep, 'backdrop.jpg'));
                        var posterSmallFile = path.join(path.dirname(posterFile), path.sep, 'folderSmall.jpg');

                        var mediaFile = {
                            filename: relativeFileName,
                            iswatched: false,
                            poster: getRelativeFilePath(folderObj.Path, posterFile),
                            backdrop: getRelativeFilePath(folderObj.Path, backdropFile),
                            postersmall: getRelativeFilePath(folderObj.Path, posterSmallFile),
                        };

                        var fileNameRegEx = /([\w\s\.\,\'!#$%&@\^\~\-]+\w)[^\\]*[\'!;#$%&\(\)\-\/\@\[\]\^\{\}\|\~]*(\d{4})|(\d{4})[\W]*(\w[\w\s\.\,\'!#$%&@\^\~\-]+)/;
                        var title = fileNameRegEx.exec(path.basename(media));
                        if (title) {
                            mediaFile.title = title[1] || title[4];
                            mediaFile.year = title[2] || title[3];
                        }

                        mediaFilesInfo.push(mediaFile);


                    }
                })
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
                    })
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
                        var filteredFileList = getFilteredFiles(
                            _(fileList).map(function (file) {
                                return path.join(folder.Path, path.sep, file)
                            })
                        );
                        saveMediaListToFile(folder, filteredFileList);
                    }

                }, this);
                if (callBack) callBack();
            };

            var getImdbImageUrl = function (url, height, width) {
                var w = width ? '._SX' + width : '';
                var h = height ? '._SY' + height : '';
                return url.split('._')[0] + "._V1" + h + w + ".jpg";
            };

            async function OsIdentifyAndUpdate(mediaList, progressObj, callBack) {
                var OS = require('opensubtitles-api');
                var OpenSubtitles = new OS({
                    'useragent': 'OSTestUserAgent',
                    'username': '',
                    'password': '',
                    'ssl': false
                });
                for (var ind = 0, len = mediaList.length; ind < len; ind++) {

                    try {
                        var jimp = require('jimp');
                        var data = await OpenSubtitles.identify({
                            path: path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].filename),
                            extend: true
                        });


                        mediaList[ind].type = data.type;
                        _(mediaList[ind]).extend(data.metadata);

                        if (!mediaList[ind].poster && data.metadata.cover) {
                            var posterUrl = getImdbImageUrl(data.metadata.cover, 1024);
                            var posterSmallUrl = getImdbImageUrl(data.metadata.cover, 180);

                            var folderName = path.dirname(path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].filename));

                            var posterFileName = path.join(folderName, path.sep, 'folder.jpg');
                            var posterSmallFileName = path.join(folderName, path.sep, 'folderSmall.jpg');
                            request(posterUrl).pipe(fs.createWriteStream(posterFileName));
                            request(posterSmallUrl).pipe(fs.createWriteStream(posterSmallFileName));
                            mediaList[ind].poster = getRelativeFilePath(mediaList[ind].$$Folder.Path, posterFileName);
                            mediaList[ind].postersmall = getRelativeFilePath(mediaList[ind].$$Folder.Path, posterSmallFileName);
                        }
                        else if (mediaList[ind].poster && !mediaList[ind].postersmall) {
                            var posterBigFileName = path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].poster);
                            var smallFileName = path.join(path.dirname(posterBigFileName), path.sep, 'folderSmall.jpg');
                            var img = await jimp.read(posterBigFileName)
                            var resizedImg = await img.resize(jimp.AUTO, 180);
                            await resizedImg.write(smallFileName);

                            mediaList[ind].postersmall = getRelativeFilePath(mediaList[ind].$$Folder.Path, smallFileName);
                        }

                        mediaList[ind].isupdatedonce = true;
                    } catch (ex) {
                        if (mediaList[ind].poster && !mediaList[ind].postersmall) {
                            var posterBigFileName = path.join(mediaList[ind].$$Folder.Path, path.sep, mediaList[ind].poster);
                            var smallFileName = path.join(path.dirname(posterBigFileName), path.sep, 'folderSmall.jpg');
                            var img = await jimp.read(posterBigFileName)
                            var resizedImg = await img.resize(jimp.AUTO, 180);
                            await resizedImg.write(smallFileName);

                            mediaList[ind].postersmall = getRelativeFilePath(mediaList[ind].$$Folder.Path, smallFileName);
                        }
                        console.log(ex);
                    }
                }
                callBack();
            }



            this.UpdateMediaMetaData = function (mediaList, progressObj, callBack) {

                OsIdentifyAndUpdate(mediaList, progressObj, callBack);

            };
        });

})();