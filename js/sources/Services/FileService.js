(function () {
    angular.module("MyMovieManager")
        .service("FileService", function () {
            var fs = fs || require('fs'),
                path = require('path');
            var Service = this;
            Service.GetFilesRecursively = function (dir, fileExtensions, filelist) {
                var files = fs.readdirSync(dir);
                filelist = filelist || [];
                _(files).each(function (file) {
                    if (fs.statSync(dir + path.sep + file).isDirectory()) {
                        filelist = Service.GetFilesRecursively(dir + path.sep + file, fileExtensions, filelist);
                    } else {
                        filelist.push(path.join(dir, path.sep, file));
                    }
                });
                if (!fileExtensions)
                    return filelist;

                return _(filelist).filter(function (file) {
                    return _(fileExtensions).some(function (format) {
                        return file.endsWith(format);
                    });
                }).value();
            };

            Service.GetFiles = function (dir, fileExtensions) {
                var files = fs.readdirSync(dir);

                var fileList = _(files).map(function (file) {
                    return path.join(dir, path.sep, file);
                }).value();

                if (!fileExtensions)
                    return fileList;

                return _(fileList).filter(function (file) {
                    return _(fileExtensions).some(function (format) {
                        return file.endsWith(format);
                    });
                }).value();

            };

            Service.IsDirectory = function (path) {
                try {
                    return fs.statSync(path).isDirectory;
                } catch (ex) {
                    return false;
                }
            };

            Service.GetFilePathIfExists = function (file) {
                try {
                    if (fs.statSync(file).isFile)
                        return file;
                    return undefined;
                } catch (ex) {
                    return undefined;
                }
            };

            Service.GetRelativeFilePath = function (folder, fileName) {
                if (fileName) return path.relative(folder, fileName);
                return undefined;
            };

            Service.InitializeDataStorage = function (folder) {
                var dataFolder = path.join(folder, '\MyMovieManager_Data_XYZ');
                var dataFilePath = path.join(dataFolder, '\data.json');
                if (!Service.IsDirectory(dataFolder)) {
                    fs.mkdirSync(dataFolder);
                }
                if (!Service.GetFilePathIfExists(dataFilePath)) {
                    fs.writeFileSync(dataFilePath, '[]');
                }
                return { Folder: dataFolder, File: dataFilePath };
            };

            Service.GetDataStorageDetails = function (folder, initialize) {
                if (initialize)
                    Service.InitializeDataStorage(folder);
                var dataFolder = path.join(folder, '\MyMovieManager_Data_XYZ');
                return {
                    Folder: dataFolder,
                    File: path.join(dataFolder, '\data.json')
                };
            };

        })
})();