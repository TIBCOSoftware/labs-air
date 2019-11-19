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
        define("@angular/compiler/src/render3/view/styling_state", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _stylingMode = 0;
    /**
     * Temporary function used to inform the existing styling algorithm
     * code to delegate all styling instruction calls to the new refactored
     * styling code.
     */
    function compilerSetStylingMode(mode) {
        _stylingMode = mode;
    }
    exports.compilerSetStylingMode = compilerSetStylingMode;
    function compilerIsNewStylingInUse() {
        return _stylingMode > 0 /* UseOld */;
    }
    exports.compilerIsNewStylingInUse = compilerIsNewStylingInUse;
    function compilerAllowOldStyling() {
        return _stylingMode < 2 /* UseNew */;
    }
    exports.compilerAllowOldStyling = compilerAllowOldStyling;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGluZ19zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3ZpZXcvc3R5bGluZ19zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0VBTUU7Ozs7Ozs7Ozs7OztJQWFGLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztJQUVyQjs7OztPQUlHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsSUFBeUI7UUFDOUQsWUFBWSxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRkQsd0RBRUM7SUFFRCxTQUFnQix5QkFBeUI7UUFDdkMsT0FBTyxZQUFZLGlCQUE2QixDQUFDO0lBQ25ELENBQUM7SUFGRCw4REFFQztJQUVELFNBQWdCLHVCQUF1QjtRQUNyQyxPQUFPLFlBQVksaUJBQTZCLENBQUM7SUFDbkQsQ0FBQztJQUZELDBEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4qIEBsaWNlbnNlXG4qIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuKlxuKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4qL1xuXG4vKipcbiAqIEEgdGVtcG9yYXJ5IGVudW0gb2Ygc3RhdGVzIHRoYXQgaW5mb3JtIHRoZSBjb3JlIHdoZXRoZXIgb3Igbm90XG4gKiB0byBkZWZlciBhbGwgc3R5bGluZyBpbnN0cnVjdGlvbiBjYWxscyB0byB0aGUgb2xkIG9yIG5ld1xuICogc3R5bGluZyBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQ29tcGlsZXJTdHlsaW5nTW9kZSB7XG4gIFVzZU9sZCA9IDAsXG4gIFVzZUJvdGhPbGRBbmROZXcgPSAxLFxuICBVc2VOZXcgPSAyLFxufVxuXG5sZXQgX3N0eWxpbmdNb2RlID0gMDtcblxuLyoqXG4gKiBUZW1wb3JhcnkgZnVuY3Rpb24gdXNlZCB0byBpbmZvcm0gdGhlIGV4aXN0aW5nIHN0eWxpbmcgYWxnb3JpdGhtXG4gKiBjb2RlIHRvIGRlbGVnYXRlIGFsbCBzdHlsaW5nIGluc3RydWN0aW9uIGNhbGxzIHRvIHRoZSBuZXcgcmVmYWN0b3JlZFxuICogc3R5bGluZyBjb2RlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZXJTZXRTdHlsaW5nTW9kZShtb2RlOiBDb21waWxlclN0eWxpbmdNb2RlKSB7XG4gIF9zdHlsaW5nTW9kZSA9IG1vZGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlcklzTmV3U3R5bGluZ0luVXNlKCkge1xuICByZXR1cm4gX3N0eWxpbmdNb2RlID4gQ29tcGlsZXJTdHlsaW5nTW9kZS5Vc2VPbGQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlckFsbG93T2xkU3R5bGluZygpIHtcbiAgcmV0dXJuIF9zdHlsaW5nTW9kZSA8IENvbXBpbGVyU3R5bGluZ01vZGUuVXNlTmV3O1xufVxuIl19