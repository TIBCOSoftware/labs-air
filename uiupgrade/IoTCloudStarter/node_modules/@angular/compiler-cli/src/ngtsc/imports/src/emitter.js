(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/imports/src/emitter", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler/src/compiler", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/imports/src/find_export", "@angular/compiler-cli/src/ngtsc/imports/src/references"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var compiler_2 = require("@angular/compiler/src/compiler");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var find_export_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/find_export");
    var references_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/references");
    /**
     * Generates `Expression`s which refer to `Reference`s in a given context.
     *
     * A `ReferenceEmitter` uses one or more `ReferenceEmitStrategy` implementations to produce an
     * `Expression` which refers to a `Reference` in the context of a particular file.
     */
    var ReferenceEmitter = /** @class */ (function () {
        function ReferenceEmitter(strategies) {
            this.strategies = strategies;
        }
        ReferenceEmitter.prototype.emit = function (ref, context, importMode) {
            var e_1, _a;
            if (importMode === void 0) { importMode = references_1.ImportMode.UseExistingImport; }
            try {
                for (var _b = tslib_1.__values(this.strategies), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var strategy = _c.value;
                    var emitted = strategy.emit(ref, context, importMode);
                    if (emitted !== null) {
                        return emitted;
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
            throw new Error("Unable to write a reference to " + typescript_1.nodeNameForError(ref.node) + " in " + ref.node.getSourceFile().fileName + " from " + context.fileName);
        };
        return ReferenceEmitter;
    }());
    exports.ReferenceEmitter = ReferenceEmitter;
    /**
     * A `ReferenceEmitStrategy` which will refer to declarations by any local `ts.Identifier`s, if
     * such identifiers are available.
     */
    var LocalIdentifierStrategy = /** @class */ (function () {
        function LocalIdentifierStrategy() {
        }
        LocalIdentifierStrategy.prototype.emit = function (ref, context, importMode) {
            // If the emitter has specified ForceNewImport, then LocalIdentifierStrategy should not use a
            // local identifier at all, *except* in the source file where the node is actually declared.
            if (importMode === references_1.ImportMode.ForceNewImport &&
                typescript_1.getSourceFile(ref.node) !== typescript_1.getSourceFile(context)) {
                return null;
            }
            // A Reference can have multiple identities in different files, so it may already have an
            // Identifier in the requested context file.
            var identifier = ref.getIdentityIn(context);
            if (identifier !== null) {
                return new compiler_1.WrappedNodeExpr(identifier);
            }
            else {
                return null;
            }
        };
        return LocalIdentifierStrategy;
    }());
    exports.LocalIdentifierStrategy = LocalIdentifierStrategy;
    /**
     * A `ReferenceEmitStrategy` which will refer to declarations that come from `node_modules` using
     * an absolute import.
     *
     * Part of this strategy involves looking at the target entry point and identifying the exported
     * name of the targeted declaration, as it might be different from the declared name (e.g. a
     * directive might be declared as FooDirImpl, but exported as FooDir). If no export can be found
     * which maps back to the original directive, an error is thrown.
     */
    var AbsoluteModuleStrategy = /** @class */ (function () {
        function AbsoluteModuleStrategy(program, checker, options, host, reflectionHost) {
            this.program = program;
            this.checker = checker;
            this.options = options;
            this.host = host;
            this.reflectionHost = reflectionHost;
            /**
             * A cache of the exports of specific modules, because resolving a module to its exports is a
             * costly operation.
             */
            this.moduleExportsCache = new Map();
        }
        AbsoluteModuleStrategy.prototype.emit = function (ref, context, importMode) {
            if (ref.bestGuessOwningModule === null) {
                // There is no module name available for this Reference, meaning it was arrived at via a
                // relative path.
                return null;
            }
            else if (!typescript_1.isDeclaration(ref.node)) {
                // It's not possible to import something which isn't a declaration.
                throw new Error('Debug assert: importing a Reference to non-declaration?');
            }
            // Try to find the exported name of the declaration, if one is available.
            var _a = ref.bestGuessOwningModule, specifier = _a.specifier, resolutionContext = _a.resolutionContext;
            var symbolName = this.resolveImportName(specifier, ref.node, resolutionContext);
            if (symbolName === null) {
                // TODO(alxhub): make this error a ts.Diagnostic pointing at whatever caused this import to be
                // triggered.
                throw new Error("Symbol " + ref.debugName + " declared in " + typescript_1.getSourceFile(ref.node).fileName + " is not exported from " + specifier + " (import into " + context.fileName + ")");
            }
            return new compiler_1.ExternalExpr(new compiler_2.ExternalReference(specifier, symbolName));
        };
        AbsoluteModuleStrategy.prototype.resolveImportName = function (moduleName, target, fromFile) {
            var exports = this.getExportsOfModule(moduleName, fromFile);
            if (exports !== null && exports.has(target)) {
                return exports.get(target);
            }
            else {
                return null;
            }
        };
        AbsoluteModuleStrategy.prototype.getExportsOfModule = function (moduleName, fromFile) {
            if (!this.moduleExportsCache.has(moduleName)) {
                this.moduleExportsCache.set(moduleName, this.enumerateExportsOfModule(moduleName, fromFile));
            }
            return this.moduleExportsCache.get(moduleName);
        };
        AbsoluteModuleStrategy.prototype.enumerateExportsOfModule = function (specifier, fromFile) {
            // First, resolve the module specifier to its entry point, and get the ts.Symbol for it.
            var resolvedModule = typescript_1.resolveModuleName(specifier, fromFile, this.options, this.host);
            if (resolvedModule === undefined) {
                return null;
            }
            var entryPointFile = typescript_1.getSourceFileOrNull(this.program, file_system_1.absoluteFrom(resolvedModule.resolvedFileName));
            if (entryPointFile === null) {
                return null;
            }
            var exports = this.reflectionHost.getExportsOfModule(entryPointFile);
            if (exports === null) {
                return null;
            }
            var exportMap = new Map();
            exports.forEach(function (declaration, name) { exportMap.set(declaration.node, name); });
            return exportMap;
        };
        return AbsoluteModuleStrategy;
    }());
    exports.AbsoluteModuleStrategy = AbsoluteModuleStrategy;
    /**
     * A `ReferenceEmitStrategy` which will refer to declarations via relative paths, provided they're
     * both in the logical project "space" of paths.
     *
     * This is trickier than it sounds, as the two files may be in different root directories in the
     * project. Simply calculating a file system relative path between the two is not sufficient.
     * Instead, `LogicalProjectPath`s are used.
     */
    var LogicalProjectStrategy = /** @class */ (function () {
        function LogicalProjectStrategy(checker, logicalFs) {
            this.checker = checker;
            this.logicalFs = logicalFs;
        }
        LogicalProjectStrategy.prototype.emit = function (ref, context) {
            var destSf = typescript_1.getSourceFile(ref.node);
            // Compute the relative path from the importing file to the file being imported. This is done
            // as a logical path computation, because the two files might be in different rootDirs.
            var destPath = this.logicalFs.logicalPathOfSf(destSf);
            if (destPath === null) {
                // The imported file is not within the logical project filesystem.
                return null;
            }
            var originPath = this.logicalFs.logicalPathOfSf(context);
            if (originPath === null) {
                throw new Error("Debug assert: attempt to import from " + context.fileName + " but it's outside the program?");
            }
            // There's no way to emit a relative reference from a file to itself.
            if (destPath === originPath) {
                return null;
            }
            var name = find_export_1.findExportedNameOfNode(ref.node, destSf, this.checker);
            if (name === null) {
                // The target declaration isn't exported from the file it's declared in. This is an issue!
                return null;
            }
            // With both files expressed as LogicalProjectPaths, getting the module specifier as a relative
            // path is now straightforward.
            var moduleName = file_system_1.LogicalProjectPath.relativePathBetween(originPath, destPath);
            return new compiler_1.ExternalExpr({ moduleName: moduleName, name: name });
        };
        return LogicalProjectStrategy;
    }());
    exports.LogicalProjectStrategy = LogicalProjectStrategy;
    /**
     * A `ReferenceEmitStrategy` which uses a `FileToModuleHost` to generate absolute import references.
     */
    var FileToModuleStrategy = /** @class */ (function () {
        function FileToModuleStrategy(checker, fileToModuleHost) {
            this.checker = checker;
            this.fileToModuleHost = fileToModuleHost;
        }
        FileToModuleStrategy.prototype.emit = function (ref, context) {
            var destSf = typescript_1.getSourceFile(ref.node);
            var name = find_export_1.findExportedNameOfNode(ref.node, destSf, this.checker);
            if (name === null) {
                return null;
            }
            var moduleName = this.fileToModuleHost.fileNameToModuleName(destSf.fileName, context.fileName);
            return new compiler_1.ExternalExpr({ moduleName: moduleName, name: name });
        };
        return FileToModuleStrategy;
    }());
    exports.FileToModuleStrategy = FileToModuleStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvaW1wb3J0cy9zcmMvZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBNEU7SUFDNUUsMkRBQWlFO0lBRWpFLDJFQUFzRjtJQUV0RixrRkFBaUk7SUFDakksdUZBQXFEO0lBQ3JELHFGQUFtRDtJQXFDbkQ7Ozs7O09BS0c7SUFDSDtRQUNFLDBCQUFvQixVQUFtQztZQUFuQyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtRQUFHLENBQUM7UUFFM0QsK0JBQUksR0FBSixVQUNJLEdBQWMsRUFBRSxPQUFzQixFQUN0QyxVQUFxRDs7WUFBckQsMkJBQUEsRUFBQSxhQUF5Qix1QkFBVSxDQUFDLGlCQUFpQjs7Z0JBQ3ZELEtBQXVCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsVUFBVSxDQUFBLGdCQUFBLDRCQUFFO29CQUFuQyxJQUFNLFFBQVEsV0FBQTtvQkFDakIsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUN4RCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7d0JBQ3BCLE9BQU8sT0FBTyxDQUFDO3FCQUNoQjtpQkFDRjs7Ozs7Ozs7O1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FDWCxvQ0FBa0MsNkJBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxjQUFTLE9BQU8sQ0FBQyxRQUFVLENBQUMsQ0FBQztRQUN2SSxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBZkQsSUFlQztJQWZZLDRDQUFnQjtJQWlCN0I7OztPQUdHO0lBQ0g7UUFBQTtRQWtCQSxD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QUMsQ0FBQztZQUNoRixPQUFPLElBQUksdUJBQVksQ0FBQyxFQUFDLFVBQVUsWUFBQSxFQUFFLElBQUksTUFBQSxFQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQ0gsNkJBQUM7SUFBRCxDQUFDLEFBcENELElBb0NDO0lBcENZLHdEQUFzQjtJQXNDbkM7O09BRUc7SUFDSDtRQUNFLDhCQUFvQixPQUF1QixFQUFVLGdCQUFrQztZQUFuRSxZQUFPLEdBQVAsT0FBTyxDQUFnQjtZQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFBRyxDQUFDO1FBRTNGLG1DQUFJLEdBQUosVUFBSyxHQUF1QixFQUFFLE9BQXNCO1lBQ2xELElBQU0sTUFBTSxHQUFHLDBCQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLElBQU0sSUFBSSxHQUFHLG9DQUFzQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwRSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxJQUFNLFVBQVUsR0FDWixJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFbEYsT0FBTyxJQUFJLHVCQUFZLENBQUMsRUFBQyxVQUFVLFlBQUEsRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQWZELElBZUM7SUFmWSxvREFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0V4cHJlc3Npb24sIEV4dGVybmFsRXhwciwgV3JhcHBlZE5vZGVFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0V4dGVybmFsUmVmZXJlbmNlfSBmcm9tICdAYW5ndWxhci9jb21waWxlci9zcmMvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0xvZ2ljYWxGaWxlU3lzdGVtLCBMb2dpY2FsUHJvamVjdFBhdGgsIGFic29sdXRlRnJvbX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge2dldFNvdXJjZUZpbGUsIGdldFNvdXJjZUZpbGVPck51bGwsIGlzRGVjbGFyYXRpb24sIG5vZGVOYW1lRm9yRXJyb3IsIHJlc29sdmVNb2R1bGVOYW1lfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcbmltcG9ydCB7ZmluZEV4cG9ydGVkTmFtZU9mTm9kZX0gZnJvbSAnLi9maW5kX2V4cG9ydCc7XG5pbXBvcnQge0ltcG9ydE1vZGUsIFJlZmVyZW5jZX0gZnJvbSAnLi9yZWZlcmVuY2VzJztcblxuLyoqXG4gKiBBIGhvc3Qgd2hpY2ggc3VwcG9ydHMgYW4gb3BlcmF0aW9uIHRvIGNvbnZlcnQgYSBmaWxlIG5hbWUgaW50byBhIG1vZHVsZSBuYW1lLlxuICpcbiAqIFRoaXMgb3BlcmF0aW9uIGlzIHR5cGljYWxseSBpbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIHRoZSBjb21waWxlciBob3N0IHBhc3NlZCB0byBuZ3RzYyB3aGVuIHJ1bm5pbmdcbiAqIHVuZGVyIGEgYnVpbGQgdG9vbCBsaWtlIEJhemVsIG9yIEJsYXplLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVUb01vZHVsZUhvc3Qge1xuICBmaWxlTmFtZVRvTW9kdWxlTmFtZShpbXBvcnRlZEZpbGVQYXRoOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgcGFydGljdWxhciBzdHJhdGVneSBmb3IgZ2VuZXJhdGluZyBhbiBleHByZXNzaW9uIHdoaWNoIHJlZmVycyB0byBhIGBSZWZlcmVuY2VgLlxuICpcbiAqIFRoZXJlIGFyZSBtYW55IHBvdGVudGlhbCB3YXlzIGEgZ2l2ZW4gYFJlZmVyZW5jZWAgY291bGQgYmUgcmVmZXJyZWQgdG8gaW4gdGhlIGNvbnRleHQgb2YgYSBnaXZlblxuICogZmlsZS4gQSBsb2NhbCBkZWNsYXJhdGlvbiBjb3VsZCBiZSBhdmFpbGFibGUsIHRoZSBgUmVmZXJlbmNlYCBjb3VsZCBiZSBpbXBvcnRhYmxlIHZpYSBhIHJlbGF0aXZlXG4gKiBpbXBvcnQgd2l0aGluIHRoZSBwcm9qZWN0LCBvciBhbiBhYnNvbHV0ZSBpbXBvcnQgaW50byBgbm9kZV9tb2R1bGVzYCBtaWdodCBiZSBuZWNlc3NhcnkuXG4gKlxuICogRGlmZmVyZW50IGBSZWZlcmVuY2VFbWl0U3RyYXRlZ3lgIGltcGxlbWVudGF0aW9ucyBpbXBsZW1lbnQgc3BlY2lmaWMgbG9naWMgZm9yIGdlbmVyYXRpbmcgc3VjaFxuICogcmVmZXJlbmNlcy4gQSBzaW5nbGUgc3RyYXRlZ3kgKHN1Y2ggYXMgdXNpbmcgYSBsb2NhbCBkZWNsYXJhdGlvbikgbWF5IG5vdCBhbHdheXMgYmUgYWJsZSB0b1xuICogZ2VuZXJhdGUgYW4gZXhwcmVzc2lvbiBmb3IgZXZlcnkgYFJlZmVyZW5jZWAgKGZvciBleGFtcGxlLCBpZiBubyBsb2NhbCBpZGVudGlmaWVyIGlzIGF2YWlsYWJsZSksXG4gKiBhbmQgbWF5IHJldHVybiBgbnVsbGAgaW4gc3VjaCBhIGNhc2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVmZXJlbmNlRW1pdFN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIEVtaXQgYW4gYEV4cHJlc3Npb25gIHdoaWNoIHJlZmVycyB0byB0aGUgZ2l2ZW4gYFJlZmVyZW5jZWAgaW4gdGhlIGNvbnRleHQgb2YgYSBwYXJ0aWN1bGFyXG4gICAqIHNvdXJjZSBmaWxlLCBpZiBwb3NzaWJsZS5cbiAgICpcbiAgICogQHBhcmFtIHJlZiB0aGUgYFJlZmVyZW5jZWAgZm9yIHdoaWNoIHRvIGdlbmVyYXRlIGFuIGV4cHJlc3Npb25cbiAgICogQHBhcmFtIGNvbnRleHQgdGhlIHNvdXJjZSBmaWxlIGluIHdoaWNoIHRoZSBgRXhwcmVzc2lvbmAgbXVzdCBiZSB2YWxpZFxuICAgKiBAcGFyYW0gaW1wb3J0TW9kZSBhIGZsYWcgd2hpY2ggY29udHJvbHMgd2hldGhlciBpbXBvcnRzIHNob3VsZCBiZSBnZW5lcmF0ZWQgb3Igbm90XG4gICAqIEByZXR1cm5zIGFuIGBFeHByZXNzaW9uYCB3aGljaCByZWZlcnMgdG8gdGhlIGBSZWZlcmVuY2VgLCBvciBgbnVsbGAgaWYgbm9uZSBjYW4gYmUgZ2VuZXJhdGVkXG4gICAqL1xuICBlbWl0KHJlZjogUmVmZXJlbmNlLCBjb250ZXh0OiB0cy5Tb3VyY2VGaWxlLCBpbXBvcnRNb2RlOiBJbXBvcnRNb2RlKTogRXhwcmVzc2lvbnxudWxsO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBgRXhwcmVzc2lvbmBzIHdoaWNoIHJlZmVyIHRvIGBSZWZlcmVuY2VgcyBpbiBhIGdpdmVuIGNvbnRleHQuXG4gKlxuICogQSBgUmVmZXJlbmNlRW1pdHRlcmAgdXNlcyBvbmUgb3IgbW9yZSBgUmVmZXJlbmNlRW1pdFN0cmF0ZWd5YCBpbXBsZW1lbnRhdGlvbnMgdG8gcHJvZHVjZSBhblxuICogYEV4cHJlc3Npb25gIHdoaWNoIHJlZmVycyB0byBhIGBSZWZlcmVuY2VgIGluIHRoZSBjb250ZXh0IG9mIGEgcGFydGljdWxhciBmaWxlLlxuICovXG5leHBvcnQgY2xhc3MgUmVmZXJlbmNlRW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc3RyYXRlZ2llczogUmVmZXJlbmNlRW1pdFN0cmF0ZWd5W10pIHt9XG5cbiAgZW1pdChcbiAgICAgIHJlZjogUmVmZXJlbmNlLCBjb250ZXh0OiB0cy5Tb3VyY2VGaWxlLFxuICAgICAgaW1wb3J0TW9kZTogSW1wb3J0TW9kZcKgPSBJbXBvcnRNb2RlLlVzZUV4aXN0aW5nSW1wb3J0KTogRXhwcmVzc2lvbiB7XG4gICAgZm9yIChjb25zdCBzdHJhdGVneSBvZiB0aGlzLnN0cmF0ZWdpZXMpIHtcbiAgICAgIGNvbnN0IGVtaXR0ZWQgPSBzdHJhdGVneS5lbWl0KHJlZiwgY29udGV4dCwgaW1wb3J0TW9kZSk7XG4gICAgICBpZiAoZW1pdHRlZCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZW1pdHRlZDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIHdyaXRlIGEgcmVmZXJlbmNlIHRvICR7bm9kZU5hbWVGb3JFcnJvcihyZWYubm9kZSl9IGluICR7cmVmLm5vZGUuZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lfSBmcm9tICR7Y29udGV4dC5maWxlTmFtZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgYFJlZmVyZW5jZUVtaXRTdHJhdGVneWAgd2hpY2ggd2lsbCByZWZlciB0byBkZWNsYXJhdGlvbnMgYnkgYW55IGxvY2FsIGB0cy5JZGVudGlmaWVyYHMsIGlmXG4gKiBzdWNoIGlkZW50aWZpZXJzIGFyZSBhdmFpbGFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbElkZW50aWZpZXJTdHJhdGVneSBpbXBsZW1lbnRzIFJlZmVyZW5jZUVtaXRTdHJhdGVneSB7XG4gIGVtaXQocmVmOiBSZWZlcmVuY2U8dHMuTm9kZT4sIGNvbnRleHQ6IHRzLlNvdXJjZUZpbGUsIGltcG9ydE1vZGU6IEltcG9ydE1vZGUpOiBFeHByZXNzaW9ufG51bGwge1xuICAgIC8vIElmIHRoZSBlbWl0dGVyIGhhcyBzcGVjaWZpZWQgRm9yY2VOZXdJbXBvcnQsIHRoZW4gTG9jYWxJZGVudGlmaWVyU3RyYXRlZ3kgc2hvdWxkIG5vdCB1c2UgYVxuICAgIC8vIGxvY2FsIGlkZW50aWZpZXIgYXQgYWxsLCAqZXhjZXB0KiBpbiB0aGUgc291cmNlIGZpbGUgd2hlcmUgdGhlIG5vZGUgaXMgYWN0dWFsbHkgZGVjbGFyZWQuXG4gICAgaWYgKGltcG9ydE1vZGUgPT09IEltcG9ydE1vZGUuRm9yY2VOZXdJbXBvcnQgJiZcbiAgICAgICAgZ2V0U291cmNlRmlsZShyZWYubm9kZSkgIT09IGdldFNvdXJjZUZpbGUoY29udGV4dCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEEgUmVmZXJlbmNlIGNhbiBoYXZlIG11bHRpcGxlIGlkZW50aXRpZXMgaW4gZGlmZmVyZW50IGZpbGVzLCBzbyBpdCBtYXkgYWxyZWFkeSBoYXZlIGFuXG4gICAgLy8gSWRlbnRpZmllciBpbiB0aGUgcmVxdWVzdGVkIGNvbnRleHQgZmlsZS5cbiAgICBjb25zdCBpZGVudGlmaWVyID0gcmVmLmdldElkZW50aXR5SW4oY29udGV4dCk7XG4gICAgaWYgKGlkZW50aWZpZXIgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgV3JhcHBlZE5vZGVFeHByKGlkZW50aWZpZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBIGBSZWZlcmVuY2VFbWl0U3RyYXRlZ3lgIHdoaWNoIHdpbGwgcmVmZXIgdG8gZGVjbGFyYXRpb25zIHRoYXQgY29tZSBmcm9tIGBub2RlX21vZHVsZXNgIHVzaW5nXG4gKiBhbiBhYnNvbHV0ZSBpbXBvcnQuXG4gKlxuICogUGFydCBvZiB0aGlzIHN0cmF0ZWd5IGludm9sdmVzIGxvb2tpbmcgYXQgdGhlIHRhcmdldCBlbnRyeSBwb2ludCBhbmQgaWRlbnRpZnlpbmcgdGhlIGV4cG9ydGVkXG4gKiBuYW1lIG9mIHRoZSB0YXJnZXRlZCBkZWNsYXJhdGlvbiwgYXMgaXQgbWlnaHQgYmUgZGlmZmVyZW50IGZyb20gdGhlIGRlY2xhcmVkIG5hbWUgKGUuZy4gYVxuICogZGlyZWN0aXZlIG1pZ2h0IGJlIGRlY2xhcmVkIGFzIEZvb0RpckltcGwsIGJ1dCBleHBvcnRlZCBhcyBGb29EaXIpLiBJZiBubyBleHBvcnQgY2FuIGJlIGZvdW5kXG4gKiB3aGljaCBtYXBzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIGRpcmVjdGl2ZSwgYW4gZXJyb3IgaXMgdGhyb3duLlxuICovXG5leHBvcnQgY2xhc3MgQWJzb2x1dGVNb2R1bGVTdHJhdGVneSBpbXBsZW1lbnRzIFJlZmVyZW5jZUVtaXRTdHJhdGVneSB7XG4gIC8qKlxuICAgKiBBIGNhY2hlIG9mIHRoZSBleHBvcnRzIG9mIHNwZWNpZmljIG1vZHVsZXMsIGJlY2F1c2UgcmVzb2x2aW5nIGEgbW9kdWxlIHRvIGl0cyBleHBvcnRzIGlzIGFcbiAgICogY29zdGx5IG9wZXJhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgbW9kdWxlRXhwb3J0c0NhY2hlID0gbmV3IE1hcDxzdHJpbmcsIE1hcDx0cy5EZWNsYXJhdGlvbiwgc3RyaW5nPnxudWxsPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHByb2dyYW06IHRzLlByb2dyYW0sIHByb3RlY3RlZCBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlcixcbiAgICAgIHByb3RlY3RlZCBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIHByb3RlY3RlZCBob3N0OiB0cy5Db21waWxlckhvc3QsXG4gICAgICBwcml2YXRlIHJlZmxlY3Rpb25Ib3N0OiBSZWZsZWN0aW9uSG9zdCkge31cblxuICBlbWl0KHJlZjogUmVmZXJlbmNlPHRzLk5vZGU+LCBjb250ZXh0OiB0cy5Tb3VyY2VGaWxlLCBpbXBvcnRNb2RlOiBJbXBvcnRNb2RlKTogRXhwcmVzc2lvbnxudWxsIHtcbiAgICBpZiAocmVmLmJlc3RHdWVzc093bmluZ01vZHVsZSA9PT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gbW9kdWxlIG5hbWUgYXZhaWxhYmxlIGZvciB0aGlzIFJlZmVyZW5jZSwgbWVhbmluZyBpdCB3YXMgYXJyaXZlZCBhdCB2aWEgYVxuICAgICAgLy8gcmVsYXRpdmUgcGF0aC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoIWlzRGVjbGFyYXRpb24ocmVmLm5vZGUpKSB7XG4gICAgICAvLyBJdCdzIG5vdCBwb3NzaWJsZSB0byBpbXBvcnQgc29tZXRoaW5nIHdoaWNoIGlzbid0IGEgZGVjbGFyYXRpb24uXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RlYnVnIGFzc2VydDogaW1wb3J0aW5nIGEgUmVmZXJlbmNlIHRvIG5vbi1kZWNsYXJhdGlvbj8nKTtcbiAgICB9XG5cbiAgICAvLyBUcnkgdG8gZmluZCB0aGUgZXhwb3J0ZWQgbmFtZSBvZiB0aGUgZGVjbGFyYXRpb24sIGlmIG9uZSBpcyBhdmFpbGFibGUuXG4gICAgY29uc3Qge3NwZWNpZmllciwgcmVzb2x1dGlvbkNvbnRleHR9ID0gcmVmLmJlc3RHdWVzc093bmluZ01vZHVsZTtcbiAgICBjb25zdCBzeW1ib2xOYW1lID0gdGhpcy5yZXNvbHZlSW1wb3J0TmFtZShzcGVjaWZpZXIsIHJlZi5ub2RlLCByZXNvbHV0aW9uQ29udGV4dCk7XG4gICAgaWYgKHN5bWJvbE5hbWUgPT09IG51bGwpIHtcbiAgICAgIC8vIFRPRE8oYWx4aHViKTogbWFrZSB0aGlzIGVycm9yIGEgdHMuRGlhZ25vc3RpYyBwb2ludGluZyBhdCB3aGF0ZXZlciBjYXVzZWQgdGhpcyBpbXBvcnQgdG8gYmVcbiAgICAgIC8vIHRyaWdnZXJlZC5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgU3ltYm9sICR7cmVmLmRlYnVnTmFtZX0gZGVjbGFyZWQgaW4gJHtnZXRTb3VyY2VGaWxlKHJlZi5ub2RlKS5maWxlTmFtZX0gaXMgbm90IGV4cG9ydGVkIGZyb20gJHtzcGVjaWZpZXJ9IChpbXBvcnQgaW50byAke2NvbnRleHQuZmlsZU5hbWV9KWApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRXh0ZXJuYWxFeHByKG5ldyBFeHRlcm5hbFJlZmVyZW5jZShzcGVjaWZpZXIsIHN5bWJvbE5hbWUpKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZUltcG9ydE5hbWUobW9kdWxlTmFtZTogc3RyaW5nLCB0YXJnZXQ6IHRzLkRlY2xhcmF0aW9uLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nXG4gICAgICB8bnVsbCB7XG4gICAgY29uc3QgZXhwb3J0cyA9IHRoaXMuZ2V0RXhwb3J0c09mTW9kdWxlKG1vZHVsZU5hbWUsIGZyb21GaWxlKTtcbiAgICBpZiAoZXhwb3J0cyAhPT0gbnVsbCAmJiBleHBvcnRzLmhhcyh0YXJnZXQpKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5nZXQodGFyZ2V0KSAhO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldEV4cG9ydHNPZk1vZHVsZShtb2R1bGVOYW1lOiBzdHJpbmcsIGZyb21GaWxlOiBzdHJpbmcpOlxuICAgICAgTWFwPHRzLkRlY2xhcmF0aW9uLCBzdHJpbmc+fG51bGwge1xuICAgIGlmICghdGhpcy5tb2R1bGVFeHBvcnRzQ2FjaGUuaGFzKG1vZHVsZU5hbWUpKSB7XG4gICAgICB0aGlzLm1vZHVsZUV4cG9ydHNDYWNoZS5zZXQobW9kdWxlTmFtZSwgdGhpcy5lbnVtZXJhdGVFeHBvcnRzT2ZNb2R1bGUobW9kdWxlTmFtZSwgZnJvbUZpbGUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubW9kdWxlRXhwb3J0c0NhY2hlLmdldChtb2R1bGVOYW1lKSAhO1xuICB9XG5cbiAgcHJvdGVjdGVkIGVudW1lcmF0ZUV4cG9ydHNPZk1vZHVsZShzcGVjaWZpZXI6IHN0cmluZywgZnJvbUZpbGU6IHN0cmluZyk6XG4gICAgICBNYXA8dHMuRGVjbGFyYXRpb24sIHN0cmluZz58bnVsbCB7XG4gICAgLy8gRmlyc3QsIHJlc29sdmUgdGhlIG1vZHVsZSBzcGVjaWZpZXIgdG8gaXRzIGVudHJ5IHBvaW50LCBhbmQgZ2V0IHRoZSB0cy5TeW1ib2wgZm9yIGl0LlxuICAgIGNvbnN0IHJlc29sdmVkTW9kdWxlID0gcmVzb2x2ZU1vZHVsZU5hbWUoc3BlY2lmaWVyLCBmcm9tRmlsZSwgdGhpcy5vcHRpb25zLCB0aGlzLmhvc3QpO1xuICAgIGlmIChyZXNvbHZlZE1vZHVsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBlbnRyeVBvaW50RmlsZSA9XG4gICAgICAgIGdldFNvdXJjZUZpbGVPck51bGwodGhpcy5wcm9ncmFtLCBhYnNvbHV0ZUZyb20ocmVzb2x2ZWRNb2R1bGUucmVzb2x2ZWRGaWxlTmFtZSkpO1xuICAgIGlmIChlbnRyeVBvaW50RmlsZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwb3J0cyA9IHRoaXMucmVmbGVjdGlvbkhvc3QuZ2V0RXhwb3J0c09mTW9kdWxlKGVudHJ5UG9pbnRGaWxlKTtcbiAgICBpZiAoZXhwb3J0cyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGV4cG9ydE1hcCA9IG5ldyBNYXA8dHMuRGVjbGFyYXRpb24sIHN0cmluZz4oKTtcbiAgICBleHBvcnRzLmZvckVhY2goKGRlY2xhcmF0aW9uLCBuYW1lKSA9PiB7IGV4cG9ydE1hcC5zZXQoZGVjbGFyYXRpb24ubm9kZSwgbmFtZSk7IH0pO1xuICAgIHJldHVybiBleHBvcnRNYXA7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGBSZWZlcmVuY2VFbWl0U3RyYXRlZ3lgIHdoaWNoIHdpbGwgcmVmZXIgdG8gZGVjbGFyYXRpb25zIHZpYSByZWxhdGl2ZSBwYXRocywgcHJvdmlkZWQgdGhleSdyZVxuICogYm90aCBpbiB0aGUgbG9naWNhbCBwcm9qZWN0IFwic3BhY2VcIiBvZiBwYXRocy5cbiAqXG4gKiBUaGlzIGlzIHRyaWNraWVyIHRoYW4gaXQgc291bmRzLCBhcyB0aGUgdHdvIGZpbGVzIG1heSBiZSBpbiBkaWZmZXJlbnQgcm9vdCBkaXJlY3RvcmllcyBpbiB0aGVcbiAqIHByb2plY3QuIFNpbXBseSBjYWxjdWxhdGluZyBhIGZpbGUgc3lzdGVtIHJlbGF0aXZlIHBhdGggYmV0d2VlbiB0aGUgdHdvIGlzIG5vdCBzdWZmaWNpZW50LlxuICogSW5zdGVhZCwgYExvZ2ljYWxQcm9qZWN0UGF0aGBzIGFyZSB1c2VkLlxuICovXG5leHBvcnQgY2xhc3MgTG9naWNhbFByb2plY3RTdHJhdGVneSBpbXBsZW1lbnRzIFJlZmVyZW5jZUVtaXRTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIHByaXZhdGUgbG9naWNhbEZzOiBMb2dpY2FsRmlsZVN5c3RlbSkge31cblxuICBlbWl0KHJlZjogUmVmZXJlbmNlPHRzLk5vZGU+LCBjb250ZXh0OiB0cy5Tb3VyY2VGaWxlKTogRXhwcmVzc2lvbnxudWxsIHtcbiAgICBjb25zdCBkZXN0U2YgPSBnZXRTb3VyY2VGaWxlKHJlZi5ub2RlKTtcblxuICAgIC8vIENvbXB1dGUgdGhlIHJlbGF0aXZlIHBhdGggZnJvbSB0aGUgaW1wb3J0aW5nIGZpbGUgdG8gdGhlIGZpbGUgYmVpbmcgaW1wb3J0ZWQuIFRoaXMgaXMgZG9uZVxuICAgIC8vIGFzIGEgbG9naWNhbCBwYXRoIGNvbXB1dGF0aW9uLCBiZWNhdXNlIHRoZSB0d28gZmlsZXMgbWlnaHQgYmUgaW4gZGlmZmVyZW50IHJvb3REaXJzLlxuICAgIGNvbnN0IGRlc3RQYXRoID0gdGhpcy5sb2dpY2FsRnMubG9naWNhbFBhdGhPZlNmKGRlc3RTZik7XG4gICAgaWYgKGRlc3RQYXRoID09PSBudWxsKSB7XG4gICAgICAvLyBUaGUgaW1wb3J0ZWQgZmlsZSBpcyBub3Qgd2l0aGluIHRoZSBsb2dpY2FsIHByb2plY3QgZmlsZXN5c3RlbS5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdpblBhdGggPSB0aGlzLmxvZ2ljYWxGcy5sb2dpY2FsUGF0aE9mU2YoY29udGV4dCk7XG4gICAgaWYgKG9yaWdpblBhdGggPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRGVidWcgYXNzZXJ0OiBhdHRlbXB0IHRvIGltcG9ydCBmcm9tICR7Y29udGV4dC5maWxlTmFtZX0gYnV0IGl0J3Mgb3V0c2lkZSB0aGUgcHJvZ3JhbT9gKTtcbiAgICB9XG5cbiAgICAvLyBUaGVyZSdzIG5vIHdheSB0byBlbWl0IGEgcmVsYXRpdmUgcmVmZXJlbmNlIGZyb20gYSBmaWxlIHRvIGl0c2VsZi5cbiAgICBpZiAoZGVzdFBhdGggPT09IG9yaWdpblBhdGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG5hbWUgPSBmaW5kRXhwb3J0ZWROYW1lT2ZOb2RlKHJlZi5ub2RlLCBkZXN0U2YsIHRoaXMuY2hlY2tlcik7XG4gICAgaWYgKG5hbWUgPT09IG51bGwpIHtcbiAgICAgIC8vIFRoZSB0YXJnZXQgZGVjbGFyYXRpb24gaXNuJ3QgZXhwb3J0ZWQgZnJvbSB0aGUgZmlsZSBpdCdzIGRlY2xhcmVkIGluLiBUaGlzIGlzIGFuIGlzc3VlIVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2l0aCBib3RoIGZpbGVzIGV4cHJlc3NlZCBhcyBMb2dpY2FsUHJvamVjdFBhdGhzLCBnZXR0aW5nIHRoZSBtb2R1bGUgc3BlY2lmaWVyIGFzIGEgcmVsYXRpdmVcbiAgICAvLyBwYXRoIGlzIG5vdyBzdHJhaWdodGZvcndhcmQuXG4gICAgY29uc3QgbW9kdWxlTmFtZSA9IExvZ2ljYWxQcm9qZWN0UGF0aC5yZWxhdGl2ZVBhdGhCZXR3ZWVuKG9yaWdpblBhdGgsIGRlc3RQYXRoKTtcbiAgICByZXR1cm4gbmV3IEV4dGVybmFsRXhwcih7bW9kdWxlTmFtZSwgbmFtZX0pO1xuICB9XG59XG5cbi8qKlxuICogQSBgUmVmZXJlbmNlRW1pdFN0cmF0ZWd5YCB3aGljaCB1c2VzIGEgYEZpbGVUb01vZHVsZUhvc3RgIHRvIGdlbmVyYXRlIGFic29sdXRlIGltcG9ydCByZWZlcmVuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgRmlsZVRvTW9kdWxlU3RyYXRlZ3kgaW1wbGVtZW50cyBSZWZlcmVuY2VFbWl0U3RyYXRlZ3kge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIGZpbGVUb01vZHVsZUhvc3Q6IEZpbGVUb01vZHVsZUhvc3QpIHt9XG5cbiAgZW1pdChyZWY6IFJlZmVyZW5jZTx0cy5Ob2RlPiwgY29udGV4dDogdHMuU291cmNlRmlsZSk6IEV4cHJlc3Npb258bnVsbCB7XG4gICAgY29uc3QgZGVzdFNmID0gZ2V0U291cmNlRmlsZShyZWYubm9kZSk7XG4gICAgY29uc3QgbmFtZSA9IGZpbmRFeHBvcnRlZE5hbWVPZk5vZGUocmVmLm5vZGUsIGRlc3RTZiwgdGhpcy5jaGVja2VyKTtcbiAgICBpZiAobmFtZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kdWxlTmFtZSA9XG4gICAgICAgIHRoaXMuZmlsZVRvTW9kdWxlSG9zdC5maWxlTmFtZVRvTW9kdWxlTmFtZShkZXN0U2YuZmlsZU5hbWUsIGNvbnRleHQuZmlsZU5hbWUpO1xuXG4gICAgcmV0dXJuIG5ldyBFeHRlcm5hbEV4cHIoe21vZHVsZU5hbWUsIG5hbWV9KTtcbiAgfVxufVxuIl19