/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/compiler-cli/src/ngtsc/indexer/src/api" />
import { ParseSourceFile } from '@angular/compiler';
import * as ts from 'typescript';
/**
 * Describes the kind of identifier found in a template.
 */
export declare enum IdentifierKind {
    Property = 0,
    Method = 1
}
/**
 * Describes the absolute byte offsets of a text anchor in a source code.
 */
export declare class AbsoluteSourceSpan {
    start: number;
    end: number;
    constructor(start: number, end: number);
}
/**
 * Describes a semantically-interesting identifier in a template, such as an interpolated variable
 * or selector.
 */
export interface TemplateIdentifier {
    name: string;
    span: AbsoluteSourceSpan;
    kind: IdentifierKind;
}
/**
 * Describes an analyzed, indexed component and its template.
 */
export interface IndexedComponent {
    name: string;
    selector: string | null;
    file: ParseSourceFile;
    template: {
        identifiers: Set<TemplateIdentifier>;
        usedComponents: Set<ts.Declaration>;
        isInline: boolean;
        file: ParseSourceFile;
    };
}
