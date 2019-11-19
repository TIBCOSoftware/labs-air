"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
function getWorkspacePath(host) {
    const possibleFiles = ['/angular.json', '/.angular.json'];
    const path = possibleFiles.filter(path => host.exists(path))[0];
    return path;
}
exports.getWorkspacePath = getWorkspacePath;
function getWorkspace(host) {
    const path = getWorkspacePath(host);
    const configBuffer = host.read(path);
    if (configBuffer === null) {
        throw new schematics_1.SchematicsException(`Could not find (${path})`);
    }
    const config = configBuffer.toString();
    return JSON.parse(config);
}
exports.getWorkspace = getWorkspace;
exports.configPath = '/.angular-cli.json';
function getConfig(host) {
    const configBuffer = host.read(exports.configPath);
    if (configBuffer === null) {
        throw new schematics_1.SchematicsException('Could not find .angular-cli.json');
    }
    const config = JSON.parse(configBuffer.toString());
    return config;
}
exports.getConfig = getConfig;
function getAppFromConfig(config, appIndexOrName) {
    if (!config.apps) {
        return null;
    }
    if (parseInt(appIndexOrName) >= 0) {
        return config.apps[parseInt(appIndexOrName)];
    }
    return config.apps.filter((app) => app.name === appIndexOrName)[0];
}
exports.getAppFromConfig = getAppFromConfig;
//# sourceMappingURL=config.js.map