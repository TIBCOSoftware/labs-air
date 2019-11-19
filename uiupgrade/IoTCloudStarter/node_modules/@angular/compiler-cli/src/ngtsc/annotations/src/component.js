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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/component", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/metadata/src/inheritance", "@angular/compiler-cli/src/ngtsc/partial_evaluator", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/util/src/resource_recorder", "@angular/compiler-cli/src/ngtsc/util/src/ts_source_map_bug_29300", "@angular/compiler-cli/src/ngtsc/annotations/src/directive", "@angular/compiler-cli/src/ngtsc/annotations/src/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var inheritance_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/inheritance");
    var partial_evaluator_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var resource_recorder_1 = require("@angular/compiler-cli/src/ngtsc/util/src/resource_recorder");
    var ts_source_map_bug_29300_1 = require("@angular/compiler-cli/src/ngtsc/util/src/ts_source_map_bug_29300");
    var directive_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/directive");
    var metadata_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/metadata");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    var EMPTY_MAP = new Map();
    var EMPTY_ARRAY = [];
    /**
     * `DecoratorHandler` which handles the `@Component` annotation.
     */
    var ComponentDecoratorHandler = /** @class */ (function () {
        function ComponentDecoratorHandler(reflector, evaluator, metaRegistry, metaReader, scopeRegistry, isCore, resourceLoader, rootDirs, defaultPreserveWhitespaces, i18nUseExternalIds, moduleResolver, cycleAnalyzer, refEmitter, defaultImportRecorder, resourceDependencies) {
            if (resourceDependencies === void 0) { resourceDependencies = new resource_recorder_1.NoopResourceDependencyRecorder(); }
            this.reflector = reflector;
            this.evaluator = evaluator;
            this.metaRegistry = metaRegistry;
            this.metaReader = metaReader;
            this.scopeRegistry = scopeRegistry;
            this.isCore = isCore;
            this.resourceLoader = resourceLoader;
            this.rootDirs = rootDirs;
            this.defaultPreserveWhitespaces = defaultPreserveWhitespaces;
            this.i18nUseExternalIds = i18nUseExternalIds;
            this.moduleResolver = moduleResolver;
            this.cycleAnalyzer = cycleAnalyzer;
            this.refEmitter = refEmitter;
            this.defaultImportRecorder = defaultImportRecorder;
            this.resourceDependencies = resourceDependencies;
            this.literalCache = new Map();
            this.elementSchemaRegistry = new compiler_1.DomElementSchemaRegistry();
            /**
             * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
             * any potential <link> tags which might need to be loaded. This cache ensures that work is not
             * thrown away, and the parsed template is reused during the analyze phase.
             */
            this.preanalyzeTemplateCache = new Map();
            this.precedence = transform_1.HandlerPrecedence.PRIMARY;
        }
        ComponentDecoratorHandler.prototype.detect = function (node, decorators) {
            if (!decorators) {
                return undefined;
            }
            var decorator = util_1.findAngularDecorator(decorators, 'Component', this.isCore);
            if (decorator !== undefined) {
                return {
                    trigger: decorator.node,
                    metadata: decorator,
                };
            }
            else {
                return undefined;
            }
        };
        ComponentDecoratorHandler.prototype.preanalyze = function (node, decorator) {
            // In preanalyze, resource URLs associated with the component are asynchronously preloaded via
            // the resourceLoader. This is the only time async operations are allowed for a component.
            // These resources are:
            //
            // - the templateUrl, if there is one
            // - any styleUrls if present
            // - any stylesheets referenced from <link> tags in the template itself
            //
            // As a result of the last one, the template must be parsed as part of preanalysis to extract
            // <link> tags, which may involve waiting for the templateUrl to be resolved first.
            var _this = this;
            // If preloading isn't possible, then skip this step.
            if (!this.resourceLoader.canPreload) {
                return undefined;
            }
            var meta = this._resolveLiteral(decorator);
            var component = reflection_1.reflectObjectLiteral(meta);
            var containingFile = node.getSourceFile().fileName;
            // Convert a styleUrl string into a Promise to preload it.
            var resolveStyleUrl = function (styleUrl) {
                var resourceUrl = _this.resourceLoader.resolve(styleUrl, containingFile);
                var promise = _this.resourceLoader.preload(resourceUrl);
                return promise || Promise.resolve();
            };
            // A Promise that waits for the template and all <link>ed styles within it to be preloaded.
            var templateAndTemplateStyleResources = this._preloadAndParseTemplate(node, decorator, component, containingFile).then(function (template) {
                if (template === null) {
                    return undefined;
                }
                else {
                    return Promise.all(template.styleUrls.map(resolveStyleUrl)).then(function () { return undefined; });
                }
            });
            // Extract all the styleUrls in the decorator.
            var styleUrls = this._extractStyleUrls(component, []);
            if (styleUrls === null) {
                // A fast path exists if there are no styleUrls, to just wait for
                // templateAndTemplateStyleResources.
                return templateAndTemplateStyleResources;
            }
            else {
                // Wait for both the template and all styleUrl resources to resolve.
                return Promise.all(tslib_1.__spread([templateAndTemplateStyleResources], styleUrls.map(resolveStyleUrl)))
                    .then(function () { return undefined; });
            }
        };
        ComponentDecoratorHandler.prototype.analyze = function (node, decorator) {
            var _this = this;
            var e_1, _a;
            var containingFile = node.getSourceFile().fileName;
            this.literalCache.delete(decorator);
            // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
            // on it.
            var directiveResult = directive_1.extractDirectiveMetadata(node, decorator, this.reflector, this.evaluator, this.defaultImportRecorder, this.isCore, this.elementSchemaRegistry.getDefaultComponentElementName());
            if (directiveResult === undefined) {
                // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
                // case, compilation of the decorator is skipped. Returning an empty object signifies
                // that no analysis was produced.
                return {};
            }
            // Next, read the `@Component`-specific fields.
            var component = directiveResult.decorator, metadata = directiveResult.metadata;
            // Go through the root directories for this project, and select the one with the smallest
            // relative path representation.
            var relativeContextFilePath = this.rootDirs.reduce(function (previous, rootDir) {
                var candidate = file_system_1.relative(file_system_1.absoluteFrom(rootDir), file_system_1.absoluteFrom(containingFile));
                if (previous === undefined || candidate.length < previous.length) {
                    return candidate;
                }
                else {
                    return previous;
                }
            }, undefined);
            var viewProviders = component.has('viewProviders') ?
                new compiler_1.WrappedNodeExpr(component.get('viewProviders')) :
                null;
            // Parse the template.
            // If a preanalyze phase was executed, the template may already exist in parsed form, so check
            // the preanalyzeTemplateCache.
            // Extract a closure of the template parsing code so that it can be reparsed with different
            // options if needed, like in the indexing pipeline.
            var parseTemplate;
            if (this.preanalyzeTemplateCache.has(node)) {
                // The template was parsed in preanalyze. Use it and delete it to save memory.
                var template_1 = this.preanalyzeTemplateCache.get(node);
                this.preanalyzeTemplateCache.delete(node);
                // A pre-analyzed template cannot be reparsed. Pre-analysis is never run with the indexing
                // pipeline.
                parseTemplate = function (options) {
                    if (options !== undefined) {
                        throw new Error("Cannot reparse a pre-analyzed template with new options");
                    }
                    return template_1;
                };
            }
            else {
                // The template was not already parsed. Either there's a templateUrl, or an inline template.
                if (component.has('templateUrl')) {
                    var templateUrlExpr = component.get('templateUrl');
                    var evalTemplateUrl = this.evaluator.evaluate(templateUrlExpr);
                    if (typeof evalTemplateUrl !== 'string') {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
                    }
                    var templateUrl_1 = this.resourceLoader.resolve(evalTemplateUrl, containingFile);
                    var templateStr_1 = this.resourceLoader.load(templateUrl_1);
                    this.resourceDependencies.recordResourceDependency(node.getSourceFile(), templateUrl_1);
                    parseTemplate = function (options) { return _this._parseTemplate(component, templateStr_1, sourceMapUrl(templateUrl_1), /* templateRange */ undefined, 
                    /* escapedString */ false, options); };
                }
                else {
                    // Expect an inline template to be present.
                    var inlineTemplate = this._extractInlineTemplate(component, containingFile);
                    if (inlineTemplate === null) {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.COMPONENT_MISSING_TEMPLATE, decorator.node, 'component is missing a template');
                    }
                    var templateStr_2 = inlineTemplate.templateStr, templateUrl_2 = inlineTemplate.templateUrl, templateRange_1 = inlineTemplate.templateRange, escapedString_1 = inlineTemplate.escapedString;
                    parseTemplate = function (options) { return _this._parseTemplate(component, templateStr_2, templateUrl_2, templateRange_1, escapedString_1, options); };
                }
            }
            var template = parseTemplate();
            if (template.errors !== undefined) {
                throw new Error("Errors parsing template: " + template.errors.map(function (e) { return e.toString(); }).join(', '));
            }
            // If the component has a selector, it should be registered with the
            // `LocalModuleScopeRegistry`
            // so that when this component appears in an `@NgModule` scope, its selector can be
            // determined.
            if (metadata.selector !== null) {
                var ref = new imports_1.Reference(node);
                this.metaRegistry.registerDirectiveMetadata(tslib_1.__assign({ ref: ref, name: node.name.text, selector: metadata.selector, exportAs: metadata.exportAs, inputs: metadata.inputs, outputs: metadata.outputs, queries: metadata.queries.map(function (query) { return query.propertyName; }), isComponent: true }, metadata_1.extractDirectiveGuards(node, this.reflector), { baseClass: util_1.readBaseClass(node, this.reflector, this.evaluator) }));
            }
            // Figure out the set of styles. The ordering here is important: external resources (styleUrls)
            // precede inline styles, and styles defined in the template override styles defined in the
            // component.
            var styles = null;
            var styleUrls = this._extractStyleUrls(component, template.styleUrls);
            if (styleUrls !== null) {
                if (styles === null) {
                    styles = [];
                }
                try {
                    for (var styleUrls_1 = tslib_1.__values(styleUrls), styleUrls_1_1 = styleUrls_1.next(); !styleUrls_1_1.done; styleUrls_1_1 = styleUrls_1.next()) {
                        var styleUrl = styleUrls_1_1.value;
                        var resourceUrl = this.resourceLoader.resolve(styleUrl, containingFile);
                        var resourceStr = this.resourceLoader.load(resourceUrl);
                        styles.push(resourceStr);
                        this.resourceDependencies.recordResourceDependency(node.getSourceFile(), resourceUrl);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (styleUrls_1_1 && !styleUrls_1_1.done && (_a = styleUrls_1.return)) _a.call(styleUrls_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (component.has('styles')) {
                var litStyles = directive_1.parseFieldArrayValue(component, 'styles', this.evaluator);
                if (litStyles !== null) {
                    if (styles === null) {
                        styles = litStyles;
                    }
                    else {
                        styles.push.apply(styles, tslib_1.__spread(litStyles));
                    }
                }
            }
            if (template.styles.length > 0) {
                if (styles === null) {
                    styles = template.styles;
                }
                else {
                    styles.push.apply(styles, tslib_1.__spread(template.styles));
                }
            }
            var encapsulation = this._resolveEnumValue(component, 'encapsulation', 'ViewEncapsulation') || 0;
            var changeDetection = this._resolveEnumValue(component, 'changeDetection', 'ChangeDetectionStrategy');
            var animations = null;
            if (component.has('animations')) {
                animations = new compiler_1.WrappedNodeExpr(component.get('animations'));
            }
            var output = {
                analysis: {
                    meta: tslib_1.__assign({}, metadata, { template: template,
                        encapsulation: encapsulation, interpolation: template.interpolation, styles: styles || [], 
                        // These will be replaced during the compilation step, after all `NgModule`s have been
                        // analyzed and the full compilation scope for the component can be realized.
                        pipes: EMPTY_MAP, directives: EMPTY_ARRAY, wrapDirectivesAndPipesInClosure: false, //
                        animations: animations,
                        viewProviders: viewProviders, i18nUseExternalIds: this.i18nUseExternalIds, relativeContextFilePath: relativeContextFilePath }),
                    metadataStmt: metadata_2.generateSetClassMetadataCall(node, this.reflector, this.defaultImportRecorder, this.isCore),
                    parsedTemplate: template.nodes, parseTemplate: parseTemplate,
                },
                typeCheck: true,
            };
            if (changeDetection !== null) {
                output.analysis.meta.changeDetection = changeDetection;
            }
            return output;
        };
        ComponentDecoratorHandler.prototype.index = function (context, node, analysis) {
            var e_2, _a;
            // The component template may have been previously parsed without preserving whitespace or with
            // `leadingTriviaChar`s, both of which may manipulate the AST into a form not representative of
            // the source code, making it unsuitable for indexing. The template is reparsed with preserving
            // options to remedy this.
            var template = analysis.parseTemplate({
                preserveWhitespaces: true,
                leadingTriviaChars: [],
            });
            var scope = this.scopeRegistry.getScopeForComponent(node);
            var selector = analysis.meta.selector;
            var matcher = new compiler_1.SelectorMatcher();
            if (scope !== null) {
                try {
                    for (var _b = tslib_1.__values(scope.compilation.directives), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var directive = _c.value;
                        matcher.addSelectables(compiler_1.CssSelector.parse(directive.selector), directive);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            var binder = new compiler_1.R3TargetBinder(matcher);
            var boundTemplate = binder.bind({ template: template.nodes });
            context.addComponent({
                declaration: node,
                selector: selector,
                boundTemplate: boundTemplate,
                templateMeta: {
                    isInline: template.isInline,
                    file: template.file,
                },
            });
        };
        ComponentDecoratorHandler.prototype.typeCheck = function (ctx, node, meta) {
            var e_3, _a, e_4, _b;
            if (!ts.isClassDeclaration(node)) {
                return;
            }
            var scope = this.scopeRegistry.getScopeForComponent(node);
            var matcher = new compiler_1.SelectorMatcher();
            if (scope !== null) {
                try {
                    for (var _c = tslib_1.__values(scope.compilation.directives), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var meta_1 = _d.value;
                        var extMeta = inheritance_1.flattenInheritedDirectiveMetadata(this.metaReader, meta_1.ref);
                        matcher.addSelectables(compiler_1.CssSelector.parse(meta_1.selector), extMeta);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                var bound = new compiler_1.R3TargetBinder(matcher).bind({ template: meta.parsedTemplate });
                var pipes = new Map();
                try {
                    for (var _e = tslib_1.__values(scope.compilation.pipes), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var _g = _f.value, name_1 = _g.name, ref = _g.ref;
                        if (!ts.isClassDeclaration(ref.node)) {
                            throw new Error("Unexpected non-class declaration " + ts.SyntaxKind[ref.node.kind] + " for pipe " + ref.debugName);
                        }
                        pipes.set(name_1, ref);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                ctx.addTemplate(new imports_1.Reference(node), bound, pipes);
            }
        };
        ComponentDecoratorHandler.prototype.resolve = function (node, analysis) {
            var _this = this;
            var e_5, _a, e_6, _b, e_7, _c, e_8, _d;
            var context = node.getSourceFile();
            // Check whether this component was registered with an NgModule. If so, it should be compiled
            // under that module's compilation scope.
            var scope = this.scopeRegistry.getScopeForComponent(node);
            var metadata = analysis.meta;
            if (scope !== null) {
                // Replace the empty components and directives from the analyze() step with a fully expanded
                // scope. This is possible now because during resolve() the whole compilation unit has been
                // fully analyzed.
                //
                // First it needs to be determined if actually importing the directives/pipes used in the
                // template would create a cycle. Currently ngtsc refuses to generate cycles, so an option
                // known as "remote scoping" is used if a cycle would be created. In remote scoping, the
                // module file sets the directives/pipes on the ngComponentDef of the component, without
                // requiring new imports (but also in a way that breaks tree shaking).
                //
                // Determining this is challenging, because the TemplateDefinitionBuilder is responsible for
                // matching directives and pipes in the template; however, that doesn't run until the actual
                // compile() step. It's not possible to run template compilation sooner as it requires the
                // ConstantPool for the overall file being compiled (which isn't available until the transform
                // step).
                //
                // Instead, directives/pipes are matched independently here, using the R3TargetBinder. This is
                // an alternative implementation of template matching which is used for template type-checking
                // and will eventually replace matching in the TemplateDefinitionBuilder.
                // Set up the R3TargetBinder, as well as a 'directives' array and a 'pipes' map that are later
                // fed to the TemplateDefinitionBuilder. First, a SelectorMatcher is constructed to match
                // directives that are in scope.
                var matcher = new compiler_1.SelectorMatcher();
                var directives = [];
                try {
                    for (var _e = tslib_1.__values(scope.compilation.directives), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var dir = _f.value;
                        var ref = dir.ref, selector = dir.selector;
                        var expression = this.refEmitter.emit(ref, context);
                        directives.push({ selector: selector, expression: expression });
                        matcher.addSelectables(compiler_1.CssSelector.parse(selector), tslib_1.__assign({}, dir, { expression: expression }));
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                var pipes_1 = new Map();
                try {
                    for (var _g = tslib_1.__values(scope.compilation.pipes), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var pipe = _h.value;
                        pipes_1.set(pipe.name, this.refEmitter.emit(pipe.ref, context));
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                // Next, the component template AST is bound using the R3TargetBinder. This produces an
                // BoundTarget, which is similar to a ts.TypeChecker.
                var binder = new compiler_1.R3TargetBinder(matcher);
                var bound = binder.bind({ template: metadata.template.nodes });
                // The BoundTarget knows which directives and pipes matched the template.
                var usedDirectives = bound.getUsedDirectives();
                var usedPipes = bound.getUsedPipes().map(function (name) { return pipes_1.get(name); });
                // Scan through the directives/pipes actually used in the template and check whether any
                // import which needs to be generated would create a cycle.
                var cycleDetected = usedDirectives.some(function (dir) { return _this._isCyclicImport(dir.expression, context); }) ||
                    usedPipes.some(function (pipe) { return _this._isCyclicImport(pipe, context); });
                if (!cycleDetected) {
                    try {
                        // No cycle was detected. Record the imports that need to be created in the cycle detector
                        // so that future cyclic import checks consider their production.
                        for (var usedDirectives_1 = tslib_1.__values(usedDirectives), usedDirectives_1_1 = usedDirectives_1.next(); !usedDirectives_1_1.done; usedDirectives_1_1 = usedDirectives_1.next()) {
                            var expression = usedDirectives_1_1.value.expression;
                            this._recordSyntheticImport(expression, context);
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (usedDirectives_1_1 && !usedDirectives_1_1.done && (_c = usedDirectives_1.return)) _c.call(usedDirectives_1);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                    try {
                        for (var usedPipes_1 = tslib_1.__values(usedPipes), usedPipes_1_1 = usedPipes_1.next(); !usedPipes_1_1.done; usedPipes_1_1 = usedPipes_1.next()) {
                            var pipe = usedPipes_1_1.value;
                            this._recordSyntheticImport(pipe, context);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (usedPipes_1_1 && !usedPipes_1_1.done && (_d = usedPipes_1.return)) _d.call(usedPipes_1);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                    // Check whether the directive/pipe arrays in ngComponentDef need to be wrapped in closures.
                    // This is required if any directive/pipe reference is to a declaration in the same file but
                    // declared after this component.
                    var wrapDirectivesAndPipesInClosure = usedDirectives.some(function (dir) { return util_1.isExpressionForwardReference(dir.expression, node.name, context); }) ||
                        usedPipes.some(function (pipe) { return util_1.isExpressionForwardReference(pipe, node.name, context); });
                    // Actual compilation still uses the full scope, not the narrowed scope determined by
                    // R3TargetBinder. This is a hedge against potential issues with the R3TargetBinder - right
                    // now the TemplateDefinitionBuilder is the "source of truth" for which directives/pipes are
                    // actually used (though the two should agree perfectly).
                    //
                    // TODO(alxhub): switch TemplateDefinitionBuilder over to using R3TargetBinder directly.
                    metadata.directives = directives;
                    metadata.pipes = pipes_1;
                    metadata.wrapDirectivesAndPipesInClosure = wrapDirectivesAndPipesInClosure;
                }
                else {
                    // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
                    // create a cycle. Instead, mark this component as requiring remote scoping, so that the
                    // NgModule file will take care of setting the directives for the component.
                    this.scopeRegistry.setComponentAsRequiringRemoteScoping(node);
                }
            }
            return {};
        };
        ComponentDecoratorHandler.prototype.compile = function (node, analysis, pool) {
            var res = compiler_1.compileComponentFromMetadata(analysis.meta, pool, compiler_1.makeBindingParser());
            var statements = res.statements;
            if (analysis.metadataStmt !== null) {
                statements.push(analysis.metadataStmt);
            }
            return {
                name: 'ngComponentDef',
                initializer: res.expression, statements: statements,
                type: res.type,
            };
        };
        ComponentDecoratorHandler.prototype._resolveLiteral = function (decorator) {
            if (this.literalCache.has(decorator)) {
                return this.literalCache.get(decorator);
            }
            if (decorator.args === null || decorator.args.length !== 1) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, decorator.node, "Incorrect number of arguments to @Component decorator");
            }
            var meta = util_1.unwrapExpression(decorator.args[0]);
            if (!ts.isObjectLiteralExpression(meta)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, "Decorator argument must be literal.");
            }
            this.literalCache.set(decorator, meta);
            return meta;
        };
        ComponentDecoratorHandler.prototype._resolveEnumValue = function (component, field, enumSymbolName) {
            var resolved = null;
            if (component.has(field)) {
                var expr = component.get(field);
                var value = this.evaluator.evaluate(expr);
                if (value instanceof partial_evaluator_1.EnumValue && util_1.isAngularCoreReference(value.enumRef, enumSymbolName)) {
                    resolved = value.resolved;
                }
                else {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, expr, field + " must be a member of " + enumSymbolName + " enum from @angular/core");
                }
            }
            return resolved;
        };
        ComponentDecoratorHandler.prototype._extractStyleUrls = function (component, extraUrls) {
            if (!component.has('styleUrls')) {
                return extraUrls.length > 0 ? extraUrls : null;
            }
            var styleUrlsExpr = component.get('styleUrls');
            var styleUrls = this.evaluator.evaluate(styleUrlsExpr);
            if (!Array.isArray(styleUrls) || !styleUrls.every(function (url) { return typeof url === 'string'; })) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, styleUrlsExpr, 'styleUrls must be an array of strings');
            }
            styleUrls.push.apply(styleUrls, tslib_1.__spread(extraUrls));
            return styleUrls;
        };
        ComponentDecoratorHandler.prototype._preloadAndParseTemplate = function (node, decorator, component, containingFile) {
            var _this = this;
            if (component.has('templateUrl')) {
                // Extract the templateUrl and preload it.
                var templateUrlExpr = component.get('templateUrl');
                var templateUrl = this.evaluator.evaluate(templateUrlExpr);
                if (typeof templateUrl !== 'string') {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, templateUrlExpr, 'templateUrl must be a string');
                }
                var resourceUrl_1 = this.resourceLoader.resolve(templateUrl, containingFile);
                var templatePromise = this.resourceLoader.preload(resourceUrl_1);
                // If the preload worked, then actually load and parse the template, and wait for any style
                // URLs to resolve.
                if (templatePromise !== undefined) {
                    return templatePromise.then(function () {
                        var templateStr = _this.resourceLoader.load(resourceUrl_1);
                        _this.resourceDependencies.recordResourceDependency(node.getSourceFile(), resourceUrl_1);
                        var template = _this._parseTemplate(component, templateStr, sourceMapUrl(resourceUrl_1), /* templateRange */ undefined, 
                        /* escapedString */ false);
                        _this.preanalyzeTemplateCache.set(node, template);
                        return template;
                    });
                }
                else {
                    return Promise.resolve(null);
                }
            }
            else {
                var inlineTemplate = this._extractInlineTemplate(component, containingFile);
                if (inlineTemplate === null) {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.COMPONENT_MISSING_TEMPLATE, decorator.node, 'component is missing a template');
                }
                var templateStr = inlineTemplate.templateStr, templateUrl = inlineTemplate.templateUrl, escapedString = inlineTemplate.escapedString, templateRange = inlineTemplate.templateRange;
                var template = this._parseTemplate(component, templateStr, templateUrl, templateRange, escapedString);
                this.preanalyzeTemplateCache.set(node, template);
                return Promise.resolve(template);
            }
        };
        ComponentDecoratorHandler.prototype._extractInlineTemplate = function (component, containingFile) {
            // If there is no inline template, then return null.
            if (!component.has('template')) {
                return null;
            }
            var templateExpr = component.get('template');
            var templateStr;
            var templateUrl = '';
            var templateRange = undefined;
            var escapedString = false;
            // We only support SourceMaps for inline templates that are simple string literals.
            if (ts.isStringLiteral(templateExpr) || ts.isNoSubstitutionTemplateLiteral(templateExpr)) {
                // the start and end of the `templateExpr` node includes the quotation marks, which we
                // must
                // strip
                templateRange = getTemplateRange(templateExpr);
                templateStr = templateExpr.getSourceFile().text;
                templateUrl = containingFile;
                escapedString = true;
            }
            else {
                var resolvedTemplate = this.evaluator.evaluate(templateExpr);
                if (typeof resolvedTemplate !== 'string') {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, templateExpr, 'template must be a string');
                }
                templateStr = resolvedTemplate;
            }
            return { templateStr: templateStr, templateUrl: templateUrl, templateRange: templateRange, escapedString: escapedString };
        };
        ComponentDecoratorHandler.prototype._parseTemplate = function (component, templateStr, templateUrl, templateRange, escapedString, options) {
            if (options === void 0) { options = {}; }
            var preserveWhitespaces = this.defaultPreserveWhitespaces;
            if (component.has('preserveWhitespaces')) {
                var expr = component.get('preserveWhitespaces');
                var value = this.evaluator.evaluate(expr);
                if (typeof value !== 'boolean') {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, expr, 'preserveWhitespaces must be a boolean');
                }
                preserveWhitespaces = value;
            }
            var interpolation = compiler_1.DEFAULT_INTERPOLATION_CONFIG;
            if (component.has('interpolation')) {
                var expr = component.get('interpolation');
                var value = this.evaluator.evaluate(expr);
                if (!Array.isArray(value) || value.length !== 2 ||
                    !value.every(function (element) { return typeof element === 'string'; })) {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, expr, 'interpolation must be an array with 2 elements of string type');
                }
                interpolation = compiler_1.InterpolationConfig.fromArray(value);
            }
            return tslib_1.__assign({ interpolation: interpolation }, compiler_1.parseTemplate(templateStr, templateUrl, tslib_1.__assign({ preserveWhitespaces: preserveWhitespaces, interpolationConfig: interpolation, range: templateRange, escapedString: escapedString }, options)), { isInline: component.has('template'), file: new compiler_1.ParseSourceFile(templateStr, templateUrl) });
        };
        ComponentDecoratorHandler.prototype._expressionToImportedFile = function (expr, origin) {
            if (!(expr instanceof compiler_1.ExternalExpr)) {
                return null;
            }
            // Figure out what file is being imported.
            return this.moduleResolver.resolveModuleName(expr.value.moduleName, origin);
        };
        ComponentDecoratorHandler.prototype._isCyclicImport = function (expr, origin) {
            var imported = this._expressionToImportedFile(expr, origin);
            if (imported === null) {
                return false;
            }
            // Check whether the import is legal.
            return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
        };
        ComponentDecoratorHandler.prototype._recordSyntheticImport = function (expr, origin) {
            var imported = this._expressionToImportedFile(expr, origin);
            if (imported === null) {
                return;
            }
            this.cycleAnalyzer.recordSyntheticImport(origin, imported);
        };
        return ComponentDecoratorHandler;
    }());
    exports.ComponentDecoratorHandler = ComponentDecoratorHandler;
    function getTemplateRange(templateExpr) {
        var startPos = templateExpr.getStart() + 1;
        var _a = ts.getLineAndCharacterOfPosition(templateExpr.getSourceFile(), startPos), line = _a.line, character = _a.character;
        return {
            startPos: startPos,
            startLine: line,
            startCol: character,
            endPos: templateExpr.getEnd() - 1,
        };
    }
    function sourceMapUrl(resourceUrl) {
        if (!ts_source_map_bug_29300_1.tsSourceMapBug29300Fixed()) {
            // By removing the template URL we are telling the translator not to try to
            // map the external source file to the generated code, since the version
            // of TS that is running does not support it.
            return '';
        }
        else {
            return resourceUrl;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9hbm5vdGF0aW9ucy9zcmMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFpWTtJQUNqWSwrQkFBaUM7SUFHakMsMkVBQWtFO0lBQ2xFLDJFQUF5RDtJQUN6RCxtRUFBaUc7SUFFakcscUVBQXVHO0lBQ3ZHLHdGQUFpRjtJQUNqRix1RkFBb0U7SUFDcEUseUVBQW1HO0lBRW5HLHVFQUFnSTtJQUVoSSxnR0FBNEc7SUFDNUcsNEdBQWdGO0lBR2hGLHVGQUEyRTtJQUMzRSxxRkFBd0Q7SUFDeEQsNkVBQW1JO0lBRW5JLElBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO0lBQ2hELElBQU0sV0FBVyxHQUFVLEVBQUUsQ0FBQztJQVM5Qjs7T0FFRztJQUNIO1FBRUUsbUNBQ1ksU0FBeUIsRUFBVSxTQUEyQixFQUM5RCxZQUE4QixFQUFVLFVBQTBCLEVBQ2xFLGFBQXVDLEVBQVUsTUFBZSxFQUNoRSxjQUE4QixFQUFVLFFBQWtCLEVBQzFELDBCQUFtQyxFQUFVLGtCQUEyQixFQUN4RSxjQUE4QixFQUFVLGFBQTRCLEVBQ3BFLFVBQTRCLEVBQVUscUJBQTRDLEVBQ2xGLG9CQUM2RDtZQUQ3RCxxQ0FBQSxFQUFBLDJCQUM2QixrREFBOEIsRUFBRTtZQVI3RCxjQUFTLEdBQVQsU0FBUyxDQUFnQjtZQUFVLGNBQVMsR0FBVCxTQUFTLENBQWtCO1lBQzlELGlCQUFZLEdBQVosWUFBWSxDQUFrQjtZQUFVLGVBQVUsR0FBVixVQUFVLENBQWdCO1lBQ2xFLGtCQUFhLEdBQWIsYUFBYSxDQUEwQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVM7WUFDaEUsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQVUsYUFB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QU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxxQ0FBcUM7WUFDckMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRU8sMERBQXNCLEdBQTlCLFVBQStCLElBQWdCLEVBQUUsTUFBcUI7WUFDcEUsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RCxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JCLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFDSCxnQ0FBQztJQUFELENBQUMsQUFub0JELElBbW9CQztJQW5vQlksOERBQXlCO0lBcW9CdEMsU0FBUyxnQkFBZ0IsQ0FBQyxZQUEyQjtRQUNuRCxJQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUEsNkVBQ3NFLEVBRHJFLGNBQUksRUFBRSx3QkFDK0QsQ0FBQztRQUM3RSxPQUFPO1lBQ0wsUUFBUSxVQUFBO1lBQ1IsU0FBUyxFQUFFLElBQUk7WUFDZixRQUFRLEVBQUUsU0FBUztZQUNuQixNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7U0FDbEMsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTLFlBQVksQ0FBQyxXQUFtQjtRQUN2QyxJQUFJLENBQUMsa0RBQXdCLEVBQUUsRUFBRTtZQUMvQiwyRUFBMkU7WUFDM0Usd0VBQXdFO1lBQ3hFLDZDQUE2QztZQUM3QyxPQUFPLEVBQUUsQ0FBQztTQUNYO2FBQU07WUFDTCxPQUFPLFdBQVcsQ0FBQztTQUNwQjtJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sLCBDc3NTZWxlY3RvciwgREVGQVVMVF9JTlRFUlBPTEFUSU9OX0NPTkZJRywgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LCBFeHByZXNzaW9uLCBFeHRlcm5hbEV4cHIsIEludGVycG9sYXRpb25Db25maWcsIExleGVyUmFuZ2UsIFBhcnNlRXJyb3IsIFBhcnNlU291cmNlRmlsZSwgUGFyc2VUZW1wbGF0ZU9wdGlvbnMsIFIzQ29tcG9uZW50TWV0YWRhdGEsIFIzVGFyZ2V0QmluZGVyLCBTZWxlY3Rvck1hdGNoZXIsIFN0YXRlbWVudCwgVG1wbEFzdE5vZGUsIFdyYXBwZWROb2RlRXhwciwgY29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YSwgbWFrZUJpbmRpbmdQYXJzZXIsIHBhcnNlVGVtcGxhdGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0N5Y2xlQW5hbHl6ZXJ9IGZyb20gJy4uLy4uL2N5Y2xlcyc7XG5pbXBvcnQge0Vycm9yQ29kZSwgRmF0YWxEaWFnbm9zdGljRXJyb3J9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7YWJzb2x1dGVGcm9tLCByZWxhdGl2ZX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtEZWZhdWx0SW1wb3J0UmVjb3JkZXIsIE1vZHVsZVJlc29sdmVyLCBSZWZlcmVuY2UsIFJlZmVyZW5jZUVtaXR0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtJbmRleGluZ0NvbnRleHR9IGZyb20gJy4uLy4uL2luZGV4ZXInO1xuaW1wb3J0IHtEaXJlY3RpdmVNZXRhLCBNZXRhZGF0YVJlYWRlciwgTWV0YWRhdGFSZWdpc3RyeSwgZXh0cmFjdERpcmVjdGl2ZUd1YXJkc30gZnJvbSAnLi4vLi4vbWV0YWRhdGEnO1xuaW1wb3J0IHtmbGF0dGVuSW5oZXJpdGVkRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20gJy4uLy4uL21ldGFkYXRhL3NyYy9pbmhlcml0YW5jZSc7XG5pbXBvcnQge0VudW1WYWx1ZSwgUGFydGlhbEV2YWx1YXRvcn0gZnJvbSAnLi4vLi4vcGFydGlhbF9ldmFsdWF0b3InO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0LCByZWZsZWN0T2JqZWN0TGl0ZXJhbH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0xvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeX0gZnJvbSAnLi4vLi4vc2NvcGUnO1xuaW1wb3J0IHtBbmFseXNpc091dHB1dCwgQ29tcGlsZVJlc3VsdCwgRGVjb3JhdG9ySGFuZGxlciwgRGV0ZWN0UmVzdWx0LCBIYW5kbGVyUHJlY2VkZW5jZSwgUmVzb2x2ZVJlc3VsdH0gZnJvbSAnLi4vLi4vdHJhbnNmb3JtJztcbmltcG9ydCB7VHlwZUNoZWNrQ29udGV4dH0gZnJvbSAnLi4vLi4vdHlwZWNoZWNrJztcbmltcG9ydCB7Tm9vcFJlc291cmNlRGVwZW5kZW5jeVJlY29yZGVyLCBSZXNvdXJjZURlcGVuZGVuY3lSZWNvcmRlcn0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvcmVzb3VyY2VfcmVjb3JkZXInO1xuaW1wb3J0IHt0c1NvdXJjZU1hcEJ1ZzI5MzAwRml4ZWR9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3RzX3NvdXJjZV9tYXBfYnVnXzI5MzAwJztcblxuaW1wb3J0IHtSZXNvdXJjZUxvYWRlcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtleHRyYWN0RGlyZWN0aXZlTWV0YWRhdGEsIHBhcnNlRmllbGRBcnJheVZhbHVlfSBmcm9tICcuL2RpcmVjdGl2ZSc7XG5pbXBvcnQge2dlbmVyYXRlU2V0Q2xhc3NNZXRhZGF0YUNhbGx9IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtmaW5kQW5ndWxhckRlY29yYXRvciwgaXNBbmd1bGFyQ29yZVJlZmVyZW5jZSwgaXNFeHByZXNzaW9uRm9yd2FyZFJlZmVyZW5jZSwgcmVhZEJhc2VDbGFzcywgdW53cmFwRXhwcmVzc2lvbn0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgRU1QVFlfTUFQID0gbmV3IE1hcDxzdHJpbmcsIEV4cHJlc3Npb24+KCk7XG5jb25zdCBFTVBUWV9BUlJBWTogYW55W10gPSBbXTtcblxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRIYW5kbGVyRGF0YSB7XG4gIG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGE7XG4gIHBhcnNlZFRlbXBsYXRlOiBUbXBsQXN0Tm9kZVtdO1xuICBtZXRhZGF0YVN0bXQ6IFN0YXRlbWVudHxudWxsO1xuICBwYXJzZVRlbXBsYXRlOiAob3B0aW9ucz86IFBhcnNlVGVtcGxhdGVPcHRpb25zKSA9PiBQYXJzZWRUZW1wbGF0ZTtcbn1cblxuLyoqXG4gKiBgRGVjb3JhdG9ySGFuZGxlcmAgd2hpY2ggaGFuZGxlcyB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnREZWNvcmF0b3JIYW5kbGVyIGltcGxlbWVudHNcbiAgICBEZWNvcmF0b3JIYW5kbGVyPENvbXBvbmVudEhhbmRsZXJEYXRhLCBEZWNvcmF0b3I+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yLFxuICAgICAgcHJpdmF0ZSBtZXRhUmVnaXN0cnk6IE1ldGFkYXRhUmVnaXN0cnksIHByaXZhdGUgbWV0YVJlYWRlcjogTWV0YWRhdGFSZWFkZXIsXG4gICAgICBwcml2YXRlIHNjb3BlUmVnaXN0cnk6IExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeSwgcHJpdmF0ZSBpc0NvcmU6IGJvb2xlYW4sXG4gICAgICBwcml2YXRlIHJlc291cmNlTG9hZGVyOiBSZXNvdXJjZUxvYWRlciwgcHJpdmF0ZSByb290RGlyczogc3RyaW5nW10sXG4gICAgICBwcml2YXRlIGRlZmF1bHRQcmVzZXJ2ZVdoaXRlc3BhY2VzOiBib29sZWFuLCBwcml2YXRlIGkxOG5Vc2VFeHRlcm5hbElkczogYm9vbGVhbixcbiAgICAgIHByaXZhdGUgbW9kdWxlUmVzb2x2ZXI6IE1vZHVsZVJlc29sdmVyLCBwcml2YXRlIGN5Y2xlQW5hbHl6ZXI6IEN5Y2xlQW5hbHl6ZXIsXG4gICAgICBwcml2YXRlIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHByaXZhdGUgZGVmYXVsdEltcG9ydFJlY29yZGVyOiBEZWZhdWx0SW1wb3J0UmVjb3JkZXIsXG4gICAgICBwcml2YXRlIHJlc291cmNlRGVwZW5kZW5jaWVzOlxuICAgICAgICAgIFJlc291cmNlRGVwZW5kZW5jeVJlY29yZGVyID0gbmV3IE5vb3BSZXNvdXJjZURlcGVuZGVuY3lSZWNvcmRlcigpKSB7fVxuXG4gIHByaXZhdGUgbGl0ZXJhbENhY2hlID0gbmV3IE1hcDxEZWNvcmF0b3IsIHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uPigpO1xuICBwcml2YXRlIGVsZW1lbnRTY2hlbWFSZWdpc3RyeSA9IG5ldyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkoKTtcblxuICAvKipcbiAgICogRHVyaW5nIHRoZSBhc3luY2hyb25vdXMgcHJlYW5hbHl6ZSBwaGFzZSwgaXQncyBuZWNlc3NhcnkgdG8gcGFyc2UgdGhlIHRlbXBsYXRlIHRvIGV4dHJhY3RcbiAgICogYW55IHBvdGVudGlhbCA8bGluaz4gdGFncyB3aGljaCBtaWdodCBuZWVkIHRvIGJlIGxvYWRlZC4gVGhpcyBjYWNoZSBlbnN1cmVzIHRoYXQgd29yayBpcyBub3RcbiAgICogdGhyb3duIGF3YXksIGFuZCB0aGUgcGFyc2VkIHRlbXBsYXRlIGlzIHJldXNlZCBkdXJpbmcgdGhlIGFuYWx5emUgcGhhc2UuXG4gICAqL1xuICBwcml2YXRlIHByZWFuYWx5emVUZW1wbGF0ZUNhY2hlID0gbmV3IE1hcDx0cy5EZWNsYXJhdGlvbiwgUGFyc2VkVGVtcGxhdGU+KCk7XG5cbiAgcmVhZG9ubHkgcHJlY2VkZW5jZSA9IEhhbmRsZXJQcmVjZWRlbmNlLlBSSU1BUlk7XG5cbiAgZGV0ZWN0KG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IERlY29yYXRvcltdfG51bGwpOiBEZXRlY3RSZXN1bHQ8RGVjb3JhdG9yPnx1bmRlZmluZWQge1xuICAgIGlmICghZGVjb3JhdG9ycykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgZGVjb3JhdG9yID0gZmluZEFuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9ycywgJ0NvbXBvbmVudCcsIHRoaXMuaXNDb3JlKTtcbiAgICBpZiAoZGVjb3JhdG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRyaWdnZXI6IGRlY29yYXRvci5ub2RlLFxuICAgICAgICBtZXRhZGF0YTogZGVjb3JhdG9yLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBwcmVhbmFseXplKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcjogRGVjb3JhdG9yKTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQge1xuICAgIC8vIEluIHByZWFuYWx5emUsIHJlc291cmNlIFVSTHMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjb21wb25lbnQgYXJlIGFzeW5jaHJvbm91c2x5IHByZWxvYWRlZCB2aWFcbiAgICAvLyB0aGUgcmVzb3VyY2VMb2FkZXIuIFRoaXMgaXMgdGhlIG9ubHkgdGltZSBhc3luYyBvcGVyYXRpb25zIGFyZSBhbGxvd2VkIGZvciBhIGNvbXBvbmVudC5cbiAgICAvLyBUaGVzZSByZXNvdXJjZXMgYXJlOlxuICAgIC8vXG4gICAgLy8gLSB0aGUgdGVtcGxhdGVVcmwsIGlmIHRoZXJlIGlzIG9uZVxuICAgIC8vIC0gYW55IHN0eWxlVXJscyBpZiBwcmVzZW50XG4gICAgLy8gLSBhbnkgc3R5bGVzaGVldHMgcmVmZXJlbmNlZCBmcm9tIDxsaW5rPiB0YWdzIGluIHRoZSB0ZW1wbGF0ZSBpdHNlbGZcbiAgICAvL1xuICAgIC8vIEFzIGEgcmVzdWx0IG9mIHRoZSBsYXN0IG9uZSwgdGhlIHRlbXBsYXRlIG11c3QgYmUgcGFyc2VkIGFzIHBhcnQgb2YgcHJlYW5hbHlzaXMgdG8gZXh0cmFjdFxuICAgIC8vIDxsaW5rPiB0YWdzLCB3aGljaCBtYXkgaW52b2x2ZSB3YWl0aW5nIGZvciB0aGUgdGVtcGxhdGVVcmwgdG8gYmUgcmVzb2x2ZWQgZmlyc3QuXG5cbiAgICAvLyBJZiBwcmVsb2FkaW5nIGlzbid0IHBvc3NpYmxlLCB0aGVuIHNraXAgdGhpcyBzdGVwLlxuICAgIGlmICghdGhpcy5yZXNvdXJjZUxvYWRlci5jYW5QcmVsb2FkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGEgPSB0aGlzLl9yZXNvbHZlTGl0ZXJhbChkZWNvcmF0b3IpO1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHJlZmxlY3RPYmplY3RMaXRlcmFsKG1ldGEpO1xuICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG5cbiAgICAvLyBDb252ZXJ0IGEgc3R5bGVVcmwgc3RyaW5nIGludG8gYSBQcm9taXNlIHRvIHByZWxvYWQgaXQuXG4gICAgY29uc3QgcmVzb2x2ZVN0eWxlVXJsID0gKHN0eWxlVXJsOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHN0eWxlVXJsLCBjb250YWluaW5nRmlsZSk7XG4gICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5yZXNvdXJjZUxvYWRlci5wcmVsb2FkKHJlc291cmNlVXJsKTtcbiAgICAgIHJldHVybiBwcm9taXNlIHx8IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG5cbiAgICAvLyBBIFByb21pc2UgdGhhdCB3YWl0cyBmb3IgdGhlIHRlbXBsYXRlIGFuZCBhbGwgPGxpbms+ZWQgc3R5bGVzIHdpdGhpbiBpdCB0byBiZSBwcmVsb2FkZWQuXG4gICAgY29uc3QgdGVtcGxhdGVBbmRUZW1wbGF0ZVN0eWxlUmVzb3VyY2VzID1cbiAgICAgICAgdGhpcy5fcHJlbG9hZEFuZFBhcnNlVGVtcGxhdGUobm9kZSwgZGVjb3JhdG9yLCBjb21wb25lbnQsIGNvbnRhaW5pbmdGaWxlKS50aGVuKHRlbXBsYXRlID0+IHtcbiAgICAgICAgICBpZiAodGVtcGxhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbCh0ZW1wbGF0ZS5zdHlsZVVybHMubWFwKHJlc29sdmVTdHlsZVVybCkpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgLy8gRXh0cmFjdCBhbGwgdGhlIHN0eWxlVXJscyBpbiB0aGUgZGVjb3JhdG9yLlxuICAgIGNvbnN0IHN0eWxlVXJscyA9IHRoaXMuX2V4dHJhY3RTdHlsZVVybHMoY29tcG9uZW50LCBbXSk7XG5cbiAgICBpZiAoc3R5bGVVcmxzID09PSBudWxsKSB7XG4gICAgICAvLyBBIGZhc3QgcGF0aCBleGlzdHMgaWYgdGhlcmUgYXJlIG5vIHN0eWxlVXJscywgdG8ganVzdCB3YWl0IGZvclxuICAgICAgLy8gdGVtcGxhdGVBbmRUZW1wbGF0ZVN0eWxlUmVzb3VyY2VzLlxuICAgICAgcmV0dXJuIHRlbXBsYXRlQW5kVGVtcGxhdGVTdHlsZVJlc291cmNlcztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2FpdCBmb3IgYm90aCB0aGUgdGVtcGxhdGUgYW5kIGFsbCBzdHlsZVVybCByZXNvdXJjZXMgdG8gcmVzb2x2ZS5cbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChbdGVtcGxhdGVBbmRUZW1wbGF0ZVN0eWxlUmVzb3VyY2VzLCAuLi5zdHlsZVVybHMubWFwKHJlc29sdmVTdHlsZVVybCldKVxuICAgICAgICAgIC50aGVuKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgYW5hbHl6ZShub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IERlY29yYXRvcik6IEFuYWx5c2lzT3V0cHV0PENvbXBvbmVudEhhbmRsZXJEYXRhPiB7XG4gICAgY29uc3QgY29udGFpbmluZ0ZpbGUgPSBub2RlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZTtcbiAgICB0aGlzLmxpdGVyYWxDYWNoZS5kZWxldGUoZGVjb3JhdG9yKTtcblxuICAgIC8vIEBDb21wb25lbnQgaW5oZXJpdHMgQERpcmVjdGl2ZSwgc28gYmVnaW4gYnkgZXh0cmFjdGluZyB0aGUgQERpcmVjdGl2ZSBtZXRhZGF0YSBhbmQgYnVpbGRpbmdcbiAgICAvLyBvbiBpdC5cbiAgICBjb25zdCBkaXJlY3RpdmVSZXN1bHQgPSBleHRyYWN0RGlyZWN0aXZlTWV0YWRhdGEoXG4gICAgICAgIG5vZGUsIGRlY29yYXRvciwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZXZhbHVhdG9yLCB0aGlzLmRlZmF1bHRJbXBvcnRSZWNvcmRlciwgdGhpcy5pc0NvcmUsXG4gICAgICAgIHRoaXMuZWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmdldERlZmF1bHRDb21wb25lbnRFbGVtZW50TmFtZSgpKTtcbiAgICBpZiAoZGlyZWN0aXZlUmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGBleHRyYWN0RGlyZWN0aXZlTWV0YWRhdGFgIHJldHVybnMgdW5kZWZpbmVkIHdoZW4gdGhlIEBEaXJlY3RpdmUgaGFzIGBqaXQ6IHRydWVgLiBJbiB0aGlzXG4gICAgICAvLyBjYXNlLCBjb21waWxhdGlvbiBvZiB0aGUgZGVjb3JhdG9yIGlzIHNraXBwZWQuIFJldHVybmluZyBhbiBlbXB0eSBvYmplY3Qgc2lnbmlmaWVzXG4gICAgICAvLyB0aGF0IG5vIGFuYWx5c2lzIHdhcyBwcm9kdWNlZC5cbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvLyBOZXh0LCByZWFkIHRoZSBgQENvbXBvbmVudGAtc3BlY2lmaWMgZmllbGRzLlxuICAgIGNvbnN0IHtkZWNvcmF0b3I6IGNvbXBvbmVudCwgbWV0YWRhdGF9ID0gZGlyZWN0aXZlUmVzdWx0O1xuXG4gICAgLy8gR28gdGhyb3VnaCB0aGUgcm9vdCBkaXJlY3RvcmllcyBmb3IgdGhpcyBwcm9qZWN0LCBhbmQgc2VsZWN0IHRoZSBvbmUgd2l0aCB0aGUgc21hbGxlc3RcbiAgICAvLyByZWxhdGl2ZSBwYXRoIHJlcHJlc2VudGF0aW9uLlxuICAgIGNvbnN0IHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoID0gdGhpcy5yb290RGlycy5yZWR1Y2U8c3RyaW5nfHVuZGVmaW5lZD4oKHByZXZpb3VzLCByb290RGlyKSA9PiB7XG4gICAgICBjb25zdCBjYW5kaWRhdGUgPSByZWxhdGl2ZShhYnNvbHV0ZUZyb20ocm9vdERpciksIGFic29sdXRlRnJvbShjb250YWluaW5nRmlsZSkpO1xuICAgICAgaWYgKHByZXZpb3VzID09PSB1bmRlZmluZWQgfHwgY2FuZGlkYXRlLmxlbmd0aCA8IHByZXZpb3VzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzO1xuICAgICAgfVxuICAgIH0sIHVuZGVmaW5lZCkgITtcblxuICAgIGNvbnN0IHZpZXdQcm92aWRlcnM6IEV4cHJlc3Npb258bnVsbCA9IGNvbXBvbmVudC5oYXMoJ3ZpZXdQcm92aWRlcnMnKSA/XG4gICAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIoY29tcG9uZW50LmdldCgndmlld1Byb3ZpZGVycycpICEpIDpcbiAgICAgICAgbnVsbDtcblxuICAgIC8vIFBhcnNlIHRoZSB0ZW1wbGF0ZS5cbiAgICAvLyBJZiBhIHByZWFuYWx5emUgcGhhc2Ugd2FzIGV4ZWN1dGVkLCB0aGUgdGVtcGxhdGUgbWF5IGFscmVhZHkgZXhpc3QgaW4gcGFyc2VkIGZvcm0sIHNvIGNoZWNrXG4gICAgLy8gdGhlIHByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLlxuICAgIC8vIEV4dHJhY3QgYSBjbG9zdXJlIG9mIHRoZSB0ZW1wbGF0ZSBwYXJzaW5nIGNvZGUgc28gdGhhdCBpdCBjYW4gYmUgcmVwYXJzZWQgd2l0aCBkaWZmZXJlbnRcbiAgICAvLyBvcHRpb25zIGlmIG5lZWRlZCwgbGlrZSBpbiB0aGUgaW5kZXhpbmcgcGlwZWxpbmUuXG4gICAgbGV0IHBhcnNlVGVtcGxhdGU6IChvcHRpb25zPzogUGFyc2VUZW1wbGF0ZU9wdGlvbnMpID0+IFBhcnNlZFRlbXBsYXRlO1xuICAgIGlmICh0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLmhhcyhub2RlKSkge1xuICAgICAgLy8gVGhlIHRlbXBsYXRlIHdhcyBwYXJzZWQgaW4gcHJlYW5hbHl6ZS4gVXNlIGl0IGFuZCBkZWxldGUgaXQgdG8gc2F2ZSBtZW1vcnkuXG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMucHJlYW5hbHl6ZVRlbXBsYXRlQ2FjaGUuZ2V0KG5vZGUpICE7XG4gICAgICB0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLmRlbGV0ZShub2RlKTtcblxuICAgICAgLy8gQSBwcmUtYW5hbHl6ZWQgdGVtcGxhdGUgY2Fubm90IGJlIHJlcGFyc2VkLiBQcmUtYW5hbHlzaXMgaXMgbmV2ZXIgcnVuIHdpdGggdGhlIGluZGV4aW5nXG4gICAgICAvLyBwaXBlbGluZS5cbiAgICAgIHBhcnNlVGVtcGxhdGUgPSAob3B0aW9ucz86IFBhcnNlVGVtcGxhdGVPcHRpb25zKSA9PiB7XG4gICAgICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXBhcnNlIGEgcHJlLWFuYWx5emVkIHRlbXBsYXRlIHdpdGggbmV3IG9wdGlvbnNgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgdGVtcGxhdGUgd2FzIG5vdCBhbHJlYWR5IHBhcnNlZC4gRWl0aGVyIHRoZXJlJ3MgYSB0ZW1wbGF0ZVVybCwgb3IgYW4gaW5saW5lIHRlbXBsYXRlLlxuICAgICAgaWYgKGNvbXBvbmVudC5oYXMoJ3RlbXBsYXRlVXJsJykpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVVcmxFeHByID0gY29tcG9uZW50LmdldCgndGVtcGxhdGVVcmwnKSAhO1xuICAgICAgICBjb25zdCBldmFsVGVtcGxhdGVVcmwgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZSh0ZW1wbGF0ZVVybEV4cHIpO1xuICAgICAgICBpZiAodHlwZW9mIGV2YWxUZW1wbGF0ZVVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgICAgIEVycm9yQ29kZS5WQUxVRV9IQVNfV1JPTkdfVFlQRSwgdGVtcGxhdGVVcmxFeHByLCAndGVtcGxhdGVVcmwgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKGV2YWxUZW1wbGF0ZVVybCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZVN0ciA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZCh0ZW1wbGF0ZVVybCk7XG4gICAgICAgIHRoaXMucmVzb3VyY2VEZXBlbmRlbmNpZXMucmVjb3JkUmVzb3VyY2VEZXBlbmRlbmN5KG5vZGUuZ2V0U291cmNlRmlsZSgpLCB0ZW1wbGF0ZVVybCk7XG5cbiAgICAgICAgcGFyc2VUZW1wbGF0ZSA9IChvcHRpb25zPzogUGFyc2VUZW1wbGF0ZU9wdGlvbnMpID0+IHRoaXMuX3BhcnNlVGVtcGxhdGUoXG4gICAgICAgICAgICBjb21wb25lbnQsIHRlbXBsYXRlU3RyLCBzb3VyY2VNYXBVcmwodGVtcGxhdGVVcmwpLCAvKiB0ZW1wbGF0ZVJhbmdlICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIGVzY2FwZWRTdHJpbmcgKi8gZmFsc2UsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRXhwZWN0IGFuIGlubGluZSB0ZW1wbGF0ZSB0byBiZSBwcmVzZW50LlxuICAgICAgICBjb25zdCBpbmxpbmVUZW1wbGF0ZSA9IHRoaXMuX2V4dHJhY3RJbmxpbmVUZW1wbGF0ZShjb21wb25lbnQsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICAgICAgaWYgKGlubGluZVRlbXBsYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgICAgICBFcnJvckNvZGUuQ09NUE9ORU5UX01JU1NJTkdfVEVNUExBVEUsIGRlY29yYXRvci5ub2RlLFxuICAgICAgICAgICAgICAnY29tcG9uZW50IGlzIG1pc3NpbmcgYSB0ZW1wbGF0ZScpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHt0ZW1wbGF0ZVN0ciwgdGVtcGxhdGVVcmwsIHRlbXBsYXRlUmFuZ2UsIGVzY2FwZWRTdHJpbmd9ID0gaW5saW5lVGVtcGxhdGU7XG4gICAgICAgIHBhcnNlVGVtcGxhdGUgPSAob3B0aW9ucz86IFBhcnNlVGVtcGxhdGVPcHRpb25zKSA9PiB0aGlzLl9wYXJzZVRlbXBsYXRlKFxuICAgICAgICAgICAgY29tcG9uZW50LCB0ZW1wbGF0ZVN0ciwgdGVtcGxhdGVVcmwsIHRlbXBsYXRlUmFuZ2UsIGVzY2FwZWRTdHJpbmcsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHBhcnNlVGVtcGxhdGUoKTtcblxuICAgIGlmICh0ZW1wbGF0ZS5lcnJvcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvcnMgcGFyc2luZyB0ZW1wbGF0ZTogJHt0ZW1wbGF0ZS5lcnJvcnMubWFwKGUgPT4gZS50b1N0cmluZygpKS5qb2luKCcsICcpfWApO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBjb21wb25lbnQgaGFzIGEgc2VsZWN0b3IsIGl0IHNob3VsZCBiZSByZWdpc3RlcmVkIHdpdGggdGhlXG4gICAgLy8gYExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeWBcbiAgICAvLyBzbyB0aGF0IHdoZW4gdGhpcyBjb21wb25lbnQgYXBwZWFycyBpbiBhbiBgQE5nTW9kdWxlYCBzY29wZSwgaXRzIHNlbGVjdG9yIGNhbiBiZVxuICAgIC8vIGRldGVybWluZWQuXG4gICAgaWYgKG1ldGFkYXRhLnNlbGVjdG9yICE9PSBudWxsKSB7XG4gICAgICBjb25zdCByZWYgPSBuZXcgUmVmZXJlbmNlKG5vZGUpO1xuICAgICAgdGhpcy5tZXRhUmVnaXN0cnkucmVnaXN0ZXJEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICAgIHJlZixcbiAgICAgICAgbmFtZTogbm9kZS5uYW1lLnRleHQsXG4gICAgICAgIHNlbGVjdG9yOiBtZXRhZGF0YS5zZWxlY3RvcixcbiAgICAgICAgZXhwb3J0QXM6IG1ldGFkYXRhLmV4cG9ydEFzLFxuICAgICAgICBpbnB1dHM6IG1ldGFkYXRhLmlucHV0cyxcbiAgICAgICAgb3V0cHV0czogbWV0YWRhdGEub3V0cHV0cyxcbiAgICAgICAgcXVlcmllczogbWV0YWRhdGEucXVlcmllcy5tYXAocXVlcnkgPT4gcXVlcnkucHJvcGVydHlOYW1lKSxcbiAgICAgICAgaXNDb21wb25lbnQ6IHRydWUsIC4uLmV4dHJhY3REaXJlY3RpdmVHdWFyZHMobm9kZSwgdGhpcy5yZWZsZWN0b3IpLFxuICAgICAgICBiYXNlQ2xhc3M6IHJlYWRCYXNlQ2xhc3Mobm9kZSwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZXZhbHVhdG9yKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEZpZ3VyZSBvdXQgdGhlIHNldCBvZiBzdHlsZXMuIFRoZSBvcmRlcmluZyBoZXJlIGlzIGltcG9ydGFudDogZXh0ZXJuYWwgcmVzb3VyY2VzIChzdHlsZVVybHMpXG4gICAgLy8gcHJlY2VkZSBpbmxpbmUgc3R5bGVzLCBhbmQgc3R5bGVzIGRlZmluZWQgaW4gdGhlIHRlbXBsYXRlIG92ZXJyaWRlIHN0eWxlcyBkZWZpbmVkIGluIHRoZVxuICAgIC8vIGNvbXBvbmVudC5cbiAgICBsZXQgc3R5bGVzOiBzdHJpbmdbXXxudWxsID0gbnVsbDtcblxuICAgIGNvbnN0IHN0eWxlVXJscyA9IHRoaXMuX2V4dHJhY3RTdHlsZVVybHMoY29tcG9uZW50LCB0ZW1wbGF0ZS5zdHlsZVVybHMpO1xuICAgIGlmIChzdHlsZVVybHMgIT09IG51bGwpIHtcbiAgICAgIGlmIChzdHlsZXMgPT09IG51bGwpIHtcbiAgICAgICAgc3R5bGVzID0gW107XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHN0eWxlVXJsIG9mIHN0eWxlVXJscykge1xuICAgICAgICBjb25zdCByZXNvdXJjZVVybCA9IHRoaXMucmVzb3VyY2VMb2FkZXIucmVzb2x2ZShzdHlsZVVybCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICBjb25zdCByZXNvdXJjZVN0ciA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZChyZXNvdXJjZVVybCk7XG4gICAgICAgIHN0eWxlcy5wdXNoKHJlc291cmNlU3RyKTtcbiAgICAgICAgdGhpcy5yZXNvdXJjZURlcGVuZGVuY2llcy5yZWNvcmRSZXNvdXJjZURlcGVuZGVuY3kobm9kZS5nZXRTb3VyY2VGaWxlKCksIHJlc291cmNlVXJsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3N0eWxlcycpKSB7XG4gICAgICBjb25zdCBsaXRTdHlsZXMgPSBwYXJzZUZpZWxkQXJyYXlWYWx1ZShjb21wb25lbnQsICdzdHlsZXMnLCB0aGlzLmV2YWx1YXRvcik7XG4gICAgICBpZiAobGl0U3R5bGVzICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChzdHlsZXMgPT09IG51bGwpIHtcbiAgICAgICAgICBzdHlsZXMgPSBsaXRTdHlsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGVzLnB1c2goLi4ubGl0U3R5bGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGVtcGxhdGUuc3R5bGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChzdHlsZXMgPT09IG51bGwpIHtcbiAgICAgICAgc3R5bGVzID0gdGVtcGxhdGUuc3R5bGVzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGVzLnB1c2goLi4udGVtcGxhdGUuc3R5bGVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBlbmNhcHN1bGF0aW9uOiBudW1iZXIgPVxuICAgICAgICB0aGlzLl9yZXNvbHZlRW51bVZhbHVlKGNvbXBvbmVudCwgJ2VuY2Fwc3VsYXRpb24nLCAnVmlld0VuY2Fwc3VsYXRpb24nKSB8fCAwO1xuXG4gICAgY29uc3QgY2hhbmdlRGV0ZWN0aW9uOiBudW1iZXJ8bnVsbCA9XG4gICAgICAgIHRoaXMuX3Jlc29sdmVFbnVtVmFsdWUoY29tcG9uZW50LCAnY2hhbmdlRGV0ZWN0aW9uJywgJ0NoYW5nZURldGVjdGlvblN0cmF0ZWd5Jyk7XG5cbiAgICBsZXQgYW5pbWF0aW9uczogRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcbiAgICBpZiAoY29tcG9uZW50LmhhcygnYW5pbWF0aW9ucycpKSB7XG4gICAgICBhbmltYXRpb25zID0gbmV3IFdyYXBwZWROb2RlRXhwcihjb21wb25lbnQuZ2V0KCdhbmltYXRpb25zJykgISk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0ID0ge1xuICAgICAgYW5hbHlzaXM6IHtcbiAgICAgICAgbWV0YToge1xuICAgICAgICAgIC4uLm1ldGFkYXRhLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgaW50ZXJwb2xhdGlvbjogdGVtcGxhdGUuaW50ZXJwb2xhdGlvbixcbiAgICAgICAgICBzdHlsZXM6IHN0eWxlcyB8fCBbXSxcblxuICAgICAgICAgIC8vIFRoZXNlIHdpbGwgYmUgcmVwbGFjZWQgZHVyaW5nIHRoZSBjb21waWxhdGlvbiBzdGVwLCBhZnRlciBhbGwgYE5nTW9kdWxlYHMgaGF2ZSBiZWVuXG4gICAgICAgICAgLy8gYW5hbHl6ZWQgYW5kIHRoZSBmdWxsIGNvbXBpbGF0aW9uIHNjb3BlIGZvciB0aGUgY29tcG9uZW50IGNhbiBiZSByZWFsaXplZC5cbiAgICAgICAgICBwaXBlczogRU1QVFlfTUFQLFxuICAgICAgICAgIGRpcmVjdGl2ZXM6IEVNUFRZX0FSUkFZLFxuICAgICAgICAgIHdyYXBEaXJlY3RpdmVzQW5kUGlwZXNJbkNsb3N1cmU6IGZhbHNlLCAgLy9cbiAgICAgICAgICBhbmltYXRpb25zLFxuICAgICAgICAgIHZpZXdQcm92aWRlcnMsXG4gICAgICAgICAgaTE4blVzZUV4dGVybmFsSWRzOiB0aGlzLmkxOG5Vc2VFeHRlcm5hbElkcywgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGhcbiAgICAgICAgfSxcbiAgICAgICAgbWV0YWRhdGFTdG10OiBnZW5lcmF0ZVNldENsYXNzTWV0YWRhdGFDYWxsKFxuICAgICAgICAgICAgbm9kZSwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZGVmYXVsdEltcG9ydFJlY29yZGVyLCB0aGlzLmlzQ29yZSksXG4gICAgICAgIHBhcnNlZFRlbXBsYXRlOiB0ZW1wbGF0ZS5ub2RlcywgcGFyc2VUZW1wbGF0ZSxcbiAgICAgIH0sXG4gICAgICB0eXBlQ2hlY2s6IHRydWUsXG4gICAgfTtcbiAgICBpZiAoY2hhbmdlRGV0ZWN0aW9uICE9PSBudWxsKSB7XG4gICAgICAob3V0cHV0LmFuYWx5c2lzLm1ldGEgYXMgUjNDb21wb25lbnRNZXRhZGF0YSkuY2hhbmdlRGV0ZWN0aW9uID0gY2hhbmdlRGV0ZWN0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9XG5cbiAgaW5kZXgoY29udGV4dDogSW5kZXhpbmdDb250ZXh0LCBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogQ29tcG9uZW50SGFuZGxlckRhdGEpIHtcbiAgICAvLyBUaGUgY29tcG9uZW50IHRlbXBsYXRlIG1heSBoYXZlIGJlZW4gcHJldmlvdXNseSBwYXJzZWQgd2l0aG91dCBwcmVzZXJ2aW5nIHdoaXRlc3BhY2Ugb3Igd2l0aFxuICAgIC8vIGBsZWFkaW5nVHJpdmlhQ2hhcmBzLCBib3RoIG9mIHdoaWNoIG1heSBtYW5pcHVsYXRlIHRoZSBBU1QgaW50byBhIGZvcm0gbm90IHJlcHJlc2VudGF0aXZlIG9mXG4gICAgLy8gdGhlIHNvdXJjZSBjb2RlLCBtYWtpbmcgaXQgdW5zdWl0YWJsZSBmb3IgaW5kZXhpbmcuIFRoZSB0ZW1wbGF0ZSBpcyByZXBhcnNlZCB3aXRoIHByZXNlcnZpbmdcbiAgICAvLyBvcHRpb25zIHRvIHJlbWVkeSB0aGlzLlxuICAgIGNvbnN0IHRlbXBsYXRlID0gYW5hbHlzaXMucGFyc2VUZW1wbGF0ZSh7XG4gICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiB0cnVlLFxuICAgICAgbGVhZGluZ1RyaXZpYUNoYXJzOiBbXSxcbiAgICB9KTtcbiAgICBjb25zdCBzY29wZSA9IHRoaXMuc2NvcGVSZWdpc3RyeS5nZXRTY29wZUZvckNvbXBvbmVudChub2RlKTtcbiAgICBjb25zdCBzZWxlY3RvciA9IGFuYWx5c2lzLm1ldGEuc2VsZWN0b3I7XG4gICAgY29uc3QgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXI8RGlyZWN0aXZlTWV0YT4oKTtcbiAgICBpZiAoc2NvcGUgIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIHNjb3BlLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShkaXJlY3RpdmUuc2VsZWN0b3IpLCBkaXJlY3RpdmUpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBiaW5kZXIgPSBuZXcgUjNUYXJnZXRCaW5kZXIobWF0Y2hlcik7XG4gICAgY29uc3QgYm91bmRUZW1wbGF0ZSA9IGJpbmRlci5iaW5kKHt0ZW1wbGF0ZTogdGVtcGxhdGUubm9kZXN9KTtcblxuICAgIGNvbnRleHQuYWRkQ29tcG9uZW50KHtcbiAgICAgIGRlY2xhcmF0aW9uOiBub2RlLFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBib3VuZFRlbXBsYXRlLFxuICAgICAgdGVtcGxhdGVNZXRhOiB7XG4gICAgICAgIGlzSW5saW5lOiB0ZW1wbGF0ZS5pc0lubGluZSxcbiAgICAgICAgZmlsZTogdGVtcGxhdGUuZmlsZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICB0eXBlQ2hlY2soY3R4OiBUeXBlQ2hlY2tDb250ZXh0LCBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBtZXRhOiBDb21wb25lbnRIYW5kbGVyRGF0YSk6IHZvaWQge1xuICAgIGlmICghdHMuaXNDbGFzc0RlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNjb3BlID0gdGhpcy5zY29wZVJlZ2lzdHJ5LmdldFNjb3BlRm9yQ29tcG9uZW50KG5vZGUpO1xuICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZU1ldGE+KCk7XG4gICAgaWYgKHNjb3BlICE9PSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IG1ldGEgb2Ygc2NvcGUuY29tcGlsYXRpb24uZGlyZWN0aXZlcykge1xuICAgICAgICBjb25zdCBleHRNZXRhID0gZmxhdHRlbkluaGVyaXRlZERpcmVjdGl2ZU1ldGFkYXRhKHRoaXMubWV0YVJlYWRlciwgbWV0YS5yZWYpO1xuICAgICAgICBtYXRjaGVyLmFkZFNlbGVjdGFibGVzKENzc1NlbGVjdG9yLnBhcnNlKG1ldGEuc2VsZWN0b3IpLCBleHRNZXRhKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJvdW5kID0gbmV3IFIzVGFyZ2V0QmluZGVyKG1hdGNoZXIpLmJpbmQoe3RlbXBsYXRlOiBtZXRhLnBhcnNlZFRlbXBsYXRlfSk7XG4gICAgICBjb25zdCBwaXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4+KCk7XG4gICAgICBmb3IgKGNvbnN0IHtuYW1lLCByZWZ9IG9mIHNjb3BlLmNvbXBpbGF0aW9uLnBpcGVzKSB7XG4gICAgICAgIGlmICghdHMuaXNDbGFzc0RlY2xhcmF0aW9uKHJlZi5ub2RlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbm9uLWNsYXNzIGRlY2xhcmF0aW9uICR7dHMuU3ludGF4S2luZFtyZWYubm9kZS5raW5kXX0gZm9yIHBpcGUgJHtyZWYuZGVidWdOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIHBpcGVzLnNldChuYW1lLCByZWYgYXMgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+KTtcbiAgICAgIH1cbiAgICAgIGN0eC5hZGRUZW1wbGF0ZShuZXcgUmVmZXJlbmNlKG5vZGUpLCBib3VuZCwgcGlwZXMpO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IENvbXBvbmVudEhhbmRsZXJEYXRhKTogUmVzb2x2ZVJlc3VsdCB7XG4gICAgY29uc3QgY29udGV4dCA9IG5vZGUuZ2V0U291cmNlRmlsZSgpO1xuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhpcyBjb21wb25lbnQgd2FzIHJlZ2lzdGVyZWQgd2l0aCBhbiBOZ01vZHVsZS4gSWYgc28sIGl0IHNob3VsZCBiZSBjb21waWxlZFxuICAgIC8vIHVuZGVyIHRoYXQgbW9kdWxlJ3MgY29tcGlsYXRpb24gc2NvcGUuXG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLnNjb3BlUmVnaXN0cnkuZ2V0U2NvcGVGb3JDb21wb25lbnQobm9kZSk7XG4gICAgbGV0IG1ldGFkYXRhID0gYW5hbHlzaXMubWV0YTtcbiAgICBpZiAoc2NvcGUgIT09IG51bGwpIHtcbiAgICAgIC8vIFJlcGxhY2UgdGhlIGVtcHR5IGNvbXBvbmVudHMgYW5kIGRpcmVjdGl2ZXMgZnJvbSB0aGUgYW5hbHl6ZSgpIHN0ZXAgd2l0aCBhIGZ1bGx5IGV4cGFuZGVkXG4gICAgICAvLyBzY29wZS4gVGhpcyBpcyBwb3NzaWJsZSBub3cgYmVjYXVzZSBkdXJpbmcgcmVzb2x2ZSgpIHRoZSB3aG9sZSBjb21waWxhdGlvbiB1bml0IGhhcyBiZWVuXG4gICAgICAvLyBmdWxseSBhbmFseXplZC5cbiAgICAgIC8vXG4gICAgICAvLyBGaXJzdCBpdCBuZWVkcyB0byBiZSBkZXRlcm1pbmVkIGlmIGFjdHVhbGx5IGltcG9ydGluZyB0aGUgZGlyZWN0aXZlcy9waXBlcyB1c2VkIGluIHRoZVxuICAgICAgLy8gdGVtcGxhdGUgd291bGQgY3JlYXRlIGEgY3ljbGUuIEN1cnJlbnRseSBuZ3RzYyByZWZ1c2VzIHRvIGdlbmVyYXRlIGN5Y2xlcywgc28gYW4gb3B0aW9uXG4gICAgICAvLyBrbm93biBhcyBcInJlbW90ZSBzY29waW5nXCIgaXMgdXNlZCBpZiBhIGN5Y2xlIHdvdWxkIGJlIGNyZWF0ZWQuIEluIHJlbW90ZSBzY29waW5nLCB0aGVcbiAgICAgIC8vIG1vZHVsZSBmaWxlIHNldHMgdGhlIGRpcmVjdGl2ZXMvcGlwZXMgb24gdGhlIG5nQ29tcG9uZW50RGVmIG9mIHRoZSBjb21wb25lbnQsIHdpdGhvdXRcbiAgICAgIC8vIHJlcXVpcmluZyBuZXcgaW1wb3J0cyAoYnV0IGFsc28gaW4gYSB3YXkgdGhhdCBicmVha3MgdHJlZSBzaGFraW5nKS5cbiAgICAgIC8vXG4gICAgICAvLyBEZXRlcm1pbmluZyB0aGlzIGlzIGNoYWxsZW5naW5nLCBiZWNhdXNlIHRoZSBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGlzIHJlc3BvbnNpYmxlIGZvclxuICAgICAgLy8gbWF0Y2hpbmcgZGlyZWN0aXZlcyBhbmQgcGlwZXMgaW4gdGhlIHRlbXBsYXRlOyBob3dldmVyLCB0aGF0IGRvZXNuJ3QgcnVuIHVudGlsIHRoZSBhY3R1YWxcbiAgICAgIC8vIGNvbXBpbGUoKSBzdGVwLiBJdCdzIG5vdCBwb3NzaWJsZSB0byBydW4gdGVtcGxhdGUgY29tcGlsYXRpb24gc29vbmVyIGFzIGl0IHJlcXVpcmVzIHRoZVxuICAgICAgLy8gQ29uc3RhbnRQb29sIGZvciB0aGUgb3ZlcmFsbCBmaWxlIGJlaW5nIGNvbXBpbGVkICh3aGljaCBpc24ndCBhdmFpbGFibGUgdW50aWwgdGhlIHRyYW5zZm9ybVxuICAgICAgLy8gc3RlcCkuXG4gICAgICAvL1xuICAgICAgLy8gSW5zdGVhZCwgZGlyZWN0aXZlcy9waXBlcyBhcmUgbWF0Y2hlZCBpbmRlcGVuZGVudGx5IGhlcmUsIHVzaW5nIHRoZSBSM1RhcmdldEJpbmRlci4gVGhpcyBpc1xuICAgICAgLy8gYW4gYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24gb2YgdGVtcGxhdGUgbWF0Y2hpbmcgd2hpY2ggaXMgdXNlZCBmb3IgdGVtcGxhdGUgdHlwZS1jaGVja2luZ1xuICAgICAgLy8gYW5kIHdpbGwgZXZlbnR1YWxseSByZXBsYWNlIG1hdGNoaW5nIGluIHRoZSBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyLlxuXG5cbiAgICAgIC8vIFNldCB1cCB0aGUgUjNUYXJnZXRCaW5kZXIsIGFzIHdlbGwgYXMgYSAnZGlyZWN0aXZlcycgYXJyYXkgYW5kIGEgJ3BpcGVzJyBtYXAgdGhhdCBhcmUgbGF0ZXJcbiAgICAgIC8vIGZlZCB0byB0aGUgVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlci4gRmlyc3QsIGEgU2VsZWN0b3JNYXRjaGVyIGlzIGNvbnN0cnVjdGVkIHRvIG1hdGNoXG4gICAgICAvLyBkaXJlY3RpdmVzIHRoYXQgYXJlIGluIHNjb3BlLlxuICAgICAgY29uc3QgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXI8RGlyZWN0aXZlTWV0YSZ7ZXhwcmVzc2lvbjogRXhwcmVzc2lvbn0+KCk7XG4gICAgICBjb25zdCBkaXJlY3RpdmVzOiB7c2VsZWN0b3I6IHN0cmluZywgZXhwcmVzc2lvbjogRXhwcmVzc2lvbn1bXSA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IGRpciBvZiBzY29wZS5jb21waWxhdGlvbi5kaXJlY3RpdmVzKSB7XG4gICAgICAgIGNvbnN0IHtyZWYsIHNlbGVjdG9yfSA9IGRpcjtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IHRoaXMucmVmRW1pdHRlci5lbWl0KHJlZiwgY29udGV4dCk7XG4gICAgICAgIGRpcmVjdGl2ZXMucHVzaCh7c2VsZWN0b3IsIGV4cHJlc3Npb259KTtcbiAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShzZWxlY3RvciksIHsuLi5kaXIsIGV4cHJlc3Npb259KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBpcGVzID0gbmV3IE1hcDxzdHJpbmcsIEV4cHJlc3Npb24+KCk7XG4gICAgICBmb3IgKGNvbnN0IHBpcGUgb2Ygc2NvcGUuY29tcGlsYXRpb24ucGlwZXMpIHtcbiAgICAgICAgcGlwZXMuc2V0KHBpcGUubmFtZSwgdGhpcy5yZWZFbWl0dGVyLmVtaXQocGlwZS5yZWYsIGNvbnRleHQpKTtcbiAgICAgIH1cblxuICAgICAgLy8gTmV4dCwgdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSBBU1QgaXMgYm91bmQgdXNpbmcgdGhlIFIzVGFyZ2V0QmluZGVyLiBUaGlzIHByb2R1Y2VzIGFuXG4gICAgICAvLyBCb3VuZFRhcmdldCwgd2hpY2ggaXMgc2ltaWxhciB0byBhIHRzLlR5cGVDaGVja2VyLlxuICAgICAgY29uc3QgYmluZGVyID0gbmV3IFIzVGFyZ2V0QmluZGVyKG1hdGNoZXIpO1xuICAgICAgY29uc3QgYm91bmQgPSBiaW5kZXIuYmluZCh7dGVtcGxhdGU6IG1ldGFkYXRhLnRlbXBsYXRlLm5vZGVzfSk7XG5cbiAgICAgIC8vIFRoZSBCb3VuZFRhcmdldCBrbm93cyB3aGljaCBkaXJlY3RpdmVzIGFuZCBwaXBlcyBtYXRjaGVkIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIGNvbnN0IHVzZWREaXJlY3RpdmVzID0gYm91bmQuZ2V0VXNlZERpcmVjdGl2ZXMoKTtcbiAgICAgIGNvbnN0IHVzZWRQaXBlcyA9IGJvdW5kLmdldFVzZWRQaXBlcygpLm1hcChuYW1lID0+IHBpcGVzLmdldChuYW1lKSAhKTtcblxuICAgICAgLy8gU2NhbiB0aHJvdWdoIHRoZSBkaXJlY3RpdmVzL3BpcGVzIGFjdHVhbGx5IHVzZWQgaW4gdGhlIHRlbXBsYXRlIGFuZCBjaGVjayB3aGV0aGVyIGFueVxuICAgICAgLy8gaW1wb3J0IHdoaWNoIG5lZWRzIHRvIGJlIGdlbmVyYXRlZCB3b3VsZCBjcmVhdGUgYSBjeWNsZS5cbiAgICAgIGNvbnN0IGN5Y2xlRGV0ZWN0ZWQgPVxuICAgICAgICAgIHVzZWREaXJlY3RpdmVzLnNvbWUoZGlyID0+IHRoaXMuX2lzQ3ljbGljSW1wb3J0KGRpci5leHByZXNzaW9uLCBjb250ZXh0KSkgfHxcbiAgICAgICAgICB1c2VkUGlwZXMuc29tZShwaXBlID0+IHRoaXMuX2lzQ3ljbGljSW1wb3J0KHBpcGUsIGNvbnRleHQpKTtcblxuICAgICAgaWYgKCFjeWNsZURldGVjdGVkKSB7XG4gICAgICAgIC8vIE5vIGN5Y2xlIHdhcyBkZXRlY3RlZC4gUmVjb3JkIHRoZSBpbXBvcnRzIHRoYXQgbmVlZCB0byBiZSBjcmVhdGVkIGluIHRoZSBjeWNsZSBkZXRlY3RvclxuICAgICAgICAvLyBzbyB0aGF0IGZ1dHVyZSBjeWNsaWMgaW1wb3J0IGNoZWNrcyBjb25zaWRlciB0aGVpciBwcm9kdWN0aW9uLlxuICAgICAgICBmb3IgKGNvbnN0IHtleHByZXNzaW9ufSBvZiB1c2VkRGlyZWN0aXZlcykge1xuICAgICAgICAgIHRoaXMuX3JlY29yZFN5bnRoZXRpY0ltcG9ydChleHByZXNzaW9uLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBpcGUgb2YgdXNlZFBpcGVzKSB7XG4gICAgICAgICAgdGhpcy5fcmVjb3JkU3ludGhldGljSW1wb3J0KHBpcGUsIGNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZGlyZWN0aXZlL3BpcGUgYXJyYXlzIGluIG5nQ29tcG9uZW50RGVmIG5lZWQgdG8gYmUgd3JhcHBlZCBpbiBjbG9zdXJlcy5cbiAgICAgICAgLy8gVGhpcyBpcyByZXF1aXJlZCBpZiBhbnkgZGlyZWN0aXZlL3BpcGUgcmVmZXJlbmNlIGlzIHRvIGEgZGVjbGFyYXRpb24gaW4gdGhlIHNhbWUgZmlsZSBidXRcbiAgICAgICAgLy8gZGVjbGFyZWQgYWZ0ZXIgdGhpcyBjb21wb25lbnQuXG4gICAgICAgIGNvbnN0IHdyYXBEaXJlY3RpdmVzQW5kUGlwZXNJbkNsb3N1cmUgPVxuICAgICAgICAgICAgdXNlZERpcmVjdGl2ZXMuc29tZShcbiAgICAgICAgICAgICAgICBkaXIgPT4gaXNFeHByZXNzaW9uRm9yd2FyZFJlZmVyZW5jZShkaXIuZXhwcmVzc2lvbiwgbm9kZS5uYW1lLCBjb250ZXh0KSkgfHxcbiAgICAgICAgICAgIHVzZWRQaXBlcy5zb21lKHBpcGUgPT4gaXNFeHByZXNzaW9uRm9yd2FyZFJlZmVyZW5jZShwaXBlLCBub2RlLm5hbWUsIGNvbnRleHQpKTtcblxuICAgICAgICAvLyBBY3R1YWwgY29tcGlsYXRpb24gc3RpbGwgdXNlcyB0aGUgZnVsbCBzY29wZSwgbm90IHRoZSBuYXJyb3dlZCBzY29wZSBkZXRlcm1pbmVkIGJ5XG4gICAgICAgIC8vIFIzVGFyZ2V0QmluZGVyLiBUaGlzIGlzIGEgaGVkZ2UgYWdhaW5zdCBwb3RlbnRpYWwgaXNzdWVzIHdpdGggdGhlIFIzVGFyZ2V0QmluZGVyIC0gcmlnaHRcbiAgICAgICAgLy8gbm93IHRoZSBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGlzIHRoZSBcInNvdXJjZSBvZiB0cnV0aFwiIGZvciB3aGljaCBkaXJlY3RpdmVzL3BpcGVzIGFyZVxuICAgICAgICAvLyBhY3R1YWxseSB1c2VkICh0aG91Z2ggdGhlIHR3byBzaG91bGQgYWdyZWUgcGVyZmVjdGx5KS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVE9ETyhhbHhodWIpOiBzd2l0Y2ggVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBvdmVyIHRvIHVzaW5nIFIzVGFyZ2V0QmluZGVyIGRpcmVjdGx5LlxuICAgICAgICBtZXRhZGF0YS5kaXJlY3RpdmVzID0gZGlyZWN0aXZlcztcbiAgICAgICAgbWV0YWRhdGEucGlwZXMgPSBwaXBlcztcbiAgICAgICAgbWV0YWRhdGEud3JhcERpcmVjdGl2ZXNBbmRQaXBlc0luQ2xvc3VyZSA9IHdyYXBEaXJlY3RpdmVzQW5kUGlwZXNJbkNsb3N1cmU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEZWNsYXJpbmcgdGhlIGRpcmVjdGl2ZURlZnMvcGlwZURlZnMgYXJyYXlzIGRpcmVjdGx5IHdvdWxkIHJlcXVpcmUgaW1wb3J0cyB0aGF0IHdvdWxkXG4gICAgICAgIC8vIGNyZWF0ZSBhIGN5Y2xlLiBJbnN0ZWFkLCBtYXJrIHRoaXMgY29tcG9uZW50IGFzIHJlcXVpcmluZyByZW1vdGUgc2NvcGluZywgc28gdGhhdCB0aGVcbiAgICAgICAgLy8gTmdNb2R1bGUgZmlsZSB3aWxsIHRha2UgY2FyZSBvZiBzZXR0aW5nIHRoZSBkaXJlY3RpdmVzIGZvciB0aGUgY29tcG9uZW50LlxuICAgICAgICB0aGlzLnNjb3BlUmVnaXN0cnkuc2V0Q29tcG9uZW50QXNSZXF1aXJpbmdSZW1vdGVTY29waW5nKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBjb21waWxlKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBDb21wb25lbnRIYW5kbGVyRGF0YSwgcG9vbDogQ29uc3RhbnRQb29sKTpcbiAgICAgIENvbXBpbGVSZXN1bHQge1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVDb21wb25lbnRGcm9tTWV0YWRhdGEoYW5hbHlzaXMubWV0YSwgcG9vbCwgbWFrZUJpbmRpbmdQYXJzZXIoKSk7XG5cbiAgICBjb25zdCBzdGF0ZW1lbnRzID0gcmVzLnN0YXRlbWVudHM7XG4gICAgaWYgKGFuYWx5c2lzLm1ldGFkYXRhU3RtdCAhPT0gbnVsbCkge1xuICAgICAgc3RhdGVtZW50cy5wdXNoKGFuYWx5c2lzLm1ldGFkYXRhU3RtdCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnbmdDb21wb25lbnREZWYnLFxuICAgICAgaW5pdGlhbGl6ZXI6IHJlcy5leHByZXNzaW9uLCBzdGF0ZW1lbnRzLFxuICAgICAgdHlwZTogcmVzLnR5cGUsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVMaXRlcmFsKGRlY29yYXRvcjogRGVjb3JhdG9yKTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ge1xuICAgIGlmICh0aGlzLmxpdGVyYWxDYWNoZS5oYXMoZGVjb3JhdG9yKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGl0ZXJhbENhY2hlLmdldChkZWNvcmF0b3IpICE7XG4gICAgfVxuICAgIGlmIChkZWNvcmF0b3IuYXJncyA9PT0gbnVsbCB8fCBkZWNvcmF0b3IuYXJncy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSSVRZX1dST05HLCBkZWNvcmF0b3Iubm9kZSxcbiAgICAgICAgICBgSW5jb3JyZWN0IG51bWJlciBvZiBhcmd1bWVudHMgdG8gQENvbXBvbmVudCBkZWNvcmF0b3JgKTtcbiAgICB9XG4gICAgY29uc3QgbWV0YSA9IHVud3JhcEV4cHJlc3Npb24oZGVjb3JhdG9yLmFyZ3NbMF0pO1xuXG4gICAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKG1ldGEpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUkdfTk9UX0xJVEVSQUwsIG1ldGEsIGBEZWNvcmF0b3IgYXJndW1lbnQgbXVzdCBiZSBsaXRlcmFsLmApO1xuICAgIH1cblxuICAgIHRoaXMubGl0ZXJhbENhY2hlLnNldChkZWNvcmF0b3IsIG1ldGEpO1xuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzb2x2ZUVudW1WYWx1ZShcbiAgICAgIGNvbXBvbmVudDogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4sIGZpZWxkOiBzdHJpbmcsIGVudW1TeW1ib2xOYW1lOiBzdHJpbmcpOiBudW1iZXJ8bnVsbCB7XG4gICAgbGV0IHJlc29sdmVkOiBudW1iZXJ8bnVsbCA9IG51bGw7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoZmllbGQpKSB7XG4gICAgICBjb25zdCBleHByID0gY29tcG9uZW50LmdldChmaWVsZCkgITtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoZXhwcikgYXMgYW55O1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRW51bVZhbHVlICYmIGlzQW5ndWxhckNvcmVSZWZlcmVuY2UodmFsdWUuZW51bVJlZiwgZW51bVN5bWJvbE5hbWUpKSB7XG4gICAgICAgIHJlc29sdmVkID0gdmFsdWUucmVzb2x2ZWQgYXMgbnVtYmVyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgICAgRXJyb3JDb2RlLlZBTFVFX0hBU19XUk9OR19UWVBFLCBleHByLFxuICAgICAgICAgICAgYCR7ZmllbGR9IG11c3QgYmUgYSBtZW1iZXIgb2YgJHtlbnVtU3ltYm9sTmFtZX0gZW51bSBmcm9tIEBhbmd1bGFyL2NvcmVgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc29sdmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdFN0eWxlVXJscyhjb21wb25lbnQ6IE1hcDxzdHJpbmcsIHRzLkV4cHJlc3Npb24+LCBleHRyYVVybHM6IHN0cmluZ1tdKTpcbiAgICAgIHN0cmluZ1tdfG51bGwge1xuICAgIGlmICghY29tcG9uZW50Lmhhcygnc3R5bGVVcmxzJykpIHtcbiAgICAgIHJldHVybiBleHRyYVVybHMubGVuZ3RoID4gMCA/IGV4dHJhVXJscyA6IG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVVcmxzRXhwciA9IGNvbXBvbmVudC5nZXQoJ3N0eWxlVXJscycpICE7XG4gICAgY29uc3Qgc3R5bGVVcmxzID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoc3R5bGVVcmxzRXhwcik7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHN0eWxlVXJscykgfHwgIXN0eWxlVXJscy5ldmVyeSh1cmwgPT4gdHlwZW9mIHVybCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLlZBTFVFX0hBU19XUk9OR19UWVBFLCBzdHlsZVVybHNFeHByLCAnc3R5bGVVcmxzIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncycpO1xuICAgIH1cbiAgICBzdHlsZVVybHMucHVzaCguLi5leHRyYVVybHMpO1xuICAgIHJldHVybiBzdHlsZVVybHMgYXMgc3RyaW5nW107XG4gIH1cblxuICBwcml2YXRlIF9wcmVsb2FkQW5kUGFyc2VUZW1wbGF0ZShcbiAgICAgIG5vZGU6IHRzLkRlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IERlY29yYXRvciwgY29tcG9uZW50OiBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPixcbiAgICAgIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBQcm9taXNlPFBhcnNlZFRlbXBsYXRlfG51bGw+IHtcbiAgICBpZiAoY29tcG9uZW50LmhhcygndGVtcGxhdGVVcmwnKSkge1xuICAgICAgLy8gRXh0cmFjdCB0aGUgdGVtcGxhdGVVcmwgYW5kIHByZWxvYWQgaXQuXG4gICAgICBjb25zdCB0ZW1wbGF0ZVVybEV4cHIgPSBjb21wb25lbnQuZ2V0KCd0ZW1wbGF0ZVVybCcpICE7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKHRlbXBsYXRlVXJsRXhwcik7XG4gICAgICBpZiAodHlwZW9mIHRlbXBsYXRlVXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgICBFcnJvckNvZGUuVkFMVUVfSEFTX1dST05HX1RZUEUsIHRlbXBsYXRlVXJsRXhwciwgJ3RlbXBsYXRlVXJsIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHRlbXBsYXRlVXJsLCBjb250YWluaW5nRmlsZSk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVByb21pc2UgPSB0aGlzLnJlc291cmNlTG9hZGVyLnByZWxvYWQocmVzb3VyY2VVcmwpO1xuXG4gICAgICAvLyBJZiB0aGUgcHJlbG9hZCB3b3JrZWQsIHRoZW4gYWN0dWFsbHkgbG9hZCBhbmQgcGFyc2UgdGhlIHRlbXBsYXRlLCBhbmQgd2FpdCBmb3IgYW55IHN0eWxlXG4gICAgICAvLyBVUkxzIHRvIHJlc29sdmUuXG4gICAgICBpZiAodGVtcGxhdGVQcm9taXNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCB0ZW1wbGF0ZVN0ciA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZChyZXNvdXJjZVVybCk7XG4gICAgICAgICAgdGhpcy5yZXNvdXJjZURlcGVuZGVuY2llcy5yZWNvcmRSZXNvdXJjZURlcGVuZGVuY3kobm9kZS5nZXRTb3VyY2VGaWxlKCksIHJlc291cmNlVXJsKTtcbiAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3BhcnNlVGVtcGxhdGUoXG4gICAgICAgICAgICAgIGNvbXBvbmVudCwgdGVtcGxhdGVTdHIsIHNvdXJjZU1hcFVybChyZXNvdXJjZVVybCksIC8qIHRlbXBsYXRlUmFuZ2UgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAvKiBlc2NhcGVkU3RyaW5nICovIGZhbHNlKTtcbiAgICAgICAgICB0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLnNldChub2RlLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlubGluZVRlbXBsYXRlID0gdGhpcy5fZXh0cmFjdElubGluZVRlbXBsYXRlKGNvbXBvbmVudCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgaWYgKGlubGluZVRlbXBsYXRlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgIEVycm9yQ29kZS5DT01QT05FTlRfTUlTU0lOR19URU1QTEFURSwgZGVjb3JhdG9yLm5vZGUsXG4gICAgICAgICAgICAnY29tcG9uZW50IGlzIG1pc3NpbmcgYSB0ZW1wbGF0ZScpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7dGVtcGxhdGVTdHIsIHRlbXBsYXRlVXJsLCBlc2NhcGVkU3RyaW5nLCB0ZW1wbGF0ZVJhbmdlfSA9IGlubGluZVRlbXBsYXRlO1xuICAgICAgY29uc3QgdGVtcGxhdGUgPVxuICAgICAgICAgIHRoaXMuX3BhcnNlVGVtcGxhdGUoY29tcG9uZW50LCB0ZW1wbGF0ZVN0ciwgdGVtcGxhdGVVcmwsIHRlbXBsYXRlUmFuZ2UsIGVzY2FwZWRTdHJpbmcpO1xuICAgICAgdGhpcy5wcmVhbmFseXplVGVtcGxhdGVDYWNoZS5zZXQobm9kZSwgdGVtcGxhdGUpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0ZW1wbGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdElubGluZVRlbXBsYXRlKGNvbXBvbmVudDogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiB7XG4gICAgdGVtcGxhdGVTdHI6IHN0cmluZyxcbiAgICB0ZW1wbGF0ZVVybDogc3RyaW5nLFxuICAgIHRlbXBsYXRlUmFuZ2U6IExleGVyUmFuZ2V8dW5kZWZpbmVkLFxuICAgIGVzY2FwZWRTdHJpbmc6IGJvb2xlYW5cbiAgfXxudWxsIHtcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBpbmxpbmUgdGVtcGxhdGUsIHRoZW4gcmV0dXJuIG51bGwuXG4gICAgaWYgKCFjb21wb25lbnQuaGFzKCd0ZW1wbGF0ZScpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdGVtcGxhdGVFeHByID0gY29tcG9uZW50LmdldCgndGVtcGxhdGUnKSAhO1xuICAgIGxldCB0ZW1wbGF0ZVN0cjogc3RyaW5nO1xuICAgIGxldCB0ZW1wbGF0ZVVybDogc3RyaW5nID0gJyc7XG4gICAgbGV0IHRlbXBsYXRlUmFuZ2U6IExleGVyUmFuZ2V8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGxldCBlc2NhcGVkU3RyaW5nID0gZmFsc2U7XG4gICAgLy8gV2Ugb25seSBzdXBwb3J0IFNvdXJjZU1hcHMgZm9yIGlubGluZSB0ZW1wbGF0ZXMgdGhhdCBhcmUgc2ltcGxlIHN0cmluZyBsaXRlcmFscy5cbiAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsKHRlbXBsYXRlRXhwcikgfHwgdHMuaXNOb1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbCh0ZW1wbGF0ZUV4cHIpKSB7XG4gICAgICAvLyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgYHRlbXBsYXRlRXhwcmAgbm9kZSBpbmNsdWRlcyB0aGUgcXVvdGF0aW9uIG1hcmtzLCB3aGljaCB3ZVxuICAgICAgLy8gbXVzdFxuICAgICAgLy8gc3RyaXBcbiAgICAgIHRlbXBsYXRlUmFuZ2UgPSBnZXRUZW1wbGF0ZVJhbmdlKHRlbXBsYXRlRXhwcik7XG4gICAgICB0ZW1wbGF0ZVN0ciA9IHRlbXBsYXRlRXhwci5nZXRTb3VyY2VGaWxlKCkudGV4dDtcbiAgICAgIHRlbXBsYXRlVXJsID0gY29udGFpbmluZ0ZpbGU7XG4gICAgICBlc2NhcGVkU3RyaW5nID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVzb2x2ZWRUZW1wbGF0ZSA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKHRlbXBsYXRlRXhwcik7XG4gICAgICBpZiAodHlwZW9mIHJlc29sdmVkVGVtcGxhdGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgIEVycm9yQ29kZS5WQUxVRV9IQVNfV1JPTkdfVFlQRSwgdGVtcGxhdGVFeHByLCAndGVtcGxhdGUgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgICAgfVxuICAgICAgdGVtcGxhdGVTdHIgPSByZXNvbHZlZFRlbXBsYXRlO1xuICAgIH1cbiAgICByZXR1cm4ge3RlbXBsYXRlU3RyLCB0ZW1wbGF0ZVVybCwgdGVtcGxhdGVSYW5nZSwgZXNjYXBlZFN0cmluZ307XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVRlbXBsYXRlKFxuICAgICAgY29tcG9uZW50OiBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPiwgdGVtcGxhdGVTdHI6IHN0cmluZywgdGVtcGxhdGVVcmw6IHN0cmluZyxcbiAgICAgIHRlbXBsYXRlUmFuZ2U6IExleGVyUmFuZ2V8dW5kZWZpbmVkLCBlc2NhcGVkU3RyaW5nOiBib29sZWFuLFxuICAgICAgb3B0aW9uczogUGFyc2VUZW1wbGF0ZU9wdGlvbnMgPSB7fSk6IFBhcnNlZFRlbXBsYXRlIHtcbiAgICBsZXQgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbiA9IHRoaXMuZGVmYXVsdFByZXNlcnZlV2hpdGVzcGFjZXM7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3ByZXNlcnZlV2hpdGVzcGFjZXMnKSkge1xuICAgICAgY29uc3QgZXhwciA9IGNvbXBvbmVudC5nZXQoJ3ByZXNlcnZlV2hpdGVzcGFjZXMnKSAhO1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZShleHByKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgICBFcnJvckNvZGUuVkFMVUVfSEFTX1dST05HX1RZUEUsIGV4cHIsICdwcmVzZXJ2ZVdoaXRlc3BhY2VzIG11c3QgYmUgYSBib29sZWFuJyk7XG4gICAgICB9XG4gICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzID0gdmFsdWU7XG4gICAgfVxuXG4gICAgbGV0IGludGVycG9sYXRpb246IEludGVycG9sYXRpb25Db25maWcgPSBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHO1xuICAgIGlmIChjb21wb25lbnQuaGFzKCdpbnRlcnBvbGF0aW9uJykpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSBjb21wb25lbnQuZ2V0KCdpbnRlcnBvbGF0aW9uJykgITtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoZXhwcik7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpIHx8IHZhbHVlLmxlbmd0aCAhPT0gMiB8fFxuICAgICAgICAgICF2YWx1ZS5ldmVyeShlbGVtZW50ID0+IHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgICAgRXJyb3JDb2RlLlZBTFVFX0hBU19XUk9OR19UWVBFLCBleHByLFxuICAgICAgICAgICAgJ2ludGVycG9sYXRpb24gbXVzdCBiZSBhbiBhcnJheSB3aXRoIDIgZWxlbWVudHMgb2Ygc3RyaW5nIHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIGludGVycG9sYXRpb24gPSBJbnRlcnBvbGF0aW9uQ29uZmlnLmZyb21BcnJheSh2YWx1ZSBhc1tzdHJpbmcsIHN0cmluZ10pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBpbnRlcnBvbGF0aW9uLFxuICAgICAgLi4ucGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZVN0ciwgdGVtcGxhdGVVcmwsIHtcbiAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZzogaW50ZXJwb2xhdGlvbixcbiAgICAgICAgcmFuZ2U6IHRlbXBsYXRlUmFuZ2UsIGVzY2FwZWRTdHJpbmcsIC4uLm9wdGlvbnMsXG4gICAgICB9KSxcbiAgICAgIGlzSW5saW5lOiBjb21wb25lbnQuaGFzKCd0ZW1wbGF0ZScpLFxuICAgICAgZmlsZTogbmV3IFBhcnNlU291cmNlRmlsZSh0ZW1wbGF0ZVN0ciwgdGVtcGxhdGVVcmwpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9leHByZXNzaW9uVG9JbXBvcnRlZEZpbGUoZXhwcjogRXhwcmVzc2lvbiwgb3JpZ2luOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZXxudWxsIHtcbiAgICBpZiAoIShleHByIGluc3RhbmNlb2YgRXh0ZXJuYWxFeHByKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gRmlndXJlIG91dCB3aGF0IGZpbGUgaXMgYmVpbmcgaW1wb3J0ZWQuXG4gICAgcmV0dXJuIHRoaXMubW9kdWxlUmVzb2x2ZXIucmVzb2x2ZU1vZHVsZU5hbWUoZXhwci52YWx1ZS5tb2R1bGVOYW1lICEsIG9yaWdpbik7XG4gIH1cblxuICBwcml2YXRlIF9pc0N5Y2xpY0ltcG9ydChleHByOiBFeHByZXNzaW9uLCBvcmlnaW46IHRzLlNvdXJjZUZpbGUpOiBib29sZWFuIHtcbiAgICBjb25zdCBpbXBvcnRlZCA9IHRoaXMuX2V4cHJlc3Npb25Ub0ltcG9ydGVkRmlsZShleHByLCBvcmlnaW4pO1xuICAgIGlmIChpbXBvcnRlZCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGltcG9ydCBpcyBsZWdhbC5cbiAgICByZXR1cm4gdGhpcy5jeWNsZUFuYWx5emVyLndvdWxkQ3JlYXRlQ3ljbGUob3JpZ2luLCBpbXBvcnRlZCk7XG4gIH1cblxuICBwcml2YXRlIF9yZWNvcmRTeW50aGV0aWNJbXBvcnQoZXhwcjogRXhwcmVzc2lvbiwgb3JpZ2luOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgY29uc3QgaW1wb3J0ZWQgPSB0aGlzLl9leHByZXNzaW9uVG9JbXBvcnRlZEZpbGUoZXhwciwgb3JpZ2luKTtcbiAgICBpZiAoaW1wb3J0ZWQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmN5Y2xlQW5hbHl6ZXIucmVjb3JkU3ludGhldGljSW1wb3J0KG9yaWdpbiwgaW1wb3J0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFRlbXBsYXRlUmFuZ2UodGVtcGxhdGVFeHByOiB0cy5FeHByZXNzaW9uKSB7XG4gIGNvbnN0IHN0YXJ0UG9zID0gdGVtcGxhdGVFeHByLmdldFN0YXJ0KCkgKyAxO1xuICBjb25zdCB7bGluZSwgY2hhcmFjdGVyfSA9XG4gICAgICB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbih0ZW1wbGF0ZUV4cHIuZ2V0U291cmNlRmlsZSgpLCBzdGFydFBvcyk7XG4gIHJldHVybiB7XG4gICAgc3RhcnRQb3MsXG4gICAgc3RhcnRMaW5lOiBsaW5lLFxuICAgIHN0YXJ0Q29sOiBjaGFyYWN0ZXIsXG4gICAgZW5kUG9zOiB0ZW1wbGF0ZUV4cHIuZ2V0RW5kKCkgLSAxLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzb3VyY2VNYXBVcmwocmVzb3VyY2VVcmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghdHNTb3VyY2VNYXBCdWcyOTMwMEZpeGVkKCkpIHtcbiAgICAvLyBCeSByZW1vdmluZyB0aGUgdGVtcGxhdGUgVVJMIHdlIGFyZSB0ZWxsaW5nIHRoZSB0cmFuc2xhdG9yIG5vdCB0byB0cnkgdG9cbiAgICAvLyBtYXAgdGhlIGV4dGVybmFsIHNvdXJjZSBmaWxlIHRvIHRoZSBnZW5lcmF0ZWQgY29kZSwgc2luY2UgdGhlIHZlcnNpb25cbiAgICAvLyBvZiBUUyB0aGF0IGlzIHJ1bm5pbmcgZG9lcyBub3Qgc3VwcG9ydCBpdC5cbiAgICByZXR1cm4gJyc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlc291cmNlVXJsO1xuICB9XG59XG5cbmludGVyZmFjZSBQYXJzZWRUZW1wbGF0ZSB7XG4gIGludGVycG9sYXRpb246IEludGVycG9sYXRpb25Db25maWc7XG4gIGVycm9ycz86IFBhcnNlRXJyb3JbXXx1bmRlZmluZWQ7XG4gIG5vZGVzOiBUbXBsQXN0Tm9kZVtdO1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuICBpc0lubGluZTogYm9vbGVhbjtcbiAgZmlsZTogUGFyc2VTb3VyY2VGaWxlO1xufVxuIl19