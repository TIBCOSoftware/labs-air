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
        define("@angular/compiler-cli/src/ngtsc/indexer/src/api", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Describes the kind of identifier found in a template.
     */
    var IdentifierKind;
    (function (IdentifierKind) {
        IdentifierKind[IdentifierKind["Property"] = 0] = "Property";
        IdentifierKind[IdentifierKind["Method"] = 1] = "Method";
    })(IdentifierKind = exports.IdentifierKind || (exports.IdentifierKind = {}));
    /**
     * Describes the absolute byte offsets of a text anchor in a source code.
     */
    var AbsoluteSourceSpan = /** @class */ (function () {
        function AbsoluteSourceSpan(start, end) {
            this.start = start;
            this.end = end;
        }
        return AbsoluteSourceSpan;
    }());
    exports.AbsoluteSourceSpan = AbsoluteSourceSpan;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9pbmRleGVyL3NyYy9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFLSDs7T0FFRztJQUNILElBQVksY0FHWDtJQUhELFdBQVksY0FBYztRQUN4QiwyREFBUSxDQUFBO1FBQ1IsdURBQU0sQ0FBQTtJQUNSLENBQUMsRUFIVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUd6QjtJQUVEOztPQUVHO0lBQ0g7UUFDRSw0QkFBbUIsS0FBYSxFQUFTLEdBQVc7WUFBakMsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFTLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBRyxDQUFDO1FBQzFELHlCQUFDO0lBQUQsQ0FBQyxBQUZELElBRUM7SUFGWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGFyc2VTb3VyY2VGaWxlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIGtpbmQgb2YgaWRlbnRpZmllciBmb3VuZCBpbiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgZW51bSBJZGVudGlmaWVyS2luZCB7XG4gIFByb3BlcnR5LFxuICBNZXRob2QsXG59XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBhYnNvbHV0ZSBieXRlIG9mZnNldHMgb2YgYSB0ZXh0IGFuY2hvciBpbiBhIHNvdXJjZSBjb2RlLlxuICovXG5leHBvcnQgY2xhc3MgQWJzb2x1dGVTb3VyY2VTcGFuIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXJ0OiBudW1iZXIsIHB1YmxpYyBlbmQ6IG51bWJlcikge31cbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgYSBzZW1hbnRpY2FsbHktaW50ZXJlc3RpbmcgaWRlbnRpZmllciBpbiBhIHRlbXBsYXRlLCBzdWNoIGFzIGFuIGludGVycG9sYXRlZCB2YXJpYWJsZVxuICogb3Igc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVJZGVudGlmaWVyIHtcbiAgbmFtZTogc3RyaW5nO1xuICBzcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW47XG4gIGtpbmQ6IElkZW50aWZpZXJLaW5kO1xufVxuXG4vKipcbiAqIERlc2NyaWJlcyBhbiBhbmFseXplZCwgaW5kZXhlZCBjb21wb25lbnQgYW5kIGl0cyB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbmRleGVkQ29tcG9uZW50IHtcbiAgbmFtZTogc3RyaW5nO1xuICBzZWxlY3Rvcjogc3RyaW5nfG51bGw7XG4gIGZpbGU6IFBhcnNlU291cmNlRmlsZTtcbiAgdGVtcGxhdGU6IHtcbiAgICBpZGVudGlmaWVyczogU2V0PFRlbXBsYXRlSWRlbnRpZmllcj4sXG4gICAgdXNlZENvbXBvbmVudHM6IFNldDx0cy5EZWNsYXJhdGlvbj4sXG4gICAgaXNJbmxpbmU6IGJvb2xlYW4sXG4gICAgZmlsZTogUGFyc2VTb3VyY2VGaWxlO1xuICB9O1xufVxuIl19