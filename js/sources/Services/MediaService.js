(function () {
    angular.module("MyMovieManager")
        .service("MediaService",
        ['DataService', 'FileService', 'SettingsService', 'MetadataService', function (DataService, Files, SettingsService, MetaDataService) {
            var path = require('path');
            this.SaveMediaListToFile = function (folder, mediaList) {
                var dataStorage = Files.GetDataStorageDetails(folder, true);
                DataService.SaveDataToFile(dataStorage.File, mediaList);
            };

            this.SaveMediaListToFileWithMetadata = function (folder, mediaList) {
                var dataStorage = Files.GetDataStorageDetails(folderObj.Path, true);
                var mediaFilesInfo = DataService.ReadDataFromFile(dataStorage.File);

                _(mediaList).each(media => {
                    var relativeFileName = Files.GetRelativeFilePath(folder, media);
                    if (!mediaFilesInfo.find(file => file.filename == relativeFileName)) {
                        var mediaFile = MetaDataService.GetOfflineMetadata(media, folder);
                        mediaFilesInfo.push(mediaFile);
                    }
                })
                DataService.SaveDataToFile(dataStorage.File, mediaFilesInfo);
            };

            this.GetMediaList = function () {
                var folderList = DataService.ReadDataFromFile(watchedFoldersFile);
                var mediaList = [];
                folderList.forEach(folder => {
                    var dataStorage = Files.GetDataStorageDetails(folder.Path);
                    var list = DataService.ReadDataFromFile(dataStorage.File);
                    _(list).each(item => {
                        item.$$Folder = folder;
                        mediaList.push(item);
                    })
                });
                return mediaList;
            };

            this.ScanMediaFiles = function (callBack) {
                var folderList = DataService.ReadDataFromFile(watchedFoldersFile);
                _(folderList).each(folder => {
                    if (folder.Recursive) {
                        var fileList = Files.GetFilesRecursively(folder.Path, SettingsService.Settings.SupportedFileFormats);
                        this.SaveMediaListToFileWithMetadata(folder.Path, fileList);
                    } else {
                        var fileList = Files.GetFiles(folder.Path, SettingsService.Settings.SupportedFileFormats);
                        this.SaveMediaListToFileWithMetadata(folder.Path, fileList);
                    }
                });
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
        }]);

})();