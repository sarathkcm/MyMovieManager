(function () {
    angular.module("MyMovieManager")
        .service("MediaService",
        ['DataService', 'FileService', 'SettingsService', 'MetadataService', function (DataService, Files, SettingsService, MetaDataService) {

            var Service = this;
            Service.SaveMediaListToFile = function (folder, mediaList) {
                var dataStorage = Files.GetDataStorageDetails(folder, true);
                DataService.SaveDataToFile(dataStorage.File, mediaList);
            };

            Service.SaveMediaListToFileWithMetadata = function (folder, mediaList) {
                var dataStorage = Files.GetDataStorageDetails(folder, true);
                var mediaFilesInfo = DataService.ReadDataFromFile(dataStorage.File);

                _(mediaList).each(media => {
                    var relativeFileName = Files.GetRelativeFilePath(folder, media);
                    if (!mediaFilesInfo.find(file => file.filename == relativeFileName)) {
                        var mediaFile = MetaDataService.GetOfflineMetadata(media, folder);
                        mediaFilesInfo.push(mediaFile);
                    }
                });
                DataService.SaveDataToFile(dataStorage.File, mediaFilesInfo);
            };

            var SetPosterPath = function (media) {
                if (media && media.$$Folder) {
                    var url = "file:///" + media.$$Folder.Path + path.sep + media.poster;
                    media.$$PosterPath = url.replace(/\\/g, "\\\\");
                }
                else
                    media.$$PosterPath = "";
            };

            Service.GetMediaList = function () {
                var mediaList = [];
                _(SettingsService.WatchedFolders).each(folder => {
                    var dataStorage = Files.GetDataStorageDetails(folder.Path);
                    var list = DataService.ReadDataFromFile(dataStorage.File);
                    _(list).each(item => {
                        item.$$Folder = folder;
                        SetPosterPath(item);
                        mediaList.push(item);
                    });
                });
                return mediaList;
            };

            Service.ScanMediaFiles = function () {
                return new Promise((resolve, reject) => {
                    try {
                        _(SettingsService.WatchedFolders).each(folder => {
                            var fileList = [];
                            if (folder.Recursive) {
                                fileList = Files.GetFilesRecursively(folder.Path, SettingsService.Settings.SupportedFileFormats);
                                Service.SaveMediaListToFileWithMetadata(folder.Path, fileList);
                            } else {
                                fileList = Files.GetFiles(folder.Path, SettingsService.Settings.SupportedFileFormats);
                                Service.SaveMediaListToFileWithMetadata(folder.Path, fileList);
                            }
                        });
                        resolve();
                    }
                    catch (ex) {
                        reject(ex);
                    }
                });
            };

            Service.UpdateMediaMetaData = function (mediaList) {

                return new Promise((resolve, reject) => {
                    try {
                        const BrowserWindow = require('electron').remote.BrowserWindow;
                        const ipcRenderer = require('electron').ipcRenderer;
                        const path = require('path');
                        const currentWindowId = BrowserWindow.getFocusedWindow().id;
                        const processorPath = 'file://' + path.join(__dirname, '/pages/Processors/IdentifyMovies.html')
                        let win = new BrowserWindow({ width: 400, height: 400, show: false });
                        win.loadURL(processorPath);

                        win.webContents.on('did-finish-load', function () {
                            win.webContents.send('identify-movies', JSON.stringify(mediaList), currentWindowId)
                        });
                        win.webContents.on('did-fail-load', function (event, errorCode, errorDescription) {
                            reject({
                                Event: event,
                                ErrorCode: errorCode,
                                ErrorDescription: errorDescription
                            });
                        });
                        ipcRenderer.on('identify-movies-completed', function (event, output) {
                            resolve(JSON.parse(output));
                        });
                    }
                    catch (ex) {
                        reject(ex);
                    }

                });
            };
        }]);

})();