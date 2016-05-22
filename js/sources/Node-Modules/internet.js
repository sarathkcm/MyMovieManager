(function () {
    var internet = { };

    internet.downloadFile = function (url, path) {
        var request = require('request');
        var fs = fs || require('fs');

        return new Promise(function (resolve, reject) {
            try {
                var stream = fs.createWriteStream(path);

                stream.on('close', function () {
                    resolve(true);
                });

                request(url).pipe(stream);
            }
            catch (ex) {
                reject(ex);
            }

        });

    };
    module.exports = internet;

})();