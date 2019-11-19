"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const find_module_1 = require("../schematics-angular-utils/find-module");
const ts = require("typescript");
const route_utils_1 = require("../schematics-angular-utils/route-utils");
const ast_utils_1 = require("../schematics-angular-utils/ast-utils");
const change_1 = require("../schematics-angular-utils/change");
const find_file_1 = require("./find-file");
const core_1 = require("@angular-devkit/core");
//import { MenuOptions } from "../menu/schema";
const classify = core_1.strings.classify;
const dasherize = core_1.strings.dasherize;
const camelize = core_1.strings.camelize;
function findFileByName(file, path, host) {
    let dir = host.getDir(path);
    while (dir) {
        let appComponentFileName = dir.path + '/' + file;
        if (host.exists(appComponentFileName)) {
            return appComponentFileName;
        }
        dir = dir.parent;
    }
    throw new schematics_1.SchematicsException(`File ${file} not found in ${path} or one of its anchestors`);
}
function createAddInjectionContext(options, host) {
    let appComponentFileName = findFileByName('app.component.ts', options.path || '/', host);
    let destinationPath = find_file_1.constructDestinationPath(options);
    let serviceName = classify(`${options.name}Service`);
    let serviceFileName = core_1.join(core_1.normalize(destinationPath), `${dasherize(options.name)}.service`);
    let relativeServiceFileName = find_module_1.buildRelativePath(appComponentFileName, serviceFileName);
    return {
        appComponentFileName,
        relativeServiceFileName,
        serviceName
    };
}
function injectServiceIntoAppComponent(options) {
    console.log('injectServiceIntoAppComponent');
    return (host) => {
        let context = createAddInjectionContext(options, host);
        let changes = buildInjectionChanges(context, host, options);
        const declarationRecorder = host.beginUpdate(context.appComponentFileName);
        for (let change of changes) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        return host;
    };
}
exports.injectServiceIntoAppComponent = injectServiceIntoAppComponent;
;
function buildInjectionChanges(context, host, options) {
    let text = host.read(context.appComponentFileName);
    if (!text)
        throw new schematics_1.SchematicsException(`File ${options.module} does not exist.`);
    let sourceText = text.toString('utf-8');
    let sourceFile = ts.createSourceFile(context.appComponentFileName, sourceText, ts.ScriptTarget.Latest, true);
    let nodes = ast_utils_1.getSourceNodes(sourceFile);
    let ctorNode = nodes.find(n => n.kind == ts.SyntaxKind.Constructor);
    let constructorChange;
    if (!ctorNode) {
        // No constructor found
        constructorChange = createConstructorForInjection(context, nodes, options);
    }
    else {
        constructorChange = addConstructorArgument(context, ctorNode, options);
    }
    return [
        constructorChange,
        route_utils_1.insertImport(sourceFile, context.appComponentFileName, context.serviceName, context.relativeServiceFileName)
    ];
}
function addConstructorArgument(context, ctorNode, options) {
    console.log(options);
    let siblings = ctorNode.getChildren();
    let parameterListNode = siblings.find(n => n.kind === ts.SyntaxKind.SyntaxList);
    if (!parameterListNode) {
        throw new schematics_1.SchematicsException(`expected constructor in ${context.appComponentFileName} to have a parameter list`);
    }
    let parameterNodes = parameterListNode.getChildren();
    let paramNode = parameterNodes.find(p => {
        let typeNode = findSuccessor(p, [ts.SyntaxKind.TypeReference, ts.SyntaxKind.Identifier]);
        if (!typeNode)
            return false;
        return typeNode.getText() === context.serviceName;
    });
    if (!paramNode && parameterNodes.length == 0) {
        let toAdd = `private ${camelize(context.serviceName)}: ${classify(context.serviceName)}`;
        return new change_1.InsertChange(context.appComponentFileName, parameterListNode.pos, toAdd);
    }
    else if (!paramNode && parameterNodes.length > 0) {
        let toAdd = `,
    private ${camelize(context.serviceName)}: ${classify(context.serviceName)}`;
        let lastParameter = parameterNodes[parameterNodes.length - 1];
        return new change_1.InsertChange(context.appComponentFileName, lastParameter.end, toAdd);
    }
    return new change_1.NoopChange();
}
function findSuccessor(node, searchPath) {
    let children = node.getChildren();
    let next = undefined;
    for (let syntaxKind of searchPath) {
        next = children.find(n => n.kind == syntaxKind);
        if (!next)
            return null;
        children = next.getChildren();
    }
    return next;
}
function createConstructorForInjection(context, nodes, options) {
    console.log(options);
    let classNode = nodes.find(n => n.kind === ts.SyntaxKind.ClassKeyword);
    if (!classNode) {
        throw new schematics_1.SchematicsException(`expected class in ${context.appComponentFileName}`);
    }
    if (!classNode.parent) {
        throw new schematics_1.SchematicsException(`expected constructor in ${context.appComponentFileName} to have a parent node`);
    }
    let siblings = classNode.parent.getChildren();
    let classIndex = siblings.indexOf(classNode);
    siblings = siblings.slice(classIndex);
    let classIdentifierNode = siblings.find(n => n.kind === ts.SyntaxKind.Identifier);
    if (!classIdentifierNode) {
        throw new schematics_1.SchematicsException(`expected class in ${context.appComponentFileName} to have an identifier`);
    }
    if (classIdentifierNode.getText() !== 'AppComponent') {
        throw new schematics_1.SchematicsException(`expected first class in ${context.appComponentFileName} to have the name AppComponent`);
    }
    let curlyNodeIndex = siblings.findIndex(n => n.kind === ts.SyntaxKind.FirstPunctuation);
    siblings = siblings.slice(curlyNodeIndex);
    let listNode = siblings.find(n => n.kind === ts.SyntaxKind.SyntaxList);
    if (!listNode) {
        throw new schematics_1.SchematicsException(`expected first class in ${context.appComponentFileName} to have a body`);
    }
    let toAdd = `
  constructor(private ${camelize(context.serviceName)}: ${classify(context.serviceName)}) {
    // ${camelize(context.serviceName)}.show = true;
  }
`;
    return new change_1.InsertChange(context.appComponentFileName, listNode.pos + 1, toAdd);
}
/*
function showTree(node: ts.Node, depth: number = 0): void {
    let indent = ''.padEnd(depth*4, ' ');
    console.log(indent + ts.SyntaxKind[node.kind]);
    if (node.getChildCount() === 0) {
        console.log(indent + '    Text: ' + node.getText());
    }

    for(let child of node.getChildren()) {
        showTree(child, depth+1);
    }
}*/
//# sourceMappingURL=add-injection.js.map