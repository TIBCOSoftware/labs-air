"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const json_utils_1 = require("../../utility/json-utils");
function UpdateWorkspaceConfig() {
    return (tree) => {
        let workspaceConfigPath = 'angular.json';
        let angularConfigContent = tree.read(workspaceConfigPath);
        if (!angularConfigContent) {
            workspaceConfigPath = '.angular.json';
            angularConfigContent = tree.read(workspaceConfigPath);
            if (!angularConfigContent) {
                return;
            }
        }
        const angularJson = core_1.parseJsonAst(angularConfigContent.toString(), core_1.JsonParseMode.Loose);
        if (angularJson.kind !== 'object') {
            return;
        }
        const projects = json_utils_1.findPropertyInAstObject(angularJson, 'projects');
        if (!projects || projects.kind !== 'object') {
            return;
        }
        // For all projects
        const recorder = tree.beginUpdate(workspaceConfigPath);
        for (const project of projects.properties) {
            const projectConfig = project.value;
            if (projectConfig.kind !== 'object') {
                break;
            }
            const architect = json_utils_1.findPropertyInAstObject(projectConfig, 'architect');
            if (!architect || architect.kind !== 'object') {
                break;
            }
            const buildTarget = json_utils_1.findPropertyInAstObject(architect, 'build');
            if (buildTarget && buildTarget.kind === 'object') {
                const builder = json_utils_1.findPropertyInAstObject(buildTarget, 'builder');
                // Projects who's build builder is not build-angular:browser
                if (builder && builder.kind === 'string' && builder.value === '@angular-devkit/build-angular:browser') {
                    updateOption('styles', recorder, buildTarget);
                    updateOption('scripts', recorder, buildTarget);
                }
            }
            const testTarget = json_utils_1.findPropertyInAstObject(architect, 'test');
            if (testTarget && testTarget.kind === 'object') {
                const builder = json_utils_1.findPropertyInAstObject(testTarget, 'builder');
                // Projects who's build builder is not build-angular:browser
                if (builder && builder.kind === 'string' && builder.value === '@angular-devkit/build-angular:karma') {
                    updateOption('styles', recorder, testTarget);
                    updateOption('scripts', recorder, testTarget);
                }
            }
        }
        tree.commitUpdate(recorder);
        return tree;
    };
}
exports.UpdateWorkspaceConfig = UpdateWorkspaceConfig;
/**
 * Helper to retreive all the options in various configurations
 */
function getAllOptions(builderConfig) {
    const options = [];
    const configurations = json_utils_1.findPropertyInAstObject(builderConfig, 'configurations');
    if (configurations && configurations.kind === 'object') {
        options.push(...configurations.properties.map(x => x.value));
    }
    options.push(json_utils_1.findPropertyInAstObject(builderConfig, 'options'));
    return options.filter(o => o && o.kind === 'object');
}
function updateOption(property, recorder, builderConfig) {
    const options = getAllOptions(builderConfig);
    for (const option of options) {
        const propertyOption = json_utils_1.findPropertyInAstObject(option, property);
        if (!propertyOption || propertyOption.kind !== 'array') {
            continue;
        }
        for (const node of propertyOption.elements) {
            if (!node || node.kind !== 'object') {
                // skip non complex objects
                continue;
            }
            const lazy = json_utils_1.findPropertyInAstObject(node, 'lazy');
            json_utils_1.removePropertyInAstObject(recorder, node, 'lazy');
            // if lazy was not true, it is redundant hence, don't add it
            if (lazy && lazy.kind === 'true') {
                json_utils_1.insertPropertyInAstObjectInOrder(recorder, node, 'inject', false, 0);
            }
        }
    }
}
