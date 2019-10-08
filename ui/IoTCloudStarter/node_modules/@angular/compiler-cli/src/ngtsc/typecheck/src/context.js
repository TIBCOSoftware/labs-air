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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/context", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/environment", "@angular/compiler-cli/src/ngtsc/typecheck/src/host", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var environment_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/environment");
    var host_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/host");
    var type_check_block_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block");
    var type_check_file_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file");
    var type_constructor_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor");
    /**
     * A template type checking context for a program.
     *
     * The `TypeCheckContext` allows registration of components and their templates which need to be
     * type checked. It also allows generation of modified `ts.SourceFile`s which contain the type
     * checking code.
     */
    var TypeCheckContext = /** @class */ (function () {
        function TypeCheckContext(config, refEmitter, typeCheckFilePath) {
            this.config = config;
            this.refEmitter = refEmitter;
            /**
             * A `Map` of `ts.SourceFile`s that the context has seen to the operations (additions of methods
             * or type-check blocks) that need to be eventually performed on that file.
             */
            this.opMap = new Map();
            /**
             * Tracks when an a particular class has a pending type constructor patching operation already
             * queued.
             */
            this.typeCtorPending = new Set();
            this.typeCheckFile = new type_check_file_1.TypeCheckFile(typeCheckFilePath, this.config, this.refEmitter);
        }
        /**
         * Record a template for the given component `node`, with a `SelectorMatcher` for directive
         * matching.
         *
         * @param node class of the node being recorded.
         * @param template AST nodes of the template being recorded.
         * @param matcher `SelectorMatcher` which tracks directives that are in scope for this template.
         */
        TypeCheckContext.prototype.addTemplate = function (ref, boundTarget, pipes) {
            var e_1, _a;
            try {
                // Get all of the directives used in the template and record type constructors for all of them.
                for (var _b = tslib_1.__values(boundTarget.getUsedDirectives()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var dir = _c.value;
                    var dirRef = dir.ref;
                    var dirNode = dirRef.node;
                    if (type_constructor_1.requiresInlineTypeCtor(dirNode)) {
                        // Add a type constructor operation for the directive.
                        this.addInlineTypeCtor(dirNode.getSourceFile(), dirRef, {
                            fnName: 'ngTypeCtor',
                            // The constructor should have a body if the directive comes from a .ts file, but not if
                            // it comes from a .d.ts file. .d.ts declarations don't have bodies.
                            body: !dirNode.getSourceFile().isDeclarationFile,
                            fields: {
                                inputs: Object.keys(dir.inputs),
                                outputs: Object.keys(dir.outputs),
                                // TODO(alxhub): support queries
                                queries: dir.queries,
                            },
                        });
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
            if (type_check_block_1.requiresInlineTypeCheckBlock(ref.node)) {
                // This class didn't meet the requirements for external type checking, so generate an inline
                // TCB for the class.
                this.addInlineTypeCheckBlock(ref, { boundTarget: boundTarget, pipes: pipes });
            }
            else {
                // The class can be type-checked externally as normal.
                this.typeCheckFile.addTypeCheckBlock(ref, { boundTarget: boundTarget, pipes: pipes });
            }
        };
        /**
         * Record a type constructor for the given `node` with the given `ctorMetadata`.
         */
        TypeCheckContext.prototype.addInlineTypeCtor = function (sf, ref, ctorMeta) {
            if (this.typeCtorPending.has(ref.node)) {
                return;
            }
            this.typeCtorPending.add(ref.node);
            // Lazily construct the operation map.
            if (!this.opMap.has(sf)) {
                this.opMap.set(sf, []);
            }
            var ops = this.opMap.get(sf);
            // Push a `TypeCtorOp` into the operation queue for the source file.
            ops.push(new TypeCtorOp(ref, ctorMeta, this.config));
        };
        /**
         * Transform a `ts.SourceFile` into a version that includes type checking code.
         *
         * If this particular source file has no directives that require type constructors, or components
         * that require type check blocks, then it will be returned directly. Otherwise, a new
         * `ts.SourceFile` is parsed from modified text of the original. This is necessary to ensure the
         * added code has correct positional information associated with it.
         */
        TypeCheckContext.prototype.transform = function (sf) {
            var _this = this;
            // If there are no operations pending for this particular file, return it directly.
            if (!this.opMap.has(sf)) {
                return sf;
            }
            // Imports may need to be added to the file to support type-checking of directives used in the
            // template within it.
            var importManager = new translator_1.ImportManager(new imports_1.NoopImportRewriter(), '_i');
            // Each Op has a splitPoint index into the text where it needs to be inserted. Split the
            // original source text into chunks at these split points, where code will be inserted between
            // the chunks.
            var ops = this.opMap.get(sf).sort(orderOps);
            var textParts = splitStringAtPoints(sf.text, ops.map(function (op) { return op.splitPoint; }));
            // Use a `ts.Printer` to generate source code.
            var printer = ts.createPrinter({ omitTrailingSemicolon: true });
            // Begin with the intial section of the code text.
            var code = textParts[0];
            // Process each operation and use the printer to generate source code for it, inserting it into
            // the source code in between the original chunks.
            ops.forEach(function (op, idx) {
                var text = op.execute(importManager, sf, _this.refEmitter, printer);
                code += text + textParts[idx + 1];
            });
            // Write out the imports that need to be added to the beginning of the file.
            var imports = importManager.getAllImports(sf.fileName)
                .map(function (i) { return "import * as " + i.qualifier + " from '" + i.specifier + "';"; })
                .join('\n');
            code = imports + '\n' + code;
            // Parse the new source file and return it.
            return ts.createSourceFile(sf.fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        };
        TypeCheckContext.prototype.calculateTemplateDiagnostics = function (originalProgram, originalHost, originalOptions) {
            var e_2, _a, e_3, _b;
            var typeCheckSf = this.typeCheckFile.render();
            // First, build the map of original source files.
            var sfMap = new Map();
            var interestingFiles = [typeCheckSf];
            try {
                for (var _c = tslib_1.__values(originalProgram.getSourceFiles()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var originalSf = _d.value;
                    var sf = this.transform(originalSf);
                    sfMap.set(sf.fileName, sf);
                    if (!sf.isDeclarationFile && this.opMap.has(originalSf)) {
                        interestingFiles.push(sf);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
            sfMap.set(typeCheckSf.fileName, typeCheckSf);
            var typeCheckProgram = ts.createProgram({
                host: new host_1.TypeCheckProgramHost(sfMap, originalHost),
                options: originalOptions,
                oldProgram: originalProgram,
                rootNames: originalProgram.getRootFileNames(),
            });
            var diagnostics = [];
            try {
                for (var interestingFiles_1 = tslib_1.__values(interestingFiles), interestingFiles_1_1 = interestingFiles_1.next(); !interestingFiles_1_1.done; interestingFiles_1_1 = interestingFiles_1.next()) {
                    var sf = interestingFiles_1_1.value;
                    diagnostics.push.apply(diagnostics, tslib_1.__spread(typeCheckProgram.getSemanticDiagnostics(sf)));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (interestingFiles_1_1 && !interestingFiles_1_1.done && (_b = interestingFiles_1.return)) _b.call(interestingFiles_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return {
                diagnostics: diagnostics.filter(function (diag) {
                    if (diag.code === 6133 /* $var is declared but its value is never read. */) {
                        return false;
                    }
                    else if (diag.code === 6199 /* All variables are unused. */) {
                        return false;
                    }
                    else if (diag.code ===
                        2695 /* Left side of comma operator is unused and has no side effects. */) {
                        return false;
                    }
                    return true;
                }),
                program: typeCheckProgram,
            };
        };
        TypeCheckContext.prototype.addInlineTypeCheckBlock = function (ref, tcbMeta) {
            var sf = ref.node.getSourceFile();
            if (!this.opMap.has(sf)) {
                this.opMap.set(sf, []);
            }
            var ops = this.opMap.get(sf);
            ops.push(new TcbOp(ref, tcbMeta, this.config));
        };
        return TypeCheckContext;
    }());
    exports.TypeCheckContext = TypeCheckContext;
    /**
     * A type check block operation which produces type check code for a particular component.
     */
    var TcbOp = /** @class */ (function () {
        function TcbOp(ref, meta, config) {
            this.ref = ref;
            this.meta = meta;
            this.config = config;
        }
        Object.defineProperty(TcbOp.prototype, "splitPoint", {
            /**
             * Type check blocks are inserted immediately after the end of the component class.
             */
            get: function () { return this.ref.node.end + 1; },
            enumerable: true,
            configurable: true
        });
        TcbOp.prototype.execute = function (im, sf, refEmitter, printer) {
            var env = new environment_1.Environment(this.config, im, refEmitter, sf);
            var fnName = ts.createIdentifier("_tcb_" + this.ref.node.pos);
            var fn = type_check_block_1.generateTypeCheckBlock(env, this.ref, fnName, this.meta);
            return printer.printNode(ts.EmitHint.Unspecified, fn, sf);
        };
        return TcbOp;
    }());
    /**
     * A type constructor operation which produces type constructor code for a particular directive.
     */
    var TypeCtorOp = /** @class */ (function () {
        function TypeCtorOp(ref, meta, config) {
            this.ref = ref;
            this.meta = meta;
            this.config = config;
        }
        Object.defineProperty(TypeCtorOp.prototype, "splitPoint", {
            /**
             * Type constructor operations are inserted immediately before the end of the directive class.
             */
            get: function () { return this.ref.node.end - 1; },
            enumerable: true,
            configurable: true
        });
        TypeCtorOp.prototype.execute = function (im, sf, refEmitter, printer) {
            var tcb = type_constructor_1.generateInlineTypeCtor(this.ref.node, this.meta, this.config);
            return printer.printNode(ts.EmitHint.Unspecified, tcb, sf);
        };
        return TypeCtorOp;
    }());
    /**
     * Compare two operations and return their split point ordering.
     */
    function orderOps(op1, op2) {
        return op1.splitPoint - op2.splitPoint;
    }
    /**
     * Split a string into chunks at any number of split points.
     */
    function splitStringAtPoints(str, points) {
        var splits = [];
        var start = 0;
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            splits.push(str.substring(start, point));
            start = point;
        }
        splits.push(str.substring(start));
        return splits;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILCtCQUFpQztJQUdqQyxtRUFBOEU7SUFFOUUseUVBQStDO0lBRy9DLHlGQUEwQztJQUMxQywyRUFBNEM7SUFDNUMsbUdBQXdGO0lBQ3hGLGlHQUFtRTtJQUNuRSxtR0FBa0Y7SUFJbEY7Ozs7OztPQU1HO0lBQ0g7UUFHRSwwQkFDWSxNQUEwQixFQUFVLFVBQTRCLEVBQ3hFLGlCQUFpQztZQUR6QixXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUFVLGVBQVUsR0FBVixVQUFVLENBQWtCO1lBSzVFOzs7ZUFHRztZQUNLLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztZQUUvQzs7O2VBR0c7WUFDSyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1lBYnZELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSwrQkFBYSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFjRDs7Ozs7OztXQU9HO1FBQ0gsc0NBQVcsR0FBWCxVQUNJLEdBQXFELEVBQ3JELFdBQW9ELEVBQ3BELEtBQW9FOzs7Z0JBQ3RFLCtGQUErRjtnQkFDL0YsS0FBa0IsSUFBQSxLQUFBLGlCQUFBLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBLGdCQUFBLDRCQUFFO29CQUE5QyxJQUFNLEdBQUcsV0FBQTtvQkFDWixJQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBdUQsQ0FBQztvQkFDM0UsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDNUIsSUFBSSx5Q0FBc0IsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDbkMsc0RBQXNEO3dCQUN0RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLE1BQU0sRUFBRTs0QkFDdEQsTUFBTSxFQUFFLFlBQVk7NEJBQ3BCLHdGQUF3Rjs0QkFDeEYsb0VBQW9FOzRCQUNwRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsaUJBQWlCOzRCQUNoRCxNQUFNLEVBQUU7Z0NBQ04sTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQ0FDL0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztnQ0FDakMsZ0NBQWdDO2dDQUNoQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87NkJBQ3JCO3lCQUNGLENBQUMsQ0FBQztxQkFDSjtpQkFDRjs7Ozs7Ozs7O1lBRUQsSUFBSSwrQ0FBNEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFDLDRGQUE0RjtnQkFDNUYscUJBQXFCO2dCQUNyQixJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLEVBQUMsV0FBVyxhQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUMsQ0FBQyxDQUFDO2FBQ3pEO2lCQUFNO2dCQUNMLHNEQUFzRDtnQkFDdEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsRUFBQyxXQUFXLGFBQUEsRUFBRSxLQUFLLE9BQUEsRUFBQyxDQUFDLENBQUM7YUFDakU7UUFDSCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCw0Q0FBaUIsR0FBakIsVUFDSSxFQUFpQixFQUFFLEdBQXFELEVBQ3hFLFFBQTBCO1lBQzVCLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0QyxPQUFPO2FBQ1I7WUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbkMsc0NBQXNDO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3hCO1lBQ0QsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFHLENBQUM7WUFFakMsb0VBQW9FO1lBQ3BFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILG9DQUFTLEdBQVQsVUFBVSxFQUFpQjtZQUEzQixpQkFxQ0M7WUFwQ0MsbUZBQW1GO1lBQ25GLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDdkIsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUVELDhGQUE4RjtZQUM5RixzQkFBc0I7WUFDdEIsSUFBTSxhQUFhLEdBQUcsSUFBSSwwQkFBYSxDQUFDLElBQUksNEJBQWtCLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUV4RSx3RkFBd0Y7WUFDeEYsOEZBQThGO1lBQzlGLGNBQWM7WUFDZCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEQsSUFBTSxTQUFTLEdBQUcsbUJBQW1CLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFVBQVUsRUFBYixDQUFhLENBQUMsQ0FBQyxDQUFDO1lBRTdFLDhDQUE4QztZQUM5QyxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUVoRSxrREFBa0Q7WUFDbEQsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhCLCtGQUErRjtZQUMvRixrREFBa0Q7WUFDbEQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQUUsRUFBRSxHQUFHO2dCQUNsQixJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsS0FBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDckUsSUFBSSxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDO1lBRUgsNEVBQTRFO1lBQzVFLElBQUksT0FBTyxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQztpQkFDbkMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsaUJBQWUsQ0FBQyxDQUFDLFNBQVMsZUFBVSxDQUFDLENBQUMsU0FBUyxPQUFJLEVBQW5ELENBQW1ELENBQUM7aUJBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixJQUFJLEdBQUcsT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7WUFFN0IsMkNBQTJDO1lBQzNDLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCx1REFBNEIsR0FBNUIsVUFDSSxlQUEyQixFQUFFLFlBQTZCLEVBQzFELGVBQW1DOztZQUlyQyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hELGlEQUFpRDtZQUNqRCxJQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztZQUMvQyxJQUFNLGdCQUFnQixHQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDOztnQkFDeEQsS0FBeUIsSUFBQSxLQUFBLGlCQUFBLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBdEQsSUFBTSxVQUFVLFdBQUE7b0JBQ25CLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3RDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDdkQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUMzQjtpQkFDRjs7Ozs7Ozs7O1lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRTdDLElBQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQztnQkFDeEMsSUFBSSxFQUFFLElBQUksMkJBQW9CLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQztnQkFDbkQsT0FBTyxFQUFFLGVBQWU7Z0JBQ3hCLFVBQVUsRUFBRSxlQUFlO2dCQUMzQixTQUFTLEVBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFO2FBQzlDLENBQUMsQ0FBQztZQUVILElBQU0sV0FBVyxHQUFvQixFQUFFLENBQUM7O2dCQUN4QyxLQUFpQixJQUFBLHFCQUFBLGlCQUFBLGdCQUFnQixDQUFBLGtEQUFBLGdGQUFFO29CQUE5QixJQUFNLEVBQUUsNkJBQUE7b0JBQ1gsV0FBVyxDQUFDLElBQUksT0FBaEIsV0FBVyxtQkFBUyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsR0FBRTtpQkFDbEU7Ozs7Ozs7OztZQUVELE9BQU87Z0JBQ0wsV0FBVyxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQzNCLFVBQUMsSUFBbUI7b0JBRWQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxtREFBbUQsRUFBRTt3QkFDMUUsT0FBTyxLQUFLLENBQUM7cUJBQ2Q7eUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQywrQkFBK0IsRUFBRTt3QkFDN0QsT0FBTyxLQUFLLENBQUM7cUJBQ2Q7eUJBQU0sSUFDSCxJQUFJLENBQUMsSUFBSTt3QkFDVCxJQUFJLENBQUMsb0VBQW9FLEVBQUU7d0JBQzdFLE9BQU8sS0FBSyxDQUFDO3FCQUNkO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUMsQ0FBQztnQkFDVixPQUFPLEVBQUUsZ0JBQWdCO2FBQzFCLENBQUM7UUFDSixDQUFDO1FBRU8sa0RBQXVCLEdBQS9CLFVBQ0ksR0FBcUQsRUFDckQsT0FBK0I7WUFDakMsSUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUN4QjtZQUNELElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRyxDQUFDO1lBQ2pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBak1ELElBaU1DO0lBak1ZLDRDQUFnQjtJQXdON0I7O09BRUc7SUFDSDtRQUNFLGVBQ2EsR0FBcUQsRUFDckQsSUFBNEIsRUFBVyxNQUEwQjtZQURqRSxRQUFHLEdBQUgsR0FBRyxDQUFrRDtZQUNyRCxTQUFJLEdBQUosSUFBSSxDQUF3QjtZQUFXLFdBQU0sR0FBTixNQUFNLENBQW9CO1FBQUcsQ0FBQztRQUtsRixzQkFBSSw2QkFBVTtZQUhkOztlQUVHO2lCQUNILGNBQTJCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7OztXQUFBO1FBRTFELHVCQUFPLEdBQVAsVUFBUSxFQUFpQixFQUFFLEVBQWlCLEVBQUUsVUFBNEIsRUFBRSxPQUFtQjtZQUU3RixJQUFNLEdBQUcsR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdELElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUssQ0FBQyxDQUFDO1lBQ2hFLElBQU0sRUFBRSxHQUFHLHlDQUFzQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEUsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBQ0gsWUFBQztJQUFELENBQUMsQUFqQkQsSUFpQkM7SUFFRDs7T0FFRztJQUNIO1FBQ0Usb0JBQ2EsR0FBcUQsRUFDckQsSUFBc0IsRUFBVSxNQUEwQjtZQUQxRCxRQUFHLEdBQUgsR0FBRyxDQUFrRDtZQUNyRCxTQUFJLEdBQUosSUFBSSxDQUFrQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQW9CO1FBQUcsQ0FBQztRQUszRSxzQkFBSSxrQ0FBVTtZQUhkOztlQUVHO2lCQUNILGNBQTJCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7OztXQUFBO1FBRTFELDRCQUFPLEdBQVAsVUFBUSxFQUFpQixFQUFFLEVBQWlCLEVBQUUsVUFBNEIsRUFBRSxPQUFtQjtZQUU3RixJQUFNLEdBQUcsR0FBRyx5Q0FBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxRSxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFDSCxpQkFBQztJQUFELENBQUMsQUFmRCxJQWVDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLFFBQVEsQ0FBQyxHQUFPLEVBQUUsR0FBTztRQUNoQyxPQUFPLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLG1CQUFtQixDQUFDLEdBQVcsRUFBRSxNQUFnQjtRQUN4RCxJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEMsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN6QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ2Y7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsQyxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0JvdW5kVGFyZ2V0fSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aH0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtOb29wSW1wb3J0UmV3cml0ZXIsIFJlZmVyZW5jZSwgUmVmZXJlbmNlRW1pdHRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyfSBmcm9tICcuLi8uLi90cmFuc2xhdG9yJztcblxuaW1wb3J0IHtUeXBlQ2hlY2tCbG9ja01ldGFkYXRhLCBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSwgVHlwZUNoZWNraW5nQ29uZmlnLCBUeXBlQ3Rvck1ldGFkYXRhfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCB7VHlwZUNoZWNrUHJvZ3JhbUhvc3R9IGZyb20gJy4vaG9zdCc7XG5pbXBvcnQge2dlbmVyYXRlVHlwZUNoZWNrQmxvY2ssIHJlcXVpcmVzSW5saW5lVHlwZUNoZWNrQmxvY2t9IGZyb20gJy4vdHlwZV9jaGVja19ibG9jayc7XG5pbXBvcnQge1R5cGVDaGVja0ZpbGUsIHR5cGVDaGVja0ZpbGVQYXRofSBmcm9tICcuL3R5cGVfY2hlY2tfZmlsZSc7XG5pbXBvcnQge2dlbmVyYXRlSW5saW5lVHlwZUN0b3IsIHJlcXVpcmVzSW5saW5lVHlwZUN0b3J9IGZyb20gJy4vdHlwZV9jb25zdHJ1Y3Rvcic7XG5cblxuXG4vKipcbiAqIEEgdGVtcGxhdGUgdHlwZSBjaGVja2luZyBjb250ZXh0IGZvciBhIHByb2dyYW0uXG4gKlxuICogVGhlIGBUeXBlQ2hlY2tDb250ZXh0YCBhbGxvd3MgcmVnaXN0cmF0aW9uIG9mIGNvbXBvbmVudHMgYW5kIHRoZWlyIHRlbXBsYXRlcyB3aGljaCBuZWVkIHRvIGJlXG4gKiB0eXBlIGNoZWNrZWQuIEl0IGFsc28gYWxsb3dzIGdlbmVyYXRpb24gb2YgbW9kaWZpZWQgYHRzLlNvdXJjZUZpbGVgcyB3aGljaCBjb250YWluIHRoZSB0eXBlXG4gKiBjaGVja2luZyBjb2RlLlxuICovXG5leHBvcnQgY2xhc3MgVHlwZUNoZWNrQ29udGV4dCB7XG4gIHByaXZhdGUgdHlwZUNoZWNrRmlsZTogVHlwZUNoZWNrRmlsZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcsIHByaXZhdGUgcmVmRW1pdHRlcjogUmVmZXJlbmNlRW1pdHRlcixcbiAgICAgIHR5cGVDaGVja0ZpbGVQYXRoOiBBYnNvbHV0ZUZzUGF0aCkge1xuICAgIHRoaXMudHlwZUNoZWNrRmlsZSA9IG5ldyBUeXBlQ2hlY2tGaWxlKHR5cGVDaGVja0ZpbGVQYXRoLCB0aGlzLmNvbmZpZywgdGhpcy5yZWZFbWl0dGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGBNYXBgIG9mIGB0cy5Tb3VyY2VGaWxlYHMgdGhhdCB0aGUgY29udGV4dCBoYXMgc2VlbiB0byB0aGUgb3BlcmF0aW9ucyAoYWRkaXRpb25zIG9mIG1ldGhvZHNcbiAgICogb3IgdHlwZS1jaGVjayBibG9ja3MpIHRoYXQgbmVlZCB0byBiZSBldmVudHVhbGx5IHBlcmZvcm1lZCBvbiB0aGF0IGZpbGUuXG4gICAqL1xuICBwcml2YXRlIG9wTWFwID0gbmV3IE1hcDx0cy5Tb3VyY2VGaWxlLCBPcFtdPigpO1xuXG4gIC8qKlxuICAgKiBUcmFja3Mgd2hlbiBhbiBhIHBhcnRpY3VsYXIgY2xhc3MgaGFzIGEgcGVuZGluZyB0eXBlIGNvbnN0cnVjdG9yIHBhdGNoaW5nIG9wZXJhdGlvbiBhbHJlYWR5XG4gICAqIHF1ZXVlZC5cbiAgICovXG4gIHByaXZhdGUgdHlwZUN0b3JQZW5kaW5nID0gbmV3IFNldDx0cy5DbGFzc0RlY2xhcmF0aW9uPigpO1xuXG4gIC8qKlxuICAgKiBSZWNvcmQgYSB0ZW1wbGF0ZSBmb3IgdGhlIGdpdmVuIGNvbXBvbmVudCBgbm9kZWAsIHdpdGggYSBgU2VsZWN0b3JNYXRjaGVyYCBmb3IgZGlyZWN0aXZlXG4gICAqIG1hdGNoaW5nLlxuICAgKlxuICAgKiBAcGFyYW0gbm9kZSBjbGFzcyBvZiB0aGUgbm9kZSBiZWluZyByZWNvcmRlZC5cbiAgICogQHBhcmFtIHRlbXBsYXRlIEFTVCBub2RlcyBvZiB0aGUgdGVtcGxhdGUgYmVpbmcgcmVjb3JkZWQuXG4gICAqIEBwYXJhbSBtYXRjaGVyIGBTZWxlY3Rvck1hdGNoZXJgIHdoaWNoIHRyYWNrcyBkaXJlY3RpdmVzIHRoYXQgYXJlIGluIHNjb3BlIGZvciB0aGlzIHRlbXBsYXRlLlxuICAgKi9cbiAgYWRkVGVtcGxhdGUoXG4gICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+PixcbiAgICAgIGJvdW5kVGFyZ2V0OiBCb3VuZFRhcmdldDxUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YT4sXG4gICAgICBwaXBlczogTWFwPHN0cmluZywgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+Pik6IHZvaWQge1xuICAgIC8vIEdldCBhbGwgb2YgdGhlIGRpcmVjdGl2ZXMgdXNlZCBpbiB0aGUgdGVtcGxhdGUgYW5kIHJlY29yZCB0eXBlIGNvbnN0cnVjdG9ycyBmb3IgYWxsIG9mIHRoZW0uXG4gICAgZm9yIChjb25zdCBkaXIgb2YgYm91bmRUYXJnZXQuZ2V0VXNlZERpcmVjdGl2ZXMoKSkge1xuICAgICAgY29uc3QgZGlyUmVmID0gZGlyLnJlZiBhcyBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj47XG4gICAgICBjb25zdCBkaXJOb2RlID0gZGlyUmVmLm5vZGU7XG4gICAgICBpZiAocmVxdWlyZXNJbmxpbmVUeXBlQ3RvcihkaXJOb2RlKSkge1xuICAgICAgICAvLyBBZGQgYSB0eXBlIGNvbnN0cnVjdG9yIG9wZXJhdGlvbiBmb3IgdGhlIGRpcmVjdGl2ZS5cbiAgICAgICAgdGhpcy5hZGRJbmxpbmVUeXBlQ3RvcihkaXJOb2RlLmdldFNvdXJjZUZpbGUoKSwgZGlyUmVmLCB7XG4gICAgICAgICAgZm5OYW1lOiAnbmdUeXBlQ3RvcicsXG4gICAgICAgICAgLy8gVGhlIGNvbnN0cnVjdG9yIHNob3VsZCBoYXZlIGEgYm9keSBpZiB0aGUgZGlyZWN0aXZlIGNvbWVzIGZyb20gYSAudHMgZmlsZSwgYnV0IG5vdCBpZlxuICAgICAgICAgIC8vIGl0IGNvbWVzIGZyb20gYSAuZC50cyBmaWxlLiAuZC50cyBkZWNsYXJhdGlvbnMgZG9uJ3QgaGF2ZSBib2RpZXMuXG4gICAgICAgICAgYm9keTogIWRpck5vZGUuZ2V0U291cmNlRmlsZSgpLmlzRGVjbGFyYXRpb25GaWxlLFxuICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgaW5wdXRzOiBPYmplY3Qua2V5cyhkaXIuaW5wdXRzKSxcbiAgICAgICAgICAgIG91dHB1dHM6IE9iamVjdC5rZXlzKGRpci5vdXRwdXRzKSxcbiAgICAgICAgICAgIC8vIFRPRE8oYWx4aHViKTogc3VwcG9ydCBxdWVyaWVzXG4gICAgICAgICAgICBxdWVyaWVzOiBkaXIucXVlcmllcyxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVxdWlyZXNJbmxpbmVUeXBlQ2hlY2tCbG9jayhyZWYubm9kZSkpIHtcbiAgICAgIC8vIFRoaXMgY2xhc3MgZGlkbid0IG1lZXQgdGhlIHJlcXVpcmVtZW50cyBmb3IgZXh0ZXJuYWwgdHlwZSBjaGVja2luZywgc28gZ2VuZXJhdGUgYW4gaW5saW5lXG4gICAgICAvLyBUQ0IgZm9yIHRoZSBjbGFzcy5cbiAgICAgIHRoaXMuYWRkSW5saW5lVHlwZUNoZWNrQmxvY2socmVmLCB7Ym91bmRUYXJnZXQsIHBpcGVzfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBjbGFzcyBjYW4gYmUgdHlwZS1jaGVja2VkIGV4dGVybmFsbHkgYXMgbm9ybWFsLlxuICAgICAgdGhpcy50eXBlQ2hlY2tGaWxlLmFkZFR5cGVDaGVja0Jsb2NrKHJlZiwge2JvdW5kVGFyZ2V0LCBwaXBlc30pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvcmQgYSB0eXBlIGNvbnN0cnVjdG9yIGZvciB0aGUgZ2l2ZW4gYG5vZGVgIHdpdGggdGhlIGdpdmVuIGBjdG9yTWV0YWRhdGFgLlxuICAgKi9cbiAgYWRkSW5saW5lVHlwZUN0b3IoXG4gICAgICBzZjogdHMuU291cmNlRmlsZSwgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4sXG4gICAgICBjdG9yTWV0YTogVHlwZUN0b3JNZXRhZGF0YSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnR5cGVDdG9yUGVuZGluZy5oYXMocmVmLm5vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudHlwZUN0b3JQZW5kaW5nLmFkZChyZWYubm9kZSk7XG5cbiAgICAvLyBMYXppbHkgY29uc3RydWN0IHRoZSBvcGVyYXRpb24gbWFwLlxuICAgIGlmICghdGhpcy5vcE1hcC5oYXMoc2YpKSB7XG4gICAgICB0aGlzLm9wTWFwLnNldChzZiwgW10pO1xuICAgIH1cbiAgICBjb25zdCBvcHMgPSB0aGlzLm9wTWFwLmdldChzZikgITtcblxuICAgIC8vIFB1c2ggYSBgVHlwZUN0b3JPcGAgaW50byB0aGUgb3BlcmF0aW9uIHF1ZXVlIGZvciB0aGUgc291cmNlIGZpbGUuXG4gICAgb3BzLnB1c2gobmV3IFR5cGVDdG9yT3AocmVmLCBjdG9yTWV0YSwgdGhpcy5jb25maWcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gYSBgdHMuU291cmNlRmlsZWAgaW50byBhIHZlcnNpb24gdGhhdCBpbmNsdWRlcyB0eXBlIGNoZWNraW5nIGNvZGUuXG4gICAqXG4gICAqIElmIHRoaXMgcGFydGljdWxhciBzb3VyY2UgZmlsZSBoYXMgbm8gZGlyZWN0aXZlcyB0aGF0IHJlcXVpcmUgdHlwZSBjb25zdHJ1Y3RvcnMsIG9yIGNvbXBvbmVudHNcbiAgICogdGhhdCByZXF1aXJlIHR5cGUgY2hlY2sgYmxvY2tzLCB0aGVuIGl0IHdpbGwgYmUgcmV0dXJuZWQgZGlyZWN0bHkuIE90aGVyd2lzZSwgYSBuZXdcbiAgICogYHRzLlNvdXJjZUZpbGVgIGlzIHBhcnNlZCBmcm9tIG1vZGlmaWVkIHRleHQgb2YgdGhlIG9yaWdpbmFsLiBUaGlzIGlzIG5lY2Vzc2FyeSB0byBlbnN1cmUgdGhlXG4gICAqIGFkZGVkIGNvZGUgaGFzIGNvcnJlY3QgcG9zaXRpb25hbCBpbmZvcm1hdGlvbiBhc3NvY2lhdGVkIHdpdGggaXQuXG4gICAqL1xuICB0cmFuc2Zvcm0oc2Y6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gb3BlcmF0aW9ucyBwZW5kaW5nIGZvciB0aGlzIHBhcnRpY3VsYXIgZmlsZSwgcmV0dXJuIGl0IGRpcmVjdGx5LlxuICAgIGlmICghdGhpcy5vcE1hcC5oYXMoc2YpKSB7XG4gICAgICByZXR1cm4gc2Y7XG4gICAgfVxuXG4gICAgLy8gSW1wb3J0cyBtYXkgbmVlZCB0byBiZSBhZGRlZCB0byB0aGUgZmlsZSB0byBzdXBwb3J0IHR5cGUtY2hlY2tpbmcgb2YgZGlyZWN0aXZlcyB1c2VkIGluIHRoZVxuICAgIC8vIHRlbXBsYXRlIHdpdGhpbiBpdC5cbiAgICBjb25zdCBpbXBvcnRNYW5hZ2VyID0gbmV3IEltcG9ydE1hbmFnZXIobmV3IE5vb3BJbXBvcnRSZXdyaXRlcigpLCAnX2knKTtcblxuICAgIC8vIEVhY2ggT3AgaGFzIGEgc3BsaXRQb2ludCBpbmRleCBpbnRvIHRoZSB0ZXh0IHdoZXJlIGl0IG5lZWRzIHRvIGJlIGluc2VydGVkLiBTcGxpdCB0aGVcbiAgICAvLyBvcmlnaW5hbCBzb3VyY2UgdGV4dCBpbnRvIGNodW5rcyBhdCB0aGVzZSBzcGxpdCBwb2ludHMsIHdoZXJlIGNvZGUgd2lsbCBiZSBpbnNlcnRlZCBiZXR3ZWVuXG4gICAgLy8gdGhlIGNodW5rcy5cbiAgICBjb25zdCBvcHMgPSB0aGlzLm9wTWFwLmdldChzZikgIS5zb3J0KG9yZGVyT3BzKTtcbiAgICBjb25zdCB0ZXh0UGFydHMgPSBzcGxpdFN0cmluZ0F0UG9pbnRzKHNmLnRleHQsIG9wcy5tYXAob3AgPT4gb3Auc3BsaXRQb2ludCkpO1xuXG4gICAgLy8gVXNlIGEgYHRzLlByaW50ZXJgIHRvIGdlbmVyYXRlIHNvdXJjZSBjb2RlLlxuICAgIGNvbnN0IHByaW50ZXIgPSB0cy5jcmVhdGVQcmludGVyKHtvbWl0VHJhaWxpbmdTZW1pY29sb246IHRydWV9KTtcblxuICAgIC8vIEJlZ2luIHdpdGggdGhlIGludGlhbCBzZWN0aW9uIG9mIHRoZSBjb2RlIHRleHQuXG4gICAgbGV0IGNvZGUgPSB0ZXh0UGFydHNbMF07XG5cbiAgICAvLyBQcm9jZXNzIGVhY2ggb3BlcmF0aW9uIGFuZCB1c2UgdGhlIHByaW50ZXIgdG8gZ2VuZXJhdGUgc291cmNlIGNvZGUgZm9yIGl0LCBpbnNlcnRpbmcgaXQgaW50b1xuICAgIC8vIHRoZSBzb3VyY2UgY29kZSBpbiBiZXR3ZWVuIHRoZSBvcmlnaW5hbCBjaHVua3MuXG4gICAgb3BzLmZvckVhY2goKG9wLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IHRleHQgPSBvcC5leGVjdXRlKGltcG9ydE1hbmFnZXIsIHNmLCB0aGlzLnJlZkVtaXR0ZXIsIHByaW50ZXIpO1xuICAgICAgY29kZSArPSB0ZXh0ICsgdGV4dFBhcnRzW2lkeCArIDFdO1xuICAgIH0pO1xuXG4gICAgLy8gV3JpdGUgb3V0IHRoZSBpbXBvcnRzIHRoYXQgbmVlZCB0byBiZSBhZGRlZCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlLlxuICAgIGxldCBpbXBvcnRzID0gaW1wb3J0TWFuYWdlci5nZXRBbGxJbXBvcnRzKHNmLmZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoaSA9PiBgaW1wb3J0ICogYXMgJHtpLnF1YWxpZmllcn0gZnJvbSAnJHtpLnNwZWNpZmllcn0nO2ApXG4gICAgICAgICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpO1xuICAgIGNvZGUgPSBpbXBvcnRzICsgJ1xcbicgKyBjb2RlO1xuXG4gICAgLy8gUGFyc2UgdGhlIG5ldyBzb3VyY2UgZmlsZSBhbmQgcmV0dXJuIGl0LlxuICAgIHJldHVybiB0cy5jcmVhdGVTb3VyY2VGaWxlKHNmLmZpbGVOYW1lLCBjb2RlLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlLCB0cy5TY3JpcHRLaW5kLlRTKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVRlbXBsYXRlRGlhZ25vc3RpY3MoXG4gICAgICBvcmlnaW5hbFByb2dyYW06IHRzLlByb2dyYW0sIG9yaWdpbmFsSG9zdDogdHMuQ29tcGlsZXJIb3N0LFxuICAgICAgb3JpZ2luYWxPcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpOiB7XG4gICAgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSxcbiAgICBwcm9ncmFtOiB0cy5Qcm9ncmFtLFxuICB9IHtcbiAgICBjb25zdCB0eXBlQ2hlY2tTZiA9IHRoaXMudHlwZUNoZWNrRmlsZS5yZW5kZXIoKTtcbiAgICAvLyBGaXJzdCwgYnVpbGQgdGhlIG1hcCBvZiBvcmlnaW5hbCBzb3VyY2UgZmlsZXMuXG4gICAgY29uc3Qgc2ZNYXAgPSBuZXcgTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4oKTtcbiAgICBjb25zdCBpbnRlcmVzdGluZ0ZpbGVzOiB0cy5Tb3VyY2VGaWxlW10gPSBbdHlwZUNoZWNrU2ZdO1xuICAgIGZvciAoY29uc3Qgb3JpZ2luYWxTZiBvZiBvcmlnaW5hbFByb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgICAgY29uc3Qgc2YgPSB0aGlzLnRyYW5zZm9ybShvcmlnaW5hbFNmKTtcbiAgICAgIHNmTWFwLnNldChzZi5maWxlTmFtZSwgc2YpO1xuICAgICAgaWYgKCFzZi5pc0RlY2xhcmF0aW9uRmlsZSAmJiB0aGlzLm9wTWFwLmhhcyhvcmlnaW5hbFNmKSkge1xuICAgICAgICBpbnRlcmVzdGluZ0ZpbGVzLnB1c2goc2YpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNmTWFwLnNldCh0eXBlQ2hlY2tTZi5maWxlTmFtZSwgdHlwZUNoZWNrU2YpO1xuXG4gICAgY29uc3QgdHlwZUNoZWNrUHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0oe1xuICAgICAgaG9zdDogbmV3IFR5cGVDaGVja1Byb2dyYW1Ib3N0KHNmTWFwLCBvcmlnaW5hbEhvc3QpLFxuICAgICAgb3B0aW9uczogb3JpZ2luYWxPcHRpb25zLFxuICAgICAgb2xkUHJvZ3JhbTogb3JpZ2luYWxQcm9ncmFtLFxuICAgICAgcm9vdE5hbWVzOiBvcmlnaW5hbFByb2dyYW0uZ2V0Um9vdEZpbGVOYW1lcygpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgc2Ygb2YgaW50ZXJlc3RpbmdGaWxlcykge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi50eXBlQ2hlY2tQcm9ncmFtLmdldFNlbWFudGljRGlhZ25vc3RpY3Moc2YpKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGlhZ25vc3RpY3M6IGRpYWdub3N0aWNzLmZpbHRlcihcbiAgICAgICAgICAoZGlhZzogdHMuRGlhZ25vc3RpYyk6XG4gICAgICAgICAgICAgIGJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaWFnLmNvZGUgPT09IDYxMzMgLyogJHZhciBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIG5ldmVyIHJlYWQuICovKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkaWFnLmNvZGUgPT09IDYxOTkgLyogQWxsIHZhcmlhYmxlcyBhcmUgdW51c2VkLiAqLykge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGRpYWcuY29kZSA9PT1cbiAgICAgICAgICAgICAgICAgICAgMjY5NSAvKiBMZWZ0IHNpZGUgb2YgY29tbWEgb3BlcmF0b3IgaXMgdW51c2VkIGFuZCBoYXMgbm8gc2lkZSBlZmZlY3RzLiAqLykge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfSksXG4gICAgICBwcm9ncmFtOiB0eXBlQ2hlY2tQcm9ncmFtLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFkZElubGluZVR5cGVDaGVja0Jsb2NrKFxuICAgICAgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4sXG4gICAgICB0Y2JNZXRhOiBUeXBlQ2hlY2tCbG9ja01ldGFkYXRhKTogdm9pZCB7XG4gICAgY29uc3Qgc2YgPSByZWYubm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgaWYgKCF0aGlzLm9wTWFwLmhhcyhzZikpIHtcbiAgICAgIHRoaXMub3BNYXAuc2V0KHNmLCBbXSk7XG4gICAgfVxuICAgIGNvbnN0IG9wcyA9IHRoaXMub3BNYXAuZ2V0KHNmKSAhO1xuICAgIG9wcy5wdXNoKG5ldyBUY2JPcChyZWYsIHRjYk1ldGEsIHRoaXMuY29uZmlnKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGNvZGUgZ2VuZXJhdGlvbiBvcGVyYXRpb24gdGhhdCBuZWVkcyB0byBoYXBwZW4gd2l0aGluIGEgZ2l2ZW4gc291cmNlIGZpbGUuXG4gKi9cbmludGVyZmFjZSBPcCB7XG4gIC8qKlxuICAgKiBUaGUgbm9kZSBpbiB0aGUgZmlsZSB3aGljaCB3aWxsIGhhdmUgY29kZSBnZW5lcmF0ZWQgZm9yIGl0LlxuICAgKi9cbiAgcmVhZG9ubHkgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj47XG5cbiAgLyoqXG4gICAqIEluZGV4IGludG8gdGhlIHNvdXJjZSB0ZXh0IHdoZXJlIHRoZSBjb2RlIGdlbmVyYXRlZCBieSB0aGUgb3BlcmF0aW9uIHNob3VsZCBiZSBpbnNlcnRlZC5cbiAgICovXG4gIHJlYWRvbmx5IHNwbGl0UG9pbnQ6IG51bWJlcjtcblxuICAvKipcbiAgICogRXhlY3V0ZSB0aGUgb3BlcmF0aW9uIGFuZCByZXR1cm4gdGhlIGdlbmVyYXRlZCBjb2RlIGFzIHRleHQuXG4gICAqL1xuICBleGVjdXRlKGltOiBJbXBvcnRNYW5hZ2VyLCBzZjogdHMuU291cmNlRmlsZSwgcmVmRW1pdHRlcjogUmVmZXJlbmNlRW1pdHRlciwgcHJpbnRlcjogdHMuUHJpbnRlcik6XG4gICAgICBzdHJpbmc7XG59XG5cbi8qKlxuICogQSB0eXBlIGNoZWNrIGJsb2NrIG9wZXJhdGlvbiB3aGljaCBwcm9kdWNlcyB0eXBlIGNoZWNrIGNvZGUgZm9yIGEgcGFydGljdWxhciBjb21wb25lbnQuXG4gKi9cbmNsYXNzIFRjYk9wIGltcGxlbWVudHMgT3Age1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+LFxuICAgICAgcmVhZG9ubHkgbWV0YTogVHlwZUNoZWNrQmxvY2tNZXRhZGF0YSwgcmVhZG9ubHkgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcpIHt9XG5cbiAgLyoqXG4gICAqIFR5cGUgY2hlY2sgYmxvY2tzIGFyZSBpbnNlcnRlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgZW5kIG9mIHRoZSBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBnZXQgc3BsaXRQb2ludCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5yZWYubm9kZS5lbmQgKyAxOyB9XG5cbiAgZXhlY3V0ZShpbTogSW1wb3J0TWFuYWdlciwgc2Y6IHRzLlNvdXJjZUZpbGUsIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHByaW50ZXI6IHRzLlByaW50ZXIpOlxuICAgICAgc3RyaW5nIHtcbiAgICBjb25zdCBlbnYgPSBuZXcgRW52aXJvbm1lbnQodGhpcy5jb25maWcsIGltLCByZWZFbWl0dGVyLCBzZik7XG4gICAgY29uc3QgZm5OYW1lID0gdHMuY3JlYXRlSWRlbnRpZmllcihgX3RjYl8ke3RoaXMucmVmLm5vZGUucG9zfWApO1xuICAgIGNvbnN0IGZuID0gZ2VuZXJhdGVUeXBlQ2hlY2tCbG9jayhlbnYsIHRoaXMucmVmLCBmbk5hbWUsIHRoaXMubWV0YSk7XG4gICAgcmV0dXJuIHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBmbiwgc2YpO1xuICB9XG59XG5cbi8qKlxuICogQSB0eXBlIGNvbnN0cnVjdG9yIG9wZXJhdGlvbiB3aGljaCBwcm9kdWNlcyB0eXBlIGNvbnN0cnVjdG9yIGNvZGUgZm9yIGEgcGFydGljdWxhciBkaXJlY3RpdmUuXG4gKi9cbmNsYXNzIFR5cGVDdG9yT3AgaW1wbGVtZW50cyBPcCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgcmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4sXG4gICAgICByZWFkb25seSBtZXRhOiBUeXBlQ3Rvck1ldGFkYXRhLCBwcml2YXRlIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnKSB7fVxuXG4gIC8qKlxuICAgKiBUeXBlIGNvbnN0cnVjdG9yIG9wZXJhdGlvbnMgYXJlIGluc2VydGVkIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZW5kIG9mIHRoZSBkaXJlY3RpdmUgY2xhc3MuXG4gICAqL1xuICBnZXQgc3BsaXRQb2ludCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5yZWYubm9kZS5lbmQgLSAxOyB9XG5cbiAgZXhlY3V0ZShpbTogSW1wb3J0TWFuYWdlciwgc2Y6IHRzLlNvdXJjZUZpbGUsIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHByaW50ZXI6IHRzLlByaW50ZXIpOlxuICAgICAgc3RyaW5nIHtcbiAgICBjb25zdCB0Y2IgPSBnZW5lcmF0ZUlubGluZVR5cGVDdG9yKHRoaXMucmVmLm5vZGUsIHRoaXMubWV0YSwgdGhpcy5jb25maWcpO1xuICAgIHJldHVybiBwcmludGVyLnByaW50Tm9kZSh0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgdGNiLCBzZik7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBvcGVyYXRpb25zIGFuZCByZXR1cm4gdGhlaXIgc3BsaXQgcG9pbnQgb3JkZXJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9yZGVyT3BzKG9wMTogT3AsIG9wMjogT3ApOiBudW1iZXIge1xuICByZXR1cm4gb3AxLnNwbGl0UG9pbnQgLSBvcDIuc3BsaXRQb2ludDtcbn1cblxuLyoqXG4gKiBTcGxpdCBhIHN0cmluZyBpbnRvIGNodW5rcyBhdCBhbnkgbnVtYmVyIG9mIHNwbGl0IHBvaW50cy5cbiAqL1xuZnVuY3Rpb24gc3BsaXRTdHJpbmdBdFBvaW50cyhzdHI6IHN0cmluZywgcG9pbnRzOiBudW1iZXJbXSk6IHN0cmluZ1tdIHtcbiAgY29uc3Qgc3BsaXRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgc3RhcnQgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzW2ldO1xuICAgIHNwbGl0cy5wdXNoKHN0ci5zdWJzdHJpbmcoc3RhcnQsIHBvaW50KSk7XG4gICAgc3RhcnQgPSBwb2ludDtcbiAgfVxuICBzcGxpdHMucHVzaChzdHIuc3Vic3RyaW5nKHN0YXJ0KSk7XG4gIHJldHVybiBzcGxpdHM7XG59XG4iXX0=