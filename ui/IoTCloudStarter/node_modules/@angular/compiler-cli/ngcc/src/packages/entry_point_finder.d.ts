/// <amd-module name="@angular/compiler-cli/ngcc/src/packages/entry_point_finder" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AbsoluteFsPath, FileSystem } from '../../../src/ngtsc/file_system';
import { DependencyResolver, SortedEntryPointsInfo } from '../dependencies/dependency_resolver';
import { Logger } from '../logging/logger';
import { PathMappings } from '../utils';
import { NgccConfiguration } from './configuration';
export declare class EntryPointFinder {
    private fs;
    private config;
    private logger;
    private resolver;
    constructor(fs: FileSystem, config: NgccConfiguration, logger: Logger, resolver: DependencyResolver);
    /**
     * Search the given directory, and sub-directories, for Angular package entry points.
     * @param sourceDirectory An absolute path to the directory to search for entry points.
     */
    findEntryPoints(sourceDirectory: AbsoluteFsPath, targetEntryPointPath?: AbsoluteFsPath, pathMappings?: PathMappings): SortedEntryPointsInfo;
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
    private getBasePaths;
    /**
     * Look for entry points that need to be compiled, starting at the source directory.
     * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
     * @param sourceDirectory An absolute path to the root directory where searching begins.
     */
    private walkDirectoryForEntryPoints;
    /**
     * Recurse the folder structure looking for all the entry points
     * @param packagePath The absolute path to an npm package that may contain entry points
     * @returns An array of entry points that were discovered.
     */
    private getEntryPointsForPackage;
    /**
     * Recursively walk a directory and its sub-directories, applying a given
     * function to each directory.
     * @param dir the directory to recursively walk.
     * @param fn the function to apply to each directory.
     */
    private walkDirectory;
}
