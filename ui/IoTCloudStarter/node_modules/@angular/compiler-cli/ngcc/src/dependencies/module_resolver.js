/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/module_resolver", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * This is a very cut-down implementation of the TypeScript module resolution strategy.
     *
     * It is specific to the needs of ngcc and is not intended to be a drop-in replacement
     * for the TS module resolver. It is used to compute the dependencies between entry-points
     * that may be compiled by ngcc.
     *
     * The algorithm only finds `.js` files for internal/relative imports and paths to
     * the folder containing the `package.json` of the entry-point for external imports.
     *
     * It can cope with nested `node_modules` folders and also supports `paths`/`baseUrl`
     * configuration properties, as provided in a `ts.CompilerOptions` object.
     */
    var ModuleResolver = /** @class */ (function () {
        function ModuleResolver(fs, pathMappings, relativeExtensions) {
            if (relativeExtensions === void 0) { relativeExtensions = [
                '.js', '/index.js'
            ]; }
            this.fs = fs;
            this.relativeExtensions = relativeExtensions;
            this.pathMappings = pathMappings ? this.processPathMappings(pathMappings) : [];
        }
        /**
         * Resolve an absolute path for the `moduleName` imported into a file at `fromPath`.
         * @param moduleName The name of the import to resolve.
         * @param fromPath The path to the file containing the import.
         * @returns A path to the resolved module or null if missing.
         * Specifically:
         *  * the absolute path to the package.json of an external module
         *  * a JavaScript file of an internal module
         *  * null if none exists.
         */
        ModuleResolver.prototype.resolveModuleImport = function (moduleName, fromPath) {
            if (utils_1.isRelativePath(moduleName)) {
                return this.resolveAsRelativePath(moduleName, fromPath);
            }
            else {
                return this.pathMappings.length && this.resolveByPathMappings(moduleName, fromPath) ||
                    this.resolveAsEntryPoint(moduleName, fromPath);
            }
        };
        /**
         * Convert the `pathMappings` into a collection of `PathMapper` functions.
         */
        ModuleResolver.prototype.processPathMappings = function (pathMappings) {
            var baseUrl = file_system_1.absoluteFrom(pathMappings.baseUrl);
            return Object.keys(pathMappings.paths).map(function (pathPattern) {
                var matcher = splitOnStar(pathPattern);
                var templates = pathMappings.paths[pathPattern].map(splitOnStar);
                return { matcher: matcher, templates: templates, baseUrl: baseUrl };
            });
        };
        /**
         * Try to resolve a module name, as a relative path, from the `fromPath`.
         *
         * As it is relative, it only looks for files that end in one of the `relativeExtensions`.
         * For example: `${moduleName}.js` or `${moduleName}/index.js`.
         * If neither of these files exist then the method returns `null`.
         */
        ModuleResolver.prototype.resolveAsRelativePath = function (moduleName, fromPath) {
            var resolvedPath = this.resolvePath(file_system_1.resolve(file_system_1.dirname(fromPath), moduleName), this.relativeExtensions);
            return resolvedPath && new ResolvedRelativeModule(resolvedPath);
        };
        /**
         * Try to resolve the `moduleName`, by applying the computed `pathMappings` and
         * then trying to resolve the mapped path as a relative or external import.
         *
         * Whether the mapped path is relative is defined as it being "below the `fromPath`" and not
         * containing `node_modules`.
         *
         * If the mapped path is not relative but does not resolve to an external entry-point, then we
         * check whether it would have resolved to a relative path, in which case it is marked as a
         * "deep-import".
         */
        ModuleResolver.prototype.resolveByPathMappings = function (moduleName, fromPath) {
            var e_1, _a;
            var mappedPaths = this.findMappedPaths(moduleName);
            if (mappedPaths.length > 0) {
                var packagePath = this.findPackagePath(fromPath);
                if (packagePath !== null) {
                    try {
                        for (var mappedPaths_1 = tslib_1.__values(mappedPaths), mappedPaths_1_1 = mappedPaths_1.next(); !mappedPaths_1_1.done; mappedPaths_1_1 = mappedPaths_1.next()) {
                            var mappedPath = mappedPaths_1_1.value;
                            var isRelative = mappedPath.startsWith(packagePath) && !mappedPath.includes('node_modules');
                            if (isRelative) {
                                return this.resolveAsRelativePath(mappedPath, fromPath);
                            }
                            else if (this.isEntryPoint(mappedPath)) {
                                return new ResolvedExternalModule(mappedPath);
                            }
                            else if (this.resolveAsRelativePath(mappedPath, fromPath)) {
                                return new ResolvedDeepImport(mappedPath);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (mappedPaths_1_1 && !mappedPaths_1_1.done && (_a = mappedPaths_1.return)) _a.call(mappedPaths_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
            return null;
        };
        /**
         * Try to resolve the `moduleName` as an external entry-point by searching the `node_modules`
         * folders up the tree for a matching `.../node_modules/${moduleName}`.
         *
         * If a folder is found but the path does not contain a `package.json` then it is marked as a
         * "deep-import".
         */
        ModuleResolver.prototype.resolveAsEntryPoint = function (moduleName, fromPath) {
            var folder = fromPath;
            while (!file_system_1.isRoot(folder)) {
                folder = file_system_1.dirname(folder);
                if (folder.endsWith('node_modules')) {
                    // Skip up if the folder already ends in node_modules
                    folder = file_system_1.dirname(folder);
                }
                var modulePath = file_system_1.resolve(folder, 'node_modules', moduleName);
                if (this.isEntryPoint(modulePath)) {
                    return new ResolvedExternalModule(modulePath);
                }
                else if (this.resolveAsRelativePath(modulePath, fromPath)) {
                    return new ResolvedDeepImport(modulePath);
                }
            }
            return null;
        };
        /**
         * Attempt to resolve a `path` to a file by appending the provided `postFixes`
         * to the `path` and checking if the file exists on disk.
         * @returns An absolute path to the first matching existing file, or `null` if none exist.
         */
        ModuleResolver.prototype.resolvePath = function (path, postFixes) {
            var e_2, _a;
            try {
                for (var postFixes_1 = tslib_1.__values(postFixes), postFixes_1_1 = postFixes_1.next(); !postFixes_1_1.done; postFixes_1_1 = postFixes_1.next()) {
                    var postFix = postFixes_1_1.value;
                    var testPath = file_system_1.absoluteFrom(path + postFix);
                    if (this.fs.exists(testPath)) {
                        return testPath;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (postFixes_1_1 && !postFixes_1_1.done && (_a = postFixes_1.return)) _a.call(postFixes_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return null;
        };
        /**
         * Can we consider the given path as an entry-point to a package?
         *
         * This is achieved by checking for the existence of `${modulePath}/package.json`.
         */
        ModuleResolver.prototype.isEntryPoint = function (modulePath) {
            return this.fs.exists(file_system_1.join(modulePath, 'package.json'));
        };
        /**
         * Apply the `pathMappers` to the `moduleName` and return all the possible
         * paths that match.
         *
         * The mapped path is computed for each template in `mapping.templates` by
         * replacing the `matcher.prefix` and `matcher.postfix` strings in `path with the
         * `template.prefix` and `template.postfix` strings.
         */
        ModuleResolver.prototype.findMappedPaths = function (moduleName) {
            var _this = this;
            var matches = this.pathMappings.map(function (mapping) { return _this.matchMapping(moduleName, mapping); });
            var bestMapping;
            var bestMatch;
            for (var index = 0; index < this.pathMappings.length; index++) {
                var mapping = this.pathMappings[index];
                var match = matches[index];
                if (match !== null) {
                    // If this mapping had no wildcard then this must be a complete match.
                    if (!mapping.matcher.hasWildcard) {
                        bestMatch = match;
                        bestMapping = mapping;
                        break;
                    }
                    // The best matched mapping is the one with the longest prefix.
                    if (!bestMapping || mapping.matcher.prefix > bestMapping.matcher.prefix) {
                        bestMatch = match;
                        bestMapping = mapping;
                    }
                }
            }
            return (bestMapping && bestMatch) ? this.computeMappedTemplates(bestMapping, bestMatch) : [];
        };
        /**
         * Attempt to find a mapped path for the given `path` and a `mapping`.
         *
         * The `path` matches the `mapping` if if it starts with `matcher.prefix` and ends with
         * `matcher.postfix`.
         *
         * @returns the wildcard segment of a matched `path`, or `null` if no match.
         */
        ModuleResolver.prototype.matchMapping = function (path, mapping) {
            var _a = mapping.matcher, prefix = _a.prefix, postfix = _a.postfix, hasWildcard = _a.hasWildcard;
            if (path.startsWith(prefix) && path.endsWith(postfix)) {
                return hasWildcard ? path.substring(prefix.length, path.length - postfix.length) : '';
            }
            return null;
        };
        /**
         * Compute the candidate paths from the given mapping's templates using the matched
         * string.
         */
        ModuleResolver.prototype.computeMappedTemplates = function (mapping, match) {
            return mapping.templates.map(function (template) { return file_system_1.resolve(mapping.baseUrl, template.prefix + match + template.postfix); });
        };
        /**
         * Search up the folder tree for the first folder that contains `package.json`
         * or `null` if none is found.
         */
        ModuleResolver.prototype.findPackagePath = function (path) {
            var folder = path;
            while (!file_system_1.isRoot(folder)) {
                folder = file_system_1.dirname(folder);
                if (this.fs.exists(file_system_1.join(folder, 'package.json'))) {
                    return folder;
                }
            }
            return null;
        };
        return ModuleResolver;
    }());
    exports.ModuleResolver = ModuleResolver;
    /**
     * A module that is external to the package doing the importing.
     * In this case we capture the folder containing the entry-point.
     */
    var ResolvedExternalModule = /** @class */ (function () {
        function ResolvedExternalModule(entryPointPath) {
            this.entryPointPath = entryPointPath;
        }
        return ResolvedExternalModule;
    }());
    exports.ResolvedExternalModule = ResolvedExternalModule;
    /**
     * A module that is relative to the module doing the importing, and so internal to the
     * source module's package.
     */
    var ResolvedRelativeModule = /** @class */ (function () {
        function ResolvedRelativeModule(modulePath) {
            this.modulePath = modulePath;
        }
        return ResolvedRelativeModule;
    }());
    exports.ResolvedRelativeModule = ResolvedRelativeModule;
    /**
     * A module that is external to the package doing the importing but pointing to a
     * module that is deep inside a package, rather than to an entry-point of the package.
     */
    var ResolvedDeepImport = /** @class */ (function () {
        function ResolvedDeepImport(importPath) {
            this.importPath = importPath;
        }
        return ResolvedDeepImport;
    }());
    exports.ResolvedDeepImport = ResolvedDeepImport;
    function splitOnStar(str) {
        var _a = tslib_1.__read(str.split('*', 2), 2), prefix = _a[0], postfix = _a[1];
        return { prefix: prefix, postfix: postfix || '', hasWildcard: postfix !== undefined };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2RlcGVuZGVuY2llcy9tb2R1bGVfcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsMkVBQXdIO0lBQ3hILDhEQUFzRDtJQUl0RDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSDtRQUdFLHdCQUFvQixFQUFjLEVBQUUsWUFBMkIsRUFBVSxrQkFFeEU7WUFGd0UsbUNBQUEsRUFBQTtnQkFDdkUsS0FBSyxFQUFFLFdBQVc7YUFDbkI7WUFGbUIsT0FBRSxHQUFGLEVBQUUsQ0FBWTtZQUF1Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBRTFGO1lBQ0MsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2pGLENBQUM7UUFFRDs7Ozs7Ozs7O1dBU0c7UUFDSCw0Q0FBbUIsR0FBbkIsVUFBb0IsVUFBa0IsRUFBRSxRQUF3QjtZQUM5RCxJQUFJLHNCQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN6RDtpQkFBTTtnQkFDTCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO29CQUMvRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3BEO1FBQ0gsQ0FBQztRQUVEOztXQUVHO1FBQ0ssNENBQW1CLEdBQTNCLFVBQTRCLFlBQTBCO1lBQ3BELElBQU0sT0FBTyxHQUFHLDBC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QUExQixlQUFVLEdBQVYsVUFBVSxDQUFnQjtRQUFHLENBQUM7UUFDbkQseUJBQUM7SUFBRCxDQUFDLEFBRkQsSUFFQztJQUZZLGdEQUFrQjtJQUkvQixTQUFTLFdBQVcsQ0FBQyxHQUFXO1FBQ3hCLElBQUEseUNBQXFDLEVBQXBDLGNBQU0sRUFBRSxlQUE0QixDQUFDO1FBQzVDLE9BQU8sRUFBQyxNQUFNLFFBQUEsRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsT0FBTyxLQUFLLFNBQVMsRUFBQyxDQUFDO0lBQzlFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGFic29sdXRlRnJvbSwgZGlybmFtZSwgaXNSb290LCBqb2luLCByZXNvbHZlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtQYXRoTWFwcGluZ3MsIGlzUmVsYXRpdmVQYXRofSBmcm9tICcuLi91dGlscyc7XG5cblxuXG4vKipcbiAqIFRoaXMgaXMgYSB2ZXJ5IGN1dC1kb3duIGltcGxlbWVudGF0aW9uIG9mIHRoZSBUeXBlU2NyaXB0IG1vZHVsZSByZXNvbHV0aW9uIHN0cmF0ZWd5LlxuICpcbiAqIEl0IGlzIHNwZWNpZmljIHRvIHRoZSBuZWVkcyBvZiBuZ2NjIGFuZCBpcyBub3QgaW50ZW5kZWQgdG8gYmUgYSBkcm9wLWluIHJlcGxhY2VtZW50XG4gKiBmb3IgdGhlIFRTIG1vZHVsZSByZXNvbHZlci4gSXQgaXMgdXNlZCB0byBjb21wdXRlIHRoZSBkZXBlbmRlbmNpZXMgYmV0d2VlbiBlbnRyeS1wb2ludHNcbiAqIHRoYXQgbWF5IGJlIGNvbXBpbGVkIGJ5IG5nY2MuXG4gKlxuICogVGhlIGFsZ29yaXRobSBvbmx5IGZpbmRzIGAuanNgIGZpbGVzIGZvciBpbnRlcm5hbC9yZWxhdGl2ZSBpbXBvcnRzIGFuZCBwYXRocyB0b1xuICogdGhlIGZvbGRlciBjb250YWluaW5nIHRoZSBgcGFja2FnZS5qc29uYCBvZiB0aGUgZW50cnktcG9pbnQgZm9yIGV4dGVybmFsIGltcG9ydHMuXG4gKlxuICogSXQgY2FuIGNvcGUgd2l0aCBuZXN0ZWQgYG5vZGVfbW9kdWxlc2AgZm9sZGVycyBhbmQgYWxzbyBzdXBwb3J0cyBgcGF0aHNgL2BiYXNlVXJsYFxuICogY29uZmlndXJhdGlvbiBwcm9wZXJ0aWVzLCBhcyBwcm92aWRlZCBpbiBhIGB0cy5Db21waWxlck9wdGlvbnNgIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vZHVsZVJlc29sdmVyIHtcbiAgcHJpdmF0ZSBwYXRoTWFwcGluZ3M6IFByb2Nlc3NlZFBhdGhNYXBwaW5nW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogRmlsZVN5c3RlbSwgcGF0aE1hcHBpbmdzPzogUGF0aE1hcHBpbmdzLCBwcml2YXRlIHJlbGF0aXZlRXh0ZW5zaW9ucyA9IFtcbiAgICAnLmpzJywgJy9pbmRleC5qcydcbiAgXSkge1xuICAgIHRoaXMucGF0aE1hcHBpbmdzID0gcGF0aE1hcHBpbmdzID8gdGhpcy5wcm9jZXNzUGF0aE1hcHBpbmdzKHBhdGhNYXBwaW5ncykgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGFuIGFic29sdXRlIHBhdGggZm9yIHRoZSBgbW9kdWxlTmFtZWAgaW1wb3J0ZWQgaW50byBhIGZpbGUgYXQgYGZyb21QYXRoYC5cbiAgICogQHBhcmFtIG1vZHVsZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGltcG9ydCB0byByZXNvbHZlLlxuICAgKiBAcGFyYW0gZnJvbVBhdGggVGhlIHBhdGggdG8gdGhlIGZpbGUgY29udGFpbmluZyB0aGUgaW1wb3J0LlxuICAgKiBAcmV0dXJucyBBIHBhdGggdG8gdGhlIHJlc29sdmVkIG1vZHVsZSBvciBudWxsIGlmIG1pc3NpbmcuXG4gICAqIFNwZWNpZmljYWxseTpcbiAgICogICogdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIHBhY2thZ2UuanNvbiBvZiBhbiBleHRlcm5hbCBtb2R1bGVcbiAgICogICogYSBKYXZhU2NyaXB0IGZpbGUgb2YgYW4gaW50ZXJuYWwgbW9kdWxlXG4gICAqICAqIG51bGwgaWYgbm9uZSBleGlzdHMuXG4gICAqL1xuICByZXNvbHZlTW9kdWxlSW1wb3J0KG1vZHVsZU5hbWU6IHN0cmluZywgZnJvbVBhdGg6IEFic29sdXRlRnNQYXRoKTogUmVzb2x2ZWRNb2R1bGV8bnVsbCB7XG4gICAgaWYgKGlzUmVsYXRpdmVQYXRoKG1vZHVsZU5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNvbHZlQXNSZWxhdGl2ZVBhdGgobW9kdWxlTmFtZSwgZnJvbVBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoTWFwcGluZ3MubGVuZ3RoICYmIHRoaXMucmVzb2x2ZUJ5UGF0aE1hcHBpbmdzKG1vZHVsZU5hbWUsIGZyb21QYXRoKSB8fFxuICAgICAgICAgIHRoaXMucmVzb2x2ZUFzRW50cnlQb2ludChtb2R1bGVOYW1lLCBmcm9tUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGBwYXRoTWFwcGluZ3NgIGludG8gYSBjb2xsZWN0aW9uIG9mIGBQYXRoTWFwcGVyYCBmdW5jdGlvbnMuXG4gICAqL1xuICBwcml2YXRlIHByb2Nlc3NQYXRoTWFwcGluZ3MocGF0aE1hcHBpbmdzOiBQYXRoTWFwcGluZ3MpOiBQcm9jZXNzZWRQYXRoTWFwcGluZ1tdIHtcbiAgICBjb25zdCBiYXNlVXJsID0gYWJzb2x1dGVGcm9tKHBhdGhNYXBwaW5ncy5iYXNlVXJsKTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMocGF0aE1hcHBpbmdzLnBhdGhzKS5tYXAocGF0aFBhdHRlcm4gPT4ge1xuICAgICAgY29uc3QgbWF0Y2hlciA9IHNwbGl0T25TdGFyKHBhdGhQYXR0ZXJuKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlcyA9IHBhdGhNYXBwaW5ncy5wYXRoc1twYXRoUGF0dGVybl0ubWFwKHNwbGl0T25TdGFyKTtcbiAgICAgIHJldHVybiB7bWF0Y2hlciwgdGVtcGxhdGVzLCBiYXNlVXJsfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnkgdG8gcmVzb2x2ZSBhIG1vZHVsZSBuYW1lLCBhcyBhIHJlbGF0aXZlIHBhdGgsIGZyb20gdGhlIGBmcm9tUGF0aGAuXG4gICAqXG4gICAqIEFzIGl0IGlzIHJlbGF0aXZlLCBpdCBvbmx5IGxvb2tzIGZvciBmaWxlcyB0aGF0IGVuZCBpbiBvbmUgb2YgdGhlIGByZWxhdGl2ZUV4dGVuc2lvbnNgLlxuICAgKiBGb3IgZXhhbXBsZTogYCR7bW9kdWxlTmFtZX0uanNgIG9yIGAke21vZHVsZU5hbWV9L2luZGV4LmpzYC5cbiAgICogSWYgbmVpdGhlciBvZiB0aGVzZSBmaWxlcyBleGlzdCB0aGVuIHRoZSBtZXRob2QgcmV0dXJucyBgbnVsbGAuXG4gICAqL1xuICBwcml2YXRlIHJlc29sdmVBc1JlbGF0aXZlUGF0aChtb2R1bGVOYW1lOiBzdHJpbmcsIGZyb21QYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFJlc29sdmVkTW9kdWxlfG51bGwge1xuICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9XG4gICAgICAgIHRoaXMucmVzb2x2ZVBhdGgocmVzb2x2ZShkaXJuYW1lKGZyb21QYXRoKSwgbW9kdWxlTmFtZSksIHRoaXMucmVsYXRpdmVFeHRlbnNpb25zKTtcbiAgICByZXR1cm4gcmVzb2x2ZWRQYXRoICYmIG5ldyBSZXNvbHZlZFJlbGF0aXZlTW9kdWxlKHJlc29sdmVkUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogVHJ5IHRvIHJlc29sdmUgdGhlIGBtb2R1bGVOYW1lYCwgYnkgYXBwbHlpbmcgdGhlIGNvbXB1dGVkIGBwYXRoTWFwcGluZ3NgIGFuZFxuICAgKiB0aGVuIHRyeWluZyB0byByZXNvbHZlIHRoZSBtYXBwZWQgcGF0aCBhcyBhIHJlbGF0aXZlIG9yIGV4dGVybmFsIGltcG9ydC5cbiAgICpcbiAgICogV2hldGhlciB0aGUgbWFwcGVkIHBhdGggaXMgcmVsYXRpdmUgaXMgZGVmaW5lZCBhcyBpdCBiZWluZyBcImJlbG93IHRoZSBgZnJvbVBhdGhgXCIgYW5kIG5vdFxuICAgKiBjb250YWluaW5nIGBub2RlX21vZHVsZXNgLlxuICAgKlxuICAgKiBJZiB0aGUgbWFwcGVkIHBhdGggaXMgbm90IHJlbGF0aXZlIGJ1dCBkb2VzIG5vdCByZXNvbHZlIHRvIGFuIGV4dGVybmFsIGVudHJ5LXBvaW50LCB0aGVuIHdlXG4gICAqIGNoZWNrIHdoZXRoZXIgaXQgd291bGQgaGF2ZSByZXNvbHZlZCB0byBhIHJlbGF0aXZlIHBhdGgsIGluIHdoaWNoIGNhc2UgaXQgaXMgbWFya2VkIGFzIGFcbiAgICogXCJkZWVwLWltcG9ydFwiLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlQnlQYXRoTWFwcGluZ3MobW9kdWxlTmFtZTogc3RyaW5nLCBmcm9tUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBSZXNvbHZlZE1vZHVsZXxudWxsIHtcbiAgICBjb25zdCBtYXBwZWRQYXRocyA9IHRoaXMuZmluZE1hcHBlZFBhdGhzKG1vZHVsZU5hbWUpO1xuICAgIGlmIChtYXBwZWRQYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBwYWNrYWdlUGF0aCA9IHRoaXMuZmluZFBhY2thZ2VQYXRoKGZyb21QYXRoKTtcbiAgICAgIGlmIChwYWNrYWdlUGF0aCAhPT0gbnVsbCkge1xuICAgICAgICBmb3IgKGNvbnN0IG1hcHBlZFBhdGggb2YgbWFwcGVkUGF0aHMpIHtcbiAgICAgICAgICBjb25zdCBpc1JlbGF0aXZlID1cbiAgICAgICAgICAgICAgbWFwcGVkUGF0aC5zdGFydHNXaXRoKHBhY2thZ2VQYXRoKSAmJiAhbWFwcGVkUGF0aC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJyk7XG4gICAgICAgICAgaWYgKGlzUmVsYXRpdmUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc29sdmVBc1JlbGF0aXZlUGF0aChtYXBwZWRQYXRoLCBmcm9tUGF0aCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRW50cnlQb2ludChtYXBwZWRQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZEV4dGVybmFsTW9kdWxlKG1hcHBlZFBhdGgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXNvbHZlQXNSZWxhdGl2ZVBhdGgobWFwcGVkUGF0aCwgZnJvbVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlc29sdmVkRGVlcEltcG9ydChtYXBwZWRQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVHJ5IHRvIHJlc29sdmUgdGhlIGBtb2R1bGVOYW1lYCBhcyBhbiBleHRlcm5hbCBlbnRyeS1wb2ludCBieSBzZWFyY2hpbmcgdGhlIGBub2RlX21vZHVsZXNgXG4gICAqIGZvbGRlcnMgdXAgdGhlIHRyZWUgZm9yIGEgbWF0Y2hpbmcgYC4uLi9ub2RlX21vZHVsZXMvJHttb2R1bGVOYW1lfWAuXG4gICAqXG4gICAqIElmIGEgZm9sZGVyIGlzIGZvdW5kIGJ1dCB0aGUgcGF0aCBkb2VzIG5vdCBjb250YWluIGEgYHBhY2thZ2UuanNvbmAgdGhlbiBpdCBpcyBtYXJrZWQgYXMgYVxuICAgKiBcImRlZXAtaW1wb3J0XCIuXG4gICAqL1xuICBwcml2YXRlIHJlc29sdmVBc0VudHJ5UG9pbnQobW9kdWxlTmFtZTogc3RyaW5nLCBmcm9tUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBSZXNvbHZlZE1vZHVsZXxudWxsIHtcbiAgICBsZXQgZm9sZGVyID0gZnJvbVBhdGg7XG4gICAgd2hpbGUgKCFpc1Jvb3QoZm9sZGVyKSkge1xuICAgICAgZm9sZGVyID0gZGlybmFtZShmb2xkZXIpO1xuICAgICAgaWYgKGZvbGRlci5lbmRzV2l0aCgnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgLy8gU2tpcCB1cCBpZiB0aGUgZm9sZGVyIGFscmVhZHkgZW5kcyBpbiBub2RlX21vZHVsZXNcbiAgICAgICAgZm9sZGVyID0gZGlybmFtZShmb2xkZXIpO1xuICAgICAgfVxuICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IHJlc29sdmUoZm9sZGVyLCAnbm9kZV9tb2R1bGVzJywgbW9kdWxlTmFtZSk7XG4gICAgICBpZiAodGhpcy5pc0VudHJ5UG9pbnQobW9kdWxlUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZEV4dGVybmFsTW9kdWxlKG1vZHVsZVBhdGgpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlc29sdmVBc1JlbGF0aXZlUGF0aChtb2R1bGVQYXRoLCBmcm9tUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZERlZXBJbXBvcnQobW9kdWxlUGF0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gcmVzb2x2ZSBhIGBwYXRoYCB0byBhIGZpbGUgYnkgYXBwZW5kaW5nIHRoZSBwcm92aWRlZCBgcG9zdEZpeGVzYFxuICAgKiB0byB0aGUgYHBhdGhgIGFuZCBjaGVja2luZyBpZiB0aGUgZmlsZSBleGlzdHMgb24gZGlzay5cbiAgICogQHJldHVybnMgQW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZmlyc3QgbWF0Y2hpbmcgZXhpc3RpbmcgZmlsZSwgb3IgYG51bGxgIGlmIG5vbmUgZXhpc3QuXG4gICAqL1xuICBwcml2YXRlIHJlc29sdmVQYXRoKHBhdGg6IEFic29sdXRlRnNQYXRoLCBwb3N0Rml4ZXM6IHN0cmluZ1tdKTogQWJzb2x1dGVGc1BhdGh8bnVsbCB7XG4gICAgZm9yIChjb25zdCBwb3N0Rml4IG9mIHBvc3RGaXhlcykge1xuICAgICAgY29uc3QgdGVzdFBhdGggPSBhYnNvbHV0ZUZyb20ocGF0aCArIHBvc3RGaXgpO1xuICAgICAgaWYgKHRoaXMuZnMuZXhpc3RzKHRlc3RQYXRoKSkge1xuICAgICAgICByZXR1cm4gdGVzdFBhdGg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbiB3ZSBjb25zaWRlciB0aGUgZ2l2ZW4gcGF0aCBhcyBhbiBlbnRyeS1wb2ludCB0byBhIHBhY2thZ2U/XG4gICAqXG4gICAqIFRoaXMgaXMgYWNoaWV2ZWQgYnkgY2hlY2tpbmcgZm9yIHRoZSBleGlzdGVuY2Ugb2YgYCR7bW9kdWxlUGF0aH0vcGFja2FnZS5qc29uYC5cbiAgICovXG4gIHByaXZhdGUgaXNFbnRyeVBvaW50KG1vZHVsZVBhdGg6IEFic29sdXRlRnNQYXRoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZnMuZXhpc3RzKGpvaW4obW9kdWxlUGF0aCwgJ3BhY2thZ2UuanNvbicpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSB0aGUgYHBhdGhNYXBwZXJzYCB0byB0aGUgYG1vZHVsZU5hbWVgIGFuZCByZXR1cm4gYWxsIHRoZSBwb3NzaWJsZVxuICAgKiBwYXRocyB0aGF0IG1hdGNoLlxuICAgKlxuICAgKiBUaGUgbWFwcGVkIHBhdGggaXMgY29tcHV0ZWQgZm9yIGVhY2ggdGVtcGxhdGUgaW4gYG1hcHBpbmcudGVtcGxhdGVzYCBieVxuICAgKiByZXBsYWNpbmcgdGhlIGBtYXRjaGVyLnByZWZpeGAgYW5kIGBtYXRjaGVyLnBvc3RmaXhgIHN0cmluZ3MgaW4gYHBhdGggd2l0aCB0aGVcbiAgICogYHRlbXBsYXRlLnByZWZpeGAgYW5kIGB0ZW1wbGF0ZS5wb3N0Zml4YCBzdHJpbmdzLlxuICAgKi9cbiAgcHJpdmF0ZSBmaW5kTWFwcGVkUGF0aHMobW9kdWxlTmFtZTogc3RyaW5nKTogQWJzb2x1dGVGc1BhdGhbXSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMucGF0aE1hcHBpbmdzLm1hcChtYXBwaW5nID0+IHRoaXMubWF0Y2hNYXBwaW5nKG1vZHVsZU5hbWUsIG1hcHBpbmcpKTtcblxuICAgIGxldCBiZXN0TWFwcGluZzogUHJvY2Vzc2VkUGF0aE1hcHBpbmd8dW5kZWZpbmVkO1xuICAgIGxldCBiZXN0TWF0Y2g6IHN0cmluZ3x1bmRlZmluZWQ7XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5wYXRoTWFwcGluZ3MubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjb25zdCBtYXBwaW5nID0gdGhpcy5wYXRoTWFwcGluZ3NbaW5kZXhdO1xuICAgICAgY29uc3QgbWF0Y2ggPSBtYXRjaGVzW2luZGV4XTtcbiAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCkge1xuICAgICAgICAvLyBJZiB0aGlzIG1hcHBpbmcgaGFkIG5vIHdpbGRjYXJkIHRoZW4gdGhpcyBtdXN0IGJlIGEgY29tcGxldGUgbWF0Y2guXG4gICAgICAgIGlmICghbWFwcGluZy5tYXRjaGVyLmhhc1dpbGRjYXJkKSB7XG4gICAgICAgICAgYmVzdE1hdGNoID0gbWF0Y2g7XG4gICAgICAgICAgYmVzdE1hcHBpbmcgPSBtYXBwaW5nO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoZSBiZXN0IG1hdGNoZWQgbWFwcGluZyBpcyB0aGUgb25lIHdpdGggdGhlIGxvbmdlc3QgcHJlZml4LlxuICAgICAgICBpZiAoIWJlc3RNYXBwaW5nIHx8IG1hcHBpbmcubWF0Y2hlci5wcmVmaXggPiBiZXN0TWFwcGluZy5tYXRjaGVyLnByZWZpeCkge1xuICAgICAgICAgIGJlc3RNYXRjaCA9IG1hdGNoO1xuICAgICAgICAgIGJlc3RNYXBwaW5nID0gbWFwcGluZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoYmVzdE1hcHBpbmcgJiYgYmVzdE1hdGNoKSA/IHRoaXMuY29tcHV0ZU1hcHBlZFRlbXBsYXRlcyhiZXN0TWFwcGluZywgYmVzdE1hdGNoKSA6IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gZmluZCBhIG1hcHBlZCBwYXRoIGZvciB0aGUgZ2l2ZW4gYHBhdGhgIGFuZCBhIGBtYXBwaW5nYC5cbiAgICpcbiAgICogVGhlIGBwYXRoYCBtYXRjaGVzIHRoZSBgbWFwcGluZ2AgaWYgaWYgaXQgc3RhcnRzIHdpdGggYG1hdGNoZXIucHJlZml4YCBhbmQgZW5kcyB3aXRoXG4gICAqIGBtYXRjaGVyLnBvc3RmaXhgLlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgd2lsZGNhcmQgc2VnbWVudCBvZiBhIG1hdGNoZWQgYHBhdGhgLCBvciBgbnVsbGAgaWYgbm8gbWF0Y2guXG4gICAqL1xuICBwcml2YXRlIG1hdGNoTWFwcGluZyhwYXRoOiBzdHJpbmcsIG1hcHBpbmc6IFByb2Nlc3NlZFBhdGhNYXBwaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGNvbnN0IHtwcmVmaXgsIHBvc3RmaXgsIGhhc1dpbGRjYXJkfSA9IG1hcHBpbmcubWF0Y2hlcjtcbiAgICBpZiAocGF0aC5zdGFydHNXaXRoKHByZWZpeCkgJiYgcGF0aC5lbmRzV2l0aChwb3N0Zml4KSkge1xuICAgICAgcmV0dXJuIGhhc1dpbGRjYXJkID8gcGF0aC5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCwgcGF0aC5sZW5ndGggLSBwb3N0Zml4Lmxlbmd0aCkgOiAnJztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZSB0aGUgY2FuZGlkYXRlIHBhdGhzIGZyb20gdGhlIGdpdmVuIG1hcHBpbmcncyB0ZW1wbGF0ZXMgdXNpbmcgdGhlIG1hdGNoZWRcbiAgICogc3RyaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlTWFwcGVkVGVtcGxhdGVzKG1hcHBpbmc6IFByb2Nlc3NlZFBhdGhNYXBwaW5nLCBtYXRjaDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG1hcHBpbmcudGVtcGxhdGVzLm1hcChcbiAgICAgICAgdGVtcGxhdGUgPT4gcmVzb2x2ZShtYXBwaW5nLmJhc2VVcmwsIHRlbXBsYXRlLnByZWZpeCArIG1hdGNoICsgdGVtcGxhdGUucG9zdGZpeCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCB1cCB0aGUgZm9sZGVyIHRyZWUgZm9yIHRoZSBmaXJzdCBmb2xkZXIgdGhhdCBjb250YWlucyBgcGFja2FnZS5qc29uYFxuICAgKiBvciBgbnVsbGAgaWYgbm9uZSBpcyBmb3VuZC5cbiAgICovXG4gIHByaXZhdGUgZmluZFBhY2thZ2VQYXRoKHBhdGg6IEFic29sdXRlRnNQYXRoKTogQWJzb2x1dGVGc1BhdGh8bnVsbCB7XG4gICAgbGV0IGZvbGRlciA9IHBhdGg7XG4gICAgd2hpbGUgKCFpc1Jvb3QoZm9sZGVyKSkge1xuICAgICAgZm9sZGVyID0gZGlybmFtZShmb2xkZXIpO1xuICAgICAgaWYgKHRoaXMuZnMuZXhpc3RzKGpvaW4oZm9sZGVyLCAncGFja2FnZS5qc29uJykpKSB7XG4gICAgICAgIHJldHVybiBmb2xkZXI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKiBUaGUgcmVzdWx0IG9mIHJlc29sdmluZyBhbiBpbXBvcnQgdG8gYSBtb2R1bGUuICovXG5leHBvcnQgdHlwZSBSZXNvbHZlZE1vZHVsZSA9IFJlc29sdmVkRXh0ZXJuYWxNb2R1bGUgfCBSZXNvbHZlZFJlbGF0aXZlTW9kdWxlIHwgUmVzb2x2ZWREZWVwSW1wb3J0O1xuXG4vKipcbiAqIEEgbW9kdWxlIHRoYXQgaXMgZXh0ZXJuYWwgdG8gdGhlIHBhY2thZ2UgZG9pbmcgdGhlIGltcG9ydGluZy5cbiAqIEluIHRoaXMgY2FzZSB3ZSBjYXB0dXJlIHRoZSBmb2xkZXIgY29udGFpbmluZyB0aGUgZW50cnktcG9pbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZEV4dGVybmFsTW9kdWxlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCkge31cbn1cblxuLyoqXG4gKiBBIG1vZHVsZSB0aGF0IGlzIHJlbGF0aXZlIHRvIHRoZSBtb2R1bGUgZG9pbmcgdGhlIGltcG9ydGluZywgYW5kIHNvIGludGVybmFsIHRvIHRoZVxuICogc291cmNlIG1vZHVsZSdzIHBhY2thZ2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZFJlbGF0aXZlTW9kdWxlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZVBhdGg6IEFic29sdXRlRnNQYXRoKSB7fVxufVxuXG4vKipcbiAqIEEgbW9kdWxlIHRoYXQgaXMgZXh0ZXJuYWwgdG8gdGhlIHBhY2thZ2UgZG9pbmcgdGhlIGltcG9ydGluZyBidXQgcG9pbnRpbmcgdG8gYVxuICogbW9kdWxlIHRoYXQgaXMgZGVlcCBpbnNpZGUgYSBwYWNrYWdlLCByYXRoZXIgdGhhbiB0byBhbiBlbnRyeS1wb2ludCBvZiB0aGUgcGFja2FnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVkRGVlcEltcG9ydCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbXBvcnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCkge31cbn1cblxuZnVuY3Rpb24gc3BsaXRPblN0YXIoc3RyOiBzdHJpbmcpOiBQYXRoTWFwcGluZ1BhdHRlcm4ge1xuICBjb25zdCBbcHJlZml4LCBwb3N0Zml4XSA9IHN0ci5zcGxpdCgnKicsIDIpO1xuICByZXR1cm4ge3ByZWZpeCwgcG9zdGZpeDogcG9zdGZpeCB8fCAnJywgaGFzV2lsZGNhcmQ6IHBvc3RmaXggIT09IHVuZGVmaW5lZH07XG59XG5cbmludGVyZmFjZSBQcm9jZXNzZWRQYXRoTWFwcGluZyB7XG4gIGJhc2VVcmw6IEFic29sdXRlRnNQYXRoO1xuICBtYXRjaGVyOiBQYXRoTWFwcGluZ1BhdHRlcm47XG4gIHRlbXBsYXRlczogUGF0aE1hcHBpbmdQYXR0ZXJuW107XG59XG5cbmludGVyZmFjZSBQYXRoTWFwcGluZ1BhdHRlcm4ge1xuICBwcmVmaXg6IHN0cmluZztcbiAgcG9zdGZpeDogc3RyaW5nO1xuICBoYXNXaWxkY2FyZDogYm9vbGVhbjtcbn1cbiJdfQ==