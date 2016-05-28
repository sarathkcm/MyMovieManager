(function () {
    angular.module("MyMovieManager")
        .service("FileService", function ($http) {
            var fs = fs || require('fs'),
                path = require('path');
            this.GetFilesRecursively = function (dir, fileExtensions, filelis) {
                var files = fs.readdirSync(dir);
                filelist = filelist || [];
                files.forEach(function (file) {
                    if (fs.statSync(dir + path.sep + file).isDirectory()) {
                        filelist = this.GetFilesRecursive(dir + path.sep + file, fileExtensions, filelist);
                    } else {
                        filelist.push(path.join(dir, path.sep, file));
                    }
                });
                if (!fileExtensions)
                    return filelist;

                return _(fileList).filter(function (file) {
                    return _(fileExtensions).any(function (format) {
                        return file.endsWith(format);
                    });
                });
            };

            this.GetFiles = function (dir, fileExtensions) {
                var files = fs.readdirSync(dir);

                var fileList = _(files).map(function (file) {
                    return path.join(dir, path.sep, file)
                });

                if (!fileExtensions)
                    return fileList;

                return _(fileList).filter(function (file) {
                    return _(fileExtensions).any(function (format) {
                        return file.endsWith(format);
                    });
                });

            }

            this.IsDirectory = function (path) {
                try {
                    return fs.statSync(path).isDirectory;
                } catch (ex) {
                    return false;
                }
            };

            this.GetFilePathIfExists = function (file) {
                try {
                    if (fs.statSync(file).isFile)
                        return file;
                    return undefined;
                } catch (ex) {
                    return undefined;
                }
            };

            this.GetRelativeFilePath = function (folder, fileName) {
                if (fileName) return path.relative(folder, fileName);
                return undefined;
            };

            this.InitializeDataStorage = function (folder) {
                var dataFolder = path.join(folder, '\MyMovieManager_Data_XYZ');
                var dataFilePath = path.join(dataFolder, '\data.json');
                if (!this.IsDirectory(dataFolder)) {
                    fs.mkdirSync(dataFolder);
                }
                if (!GetFilePathIfExists(dataFilePath)) {
                    fs.writeFileSync(dataFilePath, '[]');
                }
                return { Folder: dataFolder, File: dataFilePath };
            };

            this.GetDataStorageDetails = function (folder, initialize) {
                if (initialize)
                    this.InitializeDataStorage(folder);
                return {
                    Folder: path.join(folder, '\MyMovieManager_Data_XYZ'),
                    File: path.join(dataFolder, '\data.json')
                };
            };

        })
})();