"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
//const dasherize = strings.dasherize;
function constructDestinationPath(options) {
    return (options.path || '') + (options.flat ? '' : '/' + core_1.strings.dasherize(options.name));
}
exports.constructDestinationPath = constructDestinationPath;
function findFile(fileName, host, options) {
    const startPath = constructDestinationPath(options);
    let dir = host.getDir(startPath);
    while (dir) {
        let file = dir.subfiles.find(f => f == fileName);
        if (file) {
            return core_1.join(dir.path, file);
        }
        dir = dir.parent;
    }
    return null;
}
exports.findFile = findFile;
//# sourceMappingURL=find-file.js.map