(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host", ["require", "exports", "typescript", "@angular/compiler-cli/ngcc/src/dependencies/module_resolver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var module_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/module_resolver");
    /**
     * Helper functions for computing dependencies.
     */
    var EsmDependencyHost = /** @class */ (function () {
        function EsmDependencyHost(fs, moduleResolver) {
            this.fs = fs;
            this.moduleResolver = moduleResolver;
        }
        /**
         * Find all the dependencies for the entry-point at the given path.
         *
         * @param entryPointPath The absolute path to the JavaScript file that represents an entry-point.
         * @returns Information about the dependencies of the entry-point, including those that were
         * missing or deep imports into other entry-points.
         */
        EsmDependencyHost.prototype.findDependencies = function (entryPointPath) {
            var dependencies = new Set();
            var missing = new Set();
            var deepImports = new Set();
            var alreadySeen = new Set();
            this.recursivelyFindDependencies(entryPointPath, dependencies, missing, deepImports, alreadySeen);
            return { dependencies: dependencies, missing: missing, deepImports: deepImports };
        };
        /**
         * Compute the dependencies of the given file.
         *
         * @param file An absolute path to the file whose dependencies we want to get.
         * @param dependencies A set that will have the absolute paths of resolved entry points added to
         * it.
         * @param missing A set that will have the dependencies that could not be found added to it.
         * @param deepImports A set that will have the import paths that exist but cannot be mapped to
         * entry-points, i.e. deep-imports.
         * @param alreadySeen A set that is used to track internal dependencies to prevent getting stuck
         * in a
         * circular dependency loop.
         */
        EsmDependencyHost.prototype.recursivelyFindDependencies = function (file, dependencies, missing, deepImports, alreadySeen) {
            var _this = this;
            var fromContents = this.fs.readFile(file);
            if (!this.hasImportOrReexportStatements(fromContents)) {
                return;
            }
            // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
            var sf = ts.createSourceFile(file, fromContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
            sf.statements
                // filter out statements that are not imports or reexports
                .filter(this.isStringImportOrReexport)
                // Grab the id of the module that is being imported
                .map(function (stmt) { return stmt.moduleSpecifier.text; })
                // Resolve this module id into an absolute path
                .forEach(function (importPath) {
                var resolvedModule = _this.moduleResolver.resolveModuleImport(importPath, file);
                if (resolvedModule) {
                    if (resolvedModule instanceof module_resolver_1.ResolvedRelativeModule) {
                        var internalDependency = resolvedModule.modulePath;
                        if (!alreadySeen.has(internalDependency)) {
                            alreadySeen.add(internalDependency);
                            _this.recursivelyFindDependencies(internalDependency, dependencies, missing, deepImports, alreadySeen);
                        }
                    }
                    else {
                        if (resolvedModule instanceof module_resolver_1.ResolvedDeepImport) {
                            deepImports.add(resolvedModule.importPath);
                        }
                        else {
                            dependencies.add(resolvedModule.entryPointPath);
                        }
                    }
                }
                else {
                    missing.add(importPath);
                }
            });
        };
        /**
         * Check whether the given statement is an import with a string literal module specifier.
         * @param stmt the statement node to check.
         * @returns true if the statement is an import with a string literal module specifier.
         */
        EsmDependencyHost.prototype.isStringImportOrReexport = function (stmt) {
            return ts.isImportDeclaration(stmt) ||
                ts.isExportDeclaration(stmt) && !!stmt.moduleSpecifier &&
                    ts.isStringLiteral(stmt.moduleSpecifier);
        };
        /**
         * Check whether a source file needs to be parsed for imports.
         * This is a performance short-circuit, which saves us from creating
         * a TypeScript AST unnecessarily.
         *
         * @param source The content of the source file to check.
         *
         * @returns false if there are definitely no import or re-export statements
         * in this file, true otherwise.
         */
        EsmDependencyHost.prototype.hasImportOrReexportStatements = function (source) {
            return /(import|export)\s.+from/.test(source);
        };
        return EsmDependencyHost;
    }());
    exports.EsmDependencyHost = EsmDependencyHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtX2RlcGVuZGVuY3lfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9kZXBlbmRlbmNpZXMvZXNtX2RlcGVuZGVuY3lfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUdqQywrRkFBNkY7SUFFN0Y7O09BRUc7SUFDSDtRQUNFLDJCQUFvQixFQUFjLEVBQVUsY0FBOEI7WUFBdEQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtZQUFVLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUFHLENBQUM7UUFFOUU7Ozs7OztXQU1HO1FBQ0gsNENBQWdCLEdBQWhCLFVBQWlCLGNBQThCO1lBQzdDLElBQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQy9DLElBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1lBQ3RELElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQzlDLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQzlDLElBQUksQ0FBQywyQkFBMkIsQ0FDNUIsY0FBYyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sRUFBQyxZQUFZLGNBQUEsRUFBRSxPQUFPLFNBQUEsRUFBRSxXQUFXLGFBQUEsRUFBQyxDQUFDO1FBQzlDLENBQUM7UUFFRDs7Ozs7Ozs7Ozs7O1dBWUc7UUFDSyx1REFBMkIsR0FBbkMsVUFDSSxJQUFvQixFQUFFLFlBQWlDLEVBQUUsT0FBb0IsRUFDN0UsV0FBd0IsRUFBRSxXQUFnQztZQUY5RCxpQkFzQ0M7WUFuQ0MsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDckQsT0FBTzthQUNSO1lBRUQsOEZBQThGO1lBQzlGLElBQU0sRUFBRSxHQUNKLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdGLEVBQUUsQ0FBQyxVQUFVO2dCQUNULDBEQUEwRDtpQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztnQkFDdEMsbURBQW1EO2lCQUNsRCxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBekIsQ0FBeUIsQ0FBQztnQkFDdkMsK0NBQStDO2lCQUM5QyxPQUFPLENBQUMsVUFBQSxVQUFVO2dCQUNqQixJQUFNLGNBQWMsR0FBRyxLQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDakYsSUFBSSxjQUFjLEVBQUU7b0JBQ2xCLElBQUksY0FBYyxZQUFZLHdDQUFzQixFQUFFO3dCQUNwRCxJQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUM7d0JBQ3JELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7NEJBQ3hDLFdBQVcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs0QkFDcEMsS0FBSSxDQUFDLDJCQUEyQixDQUM1QixrQkFBa0IsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzt5QkFDMUU7cUJBQ0Y7eUJBQU07d0JBQ0wsSUFBSSxjQUFjLFlBQVksb0NBQWtCLEVBQUU7NEJBQ2hELFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lCQUM1Qzs2QkFBTTs0QkFDTCxZQUFZLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQzt5QkFDakQ7cUJBQ0Y7aUJBQ0Y7cUJBQU07b0JBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDekI7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNULENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsb0RBQXdCLEdBQXhCLFVBQXlCLElBQWtCO1lBRXpDLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQztnQkFDL0IsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZTtvQkFDdEQsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVEOzs7Ozs7Ozs7V0FTRztRQUNILHlEQUE2QixHQUE3QixVQUE4QixNQUFjO1lBQzFDLE9BQU8seUJBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUFsR0QsSUFrR0M7SUFsR1ksOENBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtLCBQYXRoU2VnbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7RGVwZW5kZW5jeUhvc3QsIERlcGVuZGVuY3lJbmZvfSBmcm9tICcuL2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge01vZHVsZVJlc29sdmVyLCBSZXNvbHZlZERlZXBJbXBvcnQsIFJlc29sdmVkUmVsYXRpdmVNb2R1bGV9IGZyb20gJy4vbW9kdWxlX3Jlc29sdmVyJztcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb25zIGZvciBjb21wdXRpbmcgZGVwZW5kZW5jaWVzLlxuICovXG5leHBvcnQgY2xhc3MgRXNtRGVwZW5kZW5jeUhvc3QgaW1wbGVtZW50cyBEZXBlbmRlbmN5SG9zdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZnM6IEZpbGVTeXN0ZW0sIHByaXZhdGUgbW9kdWxlUmVzb2x2ZXI6IE1vZHVsZVJlc29sdmVyKSB7fVxuXG4gIC8qKlxuICAgKiBGaW5kIGFsbCB0aGUgZGVwZW5kZW5jaWVzIGZvciB0aGUgZW50cnktcG9pbnQgYXQgdGhlIGdpdmVuIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSBlbnRyeVBvaW50UGF0aCBUaGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgSmF2YVNjcmlwdCBmaWxlIHRoYXQgcmVwcmVzZW50cyBhbiBlbnRyeS1wb2ludC5cbiAgICogQHJldHVybnMgSW5mb3JtYXRpb24gYWJvdXQgdGhlIGRlcGVuZGVuY2llcyBvZiB0aGUgZW50cnktcG9pbnQsIGluY2x1ZGluZyB0aG9zZSB0aGF0IHdlcmVcbiAgICogbWlzc2luZyBvciBkZWVwIGltcG9ydHMgaW50byBvdGhlciBlbnRyeS1wb2ludHMuXG4gICAqL1xuICBmaW5kRGVwZW5kZW5jaWVzKGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IERlcGVuZGVuY3lJbmZvIHtcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBuZXcgU2V0PEFic29sdXRlRnNQYXRoPigpO1xuICAgIGNvbnN0IG1pc3NpbmcgPSBuZXcgU2V0PEFic29sdXRlRnNQYXRofFBhdGhTZWdtZW50PigpO1xuICAgIGNvbnN0IGRlZXBJbXBvcnRzID0gbmV3IFNldDxBYnNvbHV0ZUZzUGF0aD4oKTtcbiAgICBjb25zdCBhbHJlYWR5U2VlbiA9IG5ldyBTZXQ8QWJzb2x1dGVGc1BhdGg+KCk7XG4gICAgdGhpcy5yZWN1cnNpdmVseUZpbmREZXBlbmRlbmNpZXMoXG4gICAgICAgIGVudHJ5UG9pbnRQYXRoLCBkZXBlbmRlbmNpZXMsIG1pc3NpbmcsIGRlZXBJbXBvcnRzLCBhbHJlYWR5U2Vlbik7XG4gICAgcmV0dXJuIHtkZXBlbmRlbmNpZXMsIG1pc3NpbmcsIGRlZXBJbXBvcnRzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlIHRoZSBkZXBlbmRlbmNpZXMgb2YgdGhlIGdpdmVuIGZpbGUuXG4gICAqXG4gICAqIEBwYXJhbSBmaWxlIEFuIGFic29sdXRlIHBhdGggdG8gdGhlIGZpbGUgd2hvc2UgZGVwZW5kZW5jaWVzIHdlIHdhbnQgdG8gZ2V0LlxuICAgKiBAcGFyYW0gZGVwZW5kZW5jaWVzIEEgc2V0IHRoYXQgd2lsbCBoYXZlIHRoZSBhYnNvbHV0ZSBwYXRocyBvZiByZXNvbHZlZCBlbnRyeSBwb2ludHMgYWRkZWQgdG9cbiAgICogaXQuXG4gICAqIEBwYXJhbSBtaXNzaW5nIEEgc2V0IHRoYXQgd2lsbCBoYXZlIHRoZSBkZXBlbmRlbmNpZXMgdGhhdCBjb3VsZCBub3QgYmUgZm91bmQgYWRkZWQgdG8gaXQuXG4gICAqIEBwYXJhbSBkZWVwSW1wb3J0cyBBIHNldCB0aGF0IHdpbGwgaGF2ZSB0aGUgaW1wb3J0IHBhdGhzIHRoYXQgZXhpc3QgYnV0IGNhbm5vdCBiZSBtYXBwZWQgdG9cbiAgICogZW50cnktcG9pbnRzLCBpLmUuIGRlZXAtaW1wb3J0cy5cbiAgICogQHBhcmFtIGFscmVhZHlTZWVuIEEgc2V0IHRoYXQgaXMgdXNlZCB0byB0cmFjayBpbnRlcm5hbCBkZXBlbmRlbmNpZXMgdG8gcHJldmVudCBnZXR0aW5nIHN0dWNrXG4gICAqIGluIGFcbiAgICogY2lyY3VsYXIgZGVwZW5kZW5jeSBsb29wLlxuICAgKi9cbiAgcHJpdmF0ZSByZWN1cnNpdmVseUZpbmREZXBlbmRlbmNpZXMoXG4gICAgICBmaWxlOiBBYnNvbHV0ZUZzUGF0aCwgZGVwZW5kZW5jaWVzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+LCBtaXNzaW5nOiBTZXQ8c3RyaW5nPixcbiAgICAgIGRlZXBJbXBvcnRzOiBTZXQ8c3RyaW5nPiwgYWxyZWFkeVNlZW46IFNldDxBYnNvbHV0ZUZzUGF0aD4pOiB2b2lkIHtcbiAgICBjb25zdCBmcm9tQ29udGVudHMgPSB0aGlzLmZzLnJlYWRGaWxlKGZpbGUpO1xuICAgIGlmICghdGhpcy5oYXNJbXBvcnRPclJlZXhwb3J0U3RhdGVtZW50cyhmcm9tQ29udGVudHMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgdGhlIHNvdXJjZSBpbnRvIGEgVHlwZVNjcmlwdCBBU1QgYW5kIHRoZW4gd2FsayBpdCBsb29raW5nIGZvciBpbXBvcnRzIGFuZCByZS1leHBvcnRzLlxuICAgIGNvbnN0IHNmID1cbiAgICAgICAgdHMuY3JlYXRlU291cmNlRmlsZShmaWxlLCBmcm9tQ29udGVudHMsIHRzLlNjcmlwdFRhcmdldC5FUzIwMTUsIGZhbHNlLCB0cy5TY3JpcHRLaW5kLkpTKTtcbiAgICBzZi5zdGF0ZW1lbnRzXG4gICAgICAgIC8vIGZpbHRlciBvdXQgc3RhdGVtZW50cyB0aGF0IGFyZSBub3QgaW1wb3J0cyBvciByZWV4cG9ydHNcbiAgICAgICAgLmZpbHRlcih0aGlzLmlzU3RyaW5nSW1wb3J0T3JSZWV4cG9ydClcbiAgICAgICAgLy8gR3JhYiB0aGUgaWQgb2YgdGhlIG1vZHVsZSB0aGF0IGlzIGJlaW5nIGltcG9ydGVkXG4gICAgICAgIC5tYXAoc3RtdCA9PiBzdG10Lm1vZHVsZVNwZWNpZmllci50ZXh0KVxuICAgICAgICAvLyBSZXNvbHZlIHRoaXMgbW9kdWxlIGlkIGludG8gYW4gYWJzb2x1dGUgcGF0aFxuICAgICAgICAuZm9yRWFjaChpbXBvcnRQYXRoID0+IHtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZE1vZHVsZSA9IHRoaXMubW9kdWxlUmVzb2x2ZXIucmVzb2x2ZU1vZHVsZUltcG9ydChpbXBvcnRQYXRoLCBmaWxlKTtcbiAgICAgICAgICBpZiAocmVzb2x2ZWRNb2R1bGUpIHtcbiAgICAgICAgICAgIGlmIChyZXNvbHZlZE1vZHVsZSBpbnN0YW5jZW9mIFJlc29sdmVkUmVsYXRpdmVNb2R1bGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgaW50ZXJuYWxEZXBlbmRlbmN5ID0gcmVzb2x2ZWRNb2R1bGUubW9kdWxlUGF0aDtcbiAgICAgICAgICAgICAgaWYgKCFhbHJlYWR5U2Vlbi5oYXMoaW50ZXJuYWxEZXBlbmRlbmN5KSkge1xuICAgICAgICAgICAgICAgIGFscmVhZHlTZWVuLmFkZChpbnRlcm5hbERlcGVuZGVuY3kpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlGaW5kRGVwZW5kZW5jaWVzKFxuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbERlcGVuZGVuY3ksIGRlcGVuZGVuY2llcywgbWlzc2luZywgZGVlcEltcG9ydHMsIGFscmVhZHlTZWVuKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHJlc29sdmVkTW9kdWxlIGluc3RhbmNlb2YgUmVzb2x2ZWREZWVwSW1wb3J0KSB7XG4gICAgICAgICAgICAgICAgZGVlcEltcG9ydHMuYWRkKHJlc29sdmVkTW9kdWxlLmltcG9ydFBhdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llcy5hZGQocmVzb2x2ZWRNb2R1bGUuZW50cnlQb2ludFBhdGgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1pc3NpbmcuYWRkKGltcG9ydFBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gc3RhdGVtZW50IGlzIGFuIGltcG9ydCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgbW9kdWxlIHNwZWNpZmllci5cbiAgICogQHBhcmFtIHN0bXQgdGhlIHN0YXRlbWVudCBub2RlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBzdGF0ZW1lbnQgaXMgYW4gaW1wb3J0IHdpdGggYSBzdHJpbmcgbGl0ZXJhbCBtb2R1bGUgc3BlY2lmaWVyLlxuICAgKi9cbiAgaXNTdHJpbmdJbXBvcnRPclJlZXhwb3J0KHN0bXQ6IHRzLlN0YXRlbWVudCk6IHN0bXQgaXMgdHMuSW1wb3J0RGVjbGFyYXRpb24mXG4gICAgICB7bW9kdWxlU3BlY2lmaWVyOiB0cy5TdHJpbmdMaXRlcmFsfSB7XG4gICAgcmV0dXJuIHRzLmlzSW1wb3J0RGVjbGFyYXRpb24oc3RtdCkgfHxcbiAgICAgICAgdHMuaXNFeHBvcnREZWNsYXJhdGlvbihzdG10KSAmJiAhIXN0bXQubW9kdWxlU3BlY2lmaWVyICYmXG4gICAgICAgIHRzLmlzU3RyaW5nTGl0ZXJhbChzdG10Lm1vZHVsZVNwZWNpZmllcik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIHNvdXJjZSBmaWxlIG5lZWRzIHRvIGJlIHBhcnNlZCBmb3IgaW1wb3J0cy5cbiAgICogVGhpcyBpcyBhIHBlcmZvcm1hbmNlIHNob3J0LWNpcmN1aXQsIHdoaWNoIHNhdmVzIHVzIGZyb20gY3JlYXRpbmdcbiAgICogYSBUeXBlU2NyaXB0IEFTVCB1bm5lY2Vzc2FyaWx5LlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBjb250ZW50IG9mIHRoZSBzb3VyY2UgZmlsZSB0byBjaGVjay5cbiAgICpcbiAgICogQHJldHVybnMgZmFsc2UgaWYgdGhlcmUgYXJlIGRlZmluaXRlbHkgbm8gaW1wb3J0IG9yIHJlLWV4cG9ydCBzdGF0ZW1lbnRzXG4gICAqIGluIHRoaXMgZmlsZSwgdHJ1ZSBvdGhlcndpc2UuXG4gICAqL1xuICBoYXNJbXBvcnRPclJlZXhwb3J0U3RhdGVtZW50cyhzb3VyY2U6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAvKGltcG9ydHxleHBvcnQpXFxzLitmcm9tLy50ZXN0KHNvdXJjZSk7XG4gIH1cbn1cbiJdfQ==