var GetJSONFromFile = function (fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
};

var SaveJSONToFile = function (fileName, jsonObject) {
    fs.writeFileSync(fileName, angular.toJson(jsonObject, 3));
};