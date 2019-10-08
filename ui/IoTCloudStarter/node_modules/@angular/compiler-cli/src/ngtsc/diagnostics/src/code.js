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
        define("@angular/compiler-cli/src/ngtsc/diagnostics/src/code", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ErrorCode;
    (function (ErrorCode) {
        ErrorCode[ErrorCode["DECORATOR_ARG_NOT_LITERAL"] = 1001] = "DECORATOR_ARG_NOT_LITERAL";
        ErrorCode[ErrorCode["DECORATOR_ARITY_WRONG"] = 1002] = "DECORATOR_ARITY_WRONG";
        ErrorCode[ErrorCode["DECORATOR_NOT_CALLED"] = 1003] = "DECORATOR_NOT_CALLED";
        ErrorCode[ErrorCode["DECORATOR_ON_ANONYMOUS_CLASS"] = 1004] = "DECORATOR_ON_ANONYMOUS_CLASS";
        ErrorCode[ErrorCode["DECORATOR_UNEXPECTED"] = 1005] = "DECORATOR_UNEXPECTED";
        /**
         * This error code indicates that there are incompatible decorators on a type or a class field.
         */
        ErrorCode[ErrorCode["DECORATOR_COLLISION"] = 1006] = "DECORATOR_COLLISION";
        ErrorCode[ErrorCode["VALUE_HAS_WRONG_TYPE"] = 1010] = "VALUE_HAS_WRONG_TYPE";
        ErrorCode[ErrorCode["VALUE_NOT_LITERAL"] = 1011] = "VALUE_NOT_LITERAL";
        ErrorCode[ErrorCode["COMPONENT_MISSING_TEMPLATE"] = 2001] = "COMPONENT_MISSING_TEMPLATE";
        ErrorCode[ErrorCode["PIPE_MISSING_NAME"] = 2002] = "PIPE_MISSING_NAME";
        ErrorCode[ErrorCode["PARAM_MISSING_TOKEN"] = 2003] = "PARAM_MISSING_TOKEN";
        ErrorCode[ErrorCode["SYMBOL_NOT_EXPORTED"] = 3001] = "SYMBOL_NOT_EXPORTED";
        ErrorCode[ErrorCode["SYMBOL_EXPORTED_UNDER_DIFFERENT_NAME"] = 3002] = "SYMBOL_EXPORTED_UNDER_DIFFERENT_NAME";
        ErrorCode[ErrorCode["CONFIG_FLAT_MODULE_NO_INDEX"] = 4001] = "CONFIG_FLAT_MODULE_NO_INDEX";
        /**
         * Raised when a host expression has a parse error, such as a host listener or host binding
         * expression containing a pipe.
         */
        ErrorCode[ErrorCode["HOST_BINDING_PARSE_ERROR"] = 5001] = "HOST_BINDING_PARSE_ERROR";
        /**
         * Raised when an NgModule contains an invalid reference in `declarations`.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_DECLARATION"] = 6001] = "NGMODULE_INVALID_DECLARATION";
        /**
         * Raised when an NgModule contains an invalid type in `imports`.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_IMPORT"] = 6002] = "NGMODULE_INVALID_IMPORT";
        /**
         * Raised when an NgModule contains an invalid type in `exports`.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_EXPORT"] = 6003] = "NGMODULE_INVALID_EXPORT";
        /**
         * Raised when an NgModule contains a type in `exports` which is neither in `declarations` nor
         * otherwise imported.
         */
        ErrorCode[ErrorCode["NGMODULE_INVALID_REEXPORT"] = 6004] = "NGMODULE_INVALID_REEXPORT";
    })(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
    function ngErrorCode(code) {
        return parseInt('-99' + code);
    }
    exports.ngErrorCode = ngErrorCode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZGlhZ25vc3RpY3Mvc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxJQUFZLFNBa0RYO0lBbERELFdBQVksU0FBUztRQUNuQixzRkFBZ0MsQ0FBQTtRQUNoQyw4RUFBNEIsQ0FBQTtRQUM1Qiw0RUFBMkIsQ0FBQTtRQUMzQiw0RkFBbUMsQ0FBQTtRQUNuQyw0RUFBMkIsQ0FBQTtRQUUzQjs7V0FFRztRQUNILDBFQUEwQixDQUFBO1FBRTFCLDRFQUEyQixDQUFBO1FBQzNCLHNFQUF3QixDQUFBO1FBRXhCLHdGQUFpQyxDQUFBO1FBQ2pDLHNFQUF3QixDQUFBO1FBQ3hCLDBFQUEwQixDQUFBO1FBRTFCLDBFQUEwQixDQUFBO1FBQzFCLDRHQUEyQyxDQUFBO1FBRTNDLDBGQUFrQyxDQUFBO1FBRWxDOzs7V0FHRztRQUNILG9GQUErQixDQUFBO1FBRS9COztXQUVHO1FBQ0gsNEZBQW1DLENBQUE7UUFFbkM7O1dBRUc7UUFDSCxrRkFBOEIsQ0FBQTtRQUU5Qjs7V0FFRztRQUNILGtGQUE4QixDQUFBO1FBRTlCOzs7V0FHRztRQUNILHNGQUFnQyxDQUFBO0lBQ2xDLENBQUMsRUFsRFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFrRHBCO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLElBQWU7UUFDekMsT0FBTyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFGRCxrQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGVudW0gRXJyb3JDb2RlIHtcbiAgREVDT1JBVE9SX0FSR19OT1RfTElURVJBTCA9IDEwMDEsXG4gIERFQ09SQVRPUl9BUklUWV9XUk9ORyA9IDEwMDIsXG4gIERFQ09SQVRPUl9OT1RfQ0FMTEVEID0gMTAwMyxcbiAgREVDT1JBVE9SX09OX0FOT05ZTU9VU19DTEFTUyA9IDEwMDQsXG4gIERFQ09SQVRPUl9VTkVYUEVDVEVEID0gMTAwNSxcblxuICAvKipcbiAgICogVGhpcyBlcnJvciBjb2RlIGluZGljYXRlcyB0aGF0IHRoZXJlIGFyZSBpbmNvbXBhdGlibGUgZGVjb3JhdG9ycyBvbiBhIHR5cGUgb3IgYSBjbGFzcyBmaWVsZC5cbiAgICovXG4gIERFQ09SQVRPUl9DT0xMSVNJT04gPSAxMDA2LFxuXG4gIFZBTFVFX0hBU19XUk9OR19UWVBFID0gMTAxMCxcbiAgVkFMVUVfTk9UX0xJVEVSQUwgPSAxMDExLFxuXG4gIENPTVBPTkVOVF9NSVNTSU5HX1RFTVBMQVRFID0gMjAwMSxcbiAgUElQRV9NSVNTSU5HX05BTUUgPSAyMDAyLFxuICBQQVJBTV9NSVNTSU5HX1RPS0VOID0gMjAwMyxcblxuICBTWU1CT0xfTk9UX0VYUE9SVEVEID0gMzAwMSxcbiAgU1lNQk9MX0VYUE9SVEVEX1VOREVSX0RJRkZFUkVOVF9OQU1FID0gMzAwMixcblxuICBDT05GSUdfRkxBVF9NT0RVTEVfTk9fSU5ERVggPSA0MDAxLFxuXG4gIC8qKlxuICAgKiBSYWlzZWQgd2hlbiBhIGhvc3QgZXhwcmVzc2lvbiBoYXMgYSBwYXJzZSBlcnJvciwgc3VjaCBhcyBhIGhvc3QgbGlzdGVuZXIgb3IgaG9zdCBiaW5kaW5nXG4gICAqIGV4cHJlc3Npb24gY29udGFpbmluZyBhIHBpcGUuXG4gICAqL1xuICBIT1NUX0JJTkRJTkdfUEFSU0VfRVJST1IgPSA1MDAxLFxuXG4gIC8qKlxuICAgKiBSYWlzZWQgd2hlbiBhbiBOZ01vZHVsZSBjb250YWlucyBhbiBpbnZhbGlkIHJlZmVyZW5jZSBpbiBgZGVjbGFyYXRpb25zYC5cbiAgICovXG4gIE5HTU9EVUxFX0lOVkFMSURfREVDTEFSQVRJT04gPSA2MDAxLFxuXG4gIC8qKlxuICAgKiBSYWlzZWQgd2hlbiBhbiBOZ01vZHVsZSBjb250YWlucyBhbiBpbnZhbGlkIHR5cGUgaW4gYGltcG9ydHNgLlxuICAgKi9cbiAgTkdNT0RVTEVfSU5WQUxJRF9JTVBPUlQgPSA2MDAyLFxuXG4gIC8qKlxuICAgKiBSYWlzZWQgd2hlbiBhbiBOZ01vZHVsZSBjb250YWlucyBhbiBpbnZhbGlkIHR5cGUgaW4gYGV4cG9ydHNgLlxuICAgKi9cbiAgTkdNT0RVTEVfSU5WQUxJRF9FWFBPUlQgPSA2MDAzLFxuXG4gIC8qKlxuICAgKiBSYWlzZWQgd2hlbiBhbiBOZ01vZHVsZSBjb250YWlucyBhIHR5cGUgaW4gYGV4cG9ydHNgIHdoaWNoIGlzIG5laXRoZXIgaW4gYGRlY2xhcmF0aW9uc2Agbm9yXG4gICAqIG90aGVyd2lzZSBpbXBvcnRlZC5cbiAgICovXG4gIE5HTU9EVUxFX0lOVkFMSURfUkVFWFBPUlQgPSA2MDA0LFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmdFcnJvckNvZGUoY29kZTogRXJyb3JDb2RlKTogbnVtYmVyIHtcbiAgcmV0dXJuIHBhcnNlSW50KCctOTknICsgY29kZSk7XG59Il19