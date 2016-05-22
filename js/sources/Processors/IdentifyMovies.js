(function () {
    var sourceWindowId;
    try {
        "use strict";
        var _ = require('underscore');
        var fs = require('fs');
        var path = require('path');
        require("babel-polyfill");
        var request = require('request');
        var internet = require('../../js/dist/Node-Modules/internet.js');

        var finish = function (mediaList) {
            const fromWindow = BrowserWindow.fromId(sourceWindowId);
            fromWindow.webContents.send('identify-movies-completed', JSON.stringify(mediaList));
            window.close();
        };

        var getImdbImageUrl = function (url, height, width) {
            var w = width ? '._SX' + width : '';
            var h = height ? '._SY' + height : '';
            return url.split('._')[0] + "._V1" + h + w + ".jpg";
        };

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

        async function OsIdentifyAndUpdate(mediaList) {
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
                        await internet.downloadFile(posterUrl, posterFileName);
                        await internet.downloadFile(posterSmallUrl, posterSmallFileName);
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
            finish(mediaList);
        }

        const ipc = require('electron').ipcRenderer
        const BrowserWindow = require('electron').remote.BrowserWindow


        ipc.on('identify-movies', function (event, mediaList, fromWindowId) {
            sourceWindowId = fromWindowId;
            OsIdentifyAndUpdate(JSON.parse(mediaList));
        });
    }
    catch (ex) {
        try {
            console.log(ex);
            const fromWindow = BrowserWindow.fromId(sourceWindowId);
            fromWindow.webContents.send('identify-movies-completed', JSON.stringify(mediaList));
        }
        catch (ex) { }
        window.close();
    }
})();