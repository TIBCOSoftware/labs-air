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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/base_def", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/annotations/src/directive", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var directive_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/directive");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    function containsNgTopLevelDecorator(decorators, isCore) {
        if (!decorators) {
            return false;
        }
        return decorators.some(function (decorator) { return util_1.isAngularDecorator(decorator, 'Component', isCore) ||
            util_1.isAngularDecorator(decorator, 'Directive', isCore) ||
            util_1.isAngularDecorator(decorator, 'NgModule', isCore); });
    }
    var BaseDefDecoratorHandler = /** @class */ (function () {
        function BaseDefDecoratorHandler(reflector, evaluator, isCore) {
            this.reflector = reflector;
            this.evaluator = evaluator;
            this.isCore = isCore;
            this.precedence = transform_1.HandlerPrecedence.WEAK;
        }
        BaseDefDecoratorHandler.prototype.detect = function (node, decorators) {
            var _this = this;
            if (containsNgTopLevelDecorator(decorators, this.isCore)) {
                // If the class is already decorated by @Component or @Directive let that
                // DecoratorHandler handle this. BaseDef is unnecessary.
                return undefined;
            }
            var result = undefined;
            this.reflector.getMembersOfClass(node).forEach(function (property) {
                var e_1, _a;
                var decorators = property.decorators;
                if (!decorators) {
                    return;
                }
                try {
                    for (var decorators_1 = tslib_1.__values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                        var decorator = decorators_1_1.value;
                        if (util_1.isAngularDecorator(decorator, 'Input', _this.isCore)) {
                            result = result || {};
                            var inputs = result.inputs = result.inputs || [];
                            inputs.push({ decorator: decorator, property: property });
                        }
                        else if (util_1.isAngularDecorator(decorator, 'Output', _this.isCore)) {
                            result = result || {};
                            var outputs = result.outputs = result.outputs || [];
                            outputs.push({ decorator: decorator, property: property });
                        }
                        else if (util_1.isAngularDecorator(decorator, 'ViewChild', _this.isCore) ||
                            util_1.isAngularDecorator(decorator, 'ViewChildren', _this.isCore)) {
                            result = result || {};
                            var viewQueries = result.viewQueries = result.viewQueries || [];
                            viewQueries.push({ member: property, decorators: decorators });
                        }
                        else if (util_1.isAngularDecorator(decorator, 'ContentChild', _this.isCore) ||
                            util_1.isAngularDecorator(decorator, 'ContentChildren', _this.isCore)) {
                            result = result || {};
                            var queries = result.queries = result.queries || [];
                            queries.push({ member: property, decorators: decorators });
                        }
                        else if (util_1.isAngularDecorator(decorator, 'HostBinding', _this.isCore) ||
                            util_1.isAngularDecorator(decorator, 'HostListener', _this.isCore)) {
                            result = result || {};
                            var host = result.host = result.host || [];
                            host.push(property);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (decorators_1_1 && !decorators_1_1.done && (_a = decorators_1.return)) _a.call(decorators_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
            if (result !== undefined) {
                return {
                    metadata: result,
                    trigger: null,
                };
            }
            else {
                return undefined;
            }
        };
        BaseDefDecoratorHandler.prototype.analyze = function (node, metadata) {
            var _this = this;
            var analysis = { name: node.name.text, typeSourceSpan: null };
            if (metadata.inputs) {
                var inputs_1 = analysis.inputs = {};
                metadata.inputs.forEach(function (_a) {
                    var decorator = _a.decorator, property = _a.property;
                    var propName = property.name;
                    var args = decorator.args;
                    var value;
                    if (args && args.length > 0) {
                        var resolvedValue = _this.evaluator.evaluate(args[0]);
                        if (typeof resolvedValue !== 'string') {
                            throw new TypeError('Input alias does not resolve to a string value');
                        }
                        value = [resolvedValue, propName];
                    }
                    else {
                        value = propName;
                    }
                    inputs_1[propName] = value;
                });
            }
            if (metadata.outputs) {
                var outputs_1 = analysis.outputs = {};
                metadata.outputs.forEach(function (_a) {
                    var decorator = _a.decorator, property = _a.property;
                    var propName = property.name;
                    var args = decorator.args;
                    var value;
                    if (args && args.length > 0) {
                        var resolvedValue = _this.evaluator.evaluate(args[0]);
                        if (typeof resolvedValue !== 'string') {
                            throw new TypeError('Output alias does not resolve to a string value');
                        }
                        value = resolvedValue;
                    }
                    else {
                        value = propName;
                    }
                    outputs_1[propName] = value;
                });
            }
            if (metadata.viewQueries) {
                analysis.viewQueries =
                    directive_1.queriesFromFields(metadata.viewQueries, this.reflector, this.evaluator);
            }
            if (metadata.queries) {
                analysis.queries = directive_1.queriesFromFields(metadata.queries, this.reflector, this.evaluator);
            }
            if (metadata.host) {
                analysis.host = directive_1.extractHostBindings(metadata.host, this.evaluator, this.isCore ? undefined : '@angular/core');
            }
            return { analysis: analysis };
        };
        BaseDefDecoratorHandler.prototype.compile = function (node, analysis, pool) {
            var _a = compiler_1.compileBaseDefFromMetadata(analysis, pool, compiler_1.makeBindingParser()), expression = _a.expression, type = _a.type;
            return {
                name: 'ngBaseDef',
                initializer: expression, type: type,
                statements: [],
            };
        };
        return BaseDefDecoratorHandler;
    }());
    exports.BaseDefDecoratorHandler = BaseDefDecoratorHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZV9kZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9iYXNlX2RlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBaUg7SUFJakgsdUVBQWlIO0lBRWpILHVGQUFtRTtJQUNuRSw2RUFBMEM7SUFFMUMsU0FBUywyQkFBMkIsQ0FBQyxVQUE4QixFQUFFLE1BQWU7UUFDbEYsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQ2xCLFVBQUEsU0FBUyxJQUFJLE9BQUEseUJBQWtCLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUM7WUFDM0QseUJBQWtCLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUM7WUFDbEQseUJBQWtCLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFGeEMsQ0FFd0MsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRDtRQUVFLGlDQUNZLFNBQXlCLEVBQVUsU0FBMkIsRUFDOUQsTUFBZTtZQURmLGNBQVMsR0FBVCxTQUFTLENBQWdCO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBa0I7WUFDOUQsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUVsQixlQUFVLEdBQUcsNkJBQWlCLENBQUMsSUFBSSxDQUFDO1FBRmYsQ0FBQztRQUkvQix3Q0FBTSxHQUFOLFVBQU8sSUFBc0IsRUFBRSxVQUE0QjtZQUEzRCxpQkFzREM7WUFwREMsSUFBSSwyQkFBMkIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN4RCx5RUFBeUU7Z0JBQ3pFLHdEQUF3RDtnQkFDeEQsT0FBTyxTQUFTLENBQUM7YUFDbEI7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QUFDLElBQUksR0FBRywrQkFBbUIsQ0FDL0IsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDL0U7WUFFRCxPQUFPLEVBQUMsUUFBUSxVQUFBLEVBQUMsQ0FBQztRQUNwQixDQUFDO1FBRUQseUNBQU8sR0FBUCxVQUFRLElBQXNCLEVBQUUsUUFBMkIsRUFBRSxJQUFrQjtZQUV2RSxJQUFBLDBGQUFvRixFQUFuRiwwQkFBVSxFQUFFLGNBQXVFLENBQUM7WUFFM0YsT0FBTztnQkFDTCxJQUFJLEVBQUUsV0FBVztnQkFDakIsV0FBVyxFQUFFLFVBQVUsRUFBRSxJQUFJLE1BQUE7Z0JBQzdCLFVBQVUsRUFBRSxFQUFFO2FBQ2YsQ0FBQztRQUNKLENBQUM7UUFDSCw4QkFBQztJQUFELENBQUMsQUFySUQsSUFxSUM7SUFySVksMERBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnN0YW50UG9vbCwgUjNCYXNlUmVmTWV0YURhdGEsIGNvbXBpbGVCYXNlRGVmRnJvbU1ldGFkYXRhLCBtYWtlQmluZGluZ1BhcnNlcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG5pbXBvcnQge1BhcnRpYWxFdmFsdWF0b3J9IGZyb20gJy4uLy4uL3BhcnRpYWxfZXZhbHVhdG9yJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgQ2xhc3NNZW1iZXIsIERlY29yYXRvciwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtBbmFseXNpc091dHB1dCwgQ29tcGlsZVJlc3VsdCwgRGVjb3JhdG9ySGFuZGxlciwgRGV0ZWN0UmVzdWx0LCBIYW5kbGVyUHJlY2VkZW5jZX0gZnJvbSAnLi4vLi4vdHJhbnNmb3JtJztcblxuaW1wb3J0IHtleHRyYWN0SG9zdEJpbmRpbmdzLCBxdWVyaWVzRnJvbUZpZWxkc30gZnJvbSAnLi9kaXJlY3RpdmUnO1xuaW1wb3J0IHtpc0FuZ3VsYXJEZWNvcmF0b3J9IGZyb20gJy4vdXRpbCc7XG5cbmZ1bmN0aW9uIGNvbnRhaW5zTmdUb3BMZXZlbERlY29yYXRvcihkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXSB8IG51bGwsIGlzQ29yZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBpZiAoIWRlY29yYXRvcnMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGRlY29yYXRvcnMuc29tZShcbiAgICAgIGRlY29yYXRvciA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9yLCAnQ29tcG9uZW50JywgaXNDb3JlKSB8fFxuICAgICAgICAgIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsICdEaXJlY3RpdmUnLCBpc0NvcmUpIHx8XG4gICAgICAgICAgaXNBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvciwgJ05nTW9kdWxlJywgaXNDb3JlKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBCYXNlRGVmRGVjb3JhdG9ySGFuZGxlciBpbXBsZW1lbnRzXG4gICAgRGVjb3JhdG9ySGFuZGxlcjxSM0Jhc2VSZWZNZXRhRGF0YSwgUjNCYXNlUmVmRGVjb3JhdG9yRGV0ZWN0aW9uPiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIGV2YWx1YXRvcjogUGFydGlhbEV2YWx1YXRvcixcbiAgICAgIHByaXZhdGUgaXNDb3JlOiBib29sZWFuKSB7fVxuXG4gIHJlYWRvbmx5IHByZWNlZGVuY2UgPSBIYW5kbGVyUHJlY2VkZW5jZS5XRUFLO1xuXG4gIGRldGVjdChub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXXxudWxsKTpcbiAgICAgIERldGVjdFJlc3VsdDxSM0Jhc2VSZWZEZWNvcmF0b3JEZXRlY3Rpb24+fHVuZGVmaW5lZCB7XG4gICAgaWYgKGNvbnRhaW5zTmdUb3BMZXZlbERlY29yYXRvcihkZWNvcmF0b3JzLCB0aGlzLmlzQ29yZSkpIHtcbiAgICAgIC8vIElmIHRoZSBjbGFzcyBpcyBhbHJlYWR5IGRlY29yYXRlZCBieSBAQ29tcG9uZW50IG9yIEBEaXJlY3RpdmUgbGV0IHRoYXRcbiAgICAgIC8vIERlY29yYXRvckhhbmRsZXIgaGFuZGxlIHRoaXMuIEJhc2VEZWYgaXMgdW5uZWNlc3NhcnkuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCByZXN1bHQ6IFIzQmFzZVJlZkRlY29yYXRvckRldGVjdGlvbnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLnJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhub2RlKS5mb3JFYWNoKHByb3BlcnR5ID0+IHtcbiAgICAgIGNvbnN0IHtkZWNvcmF0b3JzfSA9IHByb3BlcnR5O1xuICAgICAgaWYgKCFkZWNvcmF0b3JzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIGRlY29yYXRvcnMpIHtcbiAgICAgICAgaWYgKGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsICdJbnB1dCcsIHRoaXMuaXNDb3JlKSkge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCB8fCB7fTtcbiAgICAgICAgICBjb25zdCBpbnB1dHMgPSByZXN1bHQuaW5wdXRzID0gcmVzdWx0LmlucHV0cyB8fCBbXTtcbiAgICAgICAgICBpbnB1dHMucHVzaCh7ZGVjb3JhdG9yLCBwcm9wZXJ0eX0pO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsICdPdXRwdXQnLCB0aGlzLmlzQ29yZSkpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgICAgICAgY29uc3Qgb3V0cHV0cyA9IHJlc3VsdC5vdXRwdXRzID0gcmVzdWx0Lm91dHB1dHMgfHwgW107XG4gICAgICAgICAgb3V0cHV0cy5wdXNoKHtkZWNvcmF0b3IsIHByb3BlcnR5fSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9yLCAnVmlld0NoaWxkJywgdGhpcy5pc0NvcmUpIHx8XG4gICAgICAgICAgICBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9yLCAnVmlld0NoaWxkcmVuJywgdGhpcy5pc0NvcmUpKSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IHt9O1xuICAgICAgICAgIGNvbnN0IHZpZXdRdWVyaWVzID0gcmVzdWx0LnZpZXdRdWVyaWVzID0gcmVzdWx0LnZpZXdRdWVyaWVzIHx8IFtdO1xuICAgICAgICAgIHZpZXdRdWVyaWVzLnB1c2goe21lbWJlcjogcHJvcGVydHksIGRlY29yYXRvcnN9KTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsICdDb250ZW50Q2hpbGQnLCB0aGlzLmlzQ29yZSkgfHxcbiAgICAgICAgICAgIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsICdDb250ZW50Q2hpbGRyZW4nLCB0aGlzLmlzQ29yZSkpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgICAgICAgY29uc3QgcXVlcmllcyA9IHJlc3VsdC5xdWVyaWVzID0gcmVzdWx0LnF1ZXJpZXMgfHwgW107XG4gICAgICAgICAgcXVlcmllcy5wdXNoKHttZW1iZXI6IHByb3BlcnR5LCBkZWNvcmF0b3JzfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9yLCAnSG9zdEJpbmRpbmcnLCB0aGlzLmlzQ29yZSkgfHxcbiAgICAgICAgICAgIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsICdIb3N0TGlzdGVuZXInLCB0aGlzLmlzQ29yZSkpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwge307XG4gICAgICAgICAgY29uc3QgaG9zdCA9IHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3QgfHwgW107XG4gICAgICAgICAgaG9zdC5wdXNoKHByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZXRhZGF0YTogcmVzdWx0LFxuICAgICAgICB0cmlnZ2VyOiBudWxsLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBhbmFseXplKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIG1ldGFkYXRhOiBSM0Jhc2VSZWZEZWNvcmF0b3JEZXRlY3Rpb24pOlxuICAgICAgQW5hbHlzaXNPdXRwdXQ8UjNCYXNlUmVmTWV0YURhdGE+IHtcbiAgICBjb25zdCBhbmFseXNpczogUjNCYXNlUmVmTWV0YURhdGEgPSB7bmFtZTogbm9kZS5uYW1lLnRleHQsIHR5cGVTb3VyY2VTcGFuOiBudWxsICF9O1xuXG4gICAgaWYgKG1ldGFkYXRhLmlucHV0cykge1xuICAgICAgY29uc3QgaW5wdXRzID0gYW5hbHlzaXMuaW5wdXRzID0ge30gYXN7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgW3N0cmluZywgc3RyaW5nXX07XG4gICAgICBtZXRhZGF0YS5pbnB1dHMuZm9yRWFjaCgoe2RlY29yYXRvciwgcHJvcGVydHl9KSA9PiB7XG4gICAgICAgIGNvbnN0IHByb3BOYW1lID0gcHJvcGVydHkubmFtZTtcbiAgICAgICAgY29uc3QgYXJncyA9IGRlY29yYXRvci5hcmdzO1xuICAgICAgICBsZXQgdmFsdWU6IHN0cmluZ3xbc3RyaW5nLCBzdHJpbmddO1xuICAgICAgICBpZiAoYXJncyAmJiBhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZFZhbHVlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoYXJnc1swXSk7XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXNvbHZlZFZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW5wdXQgYWxpYXMgZG9lcyBub3QgcmVzb2x2ZSB0byBhIHN0cmluZyB2YWx1ZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZSA9IFtyZXNvbHZlZFZhbHVlLCBwcm9wTmFtZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBwcm9wTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBpbnB1dHNbcHJvcE5hbWVdID0gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobWV0YWRhdGEub3V0cHV0cykge1xuICAgICAgY29uc3Qgb3V0cHV0cyA9IGFuYWx5c2lzLm91dHB1dHMgPSB7fSBhc3tba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICAgICAgbWV0YWRhdGEub3V0cHV0cy5mb3JFYWNoKCh7ZGVjb3JhdG9yLCBwcm9wZXJ0eX0pID0+IHtcbiAgICAgICAgY29uc3QgcHJvcE5hbWUgPSBwcm9wZXJ0eS5uYW1lO1xuICAgICAgICBjb25zdCBhcmdzID0gZGVjb3JhdG9yLmFyZ3M7XG4gICAgICAgIGxldCB2YWx1ZTogc3RyaW5nO1xuICAgICAgICBpZiAoYXJncyAmJiBhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZFZhbHVlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoYXJnc1swXSk7XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXNvbHZlZFZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignT3V0cHV0IGFsaWFzIGRvZXMgbm90IHJlc29sdmUgdG8gYSBzdHJpbmcgdmFsdWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWUgPSByZXNvbHZlZFZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gcHJvcE5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0c1twcm9wTmFtZV0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChtZXRhZGF0YS52aWV3UXVlcmllcykge1xuICAgICAgYW5hbHlzaXMudmlld1F1ZXJpZXMgPVxuICAgICAgICAgIHF1ZXJpZXNGcm9tRmllbGRzKG1ldGFkYXRhLnZpZXdRdWVyaWVzLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5ldmFsdWF0b3IpO1xuICAgIH1cblxuICAgIGlmIChtZXRhZGF0YS5xdWVyaWVzKSB7XG4gICAgICBhbmFseXNpcy5xdWVyaWVzID0gcXVlcmllc0Zyb21GaWVsZHMobWV0YWRhdGEucXVlcmllcywgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZXZhbHVhdG9yKTtcbiAgICB9XG5cbiAgICBpZiAobWV0YWRhdGEuaG9zdCkge1xuICAgICAgYW5hbHlzaXMuaG9zdCA9IGV4dHJhY3RIb3N0QmluZGluZ3MoXG4gICAgICAgICAgbWV0YWRhdGEuaG9zdCwgdGhpcy5ldmFsdWF0b3IsIHRoaXMuaXNDb3JlID8gdW5kZWZpbmVkIDogJ0Bhbmd1bGFyL2NvcmUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2FuYWx5c2lzfTtcbiAgfVxuXG4gIGNvbXBpbGUobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IFIzQmFzZVJlZk1ldGFEYXRhLCBwb29sOiBDb25zdGFudFBvb2wpOlxuICAgICAgQ29tcGlsZVJlc3VsdFtdfENvbXBpbGVSZXN1bHQge1xuICAgIGNvbnN0IHtleHByZXNzaW9uLCB0eXBlfSA9IGNvbXBpbGVCYXNlRGVmRnJvbU1ldGFkYXRhKGFuYWx5c2lzLCBwb29sLCBtYWtlQmluZGluZ1BhcnNlcigpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnbmdCYXNlRGVmJyxcbiAgICAgIGluaXRpYWxpemVyOiBleHByZXNzaW9uLCB0eXBlLFxuICAgICAgc3RhdGVtZW50czogW10sXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzQmFzZVJlZkRlY29yYXRvckRldGVjdGlvbiB7XG4gIGlucHV0cz86IHtwcm9wZXJ0eTogQ2xhc3NNZW1iZXIsIGRlY29yYXRvcjogRGVjb3JhdG9yfVtdO1xuICBvdXRwdXRzPzoge3Byb3BlcnR5OiBDbGFzc01lbWJlciwgZGVjb3JhdG9yOiBEZWNvcmF0b3J9W107XG4gIHZpZXdRdWVyaWVzPzoge21lbWJlcjogQ2xhc3NNZW1iZXIsIGRlY29yYXRvcnM6IERlY29yYXRvcltdfVtdO1xuICBxdWVyaWVzPzoge21lbWJlcjogQ2xhc3NNZW1iZXIsIGRlY29yYXRvcnM6IERlY29yYXRvcltdfVtdO1xuICBob3N0PzogQ2xhc3NNZW1iZXJbXTtcbn1cbiJdfQ==