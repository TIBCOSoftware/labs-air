(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/ngcc/src/host/ngcc_host", "@angular/compiler-cli/ngcc/src/rendering/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var ngcc_host_1 = require("@angular/compiler-cli/ngcc/src/host/ngcc_host");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    /**
     * A RenderingFormatter that works with ECMAScript Module import and export statements.
     */
    var EsmRenderingFormatter = /** @class */ (function () {
        function EsmRenderingFormatter(host, isCore) {
            this.host = host;
            this.isCore = isCore;
        }
        /**
         *  Add the imports at the top of the file, after any imports that are already there.
         */
        EsmRenderingFormatter.prototype.addImports = function (output, imports, sf) {
            var insertionPoint = this.findEndOfImports(sf);
            var renderedImports = imports.map(function (i) { return "import * as " + i.qualifier + " from '" + i.specifier + "';\n"; }).join('');
            output.appendLeft(insertionPoint, renderedImports);
        };
        /**
         * Add the exports to the end of the file.
         */
        EsmRenderingFormatter.prototype.addExports = function (output, entryPointBasePath, exports, importManager, file) {
            exports.forEach(function (e) {
                var exportFrom = '';
                var isDtsFile = typescript_1.isDtsPath(entryPointBasePath);
                var from = isDtsFile ? e.dtsFrom : e.from;
                if (from) {
                    var basePath = utils_1.stripExtension(from);
                    var relativePath = './' + file_system_1.relative(file_system_1.dirname(entryPointBasePath), basePath);
                    exportFrom = entryPointBasePath !== basePath ? " from '" + relativePath + "'" : '';
                }
                // aliases should only be added in dts files as these are lost when rolling up dts file.
                var exportStatement = e.alias && isDtsFile ? e.alias + " as " + e.identifier : e.identifier;
                var exportStr = "\nexport {" + exportStatement + "}" + exportFrom + ";";
                output.append(exportStr);
            });
        };
        /**
         * Add the constants directly after the imports.
         */
        EsmRenderingFormatter.prototype.addConstants = function (output, constants, file) {
            if (constants === '') {
                return;
            }
            var insertionPoint = this.findEndOfImports(file);
            // Append the constants to the right of the insertion point, to ensure they get ordered after
            // added imports (those are appended left to the insertion point).
            output.appendRight(insertionPoint, '\n' + constants + '\n');
        };
        /**
         * Add the definitions directly after their decorated class.
         */
        EsmRenderingFormatter.prototype.addDefinitions = function (output, compiledClass, definitions) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class does not have a valid symbol: " + compiledClass.name);
            }
            var insertionPoint = classSymbol.valueDeclaration.getEnd();
            output.appendLeft(insertionPoint, '\n' + definitions);
        };
        /**
         * Remove static decorator properties from classes.
         */
        EsmRenderingFormatter.prototype.removeDecorators = function (output, decoratorsToRemove) {
            decoratorsToRemove.forEach(function (nodesToRemove, containerNode) {
                if (ts.isArrayLiteralExpression(containerNode)) {
                    var items = containerNode.elements;
                    if (items.length === nodesToRemove.length) {
                        // Remove the entire statement
                        var statement = findStatement(containerNode);
                        if (statement) {
                            output.remove(statement.getFullStart(), statement.getEnd());
                        }
                    }
                    else {
                        nodesToRemove.forEach(function (node) {
                            // remove any trailing comma
                            var end = (output.slice(node.getEnd(), node.getEnd() + 1) === ',') ?
                                node.getEnd() + 1 :
                                node.getEnd();
                            output.remove(node.getFullStart(), end);
                        });
                    }
                }
            });
        };
        /**
         * Rewrite the the IVY switch markers to indicate we are in IVY mode.
         */
        EsmRenderingFormatter.prototype.rewriteSwitchableDeclarations = function (outputText, sourceFile, declarations) {
            declarations.forEach(function (declaration) {
                var start = declaration.initializer.getStart();
                var end = declaration.initializer.getEnd();
                var replacement = declaration.initializer.text.replace(ngcc_host_1.PRE_R3_MARKER, ngcc_host_1.POST_R3_MARKER);
                outputText.overwrite(start, end, replacement);
            });
        };
        /**
         * Add the type parameters to the appropriate functions that return `ModuleWithProviders`
         * structures.
         *
         * This function will only get called on typings files.
         */
        EsmRenderingFormatter.prototype.addModuleWithProvidersParams = function (outputText, moduleWithProviders, importManager) {
            var _this = this;
            moduleWithProviders.forEach(function (info) {
                var ngModuleName = info.ngModule.node.name.text;
                var declarationFile = file_system_1.absoluteFromSourceFile(info.declaration.getSourceFile());
                var ngModuleFile = file_system_1.absoluteFromSourceFile(info.ngModule.node.getSourceFile());
                var importPath = info.ngModule.viaModule ||
                    (declarationFile !== ngModuleFile ?
                        utils_1.stripExtension("./" + file_system_1.relative(file_system_1.dirname(declarationFile), ngModuleFile)) :
                        null);
                var ngModule = generateImportString(importManager, importPath, ngModuleName);
                if (info.declaration.type) {
                    var typeName = info.declaration.type && ts.isTypeReferenceNode(info.declaration.type) ?
                        info.declaration.type.typeName :
                        null;
                    if (_this.isCoreModuleWithProvidersType(typeName)) {
                        // The declaration already returns `ModuleWithProvider` but it needs the `NgModule` type
                        // parameter adding.
                        outputText.overwrite(info.declaration.type.getStart(), info.declaration.type.getEnd(), "ModuleWithProviders<" + ngModule + ">");
                    }
                    else {
                        // The declaration returns an unknown type so we need to convert it to a union that
                        // includes the ngModule property.
                        var originalTypeString = info.declaration.type.getText();
                        outputText.overwrite(info.declaration.type.getStart(), info.declaration.type.getEnd(), "(" + originalTypeString + ")&{ngModule:" + ngModule + "}");
                    }
                }
                else {
                    // The declaration has no return type so provide one.
                    var lastToken = info.declaration.getLastToken();
                    var insertPoint = lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken ?
                        lastToken.getStart() :
                        info.declaration.getEnd();
                    outputText.appendLeft(insertPoint, ": " + generateImportString(importManager, '@angular/core', 'ModuleWithProviders') + "<" + ngModule + ">");
                }
            });
        };
        EsmRenderingFormatter.prototype.findEndOfImports = function (sf) {
            var e_1, _a;
            try {
                for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var stmt = _c.value;
                    if (!ts.isImportDeclaration(stmt) && !ts.isImportEqualsDeclaration(stmt) &&
                        !ts.isNamespaceImport(stmt)) {
                        return stmt.getStart();
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return 0;
        };
        /**
         * Check whether the given type is the core Angular `ModuleWithProviders` interface.
         * @param typeName The type to check.
         * @returns true if the type is the core Angular `ModuleWithProviders` interface.
         */
        EsmRenderingFormatter.prototype.isCoreModuleWithProvidersType = function (typeName) {
            var id = typeName && ts.isIdentifier(typeName) ? this.host.getImportOfIdentifier(typeName) : null;
            return (id && id.name === 'ModuleWithProviders' && (this.isCore || id.from === '@angular/core'));
        };
        return EsmRenderingFormatter;
    }());
    exports.EsmRenderingFormatter = EsmRenderingFormatter;
    function findStatement(node) {
        while (node) {
            if (ts.isExpressionStatement(node)) {
                return node;
            }
            node = node.parent;
        }
        return undefined;
    }
    function generateImportString(importManager, importPath, importName) {
        var importAs = importPath ? importManager.generateNamedImport(importPath, importName) : null;
        return importAs ? importAs.moduleImport + "." + importAs.symbol : "" + importName;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtX3JlbmRlcmluZ19mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL2VzbV9yZW5kZXJpbmdfZm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVFBLCtCQUFpQztJQUNqQywyRUFBeUc7SUFFekcsa0ZBQWlFO0lBRWpFLDJFQUFtSDtJQUluSCx3RUFBdUM7SUFFdkM7O09BRUc7SUFDSDtRQUNFLCtCQUFzQixJQUF3QixFQUFZLE1BQWU7WUFBbkQsU0FBSSxHQUFKLElBQUksQ0FBb0I7WUFBWSxXQUFNLEdBQU4sTUFBTSxDQUFTO1FBQUcsQ0FBQztRQUU3RTs7V0FFRztRQUNILDBDQUFVLEdBQVYsVUFBVyxNQUFtQixFQUFFLE9BQWlCLEVBQUUsRUFBaUI7WUFDbEUsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELElBQU0sZUFBZSxHQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsaUJBQWUsQ0FBQyxDQUFDLFNBQVMsZUFBVSxDQUFDLENBQUMsU0FBUyxTQUFNLEVBQXJELENBQXFELENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckYsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVEOztXQUVHO1FBQ0gsMENBQVUsR0FBVixVQUNJLE1BQW1CLEVBQUUsa0JBQWtDLEVBQUUsT0FBcUIsRUFDOUUsYUFBNEIsRUFBRSxJQUFtQjtZQUNuRCxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztnQkFDZixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7Z0JBQ3BCLElBQU0sU0FBUyxHQUFHLHNCQUFTLENBQUMsa0JB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ICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IE1hZ2ljU3RyaW5nIGZyb20gJ21hZ2ljLXN0cmluZyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7cmVsYXRpdmUsIGRpcm5hbWUsIEFic29sdXRlRnNQYXRoLCBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtJbXBvcnQsIEltcG9ydE1hbmFnZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy90cmFuc2xhdG9yJztcbmltcG9ydCB7aXNEdHNQYXRofSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5pbXBvcnQge0NvbXBpbGVkQ2xhc3N9IGZyb20gJy4uL2FuYWx5c2lzL2RlY29yYXRpb25fYW5hbHl6ZXInO1xuaW1wb3J0IHtOZ2NjUmVmbGVjdGlvbkhvc3QsIFBPU1RfUjNfTUFSS0VSLCBQUkVfUjNfTUFSS0VSLCBTd2l0Y2hhYmxlVmFyaWFibGVEZWNsYXJhdGlvbn0gZnJvbSAnLi4vaG9zdC9uZ2NjX2hvc3QnO1xuaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzSW5mb30gZnJvbSAnLi4vYW5hbHlzaXMvbW9kdWxlX3dpdGhfcHJvdmlkZXJzX2FuYWx5emVyJztcbmltcG9ydCB7RXhwb3J0SW5mb30gZnJvbSAnLi4vYW5hbHlzaXMvcHJpdmF0ZV9kZWNsYXJhdGlvbnNfYW5hbHl6ZXInO1xuaW1wb3J0IHtSZW5kZXJpbmdGb3JtYXR0ZXIsIFJlZHVuZGFudERlY29yYXRvck1hcH0gZnJvbSAnLi9yZW5kZXJpbmdfZm9ybWF0dGVyJztcbmltcG9ydCB7c3RyaXBFeHRlbnNpb259IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIEEgUmVuZGVyaW5nRm9ybWF0dGVyIHRoYXQgd29ya3Mgd2l0aCBFQ01BU2NyaXB0IE1vZHVsZSBpbXBvcnQgYW5kIGV4cG9ydCBzdGF0ZW1lbnRzLlxuICovXG5leHBvcnQgY2xhc3MgRXNtUmVuZGVyaW5nRm9ybWF0dGVyIGltcGxlbWVudHMgUmVuZGVyaW5nRm9ybWF0dGVyIHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGhvc3Q6IE5nY2NSZWZsZWN0aW9uSG9zdCwgcHJvdGVjdGVkIGlzQ29yZTogYm9vbGVhbikge31cblxuICAvKipcbiAgICogIEFkZCB0aGUgaW1wb3J0cyBhdCB0aGUgdG9wIG9mIHRoZSBmaWxlLCBhZnRlciBhbnkgaW1wb3J0cyB0aGF0IGFyZSBhbHJlYWR5IHRoZXJlLlxuICAgKi9cbiAgYWRkSW1wb3J0cyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBpbXBvcnRzOiBJbXBvcnRbXSwgc2Y6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IHRoaXMuZmluZEVuZE9mSW1wb3J0cyhzZik7XG4gICAgY29uc3QgcmVuZGVyZWRJbXBvcnRzID1cbiAgICAgICAgaW1wb3J0cy5tYXAoaSA9PiBgaW1wb3J0ICogYXMgJHtpLnF1YWxpZmllcn0gZnJvbSAnJHtpLnNwZWNpZmllcn0nO1xcbmApLmpvaW4oJycpO1xuICAgIG91dHB1dC5hcHBlbmRMZWZ0KGluc2VydGlvblBvaW50LCByZW5kZXJlZEltcG9ydHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgZXhwb3J0cyB0byB0aGUgZW5kIG9mIHRoZSBmaWxlLlxuICAgKi9cbiAgYWRkRXhwb3J0cyhcbiAgICAgIG91dHB1dDogTWFnaWNTdHJpbmcsIGVudHJ5UG9pbnRCYXNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIGV4cG9ydHM6IEV4cG9ydEluZm9bXSxcbiAgICAgIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIsIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBleHBvcnRzLmZvckVhY2goZSA9PiB7XG4gICAgICBsZXQgZXhwb3J0RnJvbSA9ICcnO1xuICAgICAgY29uc3QgaXNEdHNGaWxlID0gaXNEdHNQYXRoKGVudHJ5UG9pbnRCYXNlUGF0aCk7XG4gICAgICBjb25zdCBmcm9tID0gaXNEdHNGaWxlID8gZS5kdHNGcm9tIDogZS5mcm9tO1xuXG4gICAgICBpZiAoZnJvbSkge1xuICAgICAgICBjb25zdCBiYXNlUGF0aCA9IHN0cmlwRXh0ZW5zaW9uKGZyb20pO1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSAnLi8nICsgcmVsYXRpdmUoZGlybmFtZShlbnRyeVBvaW50QmFzZVBhdGgpLCBiYXNlUGF0aCk7XG4gICAgICAgIGV4cG9ydEZyb20gPSBlbnRyeVBvaW50QmFzZVBhdGggIT09IGJhc2VQYXRoID8gYCBmcm9tICcke3JlbGF0aXZlUGF0aH0nYCA6ICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBhbGlhc2VzIHNob3VsZCBvbmx5IGJlIGFkZGVkIGluIGR0cyBmaWxlcyBhcyB0aGVzZSBhcmUgbG9zdCB3aGVuIHJvbGxpbmcgdXAgZHRzIGZpbGUuXG4gICAgICBjb25zdCBleHBvcnRTdGF0ZW1lbnQgPSBlLmFsaWFzICYmIGlzRHRzRmlsZSA/IGAke2UuYWxpYXN9IGFzICR7ZS5pZGVudGlmaWVyfWAgOiBlLmlkZW50aWZpZXI7XG4gICAgICBjb25zdCBleHBvcnRTdHIgPSBgXFxuZXhwb3J0IHske2V4cG9ydFN0YXRlbWVudH19JHtleHBvcnRGcm9tfTtgO1xuICAgICAgb3V0cHV0LmFwcGVuZChleHBvcnRTdHIpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgY29uc3RhbnRzIGRpcmVjdGx5IGFmdGVyIHRoZSBpbXBvcnRzLlxuICAgKi9cbiAgYWRkQ29uc3RhbnRzKG91dHB1dDogTWFnaWNTdHJpbmcsIGNvbnN0YW50czogc3RyaW5nLCBmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgaWYgKGNvbnN0YW50cyA9PT0gJycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPSB0aGlzLmZpbmRFbmRPZkltcG9ydHMoZmlsZSk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNvbnN0YW50cyB0byB0aGUgcmlnaHQgb2YgdGhlIGluc2VydGlvbiBwb2ludCwgdG8gZW5zdXJlIHRoZXkgZ2V0IG9yZGVyZWQgYWZ0ZXJcbiAgICAvLyBhZGRlZCBpbXBvcnRzICh0aG9zZSBhcmUgYXBwZW5kZWQgbGVmdCB0byB0aGUgaW5zZXJ0aW9uIHBvaW50KS5cbiAgICBvdXRwdXQuYXBwZW5kUmlnaHQoaW5zZXJ0aW9uUG9pbnQsICdcXG4nICsgY29uc3RhbnRzICsgJ1xcbicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgZGVmaW5pdGlvbnMgZGlyZWN0bHkgYWZ0ZXIgdGhlaXIgZGVjb3JhdGVkIGNsYXNzLlxuICAgKi9cbiAgYWRkRGVmaW5pdGlvbnMob3V0cHV0OiBNYWdpY1N0cmluZywgY29tcGlsZWRDbGFzczogQ29tcGlsZWRDbGFzcywgZGVmaW5pdGlvbnM6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNsYXNzU3ltYm9sID0gdGhpcy5ob3N0LmdldENsYXNzU3ltYm9sKGNvbXBpbGVkQ2xhc3MuZGVjbGFyYXRpb24pO1xuICAgIGlmICghY2xhc3NTeW1ib2wpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcGlsZWQgY2xhc3MgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHN5bWJvbDogJHtjb21waWxlZENsYXNzLm5hbWV9YCk7XG4gICAgfVxuICAgIGNvbnN0IGluc2VydGlvblBvaW50ID0gY2xhc3NTeW1ib2wudmFsdWVEZWNsYXJhdGlvbiAhLmdldEVuZCgpO1xuICAgIG91dHB1dC5hcHBlbmRMZWZ0KGluc2VydGlvblBvaW50LCAnXFxuJyArIGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgc3RhdGljIGRlY29yYXRvciBwcm9wZXJ0aWVzIGZyb20gY2xhc3Nlcy5cbiAgICovXG4gIHJlbW92ZURlY29yYXRvcnMob3V0cHV0OiBNYWdpY1N0cmluZywgZGVjb3JhdG9yc1RvUmVtb3ZlOiBSZWR1bmRhbnREZWNvcmF0b3JNYXApOiB2b2lkIHtcbiAgICBkZWNvcmF0b3JzVG9SZW1vdmUuZm9yRWFjaCgobm9kZXNUb1JlbW92ZSwgY29udGFpbmVyTm9kZSkgPT4ge1xuICAgICAgaWYgKHRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihjb250YWluZXJOb2RlKSkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGNvbnRhaW5lck5vZGUuZWxlbWVudHM7XG4gICAgICAgIGlmIChpdGVtcy5sZW5ndGggPT09IG5vZGVzVG9SZW1vdmUubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBlbnRpcmUgc3RhdGVtZW50XG4gICAgICAgICAgY29uc3Qgc3RhdGVtZW50ID0gZmluZFN0YXRlbWVudChjb250YWluZXJOb2RlKTtcbiAgICAgICAgICBpZiAoc3RhdGVtZW50KSB7XG4gICAgICAgICAgICBvdXRwdXQucmVtb3ZlKHN0YXRlbWVudC5nZXRGdWxsU3RhcnQoKSwgc3RhdGVtZW50LmdldEVuZCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZXNUb1JlbW92ZS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGFueSB0cmFpbGluZyBjb21tYVxuICAgICAgICAgICAgY29uc3QgZW5kID0gKG91dHB1dC5zbGljZShub2RlLmdldEVuZCgpLCBub2RlLmdldEVuZCgpICsgMSkgPT09ICcsJykgP1xuICAgICAgICAgICAgICAgIG5vZGUuZ2V0RW5kKCkgKyAxIDpcbiAgICAgICAgICAgICAgICBub2RlLmdldEVuZCgpO1xuICAgICAgICAgICAgb3V0cHV0LnJlbW92ZShub2RlLmdldEZ1bGxTdGFydCgpLCBlbmQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV3cml0ZSB0aGUgdGhlIElWWSBzd2l0Y2ggbWFya2VycyB0byBpbmRpY2F0ZSB3ZSBhcmUgaW4gSVZZIG1vZGUuXG4gICAqL1xuICByZXdyaXRlU3dpdGNoYWJsZURlY2xhcmF0aW9ucyhcbiAgICAgIG91dHB1dFRleHQ6IE1hZ2ljU3RyaW5nLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLFxuICAgICAgZGVjbGFyYXRpb25zOiBTd2l0Y2hhYmxlVmFyaWFibGVEZWNsYXJhdGlvbltdKTogdm9pZCB7XG4gICAgZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xuICAgICAgY29uc3Qgc3RhcnQgPSBkZWNsYXJhdGlvbi5pbml0aWFsaXplci5nZXRTdGFydCgpO1xuICAgICAgY29uc3QgZW5kID0gZGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIuZ2V0RW5kKCk7XG4gICAgICBjb25zdCByZXBsYWNlbWVudCA9IGRlY2xhcmF0aW9uLmluaXRpYWxpemVyLnRleHQucmVwbGFjZShQUkVfUjNfTUFSS0VSLCBQT1NUX1IzX01BUktFUik7XG4gICAgICBvdXRwdXRUZXh0Lm92ZXJ3cml0ZShzdGFydCwgZW5kLCByZXBsYWNlbWVudCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHR5cGUgcGFyYW1ldGVycyB0byB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIGBNb2R1bGVXaXRoUHJvdmlkZXJzYFxuICAgKiBzdHJ1Y3R1cmVzLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgb25seSBnZXQgY2FsbGVkIG9uIHR5cGluZ3MgZmlsZXMuXG4gICAqL1xuICBhZGRNb2R1bGVXaXRoUHJvdmlkZXJzUGFyYW1zKFxuICAgICAgb3V0cHV0VGV4dDogTWFnaWNTdHJpbmcsIG1vZHVsZVdpdGhQcm92aWRlcnM6IE1vZHVsZVdpdGhQcm92aWRlcnNJbmZvW10sXG4gICAgICBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyKTogdm9pZCB7XG4gICAgbW9kdWxlV2l0aFByb3ZpZGVycy5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgY29uc3QgbmdNb2R1bGVOYW1lID0gaW5mby5uZ01vZHVsZS5ub2RlLm5hbWUudGV4dDtcbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9uRmlsZSA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoaW5mby5kZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkpO1xuICAgICAgY29uc3QgbmdNb2R1bGVGaWxlID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShpbmZvLm5nTW9kdWxlLm5vZGUuZ2V0U291cmNlRmlsZSgpKTtcbiAgICAgIGNvbnN0IGltcG9ydFBhdGggPSBpbmZvLm5nTW9kdWxlLnZpYU1vZHVsZSB8fFxuICAgICAgICAgIChkZWNsYXJhdGlvbkZpbGUgIT09IG5nTW9kdWxlRmlsZSA/XG4gICAgICAgICAgICAgICBzdHJpcEV4dGVuc2lvbihgLi8ke3JlbGF0aXZlKGRpcm5hbWUoZGVjbGFyYXRpb25GaWxlKSwgbmdNb2R1bGVGaWxlKX1gKSA6XG4gICAgICAgICAgICAgICBudWxsKTtcbiAgICAgIGNvbnN0IG5nTW9kdWxlID0gZ2VuZXJhdGVJbXBvcnRTdHJpbmcoaW1wb3J0TWFuYWdlciwgaW1wb3J0UGF0aCwgbmdNb2R1bGVOYW1lKTtcblxuICAgICAgaWYgKGluZm8uZGVjbGFyYXRpb24udHlwZSkge1xuICAgICAgICBjb25zdCB0eXBlTmFtZSA9IGluZm8uZGVjbGFyYXRpb24udHlwZSAmJiB0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKGluZm8uZGVjbGFyYXRpb24udHlwZSkgP1xuICAgICAgICAgICAgaW5mby5kZWNsYXJhdGlvbi50eXBlLnR5cGVOYW1lIDpcbiAgICAgICAgICAgIG51bGw7XG4gICAgICAgIGlmICh0aGlzLmlzQ29yZU1vZHVsZVdpdGhQcm92aWRlcnNUeXBlKHR5cGVOYW1lKSkge1xuICAgICAgICAgIC8vIFRoZSBkZWNsYXJhdGlvbiBhbHJlYWR5IHJldHVybnMgYE1vZHVsZVdpdGhQcm92aWRlcmAgYnV0IGl0IG5lZWRzIHRoZSBgTmdNb2R1bGVgIHR5cGVcbiAgICAgICAgICAvLyBwYXJhbWV0ZXIgYWRkaW5nLlxuICAgICAgICAgIG91dHB1dFRleHQub3ZlcndyaXRlKFxuICAgICAgICAgICAgICBpbmZvLmRlY2xhcmF0aW9uLnR5cGUuZ2V0U3RhcnQoKSwgaW5mby5kZWNsYXJhdGlvbi50eXBlLmdldEVuZCgpLFxuICAgICAgICAgICAgICBgTW9kdWxlV2l0aFByb3ZpZGVyczwke25nTW9kdWxlfT5gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGUgZGVjbGFyYXRpb24gcmV0dXJucyBhbiB1bmtub3duIHR5cGUgc28gd2UgbmVlZCB0byBjb252ZXJ0IGl0IHRvIGEgdW5pb24gdGhhdFxuICAgICAgICAgIC8vIGluY2x1ZGVzIHRoZSBuZ01vZHVsZSBwcm9wZXJ0eS5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFR5cGVTdHJpbmcgPSBpbmZvLmRlY2xhcmF0aW9uLnR5cGUuZ2V0VGV4dCgpO1xuICAgICAgICAgIG91dHB1dFRleHQub3ZlcndyaXRlKFxuICAgICAgICAgICAgICBpbmZvLmRlY2xhcmF0aW9uLnR5cGUuZ2V0U3RhcnQoKSwgaW5mby5kZWNsYXJhdGlvbi50eXBlLmdldEVuZCgpLFxuICAgICAgICAgICAgICBgKCR7b3JpZ2luYWxUeXBlU3RyaW5nfSkme25nTW9kdWxlOiR7bmdNb2R1bGV9fWApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgZGVjbGFyYXRpb24gaGFzIG5vIHJldHVybiB0eXBlIHNvIHByb3ZpZGUgb25lLlxuICAgICAgICBjb25zdCBsYXN0VG9rZW4gPSBpbmZvLmRlY2xhcmF0aW9uLmdldExhc3RUb2tlbigpO1xuICAgICAgICBjb25zdCBpbnNlcnRQb2ludCA9IGxhc3RUb2tlbiAmJiBsYXN0VG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5TZW1pY29sb25Ub2tlbiA/XG4gICAgICAgICAgICBsYXN0VG9rZW4uZ2V0U3RhcnQoKSA6XG4gICAgICAgICAgICBpbmZvLmRlY2xhcmF0aW9uLmdldEVuZCgpO1xuICAgICAgICBvdXRwdXRUZXh0LmFwcGVuZExlZnQoXG4gICAgICAgICAgICBpbnNlcnRQb2ludCxcbiAgICAgICAgICAgIGA6ICR7Z2VuZXJhdGVJbXBvcnRTdHJpbmcoaW1wb3J0TWFuYWdlciwgJ0Bhbmd1bGFyL2NvcmUnLCAnTW9kdWxlV2l0aFByb3ZpZGVycycpfTwke25nTW9kdWxlfT5gKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBmaW5kRW5kT2ZJbXBvcnRzKHNmOiB0cy5Tb3VyY2VGaWxlKTogbnVtYmVyIHtcbiAgICBmb3IgKGNvbnN0IHN0bXQgb2Ygc2Yuc3RhdGVtZW50cykge1xuICAgICAgaWYgKCF0cy5pc0ltcG9ydERlY2xhcmF0aW9uKHN0bXQpICYmICF0cy5pc0ltcG9ydEVxdWFsc0RlY2xhcmF0aW9uKHN0bXQpICYmXG4gICAgICAgICAgIXRzLmlzTmFtZXNwYWNlSW1wb3J0KHN0bXQpKSB7XG4gICAgICAgIHJldHVybiBzdG10LmdldFN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cblxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0eXBlIGlzIHRoZSBjb3JlIEFuZ3VsYXIgYE1vZHVsZVdpdGhQcm92aWRlcnNgIGludGVyZmFjZS5cbiAgICogQHBhcmFtIHR5cGVOYW1lIFRoZSB0eXBlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSB0eXBlIGlzIHRoZSBjb3JlIEFuZ3VsYXIgYE1vZHVsZVdpdGhQcm92aWRlcnNgIGludGVyZmFjZS5cbiAgICovXG4gIHByaXZhdGUgaXNDb3JlTW9kdWxlV2l0aFByb3ZpZGVyc1R5cGUodHlwZU5hbWU6IHRzLkVudGl0eU5hbWV8bnVsbCkge1xuICAgIGNvbnN0IGlkID1cbiAgICAgICAgdHlwZU5hbWUgJiYgdHMuaXNJZGVudGlmaWVyKHR5cGVOYW1lKSA/IHRoaXMuaG9zdC5nZXRJbXBvcnRPZklkZW50aWZpZXIodHlwZU5hbWUpIDogbnVsbDtcbiAgICByZXR1cm4gKFxuICAgICAgICBpZCAmJiBpZC5uYW1lID09PSAnTW9kdWxlV2l0aFByb3ZpZGVycycgJiYgKHRoaXMuaXNDb3JlIHx8IGlkLmZyb20gPT09ICdAYW5ndWxhci9jb3JlJykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRTdGF0ZW1lbnQobm9kZTogdHMuTm9kZSkge1xuICB3aGlsZSAobm9kZSkge1xuICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBub2RlID0gbm9kZS5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVJbXBvcnRTdHJpbmcoXG4gICAgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlciwgaW1wb3J0UGF0aDogc3RyaW5nIHwgbnVsbCwgaW1wb3J0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGltcG9ydEFzID0gaW1wb3J0UGF0aCA/IGltcG9ydE1hbmFnZXIuZ2VuZXJhdGVOYW1lZEltcG9ydChpbXBvcnRQYXRoLCBpbXBvcnROYW1lKSA6IG51bGw7XG4gIHJldHVybiBpbXBvcnRBcyA/IGAke2ltcG9ydEFzLm1vZHVsZUltcG9ydH0uJHtpbXBvcnRBcy5zeW1ib2x9YCA6IGAke2ltcG9ydE5hbWV9YDtcbn1cbiJdfQ==