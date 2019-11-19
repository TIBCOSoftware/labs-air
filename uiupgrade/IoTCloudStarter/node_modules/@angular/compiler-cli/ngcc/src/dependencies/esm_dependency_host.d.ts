/// <amd-module name="@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import { AbsoluteFsPath, FileSystem } from '../../../src/ngtsc/file_system';
import { DependencyHost, DependencyInfo } from './dependency_host';
import { ModuleResolver } from './module_resolver';
/**
 * Helper functions for computing dependencies.
 */
export declare class EsmDependencyHost implements DependencyHost {
    private fs;
    private moduleResolver;
    constructor(fs: FileSystem, moduleResolver: ModuleResolver);
    /**
     * Find all the dependencies for the entry-point at the given path.
     *
     * @param entryPointPath The absolute path to the JavaScript file that represents an entry-point.
     * @returns Information about the dependencies of the entry-point, including those that were
     * missing or deep imports into other entry-points.
     */
    findDependencies(entryPointPath: AbsoluteFsPath): DependencyInfo;
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
    private recursivelyFindDependencies;
    /**
     * Check whether the given statement is an import with a string literal module specifier.
     * @param stmt the statement node to check.
     * @returns true if the statement is an import with a string literal module specifier.
     */
    isStringImportOrReexport(stmt: ts.Statement): stmt is ts.ImportDeclaration & {
        moduleSpecifier: ts.StringLiteral;
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
    hasImportOrReexportStatements(source: string): boolean;
}
