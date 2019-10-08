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
        define("@angular/compiler-cli/src/ngtsc/indexer/src/template", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler/src/render3/r3_ast", "@angular/compiler-cli/src/ngtsc/indexer/src/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var r3_ast_1 = require("@angular/compiler/src/render3/r3_ast");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/indexer/src/api");
    /**
     * Visits the AST of an Angular template syntax expression, finding interesting
     * entities (variable references, etc.). Creates an array of Entities found in
     * the expression, with the location of the Entities being relative to the
     * expression.
     *
     * Visiting `text {{prop}}` will return `[TemplateIdentifier {name: 'prop', span: {start: 7, end:
     * 11}}]`.
     */
    var ExpressionVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ExpressionVisitor, _super);
        function ExpressionVisitor(context, boundTemplate, expressionStr, absoluteOffset) {
            if (expressionStr === void 0) { expressionStr = context.sourceSpan.toString(); }
            if (absoluteOffset === void 0) { absoluteOffset = context.sourceSpan.start.offset; }
            var _this = _super.call(this) || this;
            _this.boundTemplate = boundTemplate;
            _this.expressionStr = expressionStr;
            _this.absoluteOffset = absoluteOffset;
            _this.identifiers = [];
            return _this;
        }
        /**
         * Returns identifiers discovered in an expression.
         *
         * @param ast expression AST to visit
         * @param context HTML node expression is defined in
         * @param boundTemplate bound target of the entire template, which can be used to query for the
         * entities expressions target.
         */
        ExpressionVisitor.getIdentifiers = function (ast, context, boundTemplate) {
            var visitor = new ExpressionVisitor(context, boundTemplate);
            visitor.visit(ast);
            return visitor.identifiers;
        };
        ExpressionVisitor.prototype.visit = function (ast) { ast.visit(this); };
        ExpressionVisitor.prototype.visitMethodCall = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Method);
            _super.prototype.visitMethodCall.call(this, ast, context);
        };
        ExpressionVisitor.prototype.visitPropertyRead = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Property);
            _super.prototype.visitPropertyRead.call(this, ast, context);
        };
        /**
         * Visits an identifier, adding it to the identifier store if it is useful for indexing.
         *
         * @param ast expression AST the identifier is in
         * @param kind identifier kind
         */
        ExpressionVisitor.prototype.visitIdentifier = function (ast, kind) {
            // The definition of a non-top-level property such as `bar` in `{{foo.bar}}` is currently
            // impossible to determine by an indexer and unsupported by the indexing module.
            // The indexing module also does not currently support references to identifiers declared in the
            // template itself, which have a non-null expression target.
            if (!(ast.receiver instanceof compiler_1.ImplicitReceiver) ||
                this.boundTemplate.getExpressionTarget(ast) !== null) {
                return;
            }
            // Get the location of the identifier of real interest.
            // The compiler's expression parser records the location of some expressions in a manner not
            // useful to the indexer. For example, a `MethodCall` `foo(a, b)` will record the span of the
            // entire method call, but the indexer is interested only in the method identifier.
            var localExpression = this.expressionStr.substr(ast.span.start, ast.span.end);
            var identifierStart = ast.span.start + localExpression.indexOf(ast.name);
            // Join the relative position of the expression within a node with the absolute position
            // of the node to get the absolute position of the expression in the source code.
            var absoluteStart = this.absoluteOffset + identifierStart;
            var span = new api_1.AbsoluteSourceSpan(absoluteStart, absoluteStart + ast.name.length);
            this.identifiers.push({
                name: ast.name,
                span: span,
                kind: kind,
            });
        };
        return ExpressionVisitor;
    }(compiler_1.RecursiveAstVisitor));
    /**
     * Visits the AST of a parsed Angular template. Discovers and stores
     * identifiers of interest, deferring to an `ExpressionVisitor` as needed.
     */
    var TemplateVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(TemplateVisitor, _super);
        /**
         * Creates a template visitor for a bound template target. The bound target can be used when
         * deferred to the expression visitor to get information about the target of an expression.
         *
         * @param boundTemplate bound template target
         */
        function TemplateVisitor(boundTemplate) {
            var _this = _super.call(this) || this;
            _this.boundTemplate = boundTemplate;
            // identifiers of interest found in the template
            _this.identifiers = new Set();
            return _this;
        }
        /**
         * Visits a node in the template.
         *
         * @param node node to visit
         */
        TemplateVisitor.prototype.visit = function (node) { node.visit(this); };
        TemplateVisitor.prototype.visitAll = function (nodes) {
            var _this = this;
            nodes.forEach(function (node) { return _this.visit(node); });
        };
        TemplateVisitor.prototype.visitElement = function (element) {
            this.visitAll(element.attributes);
            this.visitAll(element.children);
            this.visitAll(element.references);
        };
        TemplateVisitor.prototype.visitTemplate = function (template) {
            this.visitAll(template.attributes);
            this.visitAll(template.children);
            this.visitAll(template.references);
            this.visitAll(template.variables);
        };
        TemplateVisitor.prototype.visitBoundText = function (text) { this.visitExpression(text); };
        /**
         * Visits a node's expression and adds its identifiers, if any, to the visitor's state.
         *
         * @param curretNode node whose expression to visit
         */
        TemplateVisitor.prototype.visitExpression = function (node) {
            var _this = this;
            var identifiers = ExpressionVisitor.getIdentifiers(node.value, node, this.boundTemplate);
            identifiers.forEach(function (id) { return _this.identifiers.add(id); });
        };
        return TemplateVisitor;
    }(r3_ast_1.RecursiveVisitor));
    /**
     * Traverses a template AST and builds identifiers discovered in it.
     *
     * @param boundTemplate bound template target, which can be used for querying expression targets.
     * @return identifiers in template
     */
    function getTemplateIdentifiers(boundTemplate) {
        var visitor = new TemplateVisitor(boundTemplate);
        if (boundTemplate.target.template !== undefined) {
            visitor.visitAll(boundTemplate.target.template);
        }
        return visitor.identifiers;
    }
    exports.getTemplateIdentifiers = getTemplateIdentifiers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luZGV4ZXIvc3JjL3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFtSTtJQUNuSSwrREFBc0k7SUFDdEksdUVBQTZFO0lBVzdFOzs7Ozs7OztPQVFHO0lBQ0g7UUFBZ0MsNkNBQW1CO1FBR2pELDJCQUNJLE9BQWEsRUFBbUIsYUFBeUMsRUFDeEQsYUFBNkMsRUFDN0MsY0FBZ0Q7WUFEaEQsOEJBQUEsRUFBQSxnQkFBZ0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7WUFDN0MsK0JBQUEsRUFBQSxpQkFBaUIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTTtZQUhyRSxZQUlFLGlCQUFPLFNBQ1I7WUFKbUMsbUJBQWEsR0FBYixhQUFhLENBQTRCO1lBQ3hELG1CQUFhLEdBQWIsYUFBYSxDQUFnQztZQUM3QyxvQkFBYyxHQUFkLGNBQWMsQ0FBa0M7WUFMNUQsaUJBQVcsR0FBeUIsRUFBRSxDQUFDOztRQU9oRCxDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNJLGdDQUFjLEdBQXJCLFVBQXNCLEdBQVEsRUFBRSxPQUFhLEVBQUUsYUFBeUM7WUFFdEYsSUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDOUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQUVELGlDQUFLLEdBQUwsVUFBTSxHQUFRLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEMsMkNBQWUsR0FBZixVQUFnQixHQUFlLEVB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SW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBU1QsIEJvdW5kVGFyZ2V0LCBEaXJlY3RpdmVNZXRhLCBJbXBsaWNpdFJlY2VpdmVyLCBNZXRob2RDYWxsLCBQcm9wZXJ0eVJlYWQsIFJlY3Vyc2l2ZUFzdFZpc2l0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7Qm91bmRUZXh0LCBFbGVtZW50LCBOb2RlLCBSZWN1cnNpdmVWaXNpdG9yIGFzIFJlY3Vyc2l2ZVRlbXBsYXRlVmlzaXRvciwgVGVtcGxhdGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3IzX2FzdCc7XG5pbXBvcnQge0Fic29sdXRlU291cmNlU3BhbiwgSWRlbnRpZmllcktpbmQsIFRlbXBsYXRlSWRlbnRpZmllcn0gZnJvbSAnLi9hcGknO1xuXG4vKipcbiAqIEEgcGFyc2VkIG5vZGUgaW4gYSB0ZW1wbGF0ZSwgd2hpY2ggbWF5IGhhdmUgYSBuYW1lIChpZiBpdCBpcyBhIHNlbGVjdG9yKSBvclxuICogYmUgYW5vbnltb3VzIChsaWtlIGEgdGV4dCBzcGFuKS5cbiAqL1xuaW50ZXJmYWNlIEhUTUxOb2RlIGV4dGVuZHMgTm9kZSB7XG4gIHRhZ05hbWU/OiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogVmlzaXRzIHRoZSBBU1Qgb2YgYW4gQW5ndWxhciB0ZW1wbGF0ZSBzeW50YXggZXhwcmVzc2lvbiwgZmluZGluZyBpbnRlcmVzdGluZ1xuICogZW50aXRpZXMgKHZhcmlhYmxlIHJlZmVyZW5jZXMsIGV0Yy4pLiBDcmVhdGVzIGFuIGFycmF5IG9mIEVudGl0aWVzIGZvdW5kIGluXG4gKiB0aGUgZXhwcmVzc2lvbiwgd2l0aCB0aGUgbG9jYXRpb24gb2YgdGhlIEVudGl0aWVzIGJlaW5nIHJlbGF0aXZlIHRvIHRoZVxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBWaXNpdGluZyBgdGV4dCB7e3Byb3B9fWAgd2lsbCByZXR1cm4gYFtUZW1wbGF0ZUlkZW50aWZpZXIge25hbWU6ICdwcm9wJywgc3Bhbjoge3N0YXJ0OiA3LCBlbmQ6XG4gKiAxMX19XWAuXG4gKi9cbmNsYXNzIEV4cHJlc3Npb25WaXNpdG9yIGV4dGVuZHMgUmVjdXJzaXZlQXN0VmlzaXRvciB7XG4gIHJlYWRvbmx5IGlkZW50aWZpZXJzOiBUZW1wbGF0ZUlkZW50aWZpZXJbXSA9IFtdO1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICBjb250ZXh0OiBOb2RlLCBwcml2YXRlIHJlYWRvbmx5IGJvdW5kVGVtcGxhdGU6IEJvdW5kVGFyZ2V0PERpcmVjdGl2ZU1ldGE+LFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBleHByZXNzaW9uU3RyID0gY29udGV4dC5zb3VyY2VTcGFuLnRvU3RyaW5nKCksXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGFic29sdXRlT2Zmc2V0ID0gY29udGV4dC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZGVudGlmaWVycyBkaXNjb3ZlcmVkIGluIGFuIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEBwYXJhbSBhc3QgZXhwcmVzc2lvbiBBU1QgdG8gdmlzaXRcbiAgICogQHBhcmFtIGNvbnRleHQgSFRNTCBub2RlIGV4cHJlc3Npb24gaXMgZGVmaW5lZCBpblxuICAgKiBAcGFyYW0gYm91bmRUZW1wbGF0ZSBib3VuZCB0YXJnZXQgb2YgdGhlIGVudGlyZSB0ZW1wbGF0ZSwgd2hpY2ggY2FuIGJlIHVzZWQgdG8gcXVlcnkgZm9yIHRoZVxuICAgKiBlbnRpdGllcyBleHByZXNzaW9ucyB0YXJnZXQuXG4gICAqL1xuICBzdGF0aWMgZ2V0SWRlbnRpZmllcnMoYXN0OiBBU1QsIGNvbnRleHQ6IE5vZGUsIGJvdW5kVGVtcGxhdGU6IEJvdW5kVGFyZ2V0PERpcmVjdGl2ZU1ldGE+KTpcbiAgICAgIFRlbXBsYXRlSWRlbnRpZmllcltdIHtcbiAgICBjb25zdCB2aXNpdG9yID0gbmV3IEV4cHJlc3Npb25WaXNpdG9yKGNvbnRleHQsIGJvdW5kVGVtcGxhdGUpO1xuICAgIHZpc2l0b3IudmlzaXQoYXN0KTtcbiAgICByZXR1cm4gdmlzaXRvci5pZGVudGlmaWVycztcbiAgfVxuXG4gIHZpc2l0KGFzdDogQVNUKSB7IGFzdC52aXNpdCh0aGlzKTsgfVxuXG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwsIGNvbnRleHQ6IHt9KSB7XG4gICAgdGhpcy52aXNpdElkZW50aWZpZXIoYXN0LCBJZGVudGlmaWVyS2luZC5NZXRob2QpO1xuICAgIHN1cGVyLnZpc2l0TWV0aG9kQ2FsbChhc3QsIGNvbnRleHQpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IHt9KSB7XG4gICAgdGhpcy52aXNpdElkZW50aWZpZXIoYXN0LCBJZGVudGlmaWVyS2luZC5Qcm9wZXJ0eSk7XG4gICAgc3VwZXIudmlzaXRQcm9wZXJ0eVJlYWQoYXN0LCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWaXNpdHMgYW4gaWRlbnRpZmllciwgYWRkaW5nIGl0IHRvIHRoZSBpZGVudGlmaWVyIHN0b3JlIGlmIGl0IGlzIHVzZWZ1bCBmb3IgaW5kZXhpbmcuXG4gICAqXG4gICAqIEBwYXJhbSBhc3QgZXhwcmVzc2lvbiBBU1QgdGhlIGlkZW50aWZpZXIgaXMgaW5cbiAgICogQHBhcmFtIGtpbmQgaWRlbnRpZmllciBraW5kXG4gICAqL1xuICBwcml2YXRlIHZpc2l0SWRlbnRpZmllcihhc3Q6IEFTVCZ7bmFtZTogc3RyaW5nLCByZWNlaXZlcjogQVNUfSwga2luZDogSWRlbnRpZmllcktpbmQpIHtcbiAgICAvLyBUaGUgZGVmaW5pdGlvbiBvZiBhIG5vbi10b3AtbGV2ZWwgcHJvcGVydHkgc3VjaCBhcyBgYmFyYCBpbiBge3tmb28uYmFyfX1gIGlzIGN1cnJlbnRseVxuICAgIC8vIGltcG9zc2libGUgdG8gZGV0ZXJtaW5lIGJ5IGFuIGluZGV4ZXIgYW5kIHVuc3VwcG9ydGVkIGJ5IHRoZSBpbmRleGluZyBtb2R1bGUuXG4gICAgLy8gVGhlIGluZGV4aW5nIG1vZHVsZSBhbHNvIGRvZXMgbm90IGN1cnJlbnRseSBzdXBwb3J0IHJlZmVyZW5jZXMgdG8gaWRlbnRpZmllcnMgZGVjbGFyZWQgaW4gdGhlXG4gICAgLy8gdGVtcGxhdGUgaXRzZWxmLCB3aGljaCBoYXZlIGEgbm9uLW51bGwgZXhwcmVzc2lvbiB0YXJnZXQuXG4gICAgaWYgKCEoYXN0LnJlY2VpdmVyIGluc3RhbmNlb2YgSW1wbGljaXRSZWNlaXZlcikgfHxcbiAgICAgICAgdGhpcy5ib3VuZFRlbXBsYXRlLmdldEV4cHJlc3Npb25UYXJnZXQoYXN0KSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgbG9jYXRpb24gb2YgdGhlIGlkZW50aWZpZXIgb2YgcmVhbCBpbnRlcmVzdC5cbiAgICAvLyBUaGUgY29tcGlsZXIncyBleHByZXNzaW9uIHBhcnNlciByZWNvcmRzIHRoZSBsb2NhdGlvbiBvZiBzb21lIGV4cHJlc3Npb25zIGluIGEgbWFubmVyIG5vdFxuICAgIC8vIHVzZWZ1bCB0byB0aGUgaW5kZXhlci4gRm9yIGV4YW1wbGUsIGEgYE1ldGhvZENhbGxgIGBmb28oYSwgYilgIHdpbGwgcmVjb3JkIHRoZSBzcGFuIG9mIHRoZVxuICAgIC8vIGVudGlyZSBtZXRob2QgY2FsbCwgYnV0IHRoZSBpbmRleGVyIGlzIGludGVyZXN0ZWQgb25seSBpbiB0aGUgbWV0aG9kIGlkZW50aWZpZXIuXG4gICAgY29uc3QgbG9jYWxFeHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uU3RyLnN1YnN0cihhc3Quc3Bhbi5zdGFydCwgYXN0LnNwYW4uZW5kKTtcbiAgICBjb25zdCBpZGVudGlmaWVyU3RhcnQgPSBhc3Quc3Bhbi5zdGFydCArIGxvY2FsRXhwcmVzc2lvbi5pbmRleE9mKGFzdC5uYW1lKTtcblxuICAgIC8vIEpvaW4gdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSBleHByZXNzaW9uIHdpdGhpbiBhIG5vZGUgd2l0aCB0aGUgYWJzb2x1dGUgcG9zaXRpb25cbiAgICAvLyBvZiB0aGUgbm9kZSB0byBnZXQgdGhlIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSBleHByZXNzaW9uIGluIHRoZSBzb3VyY2UgY29kZS5cbiAgICBjb25zdCBhYnNvbHV0ZVN0YXJ0ID0gdGhpcy5hYnNvbHV0ZU9mZnNldCArIGlkZW50aWZpZXJTdGFydDtcbiAgICBjb25zdCBzcGFuID0gbmV3IEFic29sdXRlU291cmNlU3BhbihhYnNvbHV0ZVN0YXJ0LCBhYnNvbHV0ZVN0YXJ0ICsgYXN0Lm5hbWUubGVuZ3RoKTtcblxuICAgIHRoaXMuaWRlbnRpZmllcnMucHVzaCh7XG4gICAgICBuYW1lOiBhc3QubmFtZSxcbiAgICAgIHNwYW4sXG4gICAgICBraW5kLFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogVmlzaXRzIHRoZSBBU1Qgb2YgYSBwYXJzZWQgQW5ndWxhciB0ZW1wbGF0ZS4gRGlzY292ZXJzIGFuZCBzdG9yZXNcbiAqIGlkZW50aWZpZXJzIG9mIGludGVyZXN0LCBkZWZlcnJpbmcgdG8gYW4gYEV4cHJlc3Npb25WaXNpdG9yYCBhcyBuZWVkZWQuXG4gKi9cbmNsYXNzIFRlbXBsYXRlVmlzaXRvciBleHRlbmRzIFJlY3Vyc2l2ZVRlbXBsYXRlVmlzaXRvciB7XG4gIC8vIGlkZW50aWZpZXJzIG9mIGludGVyZXN0IGZvdW5kIGluIHRoZSB0ZW1wbGF0ZVxuICByZWFkb25seSBpZGVudGlmaWVycyA9IG5ldyBTZXQ8VGVtcGxhdGVJZGVudGlmaWVyPigpO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdGVtcGxhdGUgdmlzaXRvciBmb3IgYSBib3VuZCB0ZW1wbGF0ZSB0YXJnZXQuIFRoZSBib3VuZCB0YXJnZXQgY2FuIGJlIHVzZWQgd2hlblxuICAgKiBkZWZlcnJlZCB0byB0aGUgZXhwcmVzc2lvbiB2aXNpdG9yIHRvIGdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdGFyZ2V0IG9mIGFuIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEBwYXJhbSBib3VuZFRlbXBsYXRlIGJvdW5kIHRlbXBsYXRlIHRhcmdldFxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBib3VuZFRlbXBsYXRlOiBCb3VuZFRhcmdldDxEaXJlY3RpdmVNZXRhPikgeyBzdXBlcigpOyB9XG5cbiAgLyoqXG4gICAqIFZpc2l0cyBhIG5vZGUgaW4gdGhlIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAcGFyYW0gbm9kZSBub2RlIHRvIHZpc2l0XG4gICAqL1xuICB2aXNpdChub2RlOiBIVE1MTm9kZSkgeyBub2RlLnZpc2l0KHRoaXMpOyB9XG5cbiAgdmlzaXRBbGwobm9kZXM6IE5vZGVbXSkgeyBub2Rlcy5mb3JFYWNoKG5vZGUgPT4gdGhpcy52aXNpdChub2RlKSk7IH1cblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCkge1xuICAgIHRoaXMudmlzaXRBbGwoZWxlbWVudC5hdHRyaWJ1dGVzKTtcbiAgICB0aGlzLnZpc2l0QWxsKGVsZW1lbnQuY2hpbGRyZW4pO1xuICAgIHRoaXMudmlzaXRBbGwoZWxlbWVudC5yZWZlcmVuY2VzKTtcbiAgfVxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSkge1xuICAgIHRoaXMudmlzaXRBbGwodGVtcGxhdGUuYXR0cmlidXRlcyk7XG4gICAgdGhpcy52aXNpdEFsbCh0ZW1wbGF0ZS5jaGlsZHJlbik7XG4gICAgdGhpcy52aXNpdEFsbCh0ZW1wbGF0ZS5yZWZlcmVuY2VzKTtcbiAgICB0aGlzLnZpc2l0QWxsKHRlbXBsYXRlLnZhcmlhYmxlcyk7XG4gIH1cbiAgdmlzaXRCb3VuZFRleHQodGV4dDogQm91bmRUZXh0KSB7IHRoaXMudmlzaXRFeHByZXNzaW9uKHRleHQpOyB9XG5cbiAgLyoqXG4gICAqIFZpc2l0cyBhIG5vZGUncyBleHByZXNzaW9uIGFuZCBhZGRzIGl0cyBpZGVudGlmaWVycywgaWYgYW55LCB0byB0aGUgdmlzaXRvcidzIHN0YXRlLlxuICAgKlxuICAgKiBAcGFyYW0gY3VycmV0Tm9kZSBub2RlIHdob3NlIGV4cHJlc3Npb24gdG8gdmlzaXRcbiAgICovXG4gIHByaXZhdGUgdmlzaXRFeHByZXNzaW9uKG5vZGU6IE5vZGUme3ZhbHVlOiBBU1R9KSB7XG4gICAgY29uc3QgaWRlbnRpZmllcnMgPSBFeHByZXNzaW9uVmlzaXRvci5nZXRJZGVudGlmaWVycyhub2RlLnZhbHVlLCBub2RlLCB0aGlzLmJvdW5kVGVtcGxhdGUpO1xuICAgIGlkZW50aWZpZXJzLmZvckVhY2goaWQgPT4gdGhpcy5pZGVudGlmaWVycy5hZGQoaWQpKTtcbiAgfVxufVxuXG4vKipcbiAqIFRyYXZlcnNlcyBhIHRlbXBsYXRlIEFTVCBhbmQgYnVpbGRzIGlkZW50aWZpZXJzIGRpc2NvdmVyZWQgaW4gaXQuXG4gKlxuICogQHBhcmFtIGJvdW5kVGVtcGxhdGUgYm91bmQgdGVtcGxhdGUgdGFyZ2V0LCB3aGljaCBjYW4gYmUgdXNlZCBmb3IgcXVlcnlpbmcgZXhwcmVzc2lvbiB0YXJnZXRzLlxuICogQHJldHVybiBpZGVudGlmaWVycyBpbiB0ZW1wbGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVtcGxhdGVJZGVudGlmaWVycyhib3VuZFRlbXBsYXRlOiBCb3VuZFRhcmdldDxEaXJlY3RpdmVNZXRhPik6XG4gICAgU2V0PFRlbXBsYXRlSWRlbnRpZmllcj4ge1xuICBjb25zdCB2aXNpdG9yID0gbmV3IFRlbXBsYXRlVmlzaXRvcihib3VuZFRlbXBsYXRlKTtcbiAgaWYgKGJvdW5kVGVtcGxhdGUudGFyZ2V0LnRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICB2aXNpdG9yLnZpc2l0QWxsKGJvdW5kVGVtcGxhdGUudGFyZ2V0LnRlbXBsYXRlKTtcbiAgfVxuICByZXR1cm4gdmlzaXRvci5pZGVudGlmaWVycztcbn1cbiJdfQ==