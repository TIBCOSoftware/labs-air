(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/entry_point_finder", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/entry_point"], factory);
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
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var EntryPointFinder = /** @class */ (function () {
        function EntryPointFinder(fs, config, logger, resolver) {
            this.fs = fs;
            this.config = config;
            this.logger = logger;
            this.resolver = resolver;
        }
        /**
         * Search the given directory, and sub-directories, for Angular package entry points.
         * @param sourceDirectory An absolute path to the directory to search for entry points.
         */
        EntryPointFinder.prototype.findEntryPoints = function (sourceDirectory, targetEntryPointPath, pathMappings) {
            var _this = this;
            var basePaths = this.getBasePaths(sourceDirectory, pathMappings);
            var unsortedEntryPoints = basePaths.reduce(function (entryPoints, basePath) { return entryPoints.concat(_this.walkDirectoryForEntryPoints(basePath)); }, []);
            var targetEntryPoint = targetEntryPointPath ?
                unsortedEntryPoints.find(function (entryPoint) { return entryPoint.path === targetEntryPointPath; }) :
                undefined;
            return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints, targetEntryPoint);
        };
        /**
         * Extract all the base-paths that we need to search for entry-points.
         *
         * This always contains the standard base-path (`sourceDirectory`).
         * But it also parses the `paths` mappings object to guess additional base-paths.
         *
         * For example:
         *
         * ```
         * getBasePaths('/node_modules', {baseUrl: '/dist', paths: {'*': ['lib/*', 'lib/generated/*']}})
         * > ['/node_modules', '/dist/lib']
         * ```
         *
         * Notice that `'/dist'` is not included as there is no `'*'` path,
         * and `'/dist/lib/generated'` is not included as it is covered by `'/dist/lib'`.
         *
         * @param sourceDirectory The standard base-path (e.g. node_modules).
         * @param pathMappings Path mapping configuration, from which to extract additional base-paths.
         */
        EntryPointFinder.prototype.getBasePaths = function (sourceDirectory, pathMappings) {
            var basePaths = [sourceDirectory];
            if (pathMappings) {
                var baseUrl_1 = file_system_1.resolve(pathMappings.baseUrl);
                values(pathMappings.paths).forEach(function (paths) { return paths.forEach(function (path) {
                    basePaths.push(file_system_1.join(baseUrl_1, extractPathPrefix(path)));
                }); });
            }
            basePaths.sort(); // Get the paths in order with the shorter ones first.
            return basePaths.filter(removeDeeperPaths);
        };
        /**
         * Look for entry points that need to be compiled, starting at the source directory.
         * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
         * @param sourceDirectory An absolute path to the root directory where searching begins.
         */
        EntryPointFinder.prototype.walkDirectoryForEntryPoints = function (sourceDirectory) {
            var _this = this;
            var entryPoints = this.getEntryPointsForPackage(sourceDirectory);
            if (entryPoints.length > 0) {
                // The `sourceDirectory` is an entry-point itself so no need to search its sub-directories.
                return entryPoints;
            }
            this.fs
                .readdir(sourceDirectory)
                // Not interested in hidden files
                .filter(function (p) { return !p.startsWith('.'); })
                // Ignore node_modules
                .filter(function (p) { return p !== 'node_modules'; })
                // Only interested in directories (and only those that are not symlinks)
                .filter(function (p) {
                var stat = _this.fs.lstat(file_system_1.resolve(sourceDirectory, p));
                return stat.isDirectory() && !stat.isSymbolicLink();
            })
                .forEach(function (p) {
                // Either the directory is a potential package or a namespace containing packages (e.g
                // `@angular`).
                var packagePath = file_system_1.join(sourceDirectory, p);
                entryPoints.push.apply(entryPoints, tslib_1.__spread(_this.walkDirectoryForEntryPoints(packagePath)));
                // Also check for any nested node_modules in this package
                var nestedNodeModulesPath = file_system_1.join(packagePath, 'node_modules');
                if (_this.fs.exists(nestedNodeModulesPath)) {
                    entryPoints.push.apply(entryPoints, tslib_1.__spread(_this.walkDirectoryForEntryPoints(nestedNodeModulesPath)));
                }
            });
            return entryPoints;
        };
        /**
         * Recurse the folder structure looking for all the entry points
         * @param packagePath The absolute path to an npm package that may contain entry points
         * @returns An array of entry points that were discovered.
         */
        EntryPointFinder.prototype.getEntryPointsForPackage = function (packagePath) {
            var _this = this;
            var entryPoints = [];
            // Try to get an entry point from the top level package directory
            var topLevelEntryPoint = entry_point_1.getEntryPointInfo(this.fs, this.config, this.logger, packagePath, packagePath);
            // If there is no primary entry-point then exit
            if (topLevelEntryPoint === null) {
                return [];
            }
            // Otherwise store it and search for secondary entry-points
            entryPoints.push(topLevelEntryPoint);
            this.walkDirectory(packagePath, packagePath, function (path, isDirectory) {
                // If the path is a JS file then strip its extension and see if we can match an entry-point.
                var possibleEntryPointPath = isDirectory ? path : stripJsExtension(path);
                var subEntryPoint = entry_point_1.getEntryPointInfo(_this.fs, _this.config, _this.logger, packagePath, possibleEntryPointPath);
                if (subEntryPoint !== null) {
                    entryPoints.push(subEntryPoint);
                }
            });
            return entryPoints;
        };
        /**
         * Recursively walk a directory and its sub-directories, applying a given
         * function to each directory.
         * @param dir the directory to recursively walk.
         * @param fn the function to apply to each directory.
         */
        EntryPointFinder.prototype.walkDirectory = function (packagePath, dir, fn) {
            var _this = this;
            return this.fs
                .readdir(dir)
                // Not interested in hidden files
                .filter(function (path) { return !path.startsWith('.'); })
                // Ignore node_modules
                .filter(function (path) { return path !== 'node_modules'; })
                .map(function (path) { return file_system_1.resolve(dir, path); })
                .forEach(function (path) {
                var stat = _this.fs.lstat(path);
                if (stat.isSymbolicLink()) {
                    // We are not interested in symbolic links
                    return;
                }
                fn(path, stat.isDirectory());
                if (stat.isDirectory()) {
                    _this.walkDirectory(packagePath, path, fn);
                }
            });
        };
        return EntryPointFinder;
    }());
    exports.EntryPointFinder = EntryPointFinder;
    /**
     * Extract everything in the `path` up to the first `*`.
     * @param path The path to parse.
     * @returns The extracted prefix.
     */
    function extractPathPrefix(path) {
        return path.split('*', 1)[0];
    }
    /**
     * A filter function that removes paths that are already covered by higher paths.
     *
     * @param value The current path.
     * @param index The index of the current path.
     * @param array The array of paths (sorted alphabetically).
     * @returns true if this path is not already covered by a previous path.
     */
    function removeDeeperPaths(value, index, array) {
        for (var i = 0; i < index; i++) {
            if (value.startsWith(array[i]))
                return false;
        }
        return true;
    }
    /**
     * Extract all the values (not keys) from an object.
     * @param obj The object to process.
     */
    function values(obj) {
        return Object.keys(obj).map(function (key) { return obj[key]; });
    }
    function stripJsExtension(filePath) {
        return filePath.replace(/\.js$/, '');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnRfZmluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3BhY2thZ2VzL2VudHJ5X3BvaW50X2ZpbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyRUFBeUY7SUFLekYsbUZBQTREO0lBRTVEO1FBQ0UsMEJBQ1ksRUFBYyxFQUFVLE1BQXlCLEVBQVUsTUFBYyxFQUN6RSxRQUE0QjtZQUQ1QixPQUFFLEdBQUYsRUFBRSxDQUFZO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ3pFLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQUcsQ0FBQztRQUM1Qzs7O1dBR0c7UUFDSCwwQ0FBZSxHQUFmLFVBQ0ksZUFBK0IsRUFBRSxvQkFBcUMsRUFDdEUsWUFBMkI7WUFGL0IsaUJBV0M7WUFSQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNuRSxJQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQ3hDLFVBQUMsV0FBVyxFQUFFLFFBQVEsSUFBSyxPQUFBLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQTlELENBQThELEVBQ3pGLEVBQUUsQ0FBQyxDQUFDO1lBQ1IsSUFBTSxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUMzQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxVQUFVLENBQUMsSUFBSSxLQUFLLG9CQUFvQixFQUF4QyxDQUF3QyxDQUFDLENBQUMsQ0FBQztnQkFDbEYsU0FBUyxDQUFDO1lBQ2QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLDJC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Q0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLE1BQU0sQ0FBSSxHQUF1QjtRQUN4QyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFSLENBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFtQixRQUFXO1FBQ3JELE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFNLENBQUM7SUFDNUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGpvaW4sIHJlc29sdmV9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0RlcGVuZGVuY3lSZXNvbHZlciwgU29ydGVkRW50cnlQb2ludHNJbmZvfSBmcm9tICcuLi9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jeV9yZXNvbHZlcic7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXInO1xuaW1wb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7TmdjY0NvbmZpZ3VyYXRpb259IGZyb20gJy4vY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0VudHJ5UG9pbnQsIGdldEVudHJ5UG9pbnRJbmZvfSBmcm9tICcuL2VudHJ5X3BvaW50JztcblxuZXhwb3J0IGNsYXNzIEVudHJ5UG9pbnRGaW5kZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgZnM6IEZpbGVTeXN0ZW0sIHByaXZhdGUgY29uZmlnOiBOZ2NjQ29uZmlndXJhdGlvbiwgcHJpdmF0ZSBsb2dnZXI6IExvZ2dlcixcbiAgICAgIHByaXZhdGUgcmVzb2x2ZXI6IERlcGVuZGVuY3lSZXNvbHZlcikge31cbiAgLyoqXG4gICAqIFNlYXJjaCB0aGUgZ2l2ZW4gZGlyZWN0b3J5LCBhbmQgc3ViLWRpcmVjdG9yaWVzLCBmb3IgQW5ndWxhciBwYWNrYWdlIGVudHJ5IHBvaW50cy5cbiAgICogQHBhcmFtIHNvdXJjZURpcmVjdG9yeSBBbiBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBkaXJlY3RvcnkgdG8gc2VhcmNoIGZvciBlbnRyeSBwb2ludHMuXG4gICAqL1xuICBmaW5kRW50cnlQb2ludHMoXG4gICAgICBzb3VyY2VEaXJlY3Rvcnk6IEFic29sdXRlRnNQYXRoLCB0YXJnZXRFbnRyeVBvaW50UGF0aD86IEFic29sdXRlRnNQYXRoLFxuICAgICAgcGF0aE1hcHBpbmdzPzogUGF0aE1hcHBpbmdzKTogU29ydGVkRW50cnlQb2ludHNJbmZvIHtcbiAgICBjb25zdCBiYXNlUGF0aHMgPSB0aGlzLmdldEJhc2VQYXRocyhzb3VyY2VEaXJlY3RvcnksIHBhdGhNYXBwaW5ncyk7XG4gICAgY29uc3QgdW5zb3J0ZWRFbnRyeVBvaW50cyA9IGJhc2VQYXRocy5yZWR1Y2U8RW50cnlQb2ludFtdPihcbiAgICAgICAgKGVudHJ5UG9pbnRzLCBiYXNlUGF0aCkgPT4gZW50cnlQb2ludHMuY29uY2F0KHRoaXMud2Fsa0RpcmVjdG9yeUZvckVudHJ5UG9pbnRzKGJhc2VQYXRoKSksXG4gICAgICAgIFtdKTtcbiAgICBjb25zdCB0YXJnZXRFbnRyeVBvaW50ID0gdGFyZ2V0RW50cnlQb2ludFBhdGggP1xuICAgICAgICB1bnNvcnRlZEVudHJ5UG9pbnRzLmZpbmQoZW50cnlQb2ludCA9PiBlbnRyeVBvaW50LnBhdGggPT09IHRhcmdldEVudHJ5UG9pbnRQYXRoKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlci5zb3J0RW50cnlQb2ludHNCeURlcGVuZGVuY3kodW5zb3J0ZWRFbnRyeVBvaW50cywgdGFyZ2V0RW50cnlQb2ludCk7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBhbGwgdGhlIGJhc2UtcGF0aHMgdGhhdCB3ZSBuZWVkIHRvIHNlYXJjaCBmb3IgZW50cnktcG9pbnRzLlxuICAgKlxuICAgKiBUaGlzIGFsd2F5cyBjb250YWlucyB0aGUgc3RhbmRhcmQgYmFzZS1wYXRoIChgc291cmNlRGlyZWN0b3J5YCkuXG4gICAqIEJ1dCBpdCBhbHNvIHBhcnNlcyB0aGUgYHBhdGhzYCBtYXBwaW5ncyBvYmplY3QgdG8gZ3Vlc3MgYWRkaXRpb25hbCBiYXNlLXBhdGhzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogYGBgXG4gICAqIGdldEJhc2VQYXRocygnL25vZGVfbW9kdWxlcycsIHtiYXNlVXJsOiAnL2Rpc3QnLCBwYXRoczogeycqJzogWydsaWIvKicsICdsaWIvZ2VuZXJhdGVkLyonXX19KVxuICAgKiA+IFsnL25vZGVfbW9kdWxlcycsICcvZGlzdC9saWInXVxuICAgKiBgYGBcbiAgICpcbiAgICogTm90aWNlIHRoYXQgYCcvZGlzdCdgIGlzIG5vdCBpbmNsdWRlZCBhcyB0aGVyZSBpcyBubyBgJyonYCBwYXRoLFxuICAgKiBhbmQgYCcvZGlzdC9saWIvZ2VuZXJhdGVkJ2AgaXMgbm90IGluY2x1ZGVkIGFzIGl0IGlzIGNvdmVyZWQgYnkgYCcvZGlzdC9saWInYC5cbiAgICpcbiAgICogQHBhcmFtIHNvdXJjZURpcmVjdG9yeSBUaGUgc3RhbmRhcmQgYmFzZS1wYXRoIChlLmcuIG5vZGVfbW9kdWxlcykuXG4gICAqIEBwYXJhbSBwYXRoTWFwcGluZ3MgUGF0aCBtYXBwaW5nIGNvbmZpZ3VyYXRpb24sIGZyb20gd2hpY2ggdG8gZXh0cmFjdCBhZGRpdGlvbmFsIGJhc2UtcGF0aHMuXG4gICAqL1xuICBwcml2YXRlIGdldEJhc2VQYXRocyhzb3VyY2VEaXJlY3Rvcnk6IEFic29sdXRlRnNQYXRoLCBwYXRoTWFwcGluZ3M/OiBQYXRoTWFwcGluZ3MpOlxuICAgICAgQWJzb2x1dGVGc1BhdGhbXSB7XG4gICAgY29uc3QgYmFzZVBhdGhzID0gW3NvdXJjZURpcmVjdG9yeV07XG4gICAgaWYgKHBhdGhNYXBwaW5ncykge1xuICAgICAgY29uc3QgYmFzZVVybCA9IHJlc29sdmUocGF0aE1hcHBpbmdzLmJhc2VVcmwpO1xuICAgICAgdmFsdWVzKHBhdGhNYXBwaW5ncy5wYXRocykuZm9yRWFjaChwYXRocyA9PiBwYXRocy5mb3JFYWNoKHBhdGggPT4ge1xuICAgICAgICBiYXNlUGF0aHMucHVzaChqb2luKGJhc2VVcmwsIGV4dHJhY3RQYXRoUHJlZml4KHBhdGgpKSk7XG4gICAgICB9KSk7XG4gICAgfVxuICAgIGJhc2VQYXRocy5zb3J0KCk7ICAvLyBHZXQgdGhlIHBhdGhzIGluIG9yZGVyIHdpdGggdGhlIHNob3J0ZXIgb25lcyBmaXJzdC5cbiAgICByZXR1cm4gYmFzZVBhdGhzLmZpbHRlcihyZW1vdmVEZWVwZXJQYXRocyk7XG4gIH1cblxuICAvKipcbiAgICogTG9vayBmb3IgZW50cnkgcG9pbnRzIHRoYXQgbmVlZCB0byBiZSBjb21waWxlZCwgc3RhcnRpbmcgYXQgdGhlIHNvdXJjZSBkaXJlY3RvcnkuXG4gICAqIFRoZSBmdW5jdGlvbiB3aWxsIHJlY3Vyc2UgaW50byBkaXJlY3RvcmllcyB0aGF0IHN0YXJ0IHdpdGggYEAuLi5gLCBlLmcuIGBAYW5ndWxhci8uLi5gLlxuICAgKiBAcGFyYW0gc291cmNlRGlyZWN0b3J5IEFuIGFic29sdXRlIHBhdGggdG8gdGhlIHJvb3QgZGlyZWN0b3J5IHdoZXJlIHNlYXJjaGluZyBiZWdpbnMuXG4gICAqL1xuICBwcml2YXRlIHdhbGtEaXJlY3RvcnlGb3JFbnRyeVBvaW50cyhzb3VyY2VEaXJlY3Rvcnk6IEFic29sdXRlRnNQYXRoKTogRW50cnlQb2ludFtdIHtcbiAgICBjb25zdCBlbnRyeVBvaW50cyA9IHRoaXMuZ2V0RW50cnlQb2ludHNGb3JQYWNrYWdlKHNvdXJjZURpcmVjdG9yeSk7XG4gICAgaWYgKGVudHJ5UG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFRoZSBgc291cmNlRGlyZWN0b3J5YCBpcyBhbiBlbnRyeS1wb2ludCBpdHNlbGYgc28gbm8gbmVlZCB0byBzZWFyY2ggaXRzIHN1Yi1kaXJlY3Rvcmllcy5cbiAgICAgIHJldHVybiBlbnRyeVBvaW50cztcbiAgICB9XG5cbiAgICB0aGlzLmZzXG4gICAgICAgIC5yZWFkZGlyKHNvdXJjZURpcmVjdG9yeSlcbiAgICAgICAgLy8gTm90IGludGVyZXN0ZWQgaW4gaGlkZGVuIGZpbGVzXG4gICAgICAgIC5maWx0ZXIocCA9PiAhcC5zdGFydHNXaXRoKCcuJykpXG4gICAgICAgIC8vIElnbm9yZSBub2RlX21vZHVsZXNcbiAgICAgICAgLmZpbHRlcihwID0+IHAgIT09ICdub2RlX21vZHVsZXMnKVxuICAgICAgICAvLyBPbmx5IGludGVyZXN0ZWQgaW4gZGlyZWN0b3JpZXMgKGFuZCBvbmx5IHRob3NlIHRoYXQgYXJlIG5vdCBzeW1saW5rcylcbiAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICBjb25zdCBzdGF0ID0gdGhpcy5mcy5sc3RhdChyZXNvbHZlKHNvdXJjZURpcmVjdG9yeSwgcCkpO1xuICAgICAgICAgIHJldHVybiBzdGF0LmlzRGlyZWN0b3J5KCkgJiYgIXN0YXQuaXNTeW1ib2xpY0xpbmsoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZvckVhY2gocCA9PiB7XG4gICAgICAgICAgLy8gRWl0aGVyIHRoZSBkaXJlY3RvcnkgaXMgYSBwb3RlbnRpYWwgcGFja2FnZSBvciBhIG5hbWVzcGFjZSBjb250YWluaW5nIHBhY2thZ2VzIChlLmdcbiAgICAgICAgICAvLyBgQGFuZ3VsYXJgKS5cbiAgICAgICAgICBjb25zdCBwYWNrYWdlUGF0aCA9IGpvaW4oc291cmNlRGlyZWN0b3J5LCBwKTtcbiAgICAgICAgICBlbnRyeVBvaW50cy5wdXNoKC4uLnRoaXMud2Fsa0RpcmVjdG9yeUZvckVudHJ5UG9pbnRzKHBhY2thZ2VQYXRoKSk7XG5cbiAgICAgICAgICAvLyBBbHNvIGNoZWNrIGZvciBhbnkgbmVzdGVkIG5vZGVfbW9kdWxlcyBpbiB0aGlzIHBhY2thZ2VcbiAgICAgICAgICBjb25zdCBuZXN0ZWROb2RlTW9kdWxlc1BhdGggPSBqb2luKHBhY2thZ2VQYXRoLCAnbm9kZV9tb2R1bGVzJyk7XG4gICAgICAgICAgaWYgKHRoaXMuZnMuZXhpc3RzKG5lc3RlZE5vZGVNb2R1bGVzUGF0aCkpIHtcbiAgICAgICAgICAgIGVudHJ5UG9pbnRzLnB1c2goLi4udGhpcy53YWxrRGlyZWN0b3J5Rm9yRW50cnlQb2ludHMobmVzdGVkTm9kZU1vZHVsZXNQYXRoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICByZXR1cm4gZW50cnlQb2ludHM7XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzZSB0aGUgZm9sZGVyIHN0cnVjdHVyZSBsb29raW5nIGZvciBhbGwgdGhlIGVudHJ5IHBvaW50c1xuICAgKiBAcGFyYW0gcGFja2FnZVBhdGggVGhlIGFic29sdXRlIHBhdGggdG8gYW4gbnBtIHBhY2thZ2UgdGhhdCBtYXkgY29udGFpbiBlbnRyeSBwb2ludHNcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgZW50cnkgcG9pbnRzIHRoYXQgd2VyZSBkaXNjb3ZlcmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRFbnRyeVBvaW50c0ZvclBhY2thZ2UocGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoKTogRW50cnlQb2ludFtdIHtcbiAgICBjb25zdCBlbnRyeVBvaW50czogRW50cnlQb2ludFtdID0gW107XG5cbiAgICAvLyBUcnkgdG8gZ2V0IGFuIGVudHJ5IHBvaW50IGZyb20gdGhlIHRvcCBsZXZlbCBwYWNrYWdlIGRpcmVjdG9yeVxuICAgIGNvbnN0IHRvcExldmVsRW50cnlQb2ludCA9XG4gICAgICAgIGdldEVudHJ5UG9pbnRJbmZvKHRoaXMuZnMsIHRoaXMuY29uZmlnLCB0aGlzLmxvZ2dlciwgcGFja2FnZVBhdGgsIHBhY2thZ2VQYXRoKTtcblxuICAgIC8vIElmIHRoZXJlIGlzIG5vIHByaW1hcnkgZW50cnktcG9pbnQgdGhlbiBleGl0XG4gICAgaWYgKHRvcExldmVsRW50cnlQb2ludCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSBzdG9yZSBpdCBhbmQgc2VhcmNoIGZvciBzZWNvbmRhcnkgZW50cnktcG9pbnRzXG4gICAgZW50cnlQb2ludHMucHVzaCh0b3BMZXZlbEVudHJ5UG9pbnQpO1xuICAgIHRoaXMud2Fsa0RpcmVjdG9yeShwYWNrYWdlUGF0aCwgcGFja2FnZVBhdGgsIChwYXRoLCBpc0RpcmVjdG9yeSkgPT4ge1xuICAgICAgLy8gSWYgdGhlIHBhdGggaXMgYSBKUyBmaWxlIHRoZW4gc3RyaXAgaXRzIGV4dGVuc2lvbiBhbmQgc2VlIGlmIHdlIGNhbiBtYXRjaCBhbiBlbnRyeS1wb2ludC5cbiAgICAgIGNvbnN0IHBvc3NpYmxlRW50cnlQb2ludFBhdGggPSBpc0RpcmVjdG9yeSA/IHBhdGggOiBzdHJpcEpzRXh0ZW5zaW9uKHBhdGgpO1xuICAgICAgY29uc3Qgc3ViRW50cnlQb2ludCA9XG4gICAgICAgICAgZ2V0RW50cnlQb2ludEluZm8odGhpcy5mcywgdGhpcy5jb25maWcsIHRoaXMubG9nZ2VyLCBwYWNrYWdlUGF0aCwgcG9zc2libGVFbnRyeVBvaW50UGF0aCk7XG4gICAgICBpZiAoc3ViRW50cnlQb2ludCAhPT0gbnVsbCkge1xuICAgICAgICBlbnRyeVBvaW50cy5wdXNoKHN1YkVudHJ5UG9pbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGVudHJ5UG9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IHdhbGsgYSBkaXJlY3RvcnkgYW5kIGl0cyBzdWItZGlyZWN0b3JpZXMsIGFwcGx5aW5nIGEgZ2l2ZW5cbiAgICogZnVuY3Rpb24gdG8gZWFjaCBkaXJlY3RvcnkuXG4gICAqIEBwYXJhbSBkaXIgdGhlIGRpcmVjdG9yeSB0byByZWN1cnNpdmVseSB3YWxrLlxuICAgKiBAcGFyYW0gZm4gdGhlIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIGVhY2ggZGlyZWN0b3J5LlxuICAgKi9cbiAgcHJpdmF0ZSB3YWxrRGlyZWN0b3J5KFxuICAgICAgcGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoLCBkaXI6IEFic29sdXRlRnNQYXRoLFxuICAgICAgZm46IChwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgaXNEaXJlY3Rvcnk6IGJvb2xlYW4pID0+IHZvaWQpIHtcbiAgICByZXR1cm4gdGhpcy5mc1xuICAgICAgICAucmVhZGRpcihkaXIpXG4gICAgICAgIC8vIE5vdCBpbnRlcmVzdGVkIGluIGhpZGRlbiBmaWxlc1xuICAgICAgICAuZmlsdGVyKHBhdGggPT4gIXBhdGguc3RhcnRzV2l0aCgnLicpKVxuICAgICAgICAvLyBJZ25vcmUgbm9kZV9tb2R1bGVzXG4gICAgICAgIC5maWx0ZXIocGF0aCA9PiBwYXRoICE9PSAnbm9kZV9tb2R1bGVzJylcbiAgICAgICAgLm1hcChwYXRoID0+IHJlc29sdmUoZGlyLCBwYXRoKSlcbiAgICAgICAgLmZvckVhY2gocGF0aCA9PiB7XG4gICAgICAgICAgY29uc3Qgc3RhdCA9IHRoaXMuZnMubHN0YXQocGF0aCk7XG5cbiAgICAgICAgICBpZiAoc3RhdC5pc1N5bWJvbGljTGluaygpKSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgbm90IGludGVyZXN0ZWQgaW4gc3ltYm9saWMgbGlua3NcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmbihwYXRoLCBzdGF0LmlzRGlyZWN0b3J5KCkpO1xuXG4gICAgICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgdGhpcy53YWxrRGlyZWN0b3J5KHBhY2thZ2VQYXRoLCBwYXRoLCBmbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEV4dHJhY3QgZXZlcnl0aGluZyBpbiB0aGUgYHBhdGhgIHVwIHRvIHRoZSBmaXJzdCBgKmAuXG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB0byBwYXJzZS5cbiAqIEByZXR1cm5zIFRoZSBleHRyYWN0ZWQgcHJlZml4LlxuICovXG5mdW5jdGlvbiBleHRyYWN0UGF0aFByZWZpeChwYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHBhdGguc3BsaXQoJyonLCAxKVswXTtcbn1cblxuLyoqXG4gKiBBIGZpbHRlciBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgcGF0aHMgdGhhdCBhcmUgYWxyZWFkeSBjb3ZlcmVkIGJ5IGhpZ2hlciBwYXRocy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIGN1cnJlbnQgcGF0aC5cbiAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgcGF0aC5cbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgb2YgcGF0aHMgKHNvcnRlZCBhbHBoYWJldGljYWxseSkuXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoaXMgcGF0aCBpcyBub3QgYWxyZWFkeSBjb3ZlcmVkIGJ5IGEgcHJldmlvdXMgcGF0aC5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRGVlcGVyUGF0aHModmFsdWU6IEFic29sdXRlRnNQYXRoLCBpbmRleDogbnVtYmVyLCBhcnJheTogQWJzb2x1dGVGc1BhdGhbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICBpZiAodmFsdWUuc3RhcnRzV2l0aChhcnJheVtpXSkpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGFsbCB0aGUgdmFsdWVzIChub3Qga2V5cykgZnJvbSBhbiBvYmplY3QuXG4gKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gcHJvY2Vzcy5cbiAqL1xuZnVuY3Rpb24gdmFsdWVzPFQ+KG9iajoge1trZXk6IHN0cmluZ106IFR9KTogVFtdIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGtleSA9PiBvYmpba2V5XSk7XG59XG5cbmZ1bmN0aW9uIHN0cmlwSnNFeHRlbnNpb248VCBleHRlbmRzIHN0cmluZz4oZmlsZVBhdGg6IFQpOiBUIHtcbiAgcmV0dXJuIGZpbGVQYXRoLnJlcGxhY2UoL1xcLmpzJC8sICcnKSBhcyBUO1xufVxuIl19