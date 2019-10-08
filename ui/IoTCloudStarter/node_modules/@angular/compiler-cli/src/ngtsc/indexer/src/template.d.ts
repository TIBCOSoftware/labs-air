/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/indexer/src/template" />
import { BoundTarget, DirectiveMeta } from '@angular/compiler';
import { TemplateIdentifier } from './api';
/**
 * Traverses a template AST and builds identifiers discovered in it.
 *
 * @param boundTemplate bound template target, which can be used for querying expression targets.
 * @return identifiers in template
 */
export declare function getTemplateIdentifiers(boundTemplate: BoundTarget<DirectiveMeta>): Set<TemplateIdentifier>;
