"use strict";
// Option A: Directly referencing the private APIs
// import { ModuleOptions, buildRelativePath } from "@schematics/angular/utility/find-module";
// import { Rule, Tree, SchematicsException } from "@angular-devkit/schematics";
// import { dasherize, classify } from "@angular-devkit/core";
// import { addDeclarationToModule, addExportToModule } from "@schematics/angular/utility/ast-utils";
// import { InsertChange } from "@schematics/angular/utility/change";
Object.defineProperty(exports, "__esModule", { value: true });
// Option B: Using a fork of the private APIs b/c they can change
const schematics_1 = require("@angular-devkit/schematics");
const add_to_module_context_1 = require("./add-to-module-context");
const ts = require("typescript");
const core_1 = require("@angular-devkit/core");
const { dasherize, classify } = core_1.strings;
// Referencing forked and copied private APIs 
const find_module_1 = require("../schematics-angular-utils/find-module");
const ast_utils_1 = require("../schematics-angular-utils/ast-utils");
const change_1 = require("../schematics-angular-utils/change");
const stringUtils = { dasherize, classify };
function addDeclarationToNgModule(options, exports) {
    return (host) => {
        addDeclaration(host, options);
        if (exports) {
            addExport(host, options);
        }
        return host;
    };
}
exports.addDeclarationToNgModule = addDeclarationToNgModule;
function createAddToModuleContext(host, options) {
    const result = new add_to_module_context_1.AddToModuleContext();
    if (!options.module) {
        throw new schematics_1.SchematicsException(`Module not found.`);
    }
    const text = host.read(options.module);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${options.module} does not exist!`);
    }
    const sourceText = text.toString('utf-8');
    result.source = ts.createSourceFile(options.module, sourceText, ts.ScriptTarget.Latest, true);
    const componentPath = `${options.path}/`
        + stringUtils.dasherize(options.name) + '/'
        + stringUtils.dasherize(options.name)
        + '.component';
    result.relativePath = find_module_1.buildRelativePath(options.module, componentPath);
    result.classifiedName = stringUtils.classify(`${options.name}Component`);
    return result;
}
function addDeclaration(host, options) {
    const context = createAddToModuleContext(host, options);
    const modulePath = options.module || '';
    const declarationChanges = ast_utils_1.addDeclarationToModule(context.source, modulePath, context.classifiedName, context.relativePath);
    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of declarationChanges) {
        if (change instanceof change_1.InsertChange) {
            declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
    }
    host.commitUpdate(declarationRecorder);
}
;
function addExport(host, options) {
    const context = createAddToModuleContext(host, options);
    const modulePath = options.module || '';
    const exportChanges = ast_utils_1.addExportToModule(context.source, modulePath, context.classifiedName, context.relativePath);
    const exportRecorder = host.beginUpdate(modulePath);
    for (const change of exportChanges) {
        if (change instanceof change_1.InsertChange) {
            exportRecorder.insertLeft(change.pos, change.toAdd);
        }
    }
    host.commitUpdate(exportRecorder);
}
;
//# sourceMappingURL=ng-module-utils.js.map