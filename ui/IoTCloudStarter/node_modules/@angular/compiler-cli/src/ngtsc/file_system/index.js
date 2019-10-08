(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system/src/compiler_host", "@angular/compiler-cli/src/ngtsc/file_system/src/helpers", "@angular/compiler-cli/src/ngtsc/file_system/src/logical", "@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system", "@angular/compiler-cli/src/ngtsc/file_system/src/util"], factory);
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
    var compiler_host_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/compiler_host");
    exports.NgtscCompilerHost = compiler_host_1.NgtscCompilerHost;
    var helpers_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/helpers");
    exports.absoluteFrom = helpers_1.absoluteFrom;
    exports.absoluteFromSourceFile = helpers_1.absoluteFromSourceFile;
    exports.basename = helpers_1.basename;
    exports.dirname = helpers_1.dirname;
    exports.getFileSystem = helpers_1.getFileSystem;
    exports.isRoot = helpers_1.isRoot;
    exports.join = helpers_1.join;
    exports.relative = helpers_1.relative;
    exports.relativeFrom = helpers_1.relativeFrom;
    exports.resolve = helpers_1.resolve;
    exports.setFileSystem = helpers_1.setFileSystem;
    var logical_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/logical");
    exports.LogicalFileSystem = logical_1.LogicalFileSystem;
    exports.LogicalProjectPath = logical_1.LogicalProjectPath;
    var node_js_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system");
    exports.NodeJSFileSystem = node_js_file_system_1.NodeJSFileSystem;
    var util_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/util");
    exports.getSourceFileOrError = util_1.getSourceFileOrError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ZpbGVfc3lzdGVtL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0ZBQXNEO0lBQTlDLDRDQUFBLGlCQUFpQixDQUFBO0lBQ3pCLG1GQUFtSztJQUEzSixpQ0FBQSxZQUFZLENBQUE7SUFBRSwyQ0FBQSxzQkFBc0IsQ0FBQTtJQUFFLDZCQUFBLFFBQVEsQ0FBQTtJQUFFLDRCQUFBLE9BQU8sQ0FBQTtJQUFFLGtDQUFBLGFBQWEsQ0FBQTtJQUFFLDJCQUFBLE1BQU0sQ0FBQTtJQUFFLHlCQUFBLElBQUksQ0FBQTtJQUFFLDZCQUFBLFFBQVEsQ0FBQTtJQUFFLGlDQUFBLFlBQVksQ0FBQTtJQUFFLDRCQUFBLE9BQU8sQ0FBQTtJQUFFLGtDQUFBLGFBQWEsQ0FBQTtJQUM1SSxtRkFBb0U7SUFBNUQsc0NBQUEsaUJBQWlCLENBQUE7SUFBRSx1Q0FBQSxrQkFBa0IsQ0FBQTtJQUM3QywyR0FBMkQ7SUFBbkQsaURBQUEsZ0JBQWdCLENBQUE7SUFFeEIsNkVBQWdEO0lBQXhDLHNDQUFBLG9CQUFvQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IHtOZ3RzY0NvbXBpbGVySG9zdH0gZnJvbSAnLi9zcmMvY29tcGlsZXJfaG9zdCc7XG5leHBvcnQge2Fic29sdXRlRnJvbSwgYWJzb2x1dGVGcm9tU291cmNlRmlsZSwgYmFzZW5hbWUsIGRpcm5hbWUsIGdldEZpbGVTeXN0ZW0sIGlzUm9vdCwgam9pbiwgcmVsYXRpdmUsIHJlbGF0aXZlRnJvbSwgcmVzb2x2ZSwgc2V0RmlsZVN5c3RlbX0gZnJvbSAnLi9zcmMvaGVscGVycyc7XG5leHBvcnQge0xvZ2ljYWxGaWxlU3lzdGVtLCBMb2dpY2FsUHJvamVjdFBhdGh9IGZyb20gJy4vc3JjL2xvZ2ljYWwnO1xuZXhwb3J0IHtOb2RlSlNGaWxlU3lzdGVtfSBmcm9tICcuL3NyYy9ub2RlX2pzX2ZpbGVfc3lzdGVtJztcbmV4cG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTdGF0cywgRmlsZVN5c3RlbSwgUGF0aFNlZ21lbnQsIFBhdGhTdHJpbmd9IGZyb20gJy4vc3JjL3R5cGVzJztcbmV4cG9ydCB7Z2V0U291cmNlRmlsZU9yRXJyb3J9IGZyb20gJy4vc3JjL3V0aWwnO1xuIl19