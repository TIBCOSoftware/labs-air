(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/environment", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block"], factory);
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
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var environment_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/environment");
    var type_check_block_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block");
    /**
     * An `Environment` representing the single type-checking file into which most (if not all) Type
     * Check Blocks (TCBs) will be generated.
     *
     * The `TypeCheckFile` hosts multiple TCBs and allows the sharing of declarations (e.g. type
     * constructors) between them. Rather than return such declarations via `getPreludeStatements()`, it
     * hoists them to the top of the generated `ts.SourceFile`.
     */
    var TypeCheckFile = /** @class */ (function (_super) {
        tslib_1.__extends(TypeCheckFile, _super);
        function TypeCheckFile(fileName, config, refEmitter) {
            var _this = _super.call(this, config, new translator_1.ImportManager(new imports_1.NoopImportRewriter(), 'i'), refEmitter, ts.createSourceFile(fileName, '', ts.ScriptTarget.Latest, true)) || this;
            _this.fileName = fileName;
            _this.nextTcbId = 1;
            _this.tcbStatements = [];
            return _this;
        }
        TypeCheckFile.prototype.addTypeCheckBlock = function (ref, meta) {
            var fnId = ts.createIdentifier("_tcb" + this.nextTcbId++);
            var fn = type_check_block_1.generateTypeCheckBlock(this, ref, fnId, meta);
            this.tcbStatements.push(fn);
        };
        TypeCheckFile.prototype.render = function () {
            var e_1, _a, e_2, _b, e_3, _c;
            var source = this.importManager.getAllImports(this.fileName)
                .map(function (i) { return "import * as " + i.qualifier + " from '" + i.specifier + "';"; })
                .join('\n') +
                '\n\n';
            var printer = ts.createPrinter();
            source += '\n';
            try {
                for (var _d = tslib_1.__values(this.pipeInstStatements), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var stmt = _e.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _f = tslib_1.__values(this.typeCtorStatements), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var stmt = _g.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
            source += '\n';
            try {
                for (var _h = tslib_1.__values(this.tcbStatements), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var stmt = _j.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return ts.createSourceFile(this.fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        };
        TypeCheckFile.prototype.getPreludeStatements = function () { return []; };
        return TypeCheckFile;
    }(environment_1.Environment));
    exports.TypeCheckFile = TypeCheckFile;
    function typeCheckFilePath(rootDirs) {
        var shortest = rootDirs.concat([]).sort(function (a, b) { return a.length - b.length; })[0];
        return file_system_1.join(shortest, '__ng_typecheck__.ts');
    }
    exports.typeCheckFilePath = typeCheckFilePath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jaGVja19maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90eXBlY2hlY2svc3JjL3R5cGVfY2hlY2tfZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFFakMsMkVBQXVEO0lBQ3ZELG1FQUE4RTtJQUU5RSx5RUFBK0M7SUFHL0MseUZBQTBDO0lBQzFDLG1HQUEwRDtJQUUxRDs7Ozs7OztPQU9HO0lBQ0g7UUFBbUMseUNBQVc7UUFJNUMsdUJBQW9CLFFBQWdCLEVBQUUsTUFBMEIsRUFBRSxVQUE0QjtZQUE5RixZQUNFLGtCQUNJLE1BQU0sRUFBRSxJQUFJLDBCQUFhLENBQUMsSUFBSSw0QkFBa0IsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFDcEUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsU0FDckU7WUFKbUIsY0FBUSxHQUFSLFFBQVEsQ0FBUTtZQUg1QixlQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsbUJBQWEsR0FBbUIsRUFBRSxDQUFDOztRQU0zQyxDQUFDO1FBRUQseUNBQWlCLEdBQWpCLFVBQ0ksR0FBcUQsRUFBRSxJQUE0QjtZQUNyRixJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsU0FBTyxJQUFJLENBQUMsU0FBUyxFQUFJLENBQUMsQ0FBQztZQUM1RCxJQUFNLEVBQUUsR0FBRyx5Q0FBc0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsOEJBQU0sR0FBTjs7WUFDRSxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUMxQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxpQkFBZSxDQUFDLENBQUMsU0FBUyxlQUFVLENBQUMsQ0FBQyxTQUFTLE9BQUksRUFBbkQsQ0FBbUQsQ0FBQztpQkFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDaEMsTUFBTSxDQUFDO1lBQ1gsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sSUFBSSxJQUFJLENBQUM7O2dCQUNmLEtBQW1CLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsa0JBQWtCLENBQUEsZ0JBQUEsNEJBQUU7b0JBQXZDLElBQU0sSUFBSSxXQUFBO29CQUNiLE1BQU0sSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO2lCQUNyRjs7Ozs7Ozs7OztnQkFDRCxLQUFtQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFBLGdCQUFBLDRCQUFFO29CQUF2QyxJQUFNLElBQUksV0FBQTtvQkFDYixNQUFNLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDckY7Ozs7Ozs7OztZQUNELE1BQU0sSUFBSSxJQUFJLENBQUM7O2dCQUNmLEtBQW1CLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsYUFBYSxDQUFBLGdCQUFBLDRCQUFFO29CQUFsQyxJQUFNLElBQUksV0FBQTtvQkFDYixNQUFNLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDckY7Ozs7Ozs7OztZQUVELE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUN0QixJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRUQsNENBQW9CLEdBQXBCLGNBQXlDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RCxvQkFBQztJQUFELENBQUMsQUF4Q0QsQ0FBbUMseUJBQVcsR0F3QzdDO0lBeENZLHNDQUFhO0lBMEMxQixTQUFnQixpQkFBaUIsQ0FBQyxRQUEwQjtRQUMxRCxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQW5CLENBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxPQUFPLGtCQUFJLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUhELDhDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIGpvaW59IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Tm9vcEltcG9ydFJld3JpdGVyLCBSZWZlcmVuY2UsIFJlZmVyZW5jZUVtaXR0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW1wb3J0TWFuYWdlcn0gZnJvbSAnLi4vLi4vdHJhbnNsYXRvcic7XG5cbmltcG9ydCB7VHlwZUNoZWNrQmxvY2tNZXRhZGF0YSwgVHlwZUNoZWNraW5nQ29uZmlnfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0Vudmlyb25tZW50fSBmcm9tICcuL2Vudmlyb25tZW50JztcbmltcG9ydCB7Z2VuZXJhdGVUeXBlQ2hlY2tCbG9ja30gZnJvbSAnLi90eXBlX2NoZWNrX2Jsb2NrJztcblxuLyoqXG4gKiBBbiBgRW52aXJvbm1lbnRgIHJlcHJlc2VudGluZyB0aGUgc2luZ2xlIHR5cGUtY2hlY2tpbmcgZmlsZSBpbnRvIHdoaWNoIG1vc3QgKGlmIG5vdCBhbGwpIFR5cGVcbiAqIENoZWNrIEJsb2NrcyAoVENCcykgd2lsbCBiZSBnZW5lcmF0ZWQuXG4gKlxuICogVGhlIGBUeXBlQ2hlY2tGaWxlYCBob3N0cyBtdWx0aXBsZSBUQ0JzIGFuZCBhbGxvd3MgdGhlIHNoYXJpbmcgb2YgZGVjbGFyYXRpb25zIChlLmcuIHR5cGVcbiAqIGNvbnN0cnVjdG9ycykgYmV0d2VlbiB0aGVtLiBSYXRoZXIgdGhhbiByZXR1cm4gc3VjaCBkZWNsYXJhdGlvbnMgdmlhIGBnZXRQcmVsdWRlU3RhdGVtZW50cygpYCwgaXRcbiAqIGhvaXN0cyB0aGVtIHRvIHRoZSB0b3Agb2YgdGhlIGdlbmVyYXRlZCBgdHMuU291cmNlRmlsZWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlQ2hlY2tGaWxlIGV4dGVuZHMgRW52aXJvbm1lbnQge1xuICBwcml2YXRlIG5leHRUY2JJZCA9IDE7XG4gIHByaXZhdGUgdGNiU3RhdGVtZW50czogdHMuU3RhdGVtZW50W10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZpbGVOYW1lOiBzdHJpbmcsIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnLCByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyKSB7XG4gICAgc3VwZXIoXG4gICAgICAgIGNvbmZpZywgbmV3IEltcG9ydE1hbmFnZXIobmV3IE5vb3BJbXBvcnRSZXdyaXRlcigpLCAnaScpLCByZWZFbWl0dGVyLFxuICAgICAgICB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVOYW1lLCAnJywgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSkpO1xuICB9XG5cbiAgYWRkVHlwZUNoZWNrQmxvY2soXG4gICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+PiwgbWV0YTogVHlwZUNoZWNrQmxvY2tNZXRhZGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IGZuSWQgPSB0cy5jcmVhdGVJZGVudGlmaWVyKGBfdGNiJHt0aGlzLm5leHRUY2JJZCsrfWApO1xuICAgIGNvbnN0IGZuID0gZ2VuZXJhdGVUeXBlQ2hlY2tCbG9jayh0aGlzLCByZWYsIGZuSWQsIG1ldGEpO1xuICAgIHRoaXMudGNiU3RhdGVtZW50cy5wdXNoKGZuKTtcbiAgfVxuXG4gIHJlbmRlcigpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICBsZXQgc291cmNlOiBzdHJpbmcgPSB0aGlzLmltcG9ydE1hbmFnZXIuZ2V0QWxsSW1wb3J0cyh0aGlzLmZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGkgPT4gYGltcG9ydCAqIGFzICR7aS5xdWFsaWZpZXJ9IGZyb20gJyR7aS5zcGVjaWZpZXJ9JztgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuam9pbignXFxuJykgK1xuICAgICAgICAnXFxuXFxuJztcbiAgICBjb25zdCBwcmludGVyID0gdHMuY3JlYXRlUHJpbnRlcigpO1xuICAgIHNvdXJjZSArPSAnXFxuJztcbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgdGhpcy5waXBlSW5zdFN0YXRlbWVudHMpIHtcbiAgICAgIHNvdXJjZSArPSBwcmludGVyLnByaW50Tm9kZSh0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgc3RtdCwgdGhpcy5jb250ZXh0RmlsZSkgKyAnXFxuJztcbiAgICB9XG4gICAgZm9yIChjb25zdCBzdG10IG9mIHRoaXMudHlwZUN0b3JTdGF0ZW1lbnRzKSB7XG4gICAgICBzb3VyY2UgKz0gcHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIHN0bXQsIHRoaXMuY29udGV4dEZpbGUpICsgJ1xcbic7XG4gICAgfVxuICAgIHNvdXJjZSArPSAnXFxuJztcbiAgICBmb3IgKGNvbnN0IHN0bXQgb2YgdGhpcy50Y2JTdGF0ZW1lbnRzKSB7XG4gICAgICBzb3VyY2UgKz0gcHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIHN0bXQsIHRoaXMuY29udGV4dEZpbGUpICsgJ1xcbic7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIHRoaXMuZmlsZU5hbWUsIHNvdXJjZSwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSwgdHMuU2NyaXB0S2luZC5UUyk7XG4gIH1cblxuICBnZXRQcmVsdWRlU3RhdGVtZW50cygpOiB0cy5TdGF0ZW1lbnRbXSB7IHJldHVybiBbXTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZUNoZWNrRmlsZVBhdGgocm9vdERpcnM6IEFic29sdXRlRnNQYXRoW10pOiBBYnNvbHV0ZUZzUGF0aCB7XG4gIGNvbnN0IHNob3J0ZXN0ID0gcm9vdERpcnMuY29uY2F0KFtdKS5zb3J0KChhLCBiKSA9PiBhLmxlbmd0aCAtIGIubGVuZ3RoKVswXTtcbiAgcmV0dXJuIGpvaW4oc2hvcnRlc3QsICdfX25nX3R5cGVjaGVja19fLnRzJyk7XG59XG4iXX0=