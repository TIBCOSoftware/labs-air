/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/ngcc/src/dependencies/dependency_host" />
import { AbsoluteFsPath, PathSegment } from '../../../src/ngtsc/file_system';
export interface DependencyHost {
    findDependencies(entryPointPath: AbsoluteFsPath): DependencyInfo;
}
export interface DependencyInfo {
    dependencies: Set<AbsoluteFsPath>;
    missing: Set<AbsoluteFsPath | PathSegment>;
    deepImports: Set<AbsoluteFsPath>;
}
