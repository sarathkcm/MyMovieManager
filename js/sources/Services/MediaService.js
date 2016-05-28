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
                if (!getFileIfExists(dataFilePath)) {
                    fs.writeFileSync(dataFilePath, '[]');
                }

                var mediaFilesInfo = GetJSONFromFile(dataFilePath);

                _(mediaList).each(function (media) {
                    var relativeFileName = getRelativeFilePath(folderObj.Path, media);
                    if (!mediaFilesInfo.find(file => file.filename == relativeFileName)) {
                        var mediaFolder = path.dirname(media);
                        var posterFile = getFileIfExists(path.join(mediaFolder, path.sep, 'folder.jpg')) || getFileIfExists(path.join(mediaFolder, path.sep, 'cover.jpg'));
                        var backdropFile = getFileIfExists(path.join(mediaFolder, path.sep, 'backdrop.jpg'));
                        var posterSmallFile = getFileIfExists(path.join(mediaFolder, path.sep, 'folderSmall.jpg'));

                        var mediaFile = {
                            filename: relativeFileName,
                            iswatched: false,
                            poster: getRelativeFilePath(folderObj.Path, posterFile),
                            backdrop: getRelativeFilePath(folderObj.Path, backdropFile),
                            postersmall: getRelativeFilePath(folderObj.Path, posterSmallFile),
                            metadata:{}
                        };

                        var fileNameRegEx = /([\w\s\.\,\'!#$%&@\^\~\-]+\w)[^\\]*[\'!;#$%&\(\)\-\/\@\[\]\^\{\}\|\~]*(\d{4})|(\d{4})[\W]*(\w[\w\s\.\,\'!#$%&@\^\~\-]+)/;
                        var title = fileNameRegEx.exec(path.basename(media));
                        if (title) {
                            mediaFile.metadata.title = title[1] || title[4];
                            mediaFile.metadata.year = title[2] || title[3];
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


            this.UpdateMediaMetaData = function (mediaList, callBack) {
                const BrowserWindow = require('electron').remote.BrowserWindow
                const ipcRenderer = require('electron').ipcRenderer
                const path = require('path')
                const currentWindowId = BrowserWindow.getFocusedWindow().id
                const processorPath = 'file://' + path.join(__dirname, '/pages/Processors/IdentifyMovies.html')
                let win = new BrowserWindow({ width: 400, height: 400, show: false })
                win.loadURL(processorPath)

                win.webContents.on('did-finish-load', function () {
                    win.webContents.send('identify-movies', JSON.stringify(mediaList), currentWindowId)
                });

                ipcRenderer.on('identify-movies-completed', function (event, output) {
                    callBack(JSON.parse(output));
                });
            };
        });

})();