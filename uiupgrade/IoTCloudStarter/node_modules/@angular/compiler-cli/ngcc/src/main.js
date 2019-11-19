(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/main", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/dependencies/commonjs_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/dependency_resolver", "@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/module_resolver", "@angular/compiler-cli/ngcc/src/dependencies/umd_dependency_host", "@angular/compiler-cli/ngcc/src/logging/console_logger", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/packages/configuration", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/packages/entry_point_bundle", "@angular/compiler-cli/ngcc/src/packages/entry_point_finder", "@angular/compiler-cli/ngcc/src/packages/transformer", "@angular/compiler-cli/ngcc/src/writing/in_place_file_writer", "@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer"], factory);
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
    var commonjs_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/commonjs_dependency_host");
    var dependency_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_resolver");
    var esm_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host");
    var module_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/module_resolver");
    var umd_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/umd_dependency_host");
    var console_logger_1 = require("@angular/compiler-cli/ngcc/src/logging/console_logger");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var configuration_1 = require("@angular/compiler-cli/ngcc/src/packages/configuration");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var entry_point_bundle_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point_bundle");
    var entry_point_finder_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point_finder");
    var transformer_1 = require("@angular/compiler-cli/ngcc/src/packages/transformer");
    var in_place_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer");
    var new_entry_point_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer");
    var SUPPORTED_FORMATS = ['esm5', 'esm2015', 'umd', 'commonjs'];
    /**
     * This is the main entry-point into ngcc (aNGular Compatibility Compiler).
     *
     * You can call this function to process one or more npm packages, to ensure
     * that they are compatible with the ivy compiler (ngtsc).
     *
     * @param options The options telling ngcc what to compile and how.
     */
    function mainNgcc(_a) {
        var e_1, _b;
        var basePath = _a.basePath, targetEntryPointPath = _a.targetEntryPointPath, _c = _a.propertiesToConsider, propertiesToConsider = _c === void 0 ? entry_point_1.SUPPORTED_FORMAT_PROPERTIES : _c, _d = _a.compileAllFormats, compileAllFormats = _d === void 0 ? true : _d, _e = _a.createNewEntryPointFormats, createNewEntryPointFormats = _e === void 0 ? false : _e, _f = _a.logger, logger = _f === void 0 ? new console_logger_1.ConsoleLogger(console_logger_1.LogLevel.info) : _f, pathMappings = _a.pathMappings;
        var fileSystem = file_system_1.getFileSystem();
        var transformer = new transformer_1.Transformer(fileSystem, logger);
        var moduleResolver = new module_resolver_1.ModuleResolver(fileSystem, pathMappings);
        var esmDependencyHost = new esm_dependency_host_1.EsmDependencyHost(fileSystem, moduleResolver);
        var umdDependencyHost = new umd_dependency_host_1.UmdDependencyHost(fileSystem, moduleResolver);
        var commonJsDependencyHost = new commonjs_dependency_host_1.CommonJsDependencyHost(fileSystem, moduleResolver);
        var resolver = new dependency_resolver_1.DependencyResolver(fileSystem, logger, {
            esm5: esmDependencyHost,
            esm2015: esmDependencyHost,
            umd: umdDependencyHost,
            commonjs: commonJsDependencyHost
        });
        var config = new configuration_1.NgccConfiguration(fileSystem, file_system_1.dirname(file_system_1.absoluteFrom(basePath)));
        var finder = new entry_point_finder_1.EntryPointFinder(fileSystem, config, logger, resolver);
        var fileWriter = getFileWriter(fileSystem, createNewEntryPointFormats);
        var absoluteTargetEntryPointPath = targetEntryPointPath ? file_system_1.resolve(basePath, targetEntryPointPath) : undefined;
        if (absoluteTargetEntryPointPath &&
            hasProcessedTargetEntryPoint(fileSystem, absoluteTargetEntryPointPath, propertiesToConsider, compileAllFormats)) {
            logger.debug('The target entry-point has already been processed');
            return;
        }
        var _g = finder.findEntryPoints(file_system_1.absoluteFrom(basePath), absoluteTargetEntryPointPath, pathMappings), entryPoints = _g.entryPoints, invalidEntryPoints = _g.invalidEntryPoints;
        invalidEntryPoints.forEach(function (invalidEntryPoint) {
            logger.debug("Invalid entry-point " + invalidEntryPoint.entryPoint.path + ".", "It is missing required dependencies:\n" +
                invalidEntryPoint.missingDependencies.map(function (dep) { return " - " + dep; }).join('\n'));
        });
        if (absoluteTargetEntryPointPath && entryPoints.length === 0) {
            markNonAngularPackageAsProcessed(fileSystem, absoluteTargetEntryPointPath, propertiesToConsider);
            return;
        }
        try {
            for (var entryPoints_1 = tslib_1.__values(entryPoints), entryPoints_1_1 = entryPoints_1.next(); !entryPoints_1_1.done; entryPoints_1_1 = entryPoints_1.next()) {
                var entryPoint = entryPoints_1_1.value;
                // Are we compiling the Angular core?
                var isCore = entryPoint.name === '@angular/core';
                var compiledFormats = new Set();
                var entryPointPackageJson = entryPoint.packageJson;
                var entryPointPackageJsonPath = fileSystem.resolve(entryPoint.path, 'package.json');
                var hasProcessedDts = build_marker_1.hasBeenProcessed(entryPointPackageJson, 'typings');
                for (var i = 0; i < propertiesToConsider.length; i++) {
                    var property = propertiesToConsider[i];
                    var formatPath = entryPointPackageJson[property];
                    var format = entry_point_1.getEntryPointFormat(fileSystem, entryPoint, property);
                    // No format then this property is not supposed to be compiled.
                    if (!formatPath || !format || SUPPORTED_FORMATS.indexOf(format) === -1)
                        continue;
                    if (build_marker_1.hasBeenProcessed(entryPointPackageJson, property)) {
                        compiledFormats.add(formatPath);
                        logger.debug("Skipping " + entryPoint.name + " : " + property + " (already compiled).");
                        continue;
                    }
                    var isFirstFormat = compiledFormats.size === 0;
                    var processDts = !hasProcessedDts && isFirstFormat;
                    // We don't break if this if statement fails because we still want to mark
                    // the property as processed even if its underlying format has been built already.
                    if (!compiledFormats.has(formatPath) && (compileAllFormats || isFirstFormat)) {
                        var bundle = entry_point_bundle_1.makeEntryPointBundle(fileSystem, entryPoint, formatPath, isCore, property, format, processDts, pathMappings);
                        if (bundle) {
                            logger.info("Compiling " + entryPoint.name + " : " + property + " as " + format);
                            var transformedFiles = transformer.transform(bundle);
                            fileWriter.writeBundle(entryPoint, bundle, transformedFiles);
                            compiledFormats.add(formatPath);
                        }
                        else {
                            logger.warn("Skipping " + entryPoint.name + " : " + format + " (no valid entry point file for this format).");
                        }
                    }
                    else if (!compileAllFormats) {
                        logger.debug("Skipping " + entryPoint.name + " : " + property + " (already compiled).");
                    }
                    // Either this format was just compiled or its underlying format was compiled because of a
                    // previous property.
                    if (compiledFormats.has(formatPath)) {
                        build_marker_1.markAsProcessed(fileSystem, entryPointPackageJson, entryPointPackageJsonPath, property);
                        if (processDts) {
                            build_marker_1.markAsProcessed(fileSystem, entryPointPackageJson, entryPointPackageJsonPath, 'typings');
                        }
                    }
                }
                if (compiledFormats.size === 0) {
                    throw new Error("Failed to compile any formats for entry-point at (" + entryPoint.path + "). Tried " + propertiesToConsider + ".");
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entryPoints_1_1 && !entryPoints_1_1.done && (_b = entryPoints_1.return)) _b.call(entryPoints_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    exports.mainNgcc = mainNgcc;
    function getFileWriter(fs, createNewEntryPointFormats) {
        return createNewEntryPointFormats ? new new_entry_point_file_writer_1.NewEntryPointFileWriter(fs) : new in_place_file_writer_1.InPlaceFileWriter(fs);
    }
    function hasProcessedTargetEntryPoint(fs, targetPath, propertiesToConsider, compileAllFormats) {
        var e_2, _a;
        var packageJsonPath = file_system_1.resolve(targetPath, 'package.json');
        // It might be that this target is configured in which case its package.json might not exist.
        if (!fs.exists(packageJsonPath)) {
            return false;
        }
        var packageJson = JSON.parse(fs.readFile(packageJsonPath));
        try {
            for (var propertiesToConsider_1 = tslib_1.__values(propertiesToConsider), propertiesToConsider_1_1 = propertiesToConsider_1.next(); !propertiesToConsider_1_1.done; propertiesToConsider_1_1 = propertiesToConsider_1.next()) {
                var property = propertiesToConsider_1_1.value;
                if (packageJson[property]) {
                    // Here is a property that should be processed
                    if (build_marker_1.hasBeenProcessed(packageJson, property)) {
                        if (!compileAllFormats) {
                            // It has been processed and we only need one, so we are done.
                            return true;
                        }
                    }
                    else {
                        // It has not been processed but we need all of them, so we are done.
                        return false;
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (propertiesToConsider_1_1 && !propertiesToConsider_1_1.done && (_a = propertiesToConsider_1.return)) _a.call(propertiesToConsider_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // Either all formats need to be compiled and there were none that were unprocessed,
        // Or only the one matching format needs to be compiled but there was at least one matching
        // property before the first processed format that was unprocessed.
        return true;
    }
    /**
     * If we get here, then the requested entry-point did not contain anything compiled by
     * the old Angular compiler. Therefore there is nothing for ngcc to do.
     * So mark all formats in this entry-point as processed so that clients of ngcc can avoid
     * triggering ngcc for this entry-point in the future.
     */
    function markNonAngularPackageAsProcessed(fs, path, propertiesToConsider) {
        var packageJsonPath = file_system_1.resolve(path, 'package.json');
        var packageJson = JSON.parse(fs.readFile(packageJsonPath));
        propertiesToConsider.forEach(function (formatProperty) {
            if (packageJson[formatProperty])
                build_marker_1.markAsProcessed(fs, packageJson, packageJsonPath, formatProperty);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDJFQUFzSDtJQUN0SCxpSEFBK0U7SUFDL0UsdUdBQXNFO0lBQ3RFLHVHQUFxRTtJQUNyRSwrRkFBOEQ7SUFDOUQsdUdBQXFFO0lBQ3JFLHdGQUFpRTtJQUVqRSxxRkFBMEU7SUFDMUUsdUZBQTJEO0lBQzNELG1GQUFrSTtJQUNsSSxpR0FBbUU7SUFDbkUsaUdBQStEO0lBQy9ELG1GQUFtRDtJQUduRCxvR0FBaUU7SUFDakUsa0hBQThFO0lBNkM5RSxJQUFNLGlCQUFpQixHQUF1QixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRXJGOzs7Ozs7O09BT0c7SUFDSCxTQUFnQixRQUFRLENBQ3BCLEVBRXNFOztZQUZyRSxzQkFBUSxFQUFFLDhDQUFvQixFQUFFLDRCQUFrRCxFQUFsRCxxRkFBa0QsRUFDbEYseUJBQXdCLEVBQXhCLDZDQUF3QixFQUFFLGtDQUFrQyxFQUFsQyx1REFBa0MsRUFDNUQsY0FBeUMsRUFBekMsZ0dBQXlDLEVBQUUsOEJBQVk7UUFDMUQsSUFBTSxVQUFVLEdBQUcsMkJBQWEsRUFBRSxDQUFDO1FBQ25DLElBQU0sV0FBVyxHQUFHLElBQUkseUJBQVcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEQsSUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNwRSxJQUFNLGlCQUFpQixHQUFHLElBQUksdUNBQWlCLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzVFLElBQU0saUJBQWlCLEdBQUcsSUFBSSx1Q0FBaUIsQ0FBQyxVQUFVLEVBQUUsY0FB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c0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgRmlsZVN5c3RlbSwgYWJzb2x1dGVGcm9tLCBkaXJuYW1lLCBnZXRGaWxlU3lzdGVtLCByZXNvbHZlfSBmcm9tICcuLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtDb21tb25Kc0RlcGVuZGVuY3lIb3N0fSBmcm9tICcuL2RlcGVuZGVuY2llcy9jb21tb25qc19kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtEZXBlbmRlbmN5UmVzb2x2ZXJ9IGZyb20gJy4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY3lfcmVzb2x2ZXInO1xuaW1wb3J0IHtFc21EZXBlbmRlbmN5SG9zdH0gZnJvbSAnLi9kZXBlbmRlbmNpZXMvZXNtX2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge01vZHVsZVJlc29sdmVyfSBmcm9tICcuL2RlcGVuZGVuY2llcy9tb2R1bGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtVbWREZXBlbmRlbmN5SG9zdH0gZnJvbSAnLi9kZXBlbmRlbmNpZXMvdW1kX2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge0NvbnNvbGVMb2dnZXIsIExvZ0xldmVsfSBmcm9tICcuL2xvZ2dpbmcvY29uc29sZV9sb2dnZXInO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4vbG9nZ2luZy9sb2dnZXInO1xuaW1wb3J0IHtoYXNCZWVuUHJvY2Vzc2VkLCBtYXJrQXNQcm9jZXNzZWR9IGZyb20gJy4vcGFja2FnZXMvYnVpbGRfbWFya2VyJztcbmltcG9ydCB7TmdjY0NvbmZpZ3VyYXRpb259IGZyb20gJy4vcGFja2FnZXMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0VudHJ5UG9pbnRGb3JtYXQsIEVudHJ5UG9pbnRKc29uUHJvcGVydHksIFNVUFBPUlRFRF9GT1JNQVRfUFJPUEVSVElFUywgZ2V0RW50cnlQb2ludEZvcm1hdH0gZnJvbSAnLi9wYWNrYWdlcy9lbnRyeV9wb2ludCc7XG5pbXBvcnQge21ha2VFbnRyeVBvaW50QnVuZGxlfSBmcm9tICcuL3BhY2thZ2VzL2VudHJ5X3BvaW50X2J1bmRsZSc7XG5pbXBvcnQge0VudHJ5UG9pbnRGaW5kZXJ9IGZyb20gJy4vcGFja2FnZXMvZW50cnlfcG9pbnRfZmluZGVyJztcbmltcG9ydCB7VHJhbnNmb3JtZXJ9IGZyb20gJy4vcGFja2FnZXMvdHJhbnNmb3JtZXInO1xuaW1wb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtGaWxlV3JpdGVyfSBmcm9tICcuL3dyaXRpbmcvZmlsZV93cml0ZXInO1xuaW1wb3J0IHtJblBsYWNlRmlsZVdyaXRlcn0gZnJvbSAnLi93cml0aW5nL2luX3BsYWNlX2ZpbGVfd3JpdGVyJztcbmltcG9ydCB7TmV3RW50cnlQb2ludEZpbGVXcml0ZXJ9IGZyb20gJy4vd3JpdGluZy9uZXdfZW50cnlfcG9pbnRfZmlsZV93cml0ZXInO1xuXG4vKipcbiAqIFRoZSBvcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgbmdjYyBjb21waWxlci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ2NjT3B0aW9ucyB7XG4gIC8qKiBUaGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgYG5vZGVfbW9kdWxlc2AgZm9sZGVyIHRoYXQgY29udGFpbnMgdGhlIHBhY2thZ2VzIHRvIHByb2Nlc3MuICovXG4gIGJhc2VQYXRoOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgcGF0aCB0byB0aGUgcHJpbWFyeSBwYWNrYWdlIHRvIGJlIHByb2Nlc3NlZC4gSWYgbm90IGFic29sdXRlIHRoZW4gaXQgbXVzdCBiZSByZWxhdGl2ZSB0b1xuICAgKiBgYmFzZVBhdGhgLlxuICAgKlxuICAgKiBBbGwgaXRzIGRlcGVuZGVuY2llcyB3aWxsIG5lZWQgdG8gYmUgcHJvY2Vzc2VkIHRvby5cbiAgICovXG4gIHRhcmdldEVudHJ5UG9pbnRQYXRoPzogc3RyaW5nO1xuICAvKipcbiAgICogV2hpY2ggZW50cnktcG9pbnQgcHJvcGVydGllcyBpbiB0aGUgcGFja2FnZS5qc29uIHRvIGNvbnNpZGVyIHdoZW4gcHJvY2Vzc2luZyBhbiBlbnRyeS1wb2ludC5cbiAgICogRWFjaCBwcm9wZXJ0eSBzaG91bGQgaG9sZCBhIHBhdGggdG8gdGhlIHBhcnRpY3VsYXIgYnVuZGxlIGZvcm1hdCBmb3IgdGhlIGVudHJ5LXBvaW50LlxuICAgKiBEZWZhdWx0cyB0byBhbGwgdGhlIHByb3BlcnRpZXMgaW4gdGhlIHBhY2thZ2UuanNvbi5cbiAgICovXG4gIHByb3BlcnRpZXNUb0NvbnNpZGVyPzogc3RyaW5nW107XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHByb2Nlc3MgYWxsIGZvcm1hdHMgc3BlY2lmaWVkIGJ5IChgcHJvcGVydGllc1RvQ29uc2lkZXJgKSAgb3IgdG8gc3RvcCBwcm9jZXNzaW5nXG4gICAqIHRoaXMgZW50cnktcG9pbnQgYXQgdGhlIGZpcnN0IG1hdGNoaW5nIGZvcm1hdC4gRGVmYXVsdHMgdG8gYHRydWVgLlxuICAgKi9cbiAgY29tcGlsZUFsbEZvcm1hdHM/OiBib29sZWFuO1xuICAvKipcbiAgICogV2hldGhlciB0byBjcmVhdGUgbmV3IGVudHJ5LXBvaW50cyBidW5kbGVzIHJhdGhlciB0aGFuIG92ZXJ3cml0aW5nIHRoZSBvcmlnaW5hbCBmaWxlcy5cbiAgICovXG4gIGNyZWF0ZU5ld0VudHJ5UG9pbnRGb3JtYXRzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFByb3ZpZGUgYSBsb2dnZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGxvZyBtZXNzYWdlcy5cbiAgICovXG4gIGxvZ2dlcj86IExvZ2dlcjtcbiAgLyoqXG4gICAqIFBhdGhzIG1hcHBpbmcgY29uZmlndXJhdGlvbiAoYHBhdGhzYCBhbmQgYGJhc2VVcmxgKSwgYXMgZm91bmQgaW4gYHRzLkNvbXBpbGVyT3B0aW9uc2AuXG4gICAqIFRoZXNlIGFyZSB1c2VkIHRvIHJlc29sdmUgcGF0aHMgdG8gbG9jYWxseSBidWlsdCBBbmd1bGFyIGxpYnJhcmllcy5cbiAgICovXG4gIHBhdGhNYXBwaW5ncz86IFBhdGhNYXBwaW5ncztcbiAgLyoqXG4gICAqIFByb3ZpZGUgYSBmaWxlLXN5c3RlbSBzZXJ2aWNlIHRoYXQgd2lsbCBiZSB1c2VkIGJ5IG5nY2MgZm9yIGFsbCBmaWxlIGludGVyYWN0aW9ucy5cbiAgICovXG4gIGZpbGVTeXN0ZW0/OiBGaWxlU3lzdGVtO1xufVxuXG5jb25zdCBTVVBQT1JURURfRk9STUFUUzogRW50cnlQb2ludEZvcm1hdFtdID0gWydlc201JywgJ2VzbTIwMTUnLCAndW1kJywgJ2NvbW1vbmpzJ107XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgbWFpbiBlbnRyeS1wb2ludCBpbnRvIG5nY2MgKGFOR3VsYXIgQ29tcGF0aWJpbGl0eSBDb21waWxlcikuXG4gKlxuICogWW91IGNhbiBjYWxsIHRoaXMgZnVuY3Rpb24gdG8gcHJvY2VzcyBvbmUgb3IgbW9yZSBucG0gcGFja2FnZXMsIHRvIGVuc3VyZVxuICogdGhhdCB0aGV5IGFyZSBjb21wYXRpYmxlIHdpdGggdGhlIGl2eSBjb21waWxlciAobmd0c2MpLlxuICpcbiAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIHRlbGxpbmcgbmdjYyB3aGF0IHRvIGNvbXBpbGUgYW5kIGhvdy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1haW5OZ2NjKFxuICAgIHtiYXNlUGF0aCwgdGFyZ2V0RW50cnlQb2ludFBhdGgsIHByb3BlcnRpZXNUb0NvbnNpZGVyID0gU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTLFxuICAgICBjb21waWxlQWxsRm9ybWF0cyA9IHRydWUsIGNyZWF0ZU5ld0VudHJ5UG9pbnRGb3JtYXRzID0gZmFsc2UsXG4gICAgIGxvZ2dlciA9IG5ldyBDb25zb2xlTG9nZ2VyKExvZ0xldmVsLmluZm8pLCBwYXRoTWFwcGluZ3N9OiBOZ2NjT3B0aW9ucyk6IHZvaWQge1xuICBjb25zdCBmaWxlU3lzdGVtID0gZ2V0RmlsZVN5c3RlbSgpO1xuICBjb25zdCB0cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1lcihmaWxlU3lzdGVtLCBsb2dnZXIpO1xuICBjb25zdCBtb2R1bGVSZXNvbHZlciA9IG5ldyBNb2R1bGVSZXNvbHZlcihmaWxlU3lzdGVtLCBwYXRoTWFwcGluZ3MpO1xuICBjb25zdCBlc21EZXBlbmRlbmN5SG9zdCA9IG5ldyBFc21EZXBlbmRlbmN5SG9zdChmaWxlU3lzdGVtLCBtb2R1bGVSZXNvbHZlcik7XG4gIGNvbnN0IHVtZERlcGVuZGVuY3lIb3N0ID0gbmV3IFVtZERlcGVuZGVuY3lIb3N0KGZpbGVTeXN0ZW0sIG1vZHVsZVJlc29sdmVyKTtcbiAgY29uc3QgY29tbW9uSnNEZXBlbmRlbmN5SG9zdCA9IG5ldyBDb21tb25Kc0RlcGVuZGVuY3lIb3N0KGZpbGVTeXN0ZW0sIG1vZHVsZVJlc29sdmVyKTtcbiAgY29uc3QgcmVzb2x2ZXIgPSBuZXcgRGVwZW5kZW5jeVJlc29sdmVyKGZpbGVTeXN0ZW0sIGxvZ2dlciwge1xuICAgIGVzbTU6IGVzbURlcGVuZGVuY3lIb3N0LFxuICAgIGVzbTIwMTU6IGVzbURlcGVuZGVuY3lIb3N0LFxuICAgIHVtZDogdW1kRGVwZW5kZW5jeUhvc3QsXG4gICAgY29tbW9uanM6IGNvbW1vbkpzRGVwZW5kZW5jeUhvc3RcbiAgfSk7XG4gIGNvbnN0IGNvbmZpZyA9IG5ldyBOZ2NjQ29uZmlndXJhdGlvbihmaWxlU3lzdGVtLCBkaXJuYW1lKGFic29sdXRlRnJvbShiYXNlUGF0aCkpKTtcbiAgY29uc3QgZmluZGVyID0gbmV3IEVudHJ5UG9pbnRGaW5kZXIoZmlsZVN5c3RlbSwgY29uZmlnLCBsb2dnZXIsIHJlc29sdmVyKTtcbiAgY29uc3QgZmlsZVdyaXRlciA9IGdldEZpbGVXcml0ZXIoZmlsZVN5c3RlbSwgY3JlYXRlTmV3RW50cnlQb2ludEZvcm1hdHMpO1xuXG4gIGNvbnN0IGFic29sdXRlVGFyZ2V0RW50cnlQb2ludFBhdGggPVxuICAgICAgdGFyZ2V0RW50cnlQb2ludFBhdGggPyByZXNvbHZlKGJhc2VQYXRoLCB0YXJnZXRFbnRyeVBvaW50UGF0aCkgOiB1bmRlZmluZWQ7XG5cbiAgaWYgKGFic29sdXRlVGFyZ2V0RW50cnlQb2ludFBhdGggJiZcbiAgICAgIGhhc1Byb2Nlc3NlZFRhcmdldEVudHJ5UG9pbnQoXG4gICAgICAgICAgZmlsZVN5c3RlbSwgYWJzb2x1dGVUYXJnZXRFbnRyeVBvaW50UGF0aCwgcHJvcGVydGllc1RvQ29uc2lkZXIsIGNvbXBpbGVBbGxGb3JtYXRzKSkge1xuICAgIGxvZ2dlci5kZWJ1ZygnVGhlIHRhcmdldCBlbnRyeS1wb2ludCBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHtlbnRyeVBvaW50cywgaW52YWxpZEVudHJ5UG9pbnRzfSA9XG4gICAgICBmaW5kZXIuZmluZEVudHJ5UG9pbnRzKGFic29sdXRlRnJvbShiYXNlUGF0aCksIGFic29sdXRlVGFyZ2V0RW50cnlQb2ludFBhdGgsIHBhdGhNYXBwaW5ncyk7XG5cbiAgaW52YWxpZEVudHJ5UG9pbnRzLmZvckVhY2goaW52YWxpZEVudHJ5UG9pbnQgPT4ge1xuICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgYEludmFsaWQgZW50cnktcG9pbnQgJHtpbnZhbGlkRW50cnlQb2ludC5lbnRyeVBvaW50LnBhdGh9LmAsXG4gICAgICAgIGBJdCBpcyBtaXNzaW5nIHJlcXVpcmVkIGRlcGVuZGVuY2llczpcXG5gICtcbiAgICAgICAgICAgIGludmFsaWRFbnRyeVBvaW50Lm1pc3NpbmdEZXBlbmRlbmNpZXMubWFwKGRlcCA9PiBgIC0gJHtkZXB9YCkuam9pbignXFxuJykpO1xuICB9KTtcblxuICBpZiAoYWJzb2x1dGVUYXJnZXRFbnRyeVBvaW50UGF0aCAmJiBlbnRyeVBvaW50cy5sZW5ndGggPT09IDApIHtcbiAgICBtYXJrTm9uQW5ndWxhclBhY2thZ2VBc1Byb2Nlc3NlZChcbiAgICAgICAgZmlsZVN5c3RlbSwgYWJzb2x1dGVUYXJnZXRFbnRyeVBvaW50UGF0aCwgcHJvcGVydGllc1RvQ29uc2lkZXIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZvciAoY29uc3QgZW50cnlQb2ludCBvZiBlbnRyeVBvaW50cykge1xuICAgIC8vIEFyZSB3ZSBjb21waWxpbmcgdGhlIEFuZ3VsYXIgY29yZT9cbiAgICBjb25zdCBpc0NvcmUgPSBlbnRyeVBvaW50Lm5hbWUgPT09ICdAYW5ndWxhci9jb3JlJztcblxuICAgIGNvbnN0IGNvbXBpbGVkRm9ybWF0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IGVudHJ5UG9pbnRQYWNrYWdlSnNvbiA9IGVudHJ5UG9pbnQucGFja2FnZUpzb247XG4gICAgY29uc3QgZW50cnlQb2ludFBhY2thZ2VKc29uUGF0aCA9IGZpbGVTeXN0ZW0ucmVzb2x2ZShlbnRyeVBvaW50LnBhdGgsICdwYWNrYWdlLmpzb24nKTtcblxuICAgIGNvbnN0IGhhc1Byb2Nlc3NlZER0cyA9IGhhc0JlZW5Qcm9jZXNzZWQoZW50cnlQb2ludFBhY2thZ2VKc29uLCAndHlwaW5ncycpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzVG9Db25zaWRlci5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzVG9Db25zaWRlcltpXSBhcyBFbnRyeVBvaW50SnNvblByb3BlcnR5O1xuICAgICAgY29uc3QgZm9ybWF0UGF0aCA9IGVudHJ5UG9pbnRQYWNrYWdlSnNvbltwcm9wZXJ0eV07XG4gICAgICBjb25zdCBmb3JtYXQgPSBnZXRFbnRyeVBvaW50Rm9ybWF0KGZpbGVTeXN0ZW0sIGVudHJ5UG9pbnQsIHByb3BlcnR5KTtcblxuICAgICAgLy8gTm8gZm9ybWF0IHRoZW4gdGhpcyBwcm9wZXJ0eSBpcyBub3Qgc3VwcG9zZWQgdG8gYmUgY29tcGlsZWQuXG4gICAgICBpZiAoIWZvcm1hdFBhdGggfHwgIWZvcm1hdCB8fCBTVVBQT1JURURfRk9STUFUUy5pbmRleE9mKGZvcm1hdCkgPT09IC0xKSBjb250aW51ZTtcblxuICAgICAgaWYgKGhhc0JlZW5Qcm9jZXNzZWQoZW50cnlQb2ludFBhY2thZ2VKc29uLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgY29tcGlsZWRGb3JtYXRzLmFkZChmb3JtYXRQYXRoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBTa2lwcGluZyAke2VudHJ5UG9pbnQubmFtZX0gOiAke3Byb3BlcnR5fSAoYWxyZWFkeSBjb21waWxlZCkuYCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc0ZpcnN0Rm9ybWF0ID0gY29tcGlsZWRGb3JtYXRzLnNpemUgPT09IDA7XG4gICAgICBjb25zdCBwcm9jZXNzRHRzID0gIWhhc1Byb2Nlc3NlZER0cyAmJiBpc0ZpcnN0Rm9ybWF0O1xuXG4gICAgICAvLyBXZSBkb24ndCBicmVhayBpZiB0aGlzIGlmIHN0YXRlbWVudCBmYWlscyBiZWNhdXNlIHdlIHN0aWxsIHdhbnQgdG8gbWFya1xuICAgICAgLy8gdGhlIHByb3BlcnR5IGFzIHByb2Nlc3NlZCBldmVuIGlmIGl0cyB1bmRlcmx5aW5nIGZvcm1hdCBoYXMgYmVlbiBidWlsdCBhbHJlYWR5LlxuICAgICAgaWYgKCFjb21waWxlZEZvcm1hdHMuaGFzKGZvcm1hdFBhdGgpICYmIChjb21waWxlQWxsRm9ybWF0cyB8fCBpc0ZpcnN0Rm9ybWF0KSkge1xuICAgICAgICBjb25zdCBidW5kbGUgPSBtYWtlRW50cnlQb2ludEJ1bmRsZShcbiAgICAgICAgICAgIGZpbGVTeXN0ZW0sIGVudHJ5UG9pbnQsIGZvcm1hdFBhdGgsIGlzQ29yZSwgcHJvcGVydHksIGZvcm1hdCwgcHJvY2Vzc0R0cywgcGF0aE1hcHBpbmdzKTtcbiAgICAgICAgaWYgKGJ1bmRsZSkge1xuICAgICAgICAgIGxvZ2dlci5pbmZvKGBDb21waWxpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtwcm9wZXJ0eX0gYXMgJHtmb3JtYXR9YCk7XG4gICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRGaWxlcyA9IHRyYW5zZm9ybWVyLnRyYW5zZm9ybShidW5kbGUpO1xuICAgICAgICAgIGZpbGVXcml0ZXIud3JpdGVCdW5kbGUoZW50cnlQb2ludCwgYnVuZGxlLCB0cmFuc2Zvcm1lZEZpbGVzKTtcbiAgICAgICAgICBjb21waWxlZEZvcm1hdHMuYWRkKGZvcm1hdFBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ2dlci53YXJuKFxuICAgICAgICAgICAgICBgU2tpcHBpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtmb3JtYXR9IChubyB2YWxpZCBlbnRyeSBwb2ludCBmaWxlIGZvciB0aGlzIGZvcm1hdCkuYCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWNvbXBpbGVBbGxGb3JtYXRzKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgU2tpcHBpbmcgJHtlbnRyeVBvaW50Lm5hbWV9IDogJHtwcm9wZXJ0eX0gKGFscmVhZHkgY29tcGlsZWQpLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBFaXRoZXIgdGhpcyBmb3JtYXQgd2FzIGp1c3QgY29tcGlsZWQgb3IgaXRzIHVuZGVybHlpbmcgZm9ybWF0IHdhcyBjb21waWxlZCBiZWNhdXNlIG9mIGFcbiAgICAgIC8vIHByZXZpb3VzIHByb3BlcnR5LlxuICAgICAgaWYgKGNvbXBpbGVkRm9ybWF0cy5oYXMoZm9ybWF0UGF0aCkpIHtcbiAgICAgICAgbWFya0FzUHJvY2Vzc2VkKGZpbGVTeXN0ZW0sIGVudHJ5UG9pbnRQYWNrYWdlSnNvbiwgZW50cnlQb2ludFBhY2thZ2VKc29uUGF0aCwgcHJvcGVydHkpO1xuICAgICAgICBpZiAocHJvY2Vzc0R0cykge1xuICAgICAgICAgIG1hcmtBc1Byb2Nlc3NlZChmaWxlU3lzdGVtLCBlbnRyeVBvaW50UGFja2FnZUpzb24sIGVudHJ5UG9pbnRQYWNrYWdlSnNvblBhdGgsICd0eXBpbmdzJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29tcGlsZWRGb3JtYXRzLnNpemUgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRmFpbGVkIHRvIGNvbXBpbGUgYW55IGZvcm1hdHMgZm9yIGVudHJ5LXBvaW50IGF0ICgke2VudHJ5UG9pbnQucGF0aH0pLiBUcmllZCAke3Byb3BlcnRpZXNUb0NvbnNpZGVyfS5gKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RmlsZVdyaXRlcihmczogRmlsZVN5c3RlbSwgY3JlYXRlTmV3RW50cnlQb2ludEZvcm1hdHM6IGJvb2xlYW4pOiBGaWxlV3JpdGVyIHtcbiAgcmV0dXJuIGNyZWF0ZU5ld0VudHJ5UG9pbnRGb3JtYXRzID8gbmV3IE5ld0VudHJ5UG9pbnRGaWxlV3JpdGVyKGZzKSA6IG5ldyBJblBsYWNlRmlsZVdyaXRlcihmcyk7XG59XG5cbmZ1bmN0aW9uIGhhc1Byb2Nlc3NlZFRhcmdldEVudHJ5UG9pbnQoXG4gICAgZnM6IEZpbGVTeXN0ZW0sIHRhcmdldFBhdGg6IEFic29sdXRlRnNQYXRoLCBwcm9wZXJ0aWVzVG9Db25zaWRlcjogc3RyaW5nW10sXG4gICAgY29tcGlsZUFsbEZvcm1hdHM6IGJvb2xlYW4pIHtcbiAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcmVzb2x2ZSh0YXJnZXRQYXRoLCAncGFja2FnZS5qc29uJyk7XG4gIC8vIEl0IG1pZ2h0IGJlIHRoYXQgdGhpcyB0YXJnZXQgaXMgY29uZmlndXJlZCBpbiB3aGljaCBjYXNlIGl0cyBwYWNrYWdlLmpzb24gbWlnaHQgbm90IGV4aXN0LlxuICBpZiAoIWZzLmV4aXN0cyhwYWNrYWdlSnNvblBhdGgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZShwYWNrYWdlSnNvblBhdGgpKTtcblxuICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIHByb3BlcnRpZXNUb0NvbnNpZGVyKSB7XG4gICAgaWYgKHBhY2thZ2VKc29uW3Byb3BlcnR5XSkge1xuICAgICAgLy8gSGVyZSBpcyBhIHByb3BlcnR5IHRoYXQgc2hvdWxkIGJlIHByb2Nlc3NlZFxuICAgICAgaWYgKGhhc0JlZW5Qcm9jZXNzZWQocGFja2FnZUpzb24sIHByb3BlcnR5IGFzIEVudHJ5UG9pbnRKc29uUHJvcGVydHkpKSB7XG4gICAgICAgIGlmICghY29tcGlsZUFsbEZvcm1hdHMpIHtcbiAgICAgICAgICAvLyBJdCBoYXMgYmVlbiBwcm9jZXNzZWQgYW5kIHdlIG9ubHkgbmVlZCBvbmUsIHNvIHdlIGFyZSBkb25lLlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJdCBoYXMgbm90IGJlZW4gcHJvY2Vzc2VkIGJ1dCB3ZSBuZWVkIGFsbCBvZiB0aGVtLCBzbyB3ZSBhcmUgZG9uZS5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBFaXRoZXIgYWxsIGZvcm1hdHMgbmVlZCB0byBiZSBjb21waWxlZCBhbmQgdGhlcmUgd2VyZSBub25lIHRoYXQgd2VyZSB1bnByb2Nlc3NlZCxcbiAgLy8gT3Igb25seSB0aGUgb25lIG1hdGNoaW5nIGZvcm1hdCBuZWVkcyB0byBiZSBjb21waWxlZCBidXQgdGhlcmUgd2FzIGF0IGxlYXN0IG9uZSBtYXRjaGluZ1xuICAvLyBwcm9wZXJ0eSBiZWZvcmUgdGhlIGZpcnN0IHByb2Nlc3NlZCBmb3JtYXQgdGhhdCB3YXMgdW5wcm9jZXNzZWQuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIElmIHdlIGdldCBoZXJlLCB0aGVuIHRoZSByZXF1ZXN0ZWQgZW50cnktcG9pbnQgZGlkIG5vdCBjb250YWluIGFueXRoaW5nIGNvbXBpbGVkIGJ5XG4gKiB0aGUgb2xkIEFuZ3VsYXIgY29tcGlsZXIuIFRoZXJlZm9yZSB0aGVyZSBpcyBub3RoaW5nIGZvciBuZ2NjIHRvIGRvLlxuICogU28gbWFyayBhbGwgZm9ybWF0cyBpbiB0aGlzIGVudHJ5LXBvaW50IGFzIHByb2Nlc3NlZCBzbyB0aGF0IGNsaWVudHMgb2YgbmdjYyBjYW4gYXZvaWRcbiAqIHRyaWdnZXJpbmcgbmdjYyBmb3IgdGhpcyBlbnRyeS1wb2ludCBpbiB0aGUgZnV0dXJlLlxuICovXG5mdW5jdGlvbiBtYXJrTm9uQW5ndWxhclBhY2thZ2VBc1Byb2Nlc3NlZChcbiAgICBmczogRmlsZVN5c3RlbSwgcGF0aDogQWJzb2x1dGVGc1BhdGgsIHByb3BlcnRpZXNUb0NvbnNpZGVyOiBzdHJpbmdbXSkge1xuICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSByZXNvbHZlKHBhdGgsICdwYWNrYWdlLmpzb24nKTtcbiAgY29uc3QgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlKHBhY2thZ2VKc29uUGF0aCkpO1xuICBwcm9wZXJ0aWVzVG9Db25zaWRlci5mb3JFYWNoKGZvcm1hdFByb3BlcnR5ID0+IHtcbiAgICBpZiAocGFja2FnZUpzb25bZm9ybWF0UHJvcGVydHldKVxuICAgICAgbWFya0FzUHJvY2Vzc2VkKGZzLCBwYWNrYWdlSnNvbiwgcGFja2FnZUpzb25QYXRoLCBmb3JtYXRQcm9wZXJ0eSBhcyBFbnRyeVBvaW50SnNvblByb3BlcnR5KTtcbiAgfSk7XG59XG4iXX0=