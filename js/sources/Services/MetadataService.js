(function () {
    angular.module("MyMovieManager")
        .service("MetadataService", ["DataService", "FileService", function (DataService, Files) {

            const FilenameRegex = fileNameRegEx = /([\w\s\.\,\'!#$%&@\^\~\-]+\w)[^\\]*[\'!;#$%&\(\)\-\/\@\[\]\^\{\}\|\~]*(\d{4})|(\d{4})[\W]*(\w[\w\s\.\,\'!#$%&@\^\~\-]+)/;

            this.GetOfflineMetadata = function (mediaFile, watchedFolder) {

                var mediaFolder = path.dirname(mediaFile);
                var posterFile = Files.GetFilePathIfExists(path.join(mediaFolder, path.sep, 'folder.jpg'))
                    || Files.GetFilePathIfExists(path.join(mediaFolder, path.sep, 'cover.jpg'));
                var backdropFile = Files.GetFilePathIfExists(path.join(mediaFolder, path.sep, 'backdrop.jpg'));
                var posterSmallFile = Files.GetFilePathIfExists(path.join(mediaFolder, path.sep, 'folderSmall.jpg'));

                var mediaFileObj = {
                    filename: Files.GetRelativeFilePath(watchedFolder, mediaFile),
                    iswatched: false,
                    poster: Files.GetRelativeFilePath(watchedFolder, posterFile),
                    backdrop: Files.GetRelativeFilePath(watchedFolder, backdropFile),
                    postersmall: Files.GetRelativeFilePath(watchedFolder, posterSmallFile),
                    metadata: {}
                };

                var title = FilenameRegex.exec(path.basename(mediaFile));
                if (title) {
                    mediaFileObj.metadata.title = title[1] || title[4];
                    mediaFileObj.metadata.year = title[2] || title[3];
                }
                return mediaFileObj;
            };

        }]);
})();