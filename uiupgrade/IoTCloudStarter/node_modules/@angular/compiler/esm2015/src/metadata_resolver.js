/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { StaticSymbol } from './aot/static_symbol';
import { ngfactoryFilePath } from './aot/util';
import { assertArrayOfStrings, assertInterpolationSymbols } from './assertions';
import * as cpl from './compile_metadata';
import { ChangeDetectionStrategy, Type, ViewEncapsulation, createAttribute, createComponent, createHost, createInject, createInjectable, createInjectionToken, createNgModule, createOptional, createSelf, createSkipSelf } from './core';
import { findLast } from './directive_resolver';
import { Identifiers } from './identifiers';
import { getAllLifecycleHooks } from './lifecycle_reflector';
import { CssSelector } from './selector';
import { SyncAsync, ValueTransformer, isPromise, noUndefined, resolveForwardRef, stringify, syntaxError, visitValue } from './util';
export const ERROR_COMPONENT_TYPE = 'ngComponentType';
// Design notes:
// - don't lazily create metadata:
//   For some metadata, we need to do async work sometimes,
//   so the user has to kick off this loading.
//   But we want to report errors even when the async work is
//   not required to check that the user would have been able
//   to wait correctly.
export class CompileMetadataResolver {
    constructor(_config, _htmlParser, _ngModuleResolver, _directiveResolver, _pipeResolver, _summaryResolver, _schemaRegistry, _directiveNormalizer, _console, _staticSymbolCache, _reflector, _errorCollector) {
        this._config = _config;
        this._htmlParser = _htmlParser;
        this._ngModuleResolver = _ngModuleResolver;
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._summaryResolver = _summaryResolver;
        this._schemaRegistry = _schemaRegistry;
        this._directiveNormalizer = _directiveNormalizer;
        this._console = _console;
        this._staticSymbolCache = _staticSymbolCache;
        this._reflector = _reflector;
        this._errorCollector = _errorCollector;
        this._nonNormalizedDirectiveCache = new Map();
        this._directiveCache = new Map();
        this._summaryCache = new Map();
        this._pipeCache = new Map();
        this._ngModuleCache = new Map();
        this._ngModuleOfTypes = new Map();
        this._shallowModuleCache = new Map();
    }
    getReflector() { return this._reflector; }
    clearCacheFor(type) {
        const dirMeta = this._directiveCache.get(type);
        this._directiveCache.delete(type);
        this._nonNormalizedDirectiveCache.delete(type);
        this._summaryCache.delete(type);
        this._pipeCache.delete(type);
        this._ngModuleOfTypes.delete(type);
        // Clear all of the NgModule as they contain transitive information!
        this._ngModuleCache.clear();
        if (dirMeta) {
            this._directiveNormalizer.clearCacheFor(dirMeta);
        }
    }
    clearCache() {
        this._directiveCache.clear();
        this._nonNormalizedDirectiveCache.clear();
        this._summaryCache.clear();
        this._pipeCache.clear();
        this._ngModuleCache.clear();
        this._ngModuleOfTypes.clear();
        this._directiveNormalizer.clearCache();
    }
    _createProxyClass(baseType, name) {
        let delegate = null;
        const proxyClass = function () {
            if (!delegate) {
                throw new Error(`Illegal state: Class ${name} for type ${stringify(baseType)} is not compiled yet!`);
            }
            return delegate.apply(this, arguments);
        };
        proxyClass.setDelegate = (d) => {
            delegate = d;
            proxyClass.prototype = d.prototype;
        };
        // Make stringify work correctly
        proxyClass.overriddenName = name;
        return proxyClass;
    }
    getGeneratedClass(dirType, name) {
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(ngfactoryFilePath(dirType.filePath), name);
        }
        else {
            return this._createProxyClass(dirType, name);
        }
    }
    getComponentViewClass(dirType) {
        return this.getGeneratedClass(dirType, cpl.viewClassName(dirType, 0));
    }
    getHostComponentViewClass(dirType) {
        return this.getGeneratedClass(dirType, cpl.hostViewClassName(dirType));
    }
    getHostComponentType(dirType) {
        const name = `${cpl.identifierName({ reference: dirType })}_Host`;
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(dirType.filePath, name);
        }
        return this._createProxyClass(dirType, name);
    }
    getRendererType(dirType) {
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(ngfactoryFilePath(dirType.filePath), cpl.rendererTypeName(dirType));
        }
        else {
            // returning an object as proxy,
            // that we fill later during runtime compilation.
            return {};
        }
    }
    getComponentFactory(selector, dirType, inputs, outputs) {
        if (dirType instanceof StaticSymbol) {
            return this._staticSymbolCache.get(ngfactoryFilePath(dirType.filePath), cpl.componentFactoryName(dirType));
        }
        else {
            const hostView = this.getHostComponentViewClass(dirType);
            // Note: ngContentSelectors will be filled later once the template is
            // loaded.
            const createComponentFactory = this._reflector.resolveExternalReference(Identifiers.createComponentFactory);
            return createComponentFactory(selector, dirType, hostView, inputs, outputs, []);
        }
    }
    initComponentFactory(factory, ngContentSelectors) {
        if (!(factory instanceof StaticSymbol)) {
            factory.ngContentSelectors.push(...ngContentSelectors);
        }
    }
    _loadSummary(type, kind) {
        let typeSummary = this._summaryCache.get(type);
        if (!typeSummary) {
            const summary = this._summaryResolver.resolveSummary(type);
            typeSummary = summary ? summary.type : null;
            this._summaryCache.set(type, typeSummary || null);
        }
        return typeSummary && typeSummary.summaryKind === kind ? typeSummary : null;
    }
    getHostComponentMetadata(compMeta, hostViewType) {
        const hostType = this.getHostComponentType(compMeta.type.reference);
        if (!hostViewType) {
            hostViewType = this.getHostComponentViewClass(hostType);
        }
        // Note: ! is ok here as this method should only be called with normalized directive
        // metadata, which always fills in the selector.
        const template = CssSelector.parse(compMeta.selector)[0].getMatchingElementTemplate();
        const templateUrl = '';
        const htmlAst = this._htmlParser.parse(template, templateUrl);
        return cpl.CompileDirectiveMetadata.create({
            isHost: true,
            type: { reference: hostType, diDeps: [], lifecycleHooks: [] },
            template: new cpl.CompileTemplateMetadata({
                encapsulation: ViewEncapsulation.None,
                template,
                templateUrl,
                htmlAst,
                styles: [],
                styleUrls: [],
                ngContentSelectors: [],
                animations: [],
                isInline: true,
                externalStylesheets: [],
                interpolation: null,
                preserveWhitespaces: false,
            }),
            exportAs: null,
            changeDetection: ChangeDetectionStrategy.Default,
            inputs: [],
            outputs: [],
            host: {},
            isComponent: true,
            selector: '*',
            providers: [],
            viewProviders: [],
            queries: [],
            guards: {},
            viewQueries: [],
            componentViewType: hostViewType,
            rendererType: { id: '__Host__', encapsulation: ViewEncapsulation.None, styles: [], data: {} },
            entryComponents: [],
            componentFactory: null
        });
    }
    loadDirectiveMetadata(ngModuleType, directiveType, isSync) {
        if (this._directiveCache.has(directiveType)) {
            return null;
        }
        directiveType = resolveForwardRef(directiveType);
        const { annotation, metadata } = this.getNonNormalizedDirectiveMetadata(directiveType);
        const createDirectiveMetadata = (templateMetadata) => {
            const normalizedDirMeta = new cpl.CompileDirectiveMetadata({
                isHost: false,
                type: metadata.type,
                isComponent: metadata.isComponent,
                selector: metadata.selector,
                exportAs: metadata.exportAs,
                changeDetection: metadata.changeDetection,
                inputs: metadata.inputs,
                outputs: metadata.outputs,
                hostListeners: metadata.hostListeners,
                hostProperties: metadata.hostProperties,
                hostAttributes: metadata.hostAttributes,
                providers: metadata.providers,
                viewProviders: metadata.viewProviders,
                queries: metadata.queries,
                guards: metadata.guards,
                viewQueries: metadata.viewQueries,
                entryComponents: metadata.entryComponents,
                componentViewType: metadata.componentViewType,
                rendererType: metadata.rendererType,
                componentFactory: metadata.componentFactory,
                template: templateMetadata
            });
            if (templateMetadata) {
                this.initComponentFactory(metadata.componentFactory, templateMetadata.ngContentSelectors);
            }
            this._directiveCache.set(directiveType, normalizedDirMeta);
            this._summaryCache.set(directiveType, normalizedDirMeta.toSummary());
            return null;
        };
        if (metadata.isComponent) {
            const template = metadata.template;
            const templateMeta = this._directiveNormalizer.normalizeTemplate({
                ngModuleType,
                componentType: directiveType,
                moduleUrl: this._reflector.componentModuleUrl(directiveType, annotation),
                encapsulation: template.encapsulation,
                template: template.template,
                templateUrl: template.templateUrl,
                styles: template.styles,
                styleUrls: template.styleUrls,
                animations: template.animations,
                interpolation: template.interpolation,
                preserveWhitespaces: template.preserveWhitespaces
            });
            if (isPromise(templateMeta) && isSync) {
                this._reportError(componentStillLoadingError(directiveType), directiveType);
                return null;
            }
            return SyncAsync.then(templateMeta, createDirectiveMetadata);
        }
        else {
            // directive
            createDirectiveMetadata(null);
            return null;
        }
    }
    getNonNormalizedDirectiveMetadata(directiveType) {
        directiveType = resolveForwardRef(directiveType);
        if (!directiveType) {
            return null;
        }
        let cacheEntry = this._nonNormalizedDirectiveCache.get(directiveType);
        if (cacheEntry) {
            return cacheEntry;
        }
        const dirMeta = this._directiveResolver.resolve(directiveType, false);
        if (!dirMeta) {
            return null;
        }
        let nonNormalizedTemplateMetadata = undefined;
        if (createComponent.isTypeOf(dirMeta)) {
            // component
            const compMeta = dirMeta;
            assertArrayOfStrings('styles', compMeta.styles);
            assertArrayOfStrings('styleUrls', compMeta.styleUrls);
            assertInterpolationSymbols('interpolation', compMeta.interpolation);
            const animations = compMeta.animations;
            nonNormalizedTemplateMetadata = new cpl.CompileTemplateMetadata({
                encapsulation: noUndefined(compMeta.encapsulation),
                template: noUndefined(compMeta.template),
                templateUrl: noUndefined(compMeta.templateUrl),
                htmlAst: null,
                styles: compMeta.styles || [],
                styleUrls: compMeta.styleUrls || [],
                animations: animations || [],
                interpolation: noUndefined(compMeta.interpolation),
                isInline: !!compMeta.template,
                externalStylesheets: [],
                ngContentSelectors: [],
                preserveWhitespaces: noUndefined(dirMeta.preserveWhitespaces),
            });
        }
        let changeDetectionStrategy = null;
        let viewProviders = [];
        let entryComponentMetadata = [];
        let selector = dirMeta.selector;
        if (createComponent.isTypeOf(dirMeta)) {
            // Component
            const compMeta = dirMeta;
            changeDetectionStrategy = compMeta.changeDetection;
            if (compMeta.viewProviders) {
                viewProviders = this._getProvidersMetadata(compMeta.viewProviders, entryComponentMetadata, `viewProviders for "${stringifyType(directiveType)}"`, [], directiveType);
            }
            if (compMeta.entryComponents) {
                entryComponentMetadata = flattenAndDedupeArray(compMeta.entryComponents)
                    .map((type) => this._getEntryComponentMetadata(type))
                    .concat(entryComponentMetadata);
            }
            if (!selector) {
                selector = this._schemaRegistry.getDefaultComponentElementName();
            }
        }
        else {
            // Directive
            if (!selector) {
                this._reportError(syntaxError(`Directive ${stringifyType(directiveType)} has no selector, please add it!`), directiveType);
                selector = 'error';
            }
        }
        let providers = [];
        if (dirMeta.providers != null) {
            providers = this._getProvidersMetadata(dirMeta.providers, entryComponentMetadata, `providers for "${stringifyType(directiveType)}"`, [], directiveType);
        }
        let queries = [];
        let viewQueries = [];
        if (dirMeta.queries != null) {
            queries = this._getQueriesMetadata(dirMeta.queries, false, directiveType);
            viewQueries = this._getQueriesMetadata(dirMeta.queries, true, directiveType);
        }
        const metadata = cpl.CompileDirectiveMetadata.create({
            isHost: false,
            selector: selector,
            exportAs: noUndefined(dirMeta.exportAs),
            isComponent: !!nonNormalizedTemplateMetadata,
            type: this._getTypeMetadata(directiveType),
            template: nonNormalizedTemplateMetadata,
            changeDetection: changeDetectionStrategy,
            inputs: dirMeta.inputs || [],
            outputs: dirMeta.outputs || [],
            host: dirMeta.host || {},
            providers: providers || [],
            viewProviders: viewProviders || [],
            queries: queries || [],
            guards: dirMeta.guards || {},
            viewQueries: viewQueries || [],
            entryComponents: entryComponentMetadata,
            componentViewType: nonNormalizedTemplateMetadata ? this.getComponentViewClass(directiveType) :
                null,
            rendererType: nonNormalizedTemplateMetadata ? this.getRendererType(directiveType) : null,
            componentFactory: null
        });
        if (nonNormalizedTemplateMetadata) {
            metadata.componentFactory =
                this.getComponentFactory(selector, directiveType, metadata.inputs, metadata.outputs);
        }
        cacheEntry = { metadata, annotation: dirMeta };
        this._nonNormalizedDirectiveCache.set(directiveType, cacheEntry);
        return cacheEntry;
    }
    /**
     * Gets the metadata for the given directive.
     * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
     */
    getDirectiveMetadata(directiveType) {
        const dirMeta = this._directiveCache.get(directiveType);
        if (!dirMeta) {
            this._reportError(syntaxError(`Illegal state: getDirectiveMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Directive ${stringifyType(directiveType)}.`), directiveType);
        }
        return dirMeta;
    }
    getDirectiveSummary(dirType) {
        const dirSummary = this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
        if (!dirSummary) {
            this._reportError(syntaxError(`Illegal state: Could not load the summary for directive ${stringifyType(dirType)}.`), dirType);
        }
        return dirSummary;
    }
    isDirective(type) {
        return !!this._loadSummary(type, cpl.CompileSummaryKind.Directive) ||
            this._directiveResolver.isDirective(type);
    }
    isPipe(type) {
        return !!this._loadSummary(type, cpl.CompileSummaryKind.Pipe) ||
            this._pipeResolver.isPipe(type);
    }
    isNgModule(type) {
        return !!this._loadSummary(type, cpl.CompileSummaryKind.NgModule) ||
            this._ngModuleResolver.isNgModule(type);
    }
    getNgModuleSummary(moduleType, alreadyCollecting = null) {
        let moduleSummary = this._loadSummary(moduleType, cpl.CompileSummaryKind.NgModule);
        if (!moduleSummary) {
            const moduleMeta = this.getNgModuleMetadata(moduleType, false, alreadyCollecting);
            moduleSummary = moduleMeta ? moduleMeta.toSummary() : null;
            if (moduleSummary) {
                this._summaryCache.set(moduleType, moduleSummary);
            }
        }
        return moduleSummary;
    }
    /**
     * Loads the declared directives and pipes of an NgModule.
     */
    loadNgModuleDirectiveAndPipeMetadata(moduleType, isSync, throwIfNotFound = true) {
        const ngModule = this.getNgModuleMetadata(moduleType, throwIfNotFound);
        const loading = [];
        if (ngModule) {
            ngModule.declaredDirectives.forEach((id) => {
                const promise = this.loadDirectiveMetadata(moduleType, id.reference, isSync);
                if (promise) {
                    loading.push(promise);
                }
            });
            ngModule.declaredPipes.forEach((id) => this._loadPipeMetadata(id.reference));
        }
        return Promise.all(loading);
    }
    getShallowModuleMetadata(moduleType) {
        let compileMeta = this._shallowModuleCache.get(moduleType);
        if (compileMeta) {
            return compileMeta;
        }
        const ngModuleMeta = findLast(this._reflector.shallowAnnotations(moduleType), createNgModule.isTypeOf);
        compileMeta = {
            type: this._getTypeMetadata(moduleType),
            rawExports: ngModuleMeta.exports,
            rawImports: ngModuleMeta.imports,
            rawProviders: ngModuleMeta.providers,
        };
        this._shallowModuleCache.set(moduleType, compileMeta);
        return compileMeta;
    }
    getNgModuleMetadata(moduleType, throwIfNotFound = true, alreadyCollecting = null) {
        moduleType = resolveForwardRef(moduleType);
        let compileMeta = this._ngModuleCache.get(moduleType);
        if (compileMeta) {
            return compileMeta;
        }
        const meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
        if (!meta) {
            return null;
        }
        const declaredDirectives = [];
        const exportedNonModuleIdentifiers = [];
        const declaredPipes = [];
        const importedModules = [];
        const exportedModules = [];
        const providers = [];
        const entryComponents = [];
        const bootstrapComponents = [];
        const schemas = [];
        if (meta.imports) {
            flattenAndDedupeArray(meta.imports).forEach((importedType) => {
                let importedModuleType = undefined;
                if (isValidType(importedType)) {
                    importedModuleType = importedType;
                }
                else if (importedType && importedType.ngModule) {
                    const moduleWithProviders = importedType;
                    importedModuleType = moduleWithProviders.ngModule;
                    if (moduleWithProviders.providers) {
                        providers.push(...this._getProvidersMetadata(moduleWithProviders.providers, entryComponents, `provider for the NgModule '${stringifyType(importedModuleType)}'`, [], importedType));
                    }
                }
                if (importedModuleType) {
                    if (this._checkSelfImport(moduleType, importedModuleType))
                        return;
                    if (!alreadyCollecting)
                        alreadyCollecting = new Set();
                    if (alreadyCollecting.has(importedModuleType)) {
                        this._reportError(syntaxError(`${this._getTypeDescriptor(importedModuleType)} '${stringifyType(importedType)}' is imported recursively by the module '${stringifyType(moduleType)}'.`), moduleType);
                        return;
                    }
                    alreadyCollecting.add(importedModuleType);
                    const importedModuleSummary = this.getNgModuleSummary(importedModuleType, alreadyCollecting);
                    alreadyCollecting.delete(importedModuleType);
                    if (!importedModuleSummary) {
                        this._reportError(syntaxError(`Unexpected ${this._getTypeDescriptor(importedType)} '${stringifyType(importedType)}' imported by the module '${stringifyType(moduleType)}'. Please add a @NgModule annotation.`), moduleType);
                        return;
                    }
                    importedModules.push(importedModuleSummary);
                }
                else {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(importedType)}' imported by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
            });
        }
        if (meta.exports) {
            flattenAndDedupeArray(meta.exports).forEach((exportedType) => {
                if (!isValidType(exportedType)) {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(exportedType)}' exported by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                if (!alreadyCollecting)
                    alreadyCollecting = new Set();
                if (alreadyCollecting.has(exportedType)) {
                    this._reportError(syntaxError(`${this._getTypeDescriptor(exportedType)} '${stringify(exportedType)}' is exported recursively by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                alreadyCollecting.add(exportedType);
                const exportedModuleSummary = this.getNgModuleSummary(exportedType, alreadyCollecting);
                alreadyCollecting.delete(exportedType);
                if (exportedModuleSummary) {
                    exportedModules.push(exportedModuleSummary);
                }
                else {
                    exportedNonModuleIdentifiers.push(this._getIdentifierMetadata(exportedType));
                }
            });
        }
        // Note: This will be modified later, so we rely on
        // getting a new instance every time!
        const transitiveModule = this._getTransitiveNgModuleMetadata(importedModules, exportedModules);
        if (meta.declarations) {
            flattenAndDedupeArray(meta.declarations).forEach((declaredType) => {
                if (!isValidType(declaredType)) {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(declaredType)}' declared by the module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                const declaredIdentifier = this._getIdentifierMetadata(declaredType);
                if (this.isDirective(declaredType)) {
                    transitiveModule.addDirective(declaredIdentifier);
                    declaredDirectives.push(declaredIdentifier);
                    this._addTypeToModule(declaredType, moduleType);
                }
                else if (this.isPipe(declaredType)) {
                    transitiveModule.addPipe(declaredIdentifier);
                    transitiveModule.pipes.push(declaredIdentifier);
                    declaredPipes.push(declaredIdentifier);
                    this._addTypeToModule(declaredType, moduleType);
                }
                else {
                    this._reportError(syntaxError(`Unexpected ${this._getTypeDescriptor(declaredType)} '${stringifyType(declaredType)}' declared by the module '${stringifyType(moduleType)}'. Please add a @Pipe/@Directive/@Component annotation.`), moduleType);
                    return;
                }
            });
        }
        const exportedDirectives = [];
        const exportedPipes = [];
        exportedNonModuleIdentifiers.forEach((exportedId) => {
            if (transitiveModule.directivesSet.has(exportedId.reference)) {
                exportedDirectives.push(exportedId);
                transitiveModule.addExportedDirective(exportedId);
            }
            else if (transitiveModule.pipesSet.has(exportedId.reference)) {
                exportedPipes.push(exportedId);
                transitiveModule.addExportedPipe(exportedId);
            }
            else {
                this._reportError(syntaxError(`Can't export ${this._getTypeDescriptor(exportedId.reference)} ${stringifyType(exportedId.reference)} from ${stringifyType(moduleType)} as it was neither declared nor imported!`), moduleType);
                return;
            }
        });
        // The providers of the module have to go last
        // so that they overwrite any other provider we already added.
        if (meta.providers) {
            providers.push(...this._getProvidersMetadata(meta.providers, entryComponents, `provider for the NgModule '${stringifyType(moduleType)}'`, [], moduleType));
        }
        if (meta.entryComponents) {
            entryComponents.push(...flattenAndDedupeArray(meta.entryComponents)
                .map(type => this._getEntryComponentMetadata(type)));
        }
        if (meta.bootstrap) {
            flattenAndDedupeArray(meta.bootstrap).forEach(type => {
                if (!isValidType(type)) {
                    this._reportError(syntaxError(`Unexpected value '${stringifyType(type)}' used in the bootstrap property of module '${stringifyType(moduleType)}'`), moduleType);
                    return;
                }
                bootstrapComponents.push(this._getIdentifierMetadata(type));
            });
        }
        entryComponents.push(...bootstrapComponents.map(type => this._getEntryComponentMetadata(type.reference)));
        if (meta.schemas) {
            schemas.push(...flattenAndDedupeArray(meta.schemas));
        }
        compileMeta = new cpl.CompileNgModuleMetadata({
            type: this._getTypeMetadata(moduleType),
            providers,
            entryComponents,
            bootstrapComponents,
            schemas,
            declaredDirectives,
            exportedDirectives,
            declaredPipes,
            exportedPipes,
            importedModules,
            exportedModules,
            transitiveModule,
            id: meta.id || null,
        });
        entryComponents.forEach((id) => transitiveModule.addEntryComponent(id));
        providers.forEach((provider) => transitiveModule.addProvider(provider, compileMeta.type));
        transitiveModule.addModule(compileMeta.type);
        this._ngModuleCache.set(moduleType, compileMeta);
        return compileMeta;
    }
    _checkSelfImport(moduleType, importedModuleType) {
        if (moduleType === importedModuleType) {
            this._reportError(syntaxError(`'${stringifyType(moduleType)}' module can't import itself`), moduleType);
            return true;
        }
        return false;
    }
    _getTypeDescriptor(type) {
        if (isValidType(type)) {
            if (this.isDirective(type)) {
                return 'directive';
            }
            if (this.isPipe(type)) {
                return 'pipe';
            }
            if (this.isNgModule(type)) {
                return 'module';
            }
        }
        if (type.provide) {
            return 'provider';
        }
        return 'value';
    }
    _addTypeToModule(type, moduleType) {
        const oldModule = this._ngModuleOfTypes.get(type);
        if (oldModule && oldModule !== moduleType) {
            this._reportError(syntaxError(`Type ${stringifyType(type)} is part of the declarations of 2 modules: ${stringifyType(oldModule)} and ${stringifyType(moduleType)}! ` +
                `Please consider moving ${stringifyType(type)} to a higher module that imports ${stringifyType(oldModule)} and ${stringifyType(moduleType)}. ` +
                `You can also create a new NgModule that exports and includes ${stringifyType(type)} then import that NgModule in ${stringifyType(oldModule)} and ${stringifyType(moduleType)}.`), moduleType);
            return;
        }
        this._ngModuleOfTypes.set(type, moduleType);
    }
    _getTransitiveNgModuleMetadata(importedModules, exportedModules) {
        // collect `providers` / `entryComponents` from all imported and all exported modules
        const result = new cpl.TransitiveCompileNgModuleMetadata();
        const modulesByToken = new Map();
        importedModules.concat(exportedModules).forEach((modSummary) => {
            modSummary.modules.forEach((mod) => result.addModule(mod));
            modSummary.entryComponents.forEach((comp) => result.addEntryComponent(comp));
            const addedTokens = new Set();
            modSummary.providers.forEach((entry) => {
                const tokenRef = cpl.tokenReference(entry.provider.token);
                let prevModules = modulesByToken.get(tokenRef);
                if (!prevModules) {
                    prevModules = new Set();
                    modulesByToken.set(tokenRef, prevModules);
                }
                const moduleRef = entry.module.reference;
                // Note: the providers of one module may still contain multiple providers
                // per token (e.g. for multi providers), and we need to preserve these.
                if (addedTokens.has(tokenRef) || !prevModules.has(moduleRef)) {
                    prevModules.add(moduleRef);
                    addedTokens.add(tokenRef);
                    result.addProvider(entry.provider, entry.module);
                }
            });
        });
        exportedModules.forEach((modSummary) => {
            modSummary.exportedDirectives.forEach((id) => result.addExportedDirective(id));
            modSummary.exportedPipes.forEach((id) => result.addExportedPipe(id));
        });
        importedModules.forEach((modSummary) => {
            modSummary.exportedDirectives.forEach((id) => result.addDirective(id));
            modSummary.exportedPipes.forEach((id) => result.addPipe(id));
        });
        return result;
    }
    _getIdentifierMetadata(type) {
        type = resolveForwardRef(type);
        return { reference: type };
    }
    isInjectable(type) {
        const annotations = this._reflector.tryAnnotations(type);
        return annotations.some(ann => createInjectable.isTypeOf(ann));
    }
    getInjectableSummary(type) {
        return {
            summaryKind: cpl.CompileSummaryKind.Injectable,
            type: this._getTypeMetadata(type, null, false)
        };
    }
    getInjectableMetadata(type, dependencies = null, throwOnUnknownDeps = true) {
        const typeSummary = this._loadSummary(type, cpl.CompileSummaryKind.Injectable);
        const typeMetadata = typeSummary ?
            typeSummary.type :
            this._getTypeMetadata(type, dependencies, throwOnUnknownDeps);
        const annotations = this._reflector.annotations(type).filter(ann => createInjectable.isTypeOf(ann));
        if (annotations.length === 0) {
            return null;
        }
        const meta = annotations[annotations.length - 1];
        return {
            symbol: type,
            type: typeMetadata,
            providedIn: meta.providedIn,
            useValue: meta.useValue,
            useClass: meta.useClass,
            useExisting: meta.useExisting,
            useFactory: meta.useFactory,
            deps: meta.deps,
        };
    }
    _getTypeMetadata(type, dependencies = null, throwOnUnknownDeps = true) {
        const identifier = this._getIdentifierMetadata(type);
        return {
            reference: identifier.reference,
            diDeps: this._getDependenciesMetadata(identifier.reference, dependencies, throwOnUnknownDeps),
            lifecycleHooks: getAllLifecycleHooks(this._reflector, identifier.reference),
        };
    }
    _getFactoryMetadata(factory, dependencies = null) {
        factory = resolveForwardRef(factory);
        return { reference: factory, diDeps: this._getDependenciesMetadata(factory, dependencies) };
    }
    /**
     * Gets the metadata for the given pipe.
     * This assumes `loadNgModuleDirectiveAndPipeMetadata` has been called first.
     */
    getPipeMetadata(pipeType) {
        const pipeMeta = this._pipeCache.get(pipeType);
        if (!pipeMeta) {
            this._reportError(syntaxError(`Illegal state: getPipeMetadata can only be called after loadNgModuleDirectiveAndPipeMetadata for a module that declares it. Pipe ${stringifyType(pipeType)}.`), pipeType);
        }
        return pipeMeta || null;
    }
    getPipeSummary(pipeType) {
        const pipeSummary = this._loadSummary(pipeType, cpl.CompileSummaryKind.Pipe);
        if (!pipeSummary) {
            this._reportError(syntaxError(`Illegal state: Could not load the summary for pipe ${stringifyType(pipeType)}.`), pipeType);
        }
        return pipeSummary;
    }
    getOrLoadPipeMetadata(pipeType) {
        let pipeMeta = this._pipeCache.get(pipeType);
        if (!pipeMeta) {
            pipeMeta = this._loadPipeMetadata(pipeType);
        }
        return pipeMeta;
    }
    _loadPipeMetadata(pipeType) {
        pipeType = resolveForwardRef(pipeType);
        const pipeAnnotation = this._pipeResolver.resolve(pipeType);
        const pipeMeta = new cpl.CompilePipeMetadata({
            type: this._getTypeMetadata(pipeType),
            name: pipeAnnotation.name,
            pure: !!pipeAnnotation.pure
        });
        this._pipeCache.set(pipeType, pipeMeta);
        this._summaryCache.set(pipeType, pipeMeta.toSummary());
        return pipeMeta;
    }
    _getDependenciesMetadata(typeOrFunc, dependencies, throwOnUnknownDeps = true) {
        let hasUnknownDeps = false;
        const params = dependencies || this._reflector.parameters(typeOrFunc) || [];
        const dependenciesMetadata = params.map((param) => {
            let isAttribute = false;
            let isHost = false;
            let isSelf = false;
            let isSkipSelf = false;
            let isOptional = false;
            let token = null;
            if (Array.isArray(param)) {
                param.forEach((paramEntry) => {
                    if (createHost.isTypeOf(paramEntry)) {
                        isHost = true;
                    }
                    else if (createSelf.isTypeOf(paramEntry)) {
                        isSelf = true;
                    }
                    else if (createSkipSelf.isTypeOf(paramEntry)) {
                        isSkipSelf = true;
                    }
                    else if (createOptional.isTypeOf(paramEntry)) {
                        isOptional = true;
                    }
                    else if (createAttribute.isTypeOf(paramEntry)) {
                        isAttribute = true;
                        token = paramEntry.attributeName;
                    }
                    else if (createInject.isTypeOf(paramEntry)) {
                        token = paramEntry.token;
                    }
                    else if (createInjectionToken.isTypeOf(paramEntry) ||
                        paramEntry instanceof StaticSymbol) {
                        token = paramEntry;
                    }
                    else if (isValidType(paramEntry) && token == null) {
                        token = paramEntry;
                    }
                });
            }
            else {
                token = param;
            }
            if (token == null) {
                hasUnknownDeps = true;
                return {};
            }
            return {
                isAttribute,
                isHost,
                isSelf,
                isSkipSelf,
                isOptional,
                token: this._getTokenMetadata(token)
            };
        });
        if (hasUnknownDeps) {
            const depsTokens = dependenciesMetadata.map((dep) => dep.token ? stringifyType(dep.token) : '?').join(', ');
            const message = `Can't resolve all parameters for ${stringifyType(typeOrFunc)}: (${depsTokens}).`;
            if (throwOnUnknownDeps || this._config.strictInjectionParameters) {
                this._reportError(syntaxError(message), typeOrFunc);
            }
            else {
                this._console.warn(`Warning: ${message} This will become an error in Angular v6.x`);
            }
        }
        return dependenciesMetadata;
    }
    _getTokenMetadata(token) {
        token = resolveForwardRef(token);
        let compileToken;
        if (typeof token === 'string') {
            compileToken = { value: token };
        }
        else {
            compileToken = { identifier: { reference: token } };
        }
        return compileToken;
    }
    _getProvidersMetadata(providers, targetEntryComponents, debugInfo, compileProviders = [], type) {
        providers.forEach((provider, providerIdx) => {
            if (Array.isArray(provider)) {
                this._getProvidersMetadata(provider, targetEntryComponents, debugInfo, compileProviders);
            }
            else {
                provider = resolveForwardRef(provider);
                let providerMeta = undefined;
                if (provider && typeof provider === 'object' && provider.hasOwnProperty('provide')) {
                    this._validateProvider(provider);
                    providerMeta = new cpl.ProviderMeta(provider.provide, provider);
                }
                else if (isValidType(provider)) {
                    providerMeta = new cpl.ProviderMeta(provider, { useClass: provider });
                }
                else if (provider === void 0) {
                    this._reportError(syntaxError(`Encountered undefined provider! Usually this means you have a circular dependencies. This might be caused by using 'barrel' index.ts files.`));
                    return;
                }
                else {
                    const providersInfo = providers.reduce((soFar, seenProvider, seenProviderIdx) => {
                        if (seenProviderIdx < providerIdx) {
                            soFar.push(`${stringifyType(seenProvider)}`);
                        }
                        else if (seenProviderIdx == providerIdx) {
                            soFar.push(`?${stringifyType(seenProvider)}?`);
                        }
                        else if (seenProviderIdx == providerIdx + 1) {
                            soFar.push('...');
                        }
                        return soFar;
                    }, [])
                        .join(', ');
                    this._reportError(syntaxError(`Invalid ${debugInfo ? debugInfo : 'provider'} - only instances of Provider and Type are allowed, got: [${providersInfo}]`), type);
                    return;
                }
                if (providerMeta.token ===
                    this._reflector.resolveExternalReference(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS)) {
                    targetEntryComponents.push(...this._getEntryComponentsFromProvider(providerMeta, type));
                }
                else {
                    compileProviders.push(this.getProviderMetadata(providerMeta));
                }
            }
        });
        return compileProviders;
    }
    _validateProvider(provider) {
        if (provider.hasOwnProperty('useClass') && provider.useClass == null) {
            this._reportError(syntaxError(`Invalid provider for ${stringifyType(provider.provide)}. useClass cannot be ${provider.useClass}.
           Usually it happens when:
           1. There's a circular dependency (might be caused by using index.ts (barrel) files).
           2. Class was used before it was declared. Use forwardRef in this case.`));
        }
    }
    _getEntryComponentsFromProvider(provider, type) {
        const components = [];
        const collectedIdentifiers = [];
        if (provider.useFactory || provider.useExisting || provider.useClass) {
            this._reportError(syntaxError(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!`), type);
            return [];
        }
        if (!provider.multi) {
            this._reportError(syntaxError(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!`), type);
            return [];
        }
        extractIdentifiers(provider.useValue, collectedIdentifiers);
        collectedIdentifiers.forEach((identifier) => {
            const entry = this._getEntryComponentMetadata(identifier.reference, false);
            if (entry) {
                components.push(entry);
            }
        });
        return components;
    }
    _getEntryComponentMetadata(dirType, throwIfNotFound = true) {
        const dirMeta = this.getNonNormalizedDirectiveMetadata(dirType);
        if (dirMeta && dirMeta.metadata.isComponent) {
            return { componentType: dirType, componentFactory: dirMeta.metadata.componentFactory };
        }
        const dirSummary = this._loadSummary(dirType, cpl.CompileSummaryKind.Directive);
        if (dirSummary && dirSummary.isComponent) {
            return { componentType: dirType, componentFactory: dirSummary.componentFactory };
        }
        if (throwIfNotFound) {
            throw syntaxError(`${dirType.name} cannot be used as an entry component.`);
        }
        return null;
    }
    _getInjectableTypeMetadata(type, dependencies = null) {
        const typeSummary = this._loadSummary(type, cpl.CompileSummaryKind.Injectable);
        if (typeSummary) {
            return typeSummary.type;
        }
        return this._getTypeMetadata(type, dependencies);
    }
    getProviderMetadata(provider) {
        let compileDeps = undefined;
        let compileTypeMetadata = null;
        let compileFactoryMetadata = null;
        let token = this._getTokenMetadata(provider.token);
        if (provider.useClass) {
            compileTypeMetadata =
                this._getInjectableTypeMetadata(provider.useClass, provider.dependencies);
            compileDeps = compileTypeMetadata.diDeps;
            if (provider.token === provider.useClass) {
                // use the compileTypeMetadata as it contains information about lifecycleHooks...
                token = { identifier: compileTypeMetadata };
            }
        }
        else if (provider.useFactory) {
            compileFactoryMetadata = this._getFactoryMetadata(provider.useFactory, provider.dependencies);
            compileDeps = compileFactoryMetadata.diDeps;
        }
        return {
            token: token,
            useClass: compileTypeMetadata,
            useValue: provider.useValue,
            useFactory: compileFactoryMetadata,
            useExisting: provider.useExisting ? this._getTokenMetadata(provider.useExisting) : undefined,
            deps: compileDeps,
            multi: provider.multi
        };
    }
    _getQueriesMetadata(queries, isViewQuery, directiveType) {
        const res = [];
        Object.keys(queries).forEach((propertyName) => {
            const query = queries[propertyName];
            if (query.isViewQuery === isViewQuery) {
                res.push(this._getQueryMetadata(query, propertyName, directiveType));
            }
        });
        return res;
    }
    _queryVarBindings(selector) { return selector.split(/\s*,\s*/); }
    _getQueryMetadata(q, propertyName, typeOrFunc) {
        let selectors;
        if (typeof q.selector === 'string') {
            selectors =
                this._queryVarBindings(q.selector).map(varName => this._getTokenMetadata(varName));
        }
        else {
            if (!q.selector) {
                this._reportError(syntaxError(`Can't construct a query for the property "${propertyName}" of "${stringifyType(typeOrFunc)}" since the query selector wasn't defined.`), typeOrFunc);
                selectors = [];
            }
            else {
                selectors = [this._getTokenMetadata(q.selector)];
            }
        }
        return {
            selectors,
            first: q.first,
            descendants: q.descendants, propertyName,
            read: q.read ? this._getTokenMetadata(q.read) : null,
            static: q.static
        };
    }
    _reportError(error, type, otherType) {
        if (this._errorCollector) {
            this._errorCollector(error, type);
            if (otherType) {
                this._errorCollector(error, otherType);
            }
        }
        else {
            throw error;
        }
    }
}
function flattenArray(tree, out = []) {
    if (tree) {
        for (let i = 0; i < tree.length; i++) {
            const item = resolveForwardRef(tree[i]);
            if (Array.isArray(item)) {
                flattenArray(item, out);
            }
            else {
                out.push(item);
            }
        }
    }
    return out;
}
function dedupeArray(array) {
    if (array) {
        return Array.from(new Set(array));
    }
    return [];
}
function flattenAndDedupeArray(tree) {
    return dedupeArray(flattenArray(tree));
}
function isValidType(value) {
    return (value instanceof StaticSymbol) || (value instanceof Type);
}
function extractIdentifiers(value, targetIdentifiers) {
    visitValue(value, new _CompileValueConverter(), targetIdentifiers);
}
class _CompileValueConverter extends ValueTransformer {
    visitOther(value, targetIdentifiers) {
        targetIdentifiers.push({ reference: value });
    }
}
function stringifyType(type) {
    if (type instanceof StaticSymbol) {
        return `${type.name} in ${type.filePath}`;
    }
    else {
        return stringify(type);
    }
}
/**
 * Indicates that a component is still being loaded in a synchronous compile.
 */
function componentStillLoadingError(compType) {
    const error = Error(`Can't compile synchronously as ${stringify(compType)} is still being loaded!`);
    error[ERROR_COMPONENT_TYPE] = compType;
    return error;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvbWV0YWRhdGFfcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBb0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDN0MsT0FBTyxFQUFDLG9CQUFvQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzlFLE9BQU8sS0FBSyxHQUFHLE1BQU0sb0JBQW9CLENBQUM7QUFHMUMsT0FBTyxFQUFDLHVCQUF1QixFQUEwRixJQUFJLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVoVSxPQUFPLEVBQW9CLFFBQVEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFLM0QsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV2QyxPQUFPLEVBQVUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFJM0ksTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQWlCLENBQUM7QUFFdEQsZ0JBQWdCO0FBQ2hCLGtDQUFrQztBQUNsQywyREFBMkQ7QUFDM0QsOENB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QyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxLQUFVO0lBQzdCLE9BQU8sQ0FBQyxLQUFLLFlBQVksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsS0FBVSxFQUFFLGlCQUFrRDtJQUN4RixVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksc0JBQXNCLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRCxNQUFNLHNCQUF1QixTQUFRLGdCQUFnQjtJQUNuRCxVQUFVLENBQUMsS0FBVSxFQUFFLGlCQUFrRDtRQUN2RSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0Y7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFTO0lBQzlCLElBQUksSUFBSSxZQUFZLFlBQVksRUFBRTtRQUNoQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDM0M7U0FBTTtRQUNMLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3hCO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUywwQkFBMEIsQ0FBQyxRQUFjO0lBQ2hELE1BQU0sS0FBSyxHQUNQLEtBQUssQ0FBQyxrQ0FBa0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3pGLEtBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUNoRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdGljU3ltYm9sLCBTdGF0aWNTeW1ib2xDYWNoZX0gZnJvbSAnLi9hb3Qvc3RhdGljX3N5bWJvbCc7XG5pbXBvcnQge25nZmFjdG9yeUZpbGVQYXRofSBmcm9tICcuL2FvdC91dGlsJztcbmltcG9ydCB7YXNzZXJ0QXJyYXlPZlN0cmluZ3MsIGFzc2VydEludGVycG9sYXRpb25TeW1ib2xzfSBmcm9tICcuL2Fzc2VydGlvbnMnO1xuaW1wb3J0ICogYXMgY3BsIGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0NvbXBpbGVSZWZsZWN0b3J9IGZyb20gJy4vY29tcGlsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtDb21waWxlckNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBEaXJlY3RpdmUsIEluamVjdGFibGUsIE1vZHVsZVdpdGhQcm92aWRlcnMsIFByb3ZpZGVyLCBRdWVyeSwgU2NoZW1hTWV0YWRhdGEsIFR5cGUsIFZpZXdFbmNhcHN1bGF0aW9uLCBjcmVhdGVBdHRyaWJ1dGUsIGNyZWF0ZUNvbXBvbmVudCwgY3JlYXRlSG9zdCwgY3JlYXRlSW5qZWN0LCBjcmVhdGVJbmplY3RhYmxlLCBjcmVhdGVJbmplY3Rpb25Ub2tlbiwgY3JlYXRlTmdNb2R1bGUsIGNyZWF0ZU9wdGlvbmFsLCBjcmVhdGVTZWxmLCBjcmVhdGVTa2lwU2VsZn0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7RGlyZWN0aXZlTm9ybWFsaXplcn0gZnJvbSAnLi9kaXJlY3RpdmVfbm9ybWFsaXplcic7XG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyLCBmaW5kTGFzdH0gZnJvbSAnLi9kaXJlY3RpdmVfcmVzb2x2ZXInO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge2dldEFsbExpZmVjeWNsZUhvb2tzfSBmcm9tICcuL2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICcuL21sX3BhcnNlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge05nTW9kdWxlUmVzb2x2ZXJ9IGZyb20gJy4vbmdfbW9kdWxlX3Jlc29sdmVyJztcbmltcG9ydCB7UGlwZVJlc29sdmVyfSBmcm9tICcuL3BpcGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vc2NoZW1hL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcbmltcG9ydCB7Q3NzU2VsZWN0b3J9IGZyb20gJy4vc2VsZWN0b3InO1xuaW1wb3J0IHtTdW1tYXJ5UmVzb2x2ZXJ9IGZyb20gJy4vc3VtbWFyeV9yZXNvbHZlcic7XG5pbXBvcnQge0NvbnNvbGUsIFN5bmNBc3luYywgVmFsdWVUcmFuc2Zvcm1lciwgaXNQcm9taXNlLCBub1VuZGVmaW5lZCwgcmVzb2x2ZUZvcndhcmRSZWYsIHN0cmluZ2lmeSwgc3ludGF4RXJyb3IsIHZpc2l0VmFsdWV9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCB0eXBlIEVycm9yQ29sbGVjdG9yID0gKGVycm9yOiBhbnksIHR5cGU/OiBhbnkpID0+IHZvaWQ7XG5cbmV4cG9ydCBjb25zdCBFUlJPUl9DT01QT05FTlRfVFlQRSA9ICduZ0NvbXBvbmVudFR5cGUnO1xuXG4vLyBEZXNpZ24gbm90ZXM6XG4vLyAtIGRvbid0IGxhemlseSBjcmVhdGUgbWV0YWRhdGE6XG4vLyAgIEZvciBzb21lIG1ldGFkYXRhLCB3ZSBuZWVkIHRvIGRvIGFzeW5jIHdvcmsgc29tZXRpbWVzLFxuLy8gICBzbyB0aGUgdXNlciBoYXMgdG8ga2ljayBvZmYgdGhpcyBsb2FkaW5nLlxuLy8gICBCdXQgd2Ugd2FudCB0byByZXBvcnQgZXJyb3JzIGV2ZW4gd2hlbiB0aGUgYXN5bmMgd29yayBpc1xuLy8gICBub3QgcmVxdWlyZWQgdG8gY2hlY2sgdGhhdCB0aGUgdXNlciB3b3VsZCBoYXZlIGJlZW4gYWJsZVxuLy8gICB0byB3YWl0IGNvcnJlY3RseS5cbmV4cG9ydCBjbGFzcyBDb21waWxlTWV0YWRhdGFSZXNvbHZlciB7XG4gIHByaXZhdGUgX25vbk5vcm1hbGl6ZWREaXJlY3RpdmVDYWNoZSA9XG4gICAgICBuZXcgTWFwPFR5cGUsIHthbm5vdGF0aW9uOiBEaXJlY3RpdmUsIG1ldGFkYXRhOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhfT4oKTtcbiAgcHJpdmF0ZSBfZGlyZWN0aXZlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGE+KCk7XG4gIHByaXZhdGUgX3N1bW1hcnlDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVUeXBlU3VtbWFyeXxudWxsPigpO1xuICBwcml2YXRlIF9waXBlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlUGlwZU1ldGFkYXRhPigpO1xuICBwcml2YXRlIF9uZ01vZHVsZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGE+KCk7XG4gIHByaXZhdGUgX25nTW9kdWxlT2ZUeXBlcyA9IG5ldyBNYXA8VHlwZSwgVHlwZT4oKTtcbiAgcHJpdmF0ZSBfc2hhbGxvd01vZHVsZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZVNoYWxsb3dNb2R1bGVNZXRhZGF0YT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2NvbmZpZzogQ29tcGlsZXJDb25maWcsIHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIsXG4gICAgICBwcml2YXRlIF9uZ01vZHVsZVJlc29sdmVyOiBOZ01vZHVsZVJlc29sdmVyLCBwcml2YXRlIF9kaXJlY3RpdmVSZXNvbHZlcjogRGlyZWN0aXZlUmVzb2x2ZXIsXG4gICAgICBwcml2YXRlIF9waXBlUmVzb2x2ZXI6IFBpcGVSZXNvbHZlciwgcHJpdmF0ZSBfc3VtbWFyeVJlc29sdmVyOiBTdW1tYXJ5UmVzb2x2ZXI8YW55PixcbiAgICAgIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnksXG4gICAgICBwcml2YXRlIF9kaXJlY3RpdmVOb3JtYWxpemVyOiBEaXJlY3RpdmVOb3JtYWxpemVyLCBwcml2YXRlIF9jb25zb2xlOiBDb25zb2xlLFxuICAgICAgcHJpdmF0ZSBfc3RhdGljU3ltYm9sQ2FjaGU6IFN0YXRpY1N5bWJvbENhY2hlLCBwcml2YXRlIF9yZWZsZWN0b3I6IENvbXBpbGVSZWZsZWN0b3IsXG4gICAgICBwcml2YXRlIF9lcnJvckNvbGxlY3Rvcj86IEVycm9yQ29sbGVjdG9yKSB7fVxuXG4gIGdldFJlZmxlY3RvcigpOiBDb21waWxlUmVmbGVjdG9yIHsgcmV0dXJuIHRoaXMuX3JlZmxlY3RvcjsgfVxuXG4gIGNsZWFyQ2FjaGVGb3IodHlwZTogVHlwZSkge1xuICAgIGNvbnN0IGRpck1ldGEgPSB0aGlzLl9kaXJlY3RpdmVDYWNoZS5nZXQodHlwZSk7XG4gICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuZGVsZXRlKHR5cGUpO1xuICAgIHRoaXMuX25vbk5vcm1hbGl6ZWREaXJlY3RpdmVDYWNoZS5kZWxldGUodHlwZSk7XG4gICAgdGhpcy5fc3VtbWFyeUNhY2hlLmRlbGV0ZSh0eXBlKTtcbiAgICB0aGlzLl9waXBlQ2FjaGUuZGVsZXRlKHR5cGUpO1xuICAgIHRoaXMuX25nTW9kdWxlT2ZUeXBlcy5kZWxldGUodHlwZSk7XG4gICAgLy8gQ2xlYXIgYWxsIG9mIHRoZSBOZ01vZHVsZSBhcyB0aGV5IGNvbnRhaW4gdHJhbnNpdGl2ZSBpbmZvcm1hdGlvbiFcbiAgICB0aGlzLl9uZ01vZHVsZUNhY2hlLmNsZWFyKCk7XG4gICAgaWYgKGRpck1ldGEpIHtcbiAgICAgIHRoaXMuX2RpcmVjdGl2ZU5vcm1hbGl6ZXIuY2xlYXJDYWNoZUZvcihkaXJNZXRhKTtcbiAgICB9XG4gIH1cblxuICBjbGVhckNhY2hlKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fbm9uTm9ybWFsaXplZERpcmVjdGl2ZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fc3VtbWFyeUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fcGlwZUNhY2hlLmNsZWFyKCk7XG4gICAgdGhpcy5fbmdNb2R1bGVDYWNoZS5jbGVhcigpO1xuICAgIHRoaXMuX25nTW9kdWxlT2ZUeXBlcy5jbGVhcigpO1xuICAgIHRoaXMuX2RpcmVjdGl2ZU5vcm1hbGl6ZXIuY2xlYXJDYWNoZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUHJveHlDbGFzcyhiYXNlVHlwZTogYW55LCBuYW1lOiBzdHJpbmcpOiBjcGwuUHJveHlDbGFzcyB7XG4gICAgbGV0IGRlbGVnYXRlOiBhbnkgPSBudWxsO1xuICAgIGNvbnN0IHByb3h5Q2xhc3M6IGNwbC5Qcm94eUNsYXNzID0gPGFueT5mdW5jdGlvbigpIHtcbiAgICAgIGlmICghZGVsZWdhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYElsbGVnYWwgc3RhdGU6IENsYXNzICR7bmFtZX0gZm9yIHR5cGUgJHtzdHJpbmdpZnkoYmFzZVR5cGUpfSBpcyBub3QgY29tcGlsZWQgeWV0IWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlbGVnYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICBwcm94eUNsYXNzLnNldERlbGVnYXRlID0gKGQpID0+IHtcbiAgICAgIGRlbGVnYXRlID0gZDtcbiAgICAgICg8YW55PnByb3h5Q2xhc3MpLnByb3RvdHlwZSA9IGQucHJvdG90eXBlO1xuICAgIH07XG4gICAgLy8gTWFrZSBzdHJpbmdpZnkgd29yayBjb3JyZWN0bHlcbiAgICAoPGFueT5wcm94eUNsYXNzKS5vdmVycmlkZGVuTmFtZSA9IG5hbWU7XG4gICAgcmV0dXJuIHByb3h5Q2xhc3M7XG4gIH1cblxuICBwcml2YXRlIGdldEdlbmVyYXRlZENsYXNzKGRpclR5cGU6IGFueSwgbmFtZTogc3RyaW5nKTogU3RhdGljU3ltYm9sfGNwbC5Qcm94eUNsYXNzIHtcbiAgICBpZiAoZGlyVHlwZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXRpY1N5bWJvbENhY2hlLmdldChuZ2ZhY3RvcnlGaWxlUGF0aChkaXJUeXBlLmZpbGVQYXRoKSwgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVQcm94eUNsYXNzKGRpclR5cGUsIG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29tcG9uZW50Vmlld0NsYXNzKGRpclR5cGU6IGFueSk6IFN0YXRpY1N5bWJvbHxjcGwuUHJveHlDbGFzcyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0R2VuZXJhdGVkQ2xhc3MoZGlyVHlwZSwgY3BsLnZpZXdDbGFzc05hbWUoZGlyVHlwZSwgMCkpO1xuICB9XG5cbiAgZ2V0SG9zdENvbXBvbmVudFZpZXdDbGFzcyhkaXJUeXBlOiBhbnkpOiBTdGF0aWNTeW1ib2x8Y3BsLlByb3h5Q2xhc3Mge1xuICAgIHJldHVybiB0aGlzLmdldEdlbmVyYXRlZENsYXNzKGRpclR5cGUsIGNwbC5ob3N0Vmlld0NsYXNzTmFtZShkaXJUeXBlKSk7XG4gIH1cblxuICBnZXRIb3N0Q29tcG9uZW50VHlwZShkaXJUeXBlOiBhbnkpOiBTdGF0aWNTeW1ib2x8Y3BsLlByb3h5Q2xhc3Mge1xuICAgIGNvbnN0IG5hbWUgPSBgJHtjcGwuaWRlbnRpZmllck5hbWUoe3JlZmVyZW5jZTogZGlyVHlwZX0pfV9Ib3N0YDtcbiAgICBpZiAoZGlyVHlwZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXRpY1N5bWJvbENhY2hlLmdldChkaXJUeXBlLmZpbGVQYXRoLCBuYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY3JlYXRlUHJveHlDbGFzcyhkaXJUeXBlLCBuYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVuZGVyZXJUeXBlKGRpclR5cGU6IGFueSk6IFN0YXRpY1N5bWJvbHxvYmplY3Qge1xuICAgIGlmIChkaXJUeXBlIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhdGljU3ltYm9sQ2FjaGUuZ2V0KFxuICAgICAgICAgIG5nZmFjdG9yeUZpbGVQYXRoKGRpclR5cGUuZmlsZVBhdGgpLCBjcGwucmVuZGVyZXJUeXBlTmFtZShkaXJUeXBlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHJldHVybmluZyBhbiBvYmplY3QgYXMgcHJveHksXG4gICAgICAvLyB0aGF0IHdlIGZpbGwgbGF0ZXIgZHVyaW5nIHJ1bnRpbWUgY29tcGlsYXRpb24uXG4gICAgICByZXR1cm4gPGFueT57fTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldENvbXBvbmVudEZhY3RvcnkoXG4gICAgICBzZWxlY3Rvcjogc3RyaW5nLCBkaXJUeXBlOiBhbnksIGlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ318bnVsbCxcbiAgICAgIG91dHB1dHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogU3RhdGljU3ltYm9sfG9iamVjdCB7XG4gICAgaWYgKGRpclR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGF0aWNTeW1ib2xDYWNoZS5nZXQoXG4gICAgICAgICAgbmdmYWN0b3J5RmlsZVBhdGgoZGlyVHlwZS5maWxlUGF0aCksIGNwbC5jb21wb25lbnRGYWN0b3J5TmFtZShkaXJUeXBlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGhvc3RWaWV3ID0gdGhpcy5nZXRIb3N0Q29tcG9uZW50Vmlld0NsYXNzKGRpclR5cGUpO1xuICAgICAgLy8gTm90ZTogbmdDb250ZW50U2VsZWN0b3JzIHdpbGwgYmUgZmlsbGVkIGxhdGVyIG9uY2UgdGhlIHRlbXBsYXRlIGlzXG4gICAgICAvLyBsb2FkZWQuXG4gICAgICBjb25zdCBjcmVhdGVDb21wb25lbnRGYWN0b3J5ID1cbiAgICAgICAgICB0aGlzLl9yZWZsZWN0b3IucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKElkZW50aWZpZXJzLmNyZWF0ZUNvbXBvbmVudEZhY3RvcnkpO1xuICAgICAgcmV0dXJuIGNyZWF0ZUNvbXBvbmVudEZhY3Rvcnkoc2VsZWN0b3IsIGRpclR5cGUsIDxhbnk+aG9zdFZpZXcsIGlucHV0cywgb3V0cHV0cywgW10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdENvbXBvbmVudEZhY3RvcnkoZmFjdG9yeTogU3RhdGljU3ltYm9sfG9iamVjdCwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSkge1xuICAgIGlmICghKGZhY3RvcnkgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpKSB7XG4gICAgICAoZmFjdG9yeSBhcyBhbnkpLm5nQ29udGVudFNlbGVjdG9ycy5wdXNoKC4uLm5nQ29udGVudFNlbGVjdG9ycyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbG9hZFN1bW1hcnkodHlwZTogYW55LCBraW5kOiBjcGwuQ29tcGlsZVN1bW1hcnlLaW5kKTogY3BsLkNvbXBpbGVUeXBlU3VtbWFyeXxudWxsIHtcbiAgICBsZXQgdHlwZVN1bW1hcnkgPSB0aGlzLl9zdW1tYXJ5Q2FjaGUuZ2V0KHR5cGUpO1xuICAgIGlmICghdHlwZVN1bW1hcnkpIHtcbiAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLl9zdW1tYXJ5UmVzb2x2ZXIucmVzb2x2ZVN1bW1hcnkodHlwZSk7XG4gICAgICB0eXBlU3VtbWFyeSA9IHN1bW1hcnkgPyBzdW1tYXJ5LnR5cGUgOiBudWxsO1xuICAgICAgdGhpcy5fc3VtbWFyeUNhY2hlLnNldCh0eXBlLCB0eXBlU3VtbWFyeSB8fCBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVTdW1tYXJ5ICYmIHR5cGVTdW1tYXJ5LnN1bW1hcnlLaW5kID09PSBraW5kID8gdHlwZVN1bW1hcnkgOiBudWxsO1xuICB9XG5cbiAgZ2V0SG9zdENvbXBvbmVudE1ldGFkYXRhKFxuICAgICAgY29tcE1ldGE6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICBob3N0Vmlld1R5cGU/OiBTdGF0aWNTeW1ib2x8Y3BsLlByb3h5Q2xhc3MpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICBjb25zdCBob3N0VHlwZSA9IHRoaXMuZ2V0SG9zdENvbXBvbmVudFR5cGUoY29tcE1ldGEudHlwZS5yZWZlcmVuY2UpO1xuICAgIGlmICghaG9zdFZpZXdUeXBlKSB7XG4gICAgICBob3N0Vmlld1R5cGUgPSB0aGlzLmdldEhvc3RDb21wb25lbnRWaWV3Q2xhc3MoaG9zdFR5cGUpO1xuICAgIH1cbiAgICAvLyBOb3RlOiAhIGlzIG9rIGhlcmUgYXMgdGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGggbm9ybWFsaXplZCBkaXJlY3RpdmVcbiAgICAvLyBtZXRhZGF0YSwgd2hpY2ggYWx3YXlzIGZpbGxzIGluIHRoZSBzZWxlY3Rvci5cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IENzc1NlbGVjdG9yLnBhcnNlKGNvbXBNZXRhLnNlbGVjdG9yICEpWzBdLmdldE1hdGNoaW5nRWxlbWVudFRlbXBsYXRlKCk7XG4gICAgY29uc3QgdGVtcGxhdGVVcmwgPSAnJztcbiAgICBjb25zdCBodG1sQXN0ID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZSh0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwpO1xuICAgIHJldHVybiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLmNyZWF0ZSh7XG4gICAgICBpc0hvc3Q6IHRydWUsXG4gICAgICB0eXBlOiB7cmVmZXJlbmNlOiBob3N0VHlwZSwgZGlEZXBzOiBbXSwgbGlmZWN5Y2xlSG9va3M6IFtdfSxcbiAgICAgIHRlbXBsYXRlOiBuZXcgY3BsLkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgIHRlbXBsYXRlVXJsLFxuICAgICAgICBodG1sQXN0LFxuICAgICAgICBzdHlsZXM6IFtdLFxuICAgICAgICBzdHlsZVVybHM6IFtdLFxuICAgICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IFtdLFxuICAgICAgICBhbmltYXRpb25zOiBbXSxcbiAgICAgICAgaXNJbmxpbmU6IHRydWUsXG4gICAgICAgIGV4dGVybmFsU3R5bGVzaGVldHM6IFtdLFxuICAgICAgICBpbnRlcnBvbGF0aW9uOiBudWxsLFxuICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZSxcbiAgICAgIH0pLFxuICAgICAgZXhwb3J0QXM6IG51bGwsXG4gICAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gICAgICBpbnB1dHM6IFtdLFxuICAgICAgb3V0cHV0czogW10sXG4gICAgICBob3N0OiB7fSxcbiAgICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgICAgc2VsZWN0b3I6ICcqJyxcbiAgICAgIHByb3ZpZGVyczogW10sXG4gICAgICB2aWV3UHJvdmlkZXJzOiBbXSxcbiAgICAgIHF1ZXJpZXM6IFtdLFxuICAgICAgZ3VhcmRzOiB7fSxcbiAgICAgIHZpZXdRdWVyaWVzOiBbXSxcbiAgICAgIGNvbXBvbmVudFZpZXdUeXBlOiBob3N0Vmlld1R5cGUsXG4gICAgICByZW5kZXJlclR5cGU6XG4gICAgICAgICAge2lkOiAnX19Ib3N0X18nLCBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLCBzdHlsZXM6IFtdLCBkYXRhOiB7fX0gYXMgb2JqZWN0LFxuICAgICAgZW50cnlDb21wb25lbnRzOiBbXSxcbiAgICAgIGNvbXBvbmVudEZhY3Rvcnk6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWREaXJlY3RpdmVNZXRhZGF0YShuZ01vZHVsZVR5cGU6IGFueSwgZGlyZWN0aXZlVHlwZTogYW55LCBpc1N5bmM6IGJvb2xlYW4pOiBTeW5jQXN5bmM8bnVsbD4ge1xuICAgIGlmICh0aGlzLl9kaXJlY3RpdmVDYWNoZS5oYXMoZGlyZWN0aXZlVHlwZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBkaXJlY3RpdmVUeXBlID0gcmVzb2x2ZUZvcndhcmRSZWYoZGlyZWN0aXZlVHlwZSk7XG4gICAgY29uc3Qge2Fubm90YXRpb24sIG1ldGFkYXRhfSA9IHRoaXMuZ2V0Tm9uTm9ybWFsaXplZERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUpICE7XG5cbiAgICBjb25zdCBjcmVhdGVEaXJlY3RpdmVNZXRhZGF0YSA9ICh0ZW1wbGF0ZU1ldGFkYXRhOiBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEgfCBudWxsKSA9PiB7XG4gICAgICBjb25zdCBub3JtYWxpemVkRGlyTWV0YSA9IG5ldyBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgICAgaXNIb3N0OiBmYWxzZSxcbiAgICAgICAgdHlwZTogbWV0YWRhdGEudHlwZSxcbiAgICAgICAgaXNDb21wb25lbnQ6IG1ldGFkYXRhLmlzQ29tcG9uZW50LFxuICAgICAgICBzZWxlY3RvcjogbWV0YWRhdGEuc2VsZWN0b3IsXG4gICAgICAgIGV4cG9ydEFzOiBtZXRhZGF0YS5leHBvcnRBcyxcbiAgICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBtZXRhZGF0YS5jaGFuZ2VEZXRlY3Rpb24sXG4gICAgICAgIGlucHV0czogbWV0YWRhdGEuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBtZXRhZGF0YS5vdXRwdXRzLFxuICAgICAgICBob3N0TGlzdGVuZXJzOiBtZXRhZGF0YS5ob3N0TGlzdGVuZXJzLFxuICAgICAgICBob3N0UHJvcGVydGllczogbWV0YWRhdGEuaG9zdFByb3BlcnRpZXMsXG4gICAgICAgIGhvc3RBdHRyaWJ1dGVzOiBtZXRhZGF0YS5ob3N0QXR0cmlidXRlcyxcbiAgICAgICAgcHJvdmlkZXJzOiBtZXRhZGF0YS5wcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IG1ldGFkYXRhLnZpZXdQcm92aWRlcnMsXG4gICAgICAgIHF1ZXJpZXM6IG1ldGFkYXRhLnF1ZXJpZXMsXG4gICAgICAgIGd1YXJkczogbWV0YWRhdGEuZ3VhcmRzLFxuICAgICAgICB2aWV3UXVlcmllczogbWV0YWRhdGEudmlld1F1ZXJpZXMsXG4gICAgICAgIGVudHJ5Q29tcG9uZW50czogbWV0YWRhdGEuZW50cnlDb21wb25lbnRzLFxuICAgICAgICBjb21wb25lbnRWaWV3VHlwZTogbWV0YWRhdGEuY29tcG9uZW50Vmlld1R5cGUsXG4gICAgICAgIHJlbmRlcmVyVHlwZTogbWV0YWRhdGEucmVuZGVyZXJUeXBlLFxuICAgICAgICBjb21wb25lbnRGYWN0b3J5OiBtZXRhZGF0YS5jb21wb25lbnRGYWN0b3J5LFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVNZXRhZGF0YVxuICAgICAgfSk7XG4gICAgICBpZiAodGVtcGxhdGVNZXRhZGF0YSkge1xuICAgICAgICB0aGlzLmluaXRDb21wb25lbnRGYWN0b3J5KG1ldGFkYXRhLmNvbXBvbmVudEZhY3RvcnkgISwgdGVtcGxhdGVNZXRhZGF0YS5uZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIG5vcm1hbGl6ZWREaXJNZXRhKTtcbiAgICAgIHRoaXMuX3N1bW1hcnlDYWNoZS5zZXQoZGlyZWN0aXZlVHlwZSwgbm9ybWFsaXplZERpck1ldGEudG9TdW1tYXJ5KCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIGlmIChtZXRhZGF0YS5pc0NvbXBvbmVudCkge1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSBtZXRhZGF0YS50ZW1wbGF0ZSAhO1xuICAgICAgY29uc3QgdGVtcGxhdGVNZXRhID0gdGhpcy5fZGlyZWN0aXZlTm9ybWFsaXplci5ub3JtYWxpemVUZW1wbGF0ZSh7XG4gICAgICAgIG5nTW9kdWxlVHlwZSxcbiAgICAgICAgY29tcG9uZW50VHlwZTogZGlyZWN0aXZlVHlwZSxcbiAgICAgICAgbW9kdWxlVXJsOiB0aGlzLl9yZWZsZWN0b3IuY29tcG9uZW50TW9kdWxlVXJsKGRpcmVjdGl2ZVR5cGUsIGFubm90YXRpb24pLFxuICAgICAgICBlbmNhcHN1bGF0aW9uOiB0ZW1wbGF0ZS5lbmNhcHN1bGF0aW9uLFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUudGVtcGxhdGUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZS50ZW1wbGF0ZVVybCxcbiAgICAgICAgc3R5bGVzOiB0ZW1wbGF0ZS5zdHlsZXMsXG4gICAgICAgIHN0eWxlVXJsczogdGVtcGxhdGUuc3R5bGVVcmxzLFxuICAgICAgICBhbmltYXRpb25zOiB0ZW1wbGF0ZS5hbmltYXRpb25zLFxuICAgICAgICBpbnRlcnBvbGF0aW9uOiB0ZW1wbGF0ZS5pbnRlcnBvbGF0aW9uLFxuICAgICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiB0ZW1wbGF0ZS5wcmVzZXJ2ZVdoaXRlc3BhY2VzXG4gICAgICB9KTtcbiAgICAgIGlmIChpc1Byb21pc2UodGVtcGxhdGVNZXRhKSAmJiBpc1N5bmMpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoY29tcG9uZW50U3RpbGxMb2FkaW5nRXJyb3IoZGlyZWN0aXZlVHlwZSksIGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBTeW5jQXN5bmMudGhlbih0ZW1wbGF0ZU1ldGEsIGNyZWF0ZURpcmVjdGl2ZU1ldGFkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGlyZWN0aXZlXG4gICAgICBjcmVhdGVEaXJlY3RpdmVNZXRhZGF0YShudWxsKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlOiBhbnkpOlxuICAgICAge2Fubm90YXRpb246IERpcmVjdGl2ZSwgbWV0YWRhdGE6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGF9fG51bGwge1xuICAgIGRpcmVjdGl2ZVR5cGUgPSByZXNvbHZlRm9yd2FyZFJlZihkaXJlY3RpdmVUeXBlKTtcbiAgICBpZiAoIWRpcmVjdGl2ZVR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgY2FjaGVFbnRyeSA9IHRoaXMuX25vbk5vcm1hbGl6ZWREaXJlY3RpdmVDYWNoZS5nZXQoZGlyZWN0aXZlVHlwZSk7XG4gICAgaWYgKGNhY2hlRW50cnkpIHtcbiAgICAgIHJldHVybiBjYWNoZUVudHJ5O1xuICAgIH1cbiAgICBjb25zdCBkaXJNZXRhID0gdGhpcy5fZGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlLCBmYWxzZSk7XG4gICAgaWYgKCFkaXJNZXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IG5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhOiBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEgPSB1bmRlZmluZWQgITtcblxuICAgIGlmIChjcmVhdGVDb21wb25lbnQuaXNUeXBlT2YoZGlyTWV0YSkpIHtcbiAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgY29uc3QgY29tcE1ldGEgPSBkaXJNZXRhIGFzIENvbXBvbmVudDtcbiAgICAgIGFzc2VydEFycmF5T2ZTdHJpbmdzKCdzdHlsZXMnLCBjb21wTWV0YS5zdHlsZXMpO1xuICAgICAgYXNzZXJ0QXJyYXlPZlN0cmluZ3MoJ3N0eWxlVXJscycsIGNvbXBNZXRhLnN0eWxlVXJscyk7XG4gICAgICBhc3NlcnRJbnRlcnBvbGF0aW9uU3ltYm9scygnaW50ZXJwb2xhdGlvbicsIGNvbXBNZXRhLmludGVycG9sYXRpb24pO1xuXG4gICAgICBjb25zdCBhbmltYXRpb25zID0gY29tcE1ldGEuYW5pbWF0aW9ucztcblxuICAgICAgbm9uTm9ybWFsaXplZFRlbXBsYXRlTWV0YWRhdGEgPSBuZXcgY3BsLkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgICAgZW5jYXBzdWxhdGlvbjogbm9VbmRlZmluZWQoY29tcE1ldGEuZW5jYXBzdWxhdGlvbiksXG4gICAgICAgIHRlbXBsYXRlOiBub1VuZGVmaW5lZChjb21wTWV0YS50ZW1wbGF0ZSksXG4gICAgICAgIHRlbXBsYXRlVXJsOiBub1VuZGVmaW5lZChjb21wTWV0YS50ZW1wbGF0ZVVybCksXG4gICAgICAgIGh0bWxBc3Q6IG51bGwsXG4gICAgICAgIHN0eWxlczogY29tcE1ldGEuc3R5bGVzIHx8IFtdLFxuICAgICAgICBzdHlsZVVybHM6IGNvbXBNZXRhLnN0eWxlVXJscyB8fCBbXSxcbiAgICAgICAgYW5pbWF0aW9uczogYW5pbWF0aW9ucyB8fCBbXSxcbiAgICAgICAgaW50ZXJwb2xhdGlvbjogbm9VbmRlZmluZWQoY29tcE1ldGEuaW50ZXJwb2xhdGlvbiksXG4gICAgICAgIGlzSW5saW5lOiAhIWNvbXBNZXRhLnRlbXBsYXRlLFxuICAgICAgICBleHRlcm5hbFN0eWxlc2hlZXRzOiBbXSxcbiAgICAgICAgbmdDb250ZW50U2VsZWN0b3JzOiBbXSxcbiAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogbm9VbmRlZmluZWQoZGlyTWV0YS5wcmVzZXJ2ZVdoaXRlc3BhY2VzKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBudWxsICE7XG4gICAgbGV0IHZpZXdQcm92aWRlcnM6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW107XG4gICAgbGV0IGVudHJ5Q29tcG9uZW50TWV0YWRhdGE6IGNwbC5Db21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdID0gW107XG4gICAgbGV0IHNlbGVjdG9yID0gZGlyTWV0YS5zZWxlY3RvcjtcblxuICAgIGlmIChjcmVhdGVDb21wb25lbnQuaXNUeXBlT2YoZGlyTWV0YSkpIHtcbiAgICAgIC8vIENvbXBvbmVudFxuICAgICAgY29uc3QgY29tcE1ldGEgPSBkaXJNZXRhIGFzIENvbXBvbmVudDtcbiAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gY29tcE1ldGEuY2hhbmdlRGV0ZWN0aW9uICE7XG4gICAgICBpZiAoY29tcE1ldGEudmlld1Byb3ZpZGVycykge1xuICAgICAgICB2aWV3UHJvdmlkZXJzID0gdGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICAgICAgICBjb21wTWV0YS52aWV3UHJvdmlkZXJzLCBlbnRyeUNvbXBvbmVudE1ldGFkYXRhLFxuICAgICAgICAgICAgYHZpZXdQcm92aWRlcnMgZm9yIFwiJHtzdHJpbmdpZnlUeXBlKGRpcmVjdGl2ZVR5cGUpfVwiYCwgW10sIGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgfVxuICAgICAgaWYgKGNvbXBNZXRhLmVudHJ5Q29tcG9uZW50cykge1xuICAgICAgICBlbnRyeUNvbXBvbmVudE1ldGFkYXRhID0gZmxhdHRlbkFuZERlZHVwZUFycmF5KGNvbXBNZXRhLmVudHJ5Q29tcG9uZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKCh0eXBlKSA9PiB0aGlzLl9nZXRFbnRyeUNvbXBvbmVudE1ldGFkYXRhKHR5cGUpICEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdChlbnRyeUNvbXBvbmVudE1ldGFkYXRhKTtcbiAgICAgIH1cbiAgICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgICAgc2VsZWN0b3IgPSB0aGlzLl9zY2hlbWFSZWdpc3RyeS5nZXREZWZhdWx0Q29tcG9uZW50RWxlbWVudE5hbWUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGlyZWN0aXZlXG4gICAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgYERpcmVjdGl2ZSAke3N0cmluZ2lmeVR5cGUoZGlyZWN0aXZlVHlwZSl9IGhhcyBubyBzZWxlY3RvciwgcGxlYXNlIGFkZCBpdCFgKSxcbiAgICAgICAgICAgIGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgICBzZWxlY3RvciA9ICdlcnJvcic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHByb3ZpZGVyczogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhW10gPSBbXTtcbiAgICBpZiAoZGlyTWV0YS5wcm92aWRlcnMgIT0gbnVsbCkge1xuICAgICAgcHJvdmlkZXJzID0gdGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICAgICAgZGlyTWV0YS5wcm92aWRlcnMsIGVudHJ5Q29tcG9uZW50TWV0YWRhdGEsXG4gICAgICAgICAgYHByb3ZpZGVycyBmb3IgXCIke3N0cmluZ2lmeVR5cGUoZGlyZWN0aXZlVHlwZSl9XCJgLCBbXSwgZGlyZWN0aXZlVHlwZSk7XG4gICAgfVxuICAgIGxldCBxdWVyaWVzOiBjcGwuQ29tcGlsZVF1ZXJ5TWV0YWRhdGFbXSA9IFtdO1xuICAgIGxldCB2aWV3UXVlcmllczogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10gPSBbXTtcbiAgICBpZiAoZGlyTWV0YS5xdWVyaWVzICE9IG51bGwpIHtcbiAgICAgIHF1ZXJpZXMgPSB0aGlzLl9nZXRRdWVyaWVzTWV0YWRhdGEoZGlyTWV0YS5xdWVyaWVzLCBmYWxzZSwgZGlyZWN0aXZlVHlwZSk7XG4gICAgICB2aWV3UXVlcmllcyA9IHRoaXMuX2dldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIHRydWUsIGRpcmVjdGl2ZVR5cGUpO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGFkYXRhID0gY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgICAgaXNIb3N0OiBmYWxzZSxcbiAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgIGV4cG9ydEFzOiBub1VuZGVmaW5lZChkaXJNZXRhLmV4cG9ydEFzKSxcbiAgICAgIGlzQ29tcG9uZW50OiAhIW5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhLFxuICAgICAgdHlwZTogdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUpLFxuICAgICAgdGVtcGxhdGU6IG5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhLFxuICAgICAgY2hhbmdlRGV0ZWN0aW9uOiBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICAgIGlucHV0czogZGlyTWV0YS5pbnB1dHMgfHwgW10sXG4gICAgICBvdXRwdXRzOiBkaXJNZXRhLm91dHB1dHMgfHwgW10sXG4gICAgICBob3N0OiBkaXJNZXRhLmhvc3QgfHwge30sXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyB8fCBbXSxcbiAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnMgfHwgW10sXG4gICAgICBxdWVyaWVzOiBxdWVyaWVzIHx8IFtdLFxuICAgICAgZ3VhcmRzOiBkaXJNZXRhLmd1YXJkcyB8fCB7fSxcbiAgICAgIHZpZXdRdWVyaWVzOiB2aWV3UXVlcmllcyB8fCBbXSxcbiAgICAgIGVudHJ5Q29tcG9uZW50czogZW50cnlDb21wb25lbnRNZXRhZGF0YSxcbiAgICAgIGNvbXBvbmVudFZpZXdUeXBlOiBub25Ob3JtYWxpemVkVGVtcGxhdGVNZXRhZGF0YSA/IHRoaXMuZ2V0Q29tcG9uZW50Vmlld0NsYXNzKGRpcmVjdGl2ZVR5cGUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICByZW5kZXJlclR5cGU6IG5vbk5vcm1hbGl6ZWRUZW1wbGF0ZU1ldGFkYXRhID8gdGhpcy5nZXRSZW5kZXJlclR5cGUoZGlyZWN0aXZlVHlwZSkgOiBudWxsLFxuICAgICAgY29tcG9uZW50RmFjdG9yeTogbnVsbFxuICAgIH0pO1xuICAgIGlmIChub25Ob3JtYWxpemVkVGVtcGxhdGVNZXRhZGF0YSkge1xuICAgICAgbWV0YWRhdGEuY29tcG9uZW50RmFjdG9yeSA9XG4gICAgICAgICAgdGhpcy5nZXRDb21wb25lbnRGYWN0b3J5KHNlbGVjdG9yLCBkaXJlY3RpdmVUeXBlLCBtZXRhZGF0YS5pbnB1dHMsIG1ldGFkYXRhLm91dHB1dHMpO1xuICAgIH1cbiAgICBjYWNoZUVudHJ5ID0ge21ldGFkYXRhLCBhbm5vdGF0aW9uOiBkaXJNZXRhfTtcbiAgICB0aGlzLl9ub25Ob3JtYWxpemVkRGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIGNhY2hlRW50cnkpO1xuICAgIHJldHVybiBjYWNoZUVudHJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1ldGFkYXRhIGZvciB0aGUgZ2l2ZW4gZGlyZWN0aXZlLlxuICAgKiBUaGlzIGFzc3VtZXMgYGxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YWAgaGFzIGJlZW4gY2FsbGVkIGZpcnN0LlxuICAgKi9cbiAgZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZTogYW55KTogY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgY29uc3QgZGlyTWV0YSA9IHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmdldChkaXJlY3RpdmVUeXBlKSAhO1xuICAgIGlmICghZGlyTWV0YSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBnZXREaXJlY3RpdmVNZXRhZGF0YSBjYW4gb25seSBiZSBjYWxsZWQgYWZ0ZXIgbG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhIGZvciBhIG1vZHVsZSB0aGF0IGRlY2xhcmVzIGl0LiBEaXJlY3RpdmUgJHtzdHJpbmdpZnlUeXBlKGRpcmVjdGl2ZVR5cGUpfS5gKSxcbiAgICAgICAgICBkaXJlY3RpdmVUeXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpck1ldGE7XG4gIH1cblxuICBnZXREaXJlY3RpdmVTdW1tYXJ5KGRpclR5cGU6IGFueSk6IGNwbC5Db21waWxlRGlyZWN0aXZlU3VtbWFyeSB7XG4gICAgY29uc3QgZGlyU3VtbWFyeSA9XG4gICAgICAgIDxjcGwuQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnk+dGhpcy5fbG9hZFN1bW1hcnkoZGlyVHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUpO1xuICAgIGlmICghZGlyU3VtbWFyeSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBDb3VsZCBub3QgbG9hZCB0aGUgc3VtbWFyeSBmb3IgZGlyZWN0aXZlICR7c3RyaW5naWZ5VHlwZShkaXJUeXBlKX0uYCksXG4gICAgICAgICAgZGlyVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBkaXJTdW1tYXJ5O1xuICB9XG5cbiAgaXNEaXJlY3RpdmUodHlwZTogYW55KSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbG9hZFN1bW1hcnkodHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUpIHx8XG4gICAgICAgIHRoaXMuX2RpcmVjdGl2ZVJlc29sdmVyLmlzRGlyZWN0aXZlKHR5cGUpO1xuICB9XG5cbiAgaXNQaXBlKHR5cGU6IGFueSkge1xuICAgIHJldHVybiAhIXRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuUGlwZSkgfHxcbiAgICAgICAgdGhpcy5fcGlwZVJlc29sdmVyLmlzUGlwZSh0eXBlKTtcbiAgfVxuXG4gIGlzTmdNb2R1bGUodHlwZTogYW55KSB7XG4gICAgcmV0dXJuICEhdGhpcy5fbG9hZFN1bW1hcnkodHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5OZ01vZHVsZSkgfHxcbiAgICAgICAgdGhpcy5fbmdNb2R1bGVSZXNvbHZlci5pc05nTW9kdWxlKHR5cGUpO1xuICB9XG5cbiAgZ2V0TmdNb2R1bGVTdW1tYXJ5KG1vZHVsZVR5cGU6IGFueSwgYWxyZWFkeUNvbGxlY3Rpbmc6IFNldDxhbnk+fG51bGwgPSBudWxsKTpcbiAgICAgIGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5fG51bGwge1xuICAgIGxldCBtb2R1bGVTdW1tYXJ5OiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeXxudWxsID1cbiAgICAgICAgPGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5PnRoaXMuX2xvYWRTdW1tYXJ5KG1vZHVsZVR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuTmdNb2R1bGUpO1xuICAgIGlmICghbW9kdWxlU3VtbWFyeSkge1xuICAgICAgY29uc3QgbW9kdWxlTWV0YSA9IHRoaXMuZ2V0TmdNb2R1bGVNZXRhZGF0YShtb2R1bGVUeXBlLCBmYWxzZSwgYWxyZWFkeUNvbGxlY3RpbmcpO1xuICAgICAgbW9kdWxlU3VtbWFyeSA9IG1vZHVsZU1ldGEgPyBtb2R1bGVNZXRhLnRvU3VtbWFyeSgpIDogbnVsbDtcbiAgICAgIGlmIChtb2R1bGVTdW1tYXJ5KSB7XG4gICAgICAgIHRoaXMuX3N1bW1hcnlDYWNoZS5zZXQobW9kdWxlVHlwZSwgbW9kdWxlU3VtbWFyeSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtb2R1bGVTdW1tYXJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIHRoZSBkZWNsYXJlZCBkaXJlY3RpdmVzIGFuZCBwaXBlcyBvZiBhbiBOZ01vZHVsZS5cbiAgICovXG4gIGxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YShtb2R1bGVUeXBlOiBhbnksIGlzU3luYzogYm9vbGVhbiwgdGhyb3dJZk5vdEZvdW5kID0gdHJ1ZSk6XG4gICAgICBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IG5nTW9kdWxlID0gdGhpcy5nZXROZ01vZHVsZU1ldGFkYXRhKG1vZHVsZVR5cGUsIHRocm93SWZOb3RGb3VuZCk7XG4gICAgY29uc3QgbG9hZGluZzogUHJvbWlzZTxhbnk+W10gPSBbXTtcbiAgICBpZiAobmdNb2R1bGUpIHtcbiAgICAgIG5nTW9kdWxlLmRlY2xhcmVkRGlyZWN0aXZlcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5sb2FkRGlyZWN0aXZlTWV0YWRhdGEobW9kdWxlVHlwZSwgaWQucmVmZXJlbmNlLCBpc1N5bmMpO1xuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgIGxvYWRpbmcucHVzaChwcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBuZ01vZHVsZS5kZWNsYXJlZFBpcGVzLmZvckVhY2goKGlkKSA9PiB0aGlzLl9sb2FkUGlwZU1ldGFkYXRhKGlkLnJlZmVyZW5jZSkpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobG9hZGluZyk7XG4gIH1cblxuICBnZXRTaGFsbG93TW9kdWxlTWV0YWRhdGEobW9kdWxlVHlwZTogYW55KTogY3BsLkNvbXBpbGVTaGFsbG93TW9kdWxlTWV0YWRhdGF8bnVsbCB7XG4gICAgbGV0IGNvbXBpbGVNZXRhID0gdGhpcy5fc2hhbGxvd01vZHVsZUNhY2hlLmdldChtb2R1bGVUeXBlKTtcbiAgICBpZiAoY29tcGlsZU1ldGEpIHtcbiAgICAgIHJldHVybiBjb21waWxlTWV0YTtcbiAgICB9XG5cbiAgICBjb25zdCBuZ01vZHVsZU1ldGEgPVxuICAgICAgICBmaW5kTGFzdCh0aGlzLl9yZWZsZWN0b3Iuc2hhbGxvd0Fubm90YXRpb25zKG1vZHVsZVR5cGUpLCBjcmVhdGVOZ01vZHVsZS5pc1R5cGVPZik7XG5cbiAgICBjb21waWxlTWV0YSA9IHtcbiAgICAgIHR5cGU6IHRoaXMuX2dldFR5cGVNZXRhZGF0YShtb2R1bGVUeXBlKSxcbiAgICAgIHJhd0V4cG9ydHM6IG5nTW9kdWxlTWV0YS5leHBvcnRzLFxuICAgICAgcmF3SW1wb3J0czogbmdNb2R1bGVNZXRhLmltcG9ydHMsXG4gICAgICByYXdQcm92aWRlcnM6IG5nTW9kdWxlTWV0YS5wcm92aWRlcnMsXG4gICAgfTtcblxuICAgIHRoaXMuX3NoYWxsb3dNb2R1bGVDYWNoZS5zZXQobW9kdWxlVHlwZSwgY29tcGlsZU1ldGEpO1xuICAgIHJldHVybiBjb21waWxlTWV0YTtcbiAgfVxuXG4gIGdldE5nTW9kdWxlTWV0YWRhdGEoXG4gICAgICBtb2R1bGVUeXBlOiBhbnksIHRocm93SWZOb3RGb3VuZCA9IHRydWUsXG4gICAgICBhbHJlYWR5Q29sbGVjdGluZzogU2V0PGFueT58bnVsbCA9IG51bGwpOiBjcGwuQ29tcGlsZU5nTW9kdWxlTWV0YWRhdGF8bnVsbCB7XG4gICAgbW9kdWxlVHlwZSA9IHJlc29sdmVGb3J3YXJkUmVmKG1vZHVsZVR5cGUpO1xuICAgIGxldCBjb21waWxlTWV0YSA9IHRoaXMuX25nTW9kdWxlQ2FjaGUuZ2V0KG1vZHVsZVR5cGUpO1xuICAgIGlmIChjb21waWxlTWV0YSkge1xuICAgICAgcmV0dXJuIGNvbXBpbGVNZXRhO1xuICAgIH1cbiAgICBjb25zdCBtZXRhID0gdGhpcy5fbmdNb2R1bGVSZXNvbHZlci5yZXNvbHZlKG1vZHVsZVR5cGUsIHRocm93SWZOb3RGb3VuZCk7XG4gICAgaWYgKCFtZXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZGVjbGFyZWREaXJlY3RpdmVzOiBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3QgZXhwb3J0ZWROb25Nb2R1bGVJZGVudGlmaWVyczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGRlY2xhcmVkUGlwZXM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBpbXBvcnRlZE1vZHVsZXM6IGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5W10gPSBbXTtcbiAgICBjb25zdCBleHBvcnRlZE1vZHVsZXM6IGNwbC5Db21waWxlTmdNb2R1bGVTdW1tYXJ5W10gPSBbXTtcbiAgICBjb25zdCBwcm92aWRlcnM6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3QgZW50cnlDb21wb25lbnRzOiBjcGwuQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGJvb3RzdHJhcENvbXBvbmVudHM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBzY2hlbWFzOiBTY2hlbWFNZXRhZGF0YVtdID0gW107XG5cbiAgICBpZiAobWV0YS5pbXBvcnRzKSB7XG4gICAgICBmbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5pbXBvcnRzKS5mb3JFYWNoKChpbXBvcnRlZFR5cGUpID0+IHtcbiAgICAgICAgbGV0IGltcG9ydGVkTW9kdWxlVHlwZTogVHlwZSA9IHVuZGVmaW5lZCAhO1xuICAgICAgICBpZiAoaXNWYWxpZFR5cGUoaW1wb3J0ZWRUeXBlKSkge1xuICAgICAgICAgIGltcG9ydGVkTW9kdWxlVHlwZSA9IGltcG9ydGVkVHlwZTtcbiAgICAgICAgfSBlbHNlIGlmIChpbXBvcnRlZFR5cGUgJiYgaW1wb3J0ZWRUeXBlLm5nTW9kdWxlKSB7XG4gICAgICAgICAgY29uc3QgbW9kdWxlV2l0aFByb3ZpZGVyczogTW9kdWxlV2l0aFByb3ZpZGVycyA9IGltcG9ydGVkVHlwZTtcbiAgICAgICAgICBpbXBvcnRlZE1vZHVsZVR5cGUgPSBtb2R1bGVXaXRoUHJvdmlkZXJzLm5nTW9kdWxlO1xuICAgICAgICAgIGlmIChtb2R1bGVXaXRoUHJvdmlkZXJzLnByb3ZpZGVycykge1xuICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2goLi4udGhpcy5fZ2V0UHJvdmlkZXJzTWV0YWRhdGEoXG4gICAgICAgICAgICAgICAgbW9kdWxlV2l0aFByb3ZpZGVycy5wcm92aWRlcnMsIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICBgcHJvdmlkZXIgZm9yIHRoZSBOZ01vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKGltcG9ydGVkTW9kdWxlVHlwZSl9J2AsIFtdLFxuICAgICAgICAgICAgICAgIGltcG9ydGVkVHlwZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbXBvcnRlZE1vZHVsZVR5cGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5fY2hlY2tTZWxmSW1wb3J0KG1vZHVsZVR5cGUsIGltcG9ydGVkTW9kdWxlVHlwZSkpIHJldHVybjtcbiAgICAgICAgICBpZiAoIWFscmVhZHlDb2xsZWN0aW5nKSBhbHJlYWR5Q29sbGVjdGluZyA9IG5ldyBTZXQoKTtcbiAgICAgICAgICBpZiAoYWxyZWFkeUNvbGxlY3RpbmcuaGFzKGltcG9ydGVkTW9kdWxlVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihpbXBvcnRlZE1vZHVsZVR5cGUpfSAnJHtzdHJpbmdpZnlUeXBlKGltcG9ydGVkVHlwZSl9JyBpcyBpbXBvcnRlZCByZWN1cnNpdmVseSBieSB0aGUgbW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9Jy5gKSxcbiAgICAgICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxyZWFkeUNvbGxlY3RpbmcuYWRkKGltcG9ydGVkTW9kdWxlVHlwZSk7XG4gICAgICAgICAgY29uc3QgaW1wb3J0ZWRNb2R1bGVTdW1tYXJ5ID1cbiAgICAgICAgICAgICAgdGhpcy5nZXROZ01vZHVsZVN1bW1hcnkoaW1wb3J0ZWRNb2R1bGVUeXBlLCBhbHJlYWR5Q29sbGVjdGluZyk7XG4gICAgICAgICAgYWxyZWFkeUNvbGxlY3RpbmcuZGVsZXRlKGltcG9ydGVkTW9kdWxlVHlwZSk7XG4gICAgICAgICAgaWYgKCFpbXBvcnRlZE1vZHVsZVN1bW1hcnkpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCAke3RoaXMuX2dldFR5cGVEZXNjcmlwdG9yKGltcG9ydGVkVHlwZSl9ICcke3N0cmluZ2lmeVR5cGUoaW1wb3J0ZWRUeXBlKX0nIGltcG9ydGVkIGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nLiBQbGVhc2UgYWRkIGEgQE5nTW9kdWxlIGFubm90YXRpb24uYCksXG4gICAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGltcG9ydGVkTW9kdWxlcy5wdXNoKGltcG9ydGVkTW9kdWxlU3VtbWFyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgdmFsdWUgJyR7c3RyaW5naWZ5VHlwZShpbXBvcnRlZFR5cGUpfScgaW1wb3J0ZWQgYnkgdGhlIG1vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfSdgKSxcbiAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobWV0YS5leHBvcnRzKSB7XG4gICAgICBmbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5leHBvcnRzKS5mb3JFYWNoKChleHBvcnRlZFR5cGUpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkVHlwZShleHBvcnRlZFR5cGUpKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgdmFsdWUgJyR7c3RyaW5naWZ5VHlwZShleHBvcnRlZFR5cGUpfScgZXhwb3J0ZWQgYnkgdGhlIG1vZHVsZSAnJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfSdgKSxcbiAgICAgICAgICAgICAgbW9kdWxlVHlwZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYWxyZWFkeUNvbGxlY3RpbmcpIGFscmVhZHlDb2xsZWN0aW5nID0gbmV3IFNldCgpO1xuICAgICAgICBpZiAoYWxyZWFkeUNvbGxlY3RpbmcuaGFzKGV4cG9ydGVkVHlwZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgICBgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihleHBvcnRlZFR5cGUpfSAnJHtzdHJpbmdpZnkoZXhwb3J0ZWRUeXBlKX0nIGlzIGV4cG9ydGVkIHJlY3Vyc2l2ZWx5IGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5Q29sbGVjdGluZy5hZGQoZXhwb3J0ZWRUeXBlKTtcbiAgICAgICAgY29uc3QgZXhwb3J0ZWRNb2R1bGVTdW1tYXJ5ID0gdGhpcy5nZXROZ01vZHVsZVN1bW1hcnkoZXhwb3J0ZWRUeXBlLCBhbHJlYWR5Q29sbGVjdGluZyk7XG4gICAgICAgIGFscmVhZHlDb2xsZWN0aW5nLmRlbGV0ZShleHBvcnRlZFR5cGUpO1xuICAgICAgICBpZiAoZXhwb3J0ZWRNb2R1bGVTdW1tYXJ5KSB7XG4gICAgICAgICAgZXhwb3J0ZWRNb2R1bGVzLnB1c2goZXhwb3J0ZWRNb2R1bGVTdW1tYXJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBvcnRlZE5vbk1vZHVsZUlkZW50aWZpZXJzLnB1c2godGhpcy5fZ2V0SWRlbnRpZmllck1ldGFkYXRhKGV4cG9ydGVkVHlwZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBOb3RlOiBUaGlzIHdpbGwgYmUgbW9kaWZpZWQgbGF0ZXIsIHNvIHdlIHJlbHkgb25cbiAgICAvLyBnZXR0aW5nIGEgbmV3IGluc3RhbmNlIGV2ZXJ5IHRpbWUhXG4gICAgY29uc3QgdHJhbnNpdGl2ZU1vZHVsZSA9IHRoaXMuX2dldFRyYW5zaXRpdmVOZ01vZHVsZU1ldGFkYXRhKGltcG9ydGVkTW9kdWxlcywgZXhwb3J0ZWRNb2R1bGVzKTtcbiAgICBpZiAobWV0YS5kZWNsYXJhdGlvbnMpIHtcbiAgICAgIGZsYXR0ZW5BbmREZWR1cGVBcnJheShtZXRhLmRlY2xhcmF0aW9ucykuZm9yRWFjaCgoZGVjbGFyZWRUeXBlKSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZFR5cGUoZGVjbGFyZWRUeXBlKSkge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICBzeW50YXhFcnJvcihcbiAgICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIHZhbHVlICcke3N0cmluZ2lmeVR5cGUoZGVjbGFyZWRUeXBlKX0nIGRlY2xhcmVkIGJ5IHRoZSBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWNsYXJlZElkZW50aWZpZXIgPSB0aGlzLl9nZXRJZGVudGlmaWVyTWV0YWRhdGEoZGVjbGFyZWRUeXBlKTtcbiAgICAgICAgaWYgKHRoaXMuaXNEaXJlY3RpdmUoZGVjbGFyZWRUeXBlKSkge1xuICAgICAgICAgIHRyYW5zaXRpdmVNb2R1bGUuYWRkRGlyZWN0aXZlKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgZGVjbGFyZWREaXJlY3RpdmVzLnB1c2goZGVjbGFyZWRJZGVudGlmaWVyKTtcbiAgICAgICAgICB0aGlzLl9hZGRUeXBlVG9Nb2R1bGUoZGVjbGFyZWRUeXBlLCBtb2R1bGVUeXBlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUGlwZShkZWNsYXJlZFR5cGUpKSB7XG4gICAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRQaXBlKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5waXBlcy5wdXNoKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgZGVjbGFyZWRQaXBlcy5wdXNoKGRlY2xhcmVkSWRlbnRpZmllcik7XG4gICAgICAgICAgdGhpcy5fYWRkVHlwZVRvTW9kdWxlKGRlY2xhcmVkVHlwZSwgbW9kdWxlVHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihkZWNsYXJlZFR5cGUpfSAnJHtzdHJpbmdpZnlUeXBlKGRlY2xhcmVkVHlwZSl9JyBkZWNsYXJlZCBieSB0aGUgbW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9Jy4gUGxlYXNlIGFkZCBhIEBQaXBlL0BEaXJlY3RpdmUvQENvbXBvbmVudCBhbm5vdGF0aW9uLmApLFxuICAgICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGV4cG9ydGVkRGlyZWN0aXZlczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IGV4cG9ydGVkUGlwZXM6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhW10gPSBbXTtcbiAgICBleHBvcnRlZE5vbk1vZHVsZUlkZW50aWZpZXJzLmZvckVhY2goKGV4cG9ydGVkSWQpID0+IHtcbiAgICAgIGlmICh0cmFuc2l0aXZlTW9kdWxlLmRpcmVjdGl2ZXNTZXQuaGFzKGV4cG9ydGVkSWQucmVmZXJlbmNlKSkge1xuICAgICAgICBleHBvcnRlZERpcmVjdGl2ZXMucHVzaChleHBvcnRlZElkKTtcbiAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRFeHBvcnRlZERpcmVjdGl2ZShleHBvcnRlZElkKTtcbiAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGl2ZU1vZHVsZS5waXBlc1NldC5oYXMoZXhwb3J0ZWRJZC5yZWZlcmVuY2UpKSB7XG4gICAgICAgIGV4cG9ydGVkUGlwZXMucHVzaChleHBvcnRlZElkKTtcbiAgICAgICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRFeHBvcnRlZFBpcGUoZXhwb3J0ZWRJZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgIGBDYW4ndCBleHBvcnQgJHt0aGlzLl9nZXRUeXBlRGVzY3JpcHRvcihleHBvcnRlZElkLnJlZmVyZW5jZSl9ICR7c3RyaW5naWZ5VHlwZShleHBvcnRlZElkLnJlZmVyZW5jZSl9IGZyb20gJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfSBhcyBpdCB3YXMgbmVpdGhlciBkZWNsYXJlZCBub3IgaW1wb3J0ZWQhYCksXG4gICAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhlIHByb3ZpZGVycyBvZiB0aGUgbW9kdWxlIGhhdmUgdG8gZ28gbGFzdFxuICAgIC8vIHNvIHRoYXQgdGhleSBvdmVyd3JpdGUgYW55IG90aGVyIHByb3ZpZGVyIHdlIGFscmVhZHkgYWRkZWQuXG4gICAgaWYgKG1ldGEucHJvdmlkZXJzKSB7XG4gICAgICBwcm92aWRlcnMucHVzaCguLi50aGlzLl9nZXRQcm92aWRlcnNNZXRhZGF0YShcbiAgICAgICAgICBtZXRhLnByb3ZpZGVycywgZW50cnlDb21wb25lbnRzLFxuICAgICAgICAgIGBwcm92aWRlciBmb3IgdGhlIE5nTW9kdWxlICcke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9J2AsIFtdLCBtb2R1bGVUeXBlKSk7XG4gICAgfVxuXG4gICAgaWYgKG1ldGEuZW50cnlDb21wb25lbnRzKSB7XG4gICAgICBlbnRyeUNvbXBvbmVudHMucHVzaCguLi5mbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5lbnRyeUNvbXBvbmVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0eXBlID0+IHRoaXMuX2dldEVudHJ5Q29tcG9uZW50TWV0YWRhdGEodHlwZSkgISkpO1xuICAgIH1cblxuICAgIGlmIChtZXRhLmJvb3RzdHJhcCkge1xuICAgICAgZmxhdHRlbkFuZERlZHVwZUFycmF5KG1ldGEuYm9vdHN0cmFwKS5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgdmFsdWUgJyR7c3RyaW5naWZ5VHlwZSh0eXBlKX0nIHVzZWQgaW4gdGhlIGJvb3RzdHJhcCBwcm9wZXJ0eSBvZiBtb2R1bGUgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nYCksXG4gICAgICAgICAgICAgIG1vZHVsZVR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBib290c3RyYXBDb21wb25lbnRzLnB1c2godGhpcy5fZ2V0SWRlbnRpZmllck1ldGFkYXRhKHR5cGUpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGVudHJ5Q29tcG9uZW50cy5wdXNoKFxuICAgICAgICAuLi5ib290c3RyYXBDb21wb25lbnRzLm1hcCh0eXBlID0+IHRoaXMuX2dldEVudHJ5Q29tcG9uZW50TWV0YWRhdGEodHlwZS5yZWZlcmVuY2UpICEpKTtcblxuICAgIGlmIChtZXRhLnNjaGVtYXMpIHtcbiAgICAgIHNjaGVtYXMucHVzaCguLi5mbGF0dGVuQW5kRGVkdXBlQXJyYXkobWV0YS5zY2hlbWFzKSk7XG4gICAgfVxuXG4gICAgY29tcGlsZU1ldGEgPSBuZXcgY3BsLkNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKHtcbiAgICAgIHR5cGU6IHRoaXMuX2dldFR5cGVNZXRhZGF0YShtb2R1bGVUeXBlKSxcbiAgICAgIHByb3ZpZGVycyxcbiAgICAgIGVudHJ5Q29tcG9uZW50cyxcbiAgICAgIGJvb3RzdHJhcENvbXBvbmVudHMsXG4gICAgICBzY2hlbWFzLFxuICAgICAgZGVjbGFyZWREaXJlY3RpdmVzLFxuICAgICAgZXhwb3J0ZWREaXJlY3RpdmVzLFxuICAgICAgZGVjbGFyZWRQaXBlcyxcbiAgICAgIGV4cG9ydGVkUGlwZXMsXG4gICAgICBpbXBvcnRlZE1vZHVsZXMsXG4gICAgICBleHBvcnRlZE1vZHVsZXMsXG4gICAgICB0cmFuc2l0aXZlTW9kdWxlLFxuICAgICAgaWQ6IG1ldGEuaWQgfHwgbnVsbCxcbiAgICB9KTtcblxuICAgIGVudHJ5Q29tcG9uZW50cy5mb3JFYWNoKChpZCkgPT4gdHJhbnNpdGl2ZU1vZHVsZS5hZGRFbnRyeUNvbXBvbmVudChpZCkpO1xuICAgIHByb3ZpZGVycy5mb3JFYWNoKChwcm92aWRlcikgPT4gdHJhbnNpdGl2ZU1vZHVsZS5hZGRQcm92aWRlcihwcm92aWRlciwgY29tcGlsZU1ldGEgIS50eXBlKSk7XG4gICAgdHJhbnNpdGl2ZU1vZHVsZS5hZGRNb2R1bGUoY29tcGlsZU1ldGEudHlwZSk7XG4gICAgdGhpcy5fbmdNb2R1bGVDYWNoZS5zZXQobW9kdWxlVHlwZSwgY29tcGlsZU1ldGEpO1xuICAgIHJldHVybiBjb21waWxlTWV0YTtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrU2VsZkltcG9ydChtb2R1bGVUeXBlOiBUeXBlLCBpbXBvcnRlZE1vZHVsZVR5cGU6IFR5cGUpOiBib29sZWFuIHtcbiAgICBpZiAobW9kdWxlVHlwZSA9PT0gaW1wb3J0ZWRNb2R1bGVUeXBlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihgJyR7c3RyaW5naWZ5VHlwZShtb2R1bGVUeXBlKX0nIG1vZHVsZSBjYW4ndCBpbXBvcnQgaXRzZWxmYCksIG1vZHVsZVR5cGUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFR5cGVEZXNjcmlwdG9yKHR5cGU6IFR5cGUpOiBzdHJpbmcge1xuICAgIGlmIChpc1ZhbGlkVHlwZSh0eXBlKSkge1xuICAgICAgaWYgKHRoaXMuaXNEaXJlY3RpdmUodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuICdkaXJlY3RpdmUnO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1BpcGUodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuICdwaXBlJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNOZ01vZHVsZSh0eXBlKSkge1xuICAgICAgICByZXR1cm4gJ21vZHVsZSc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCh0eXBlIGFzIGFueSkucHJvdmlkZSkge1xuICAgICAgcmV0dXJuICdwcm92aWRlcic7XG4gICAgfVxuXG4gICAgcmV0dXJuICd2YWx1ZSc7XG4gIH1cblxuXG4gIHByaXZhdGUgX2FkZFR5cGVUb01vZHVsZSh0eXBlOiBUeXBlLCBtb2R1bGVUeXBlOiBUeXBlKSB7XG4gICAgY29uc3Qgb2xkTW9kdWxlID0gdGhpcy5fbmdNb2R1bGVPZlR5cGVzLmdldCh0eXBlKTtcbiAgICBpZiAob2xkTW9kdWxlICYmIG9sZE1vZHVsZSAhPT0gbW9kdWxlVHlwZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBUeXBlICR7c3RyaW5naWZ5VHlwZSh0eXBlKX0gaXMgcGFydCBvZiB0aGUgZGVjbGFyYXRpb25zIG9mIDIgbW9kdWxlczogJHtzdHJpbmdpZnlUeXBlKG9sZE1vZHVsZSl9IGFuZCAke3N0cmluZ2lmeVR5cGUobW9kdWxlVHlwZSl9ISBgICtcbiAgICAgICAgICAgICAgYFBsZWFzZSBjb25zaWRlciBtb3ZpbmcgJHtzdHJpbmdpZnlUeXBlKHR5cGUpfSB0byBhIGhpZ2hlciBtb2R1bGUgdGhhdCBpbXBvcnRzICR7c3RyaW5naWZ5VHlwZShvbGRNb2R1bGUpfSBhbmQgJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfS4gYCArXG4gICAgICAgICAgICAgIGBZb3UgY2FuIGFsc28gY3JlYXRlIGEgbmV3IE5nTW9kdWxlIHRoYXQgZXhwb3J0cyBhbmQgaW5jbHVkZXMgJHtzdHJpbmdpZnlUeXBlKHR5cGUpfSB0aGVuIGltcG9ydCB0aGF0IE5nTW9kdWxlIGluICR7c3RyaW5naWZ5VHlwZShvbGRNb2R1bGUpfSBhbmQgJHtzdHJpbmdpZnlUeXBlKG1vZHVsZVR5cGUpfS5gKSxcbiAgICAgICAgICBtb2R1bGVUeXBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbmdNb2R1bGVPZlR5cGVzLnNldCh0eXBlLCBtb2R1bGVUeXBlKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFRyYW5zaXRpdmVOZ01vZHVsZU1ldGFkYXRhKFxuICAgICAgaW1wb3J0ZWRNb2R1bGVzOiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdLFxuICAgICAgZXhwb3J0ZWRNb2R1bGVzOiBjcGwuQ29tcGlsZU5nTW9kdWxlU3VtbWFyeVtdKTogY3BsLlRyYW5zaXRpdmVDb21waWxlTmdNb2R1bGVNZXRhZGF0YSB7XG4gICAgLy8gY29sbGVjdCBgcHJvdmlkZXJzYCAvIGBlbnRyeUNvbXBvbmVudHNgIGZyb20gYWxsIGltcG9ydGVkIGFuZCBhbGwgZXhwb3J0ZWQgbW9kdWxlc1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBjcGwuVHJhbnNpdGl2ZUNvbXBpbGVOZ01vZHVsZU1ldGFkYXRhKCk7XG4gICAgY29uc3QgbW9kdWxlc0J5VG9rZW4gPSBuZXcgTWFwPGFueSwgU2V0PGFueT4+KCk7XG4gICAgaW1wb3J0ZWRNb2R1bGVzLmNvbmNhdChleHBvcnRlZE1vZHVsZXMpLmZvckVhY2goKG1vZFN1bW1hcnkpID0+IHtcbiAgICAgIG1vZFN1bW1hcnkubW9kdWxlcy5mb3JFYWNoKChtb2QpID0+IHJlc3VsdC5hZGRNb2R1bGUobW9kKSk7XG4gICAgICBtb2RTdW1tYXJ5LmVudHJ5Q29tcG9uZW50cy5mb3JFYWNoKChjb21wKSA9PiByZXN1bHQuYWRkRW50cnlDb21wb25lbnQoY29tcCkpO1xuICAgICAgY29uc3QgYWRkZWRUb2tlbnMgPSBuZXcgU2V0PGFueT4oKTtcbiAgICAgIG1vZFN1bW1hcnkucHJvdmlkZXJzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgIGNvbnN0IHRva2VuUmVmID0gY3BsLnRva2VuUmVmZXJlbmNlKGVudHJ5LnByb3ZpZGVyLnRva2VuKTtcbiAgICAgICAgbGV0IHByZXZNb2R1bGVzID0gbW9kdWxlc0J5VG9rZW4uZ2V0KHRva2VuUmVmKTtcbiAgICAgICAgaWYgKCFwcmV2TW9kdWxlcykge1xuICAgICAgICAgIHByZXZNb2R1bGVzID0gbmV3IFNldDxhbnk+KCk7XG4gICAgICAgICAgbW9kdWxlc0J5VG9rZW4uc2V0KHRva2VuUmVmLCBwcmV2TW9kdWxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbW9kdWxlUmVmID0gZW50cnkubW9kdWxlLnJlZmVyZW5jZTtcbiAgICAgICAgLy8gTm90ZTogdGhlIHByb3ZpZGVycyBvZiBvbmUgbW9kdWxlIG1heSBzdGlsbCBjb250YWluIG11bHRpcGxlIHByb3ZpZGVyc1xuICAgICAgICAvLyBwZXIgdG9rZW4gKGUuZy4gZm9yIG11bHRpIHByb3ZpZGVycyksIGFuZCB3ZSBuZWVkIHRvIHByZXNlcnZlIHRoZXNlLlxuICAgICAgICBpZiAoYWRkZWRUb2tlbnMuaGFzKHRva2VuUmVmKSB8fCAhcHJldk1vZHVsZXMuaGFzKG1vZHVsZVJlZikpIHtcbiAgICAgICAgICBwcmV2TW9kdWxlcy5hZGQobW9kdWxlUmVmKTtcbiAgICAgICAgICBhZGRlZFRva2Vucy5hZGQodG9rZW5SZWYpO1xuICAgICAgICAgIHJlc3VsdC5hZGRQcm92aWRlcihlbnRyeS5wcm92aWRlciwgZW50cnkubW9kdWxlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgZXhwb3J0ZWRNb2R1bGVzLmZvckVhY2goKG1vZFN1bW1hcnkpID0+IHtcbiAgICAgIG1vZFN1bW1hcnkuZXhwb3J0ZWREaXJlY3RpdmVzLmZvckVhY2goKGlkKSA9PiByZXN1bHQuYWRkRXhwb3J0ZWREaXJlY3RpdmUoaWQpKTtcbiAgICAgIG1vZFN1bW1hcnkuZXhwb3J0ZWRQaXBlcy5mb3JFYWNoKChpZCkgPT4gcmVzdWx0LmFkZEV4cG9ydGVkUGlwZShpZCkpO1xuICAgIH0pO1xuICAgIGltcG9ydGVkTW9kdWxlcy5mb3JFYWNoKChtb2RTdW1tYXJ5KSA9PiB7XG4gICAgICBtb2RTdW1tYXJ5LmV4cG9ydGVkRGlyZWN0aXZlcy5mb3JFYWNoKChpZCkgPT4gcmVzdWx0LmFkZERpcmVjdGl2ZShpZCkpO1xuICAgICAgbW9kU3VtbWFyeS5leHBvcnRlZFBpcGVzLmZvckVhY2goKGlkKSA9PiByZXN1bHQuYWRkUGlwZShpZCkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9nZXRJZGVudGlmaWVyTWV0YWRhdGEodHlwZTogVHlwZSk6IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhIHtcbiAgICB0eXBlID0gcmVzb2x2ZUZvcndhcmRSZWYodHlwZSk7XG4gICAgcmV0dXJuIHtyZWZlcmVuY2U6IHR5cGV9O1xuICB9XG5cbiAgaXNJbmplY3RhYmxlKHR5cGU6IGFueSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGFubm90YXRpb25zID0gdGhpcy5fcmVmbGVjdG9yLnRyeUFubm90YXRpb25zKHR5cGUpO1xuICAgIHJldHVybiBhbm5vdGF0aW9ucy5zb21lKGFubiA9PiBjcmVhdGVJbmplY3RhYmxlLmlzVHlwZU9mKGFubikpO1xuICB9XG5cbiAgZ2V0SW5qZWN0YWJsZVN1bW1hcnkodHlwZTogYW55KTogY3BsLkNvbXBpbGVUeXBlU3VtbWFyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1bW1hcnlLaW5kOiBjcGwuQ29tcGlsZVN1bW1hcnlLaW5kLkluamVjdGFibGUsXG4gICAgICB0eXBlOiB0aGlzLl9nZXRUeXBlTWV0YWRhdGEodHlwZSwgbnVsbCwgZmFsc2UpXG4gICAgfTtcbiAgfVxuXG4gIGdldEluamVjdGFibGVNZXRhZGF0YShcbiAgICAgIHR5cGU6IGFueSwgZGVwZW5kZW5jaWVzOiBhbnlbXXxudWxsID0gbnVsbCxcbiAgICAgIHRocm93T25Vbmtub3duRGVwczogYm9vbGVhbiA9IHRydWUpOiBjcGwuQ29tcGlsZUluamVjdGFibGVNZXRhZGF0YXxudWxsIHtcbiAgICBjb25zdCB0eXBlU3VtbWFyeSA9IHRoaXMuX2xvYWRTdW1tYXJ5KHR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuSW5qZWN0YWJsZSk7XG4gICAgY29uc3QgdHlwZU1ldGFkYXRhID0gdHlwZVN1bW1hcnkgP1xuICAgICAgICB0eXBlU3VtbWFyeS50eXBlIDpcbiAgICAgICAgdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKHR5cGUsIGRlcGVuZGVuY2llcywgdGhyb3dPblVua25vd25EZXBzKTtcblxuICAgIGNvbnN0IGFubm90YXRpb25zOiBJbmplY3RhYmxlW10gPVxuICAgICAgICB0aGlzLl9yZWZsZWN0b3IuYW5ub3RhdGlvbnModHlwZSkuZmlsdGVyKGFubiA9PiBjcmVhdGVJbmplY3RhYmxlLmlzVHlwZU9mKGFubikpO1xuXG4gICAgaWYgKGFubm90YXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0YSA9IGFubm90YXRpb25zW2Fubm90YXRpb25zLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiB7XG4gICAgICBzeW1ib2w6IHR5cGUsXG4gICAgICB0eXBlOiB0eXBlTWV0YWRhdGEsXG4gICAgICBwcm92aWRlZEluOiBtZXRhLnByb3ZpZGVkSW4sXG4gICAgICB1c2VWYWx1ZTogbWV0YS51c2VWYWx1ZSxcbiAgICAgIHVzZUNsYXNzOiBtZXRhLnVzZUNsYXNzLFxuICAgICAgdXNlRXhpc3Rpbmc6IG1ldGEudXNlRXhpc3RpbmcsXG4gICAgICB1c2VGYWN0b3J5OiBtZXRhLnVzZUZhY3RvcnksXG4gICAgICBkZXBzOiBtZXRhLmRlcHMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFR5cGVNZXRhZGF0YSh0eXBlOiBUeXBlLCBkZXBlbmRlbmNpZXM6IGFueVtdfG51bGwgPSBudWxsLCB0aHJvd09uVW5rbm93bkRlcHMgPSB0cnVlKTpcbiAgICAgIGNwbC5Db21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICBjb25zdCBpZGVudGlmaWVyID0gdGhpcy5fZ2V0SWRlbnRpZmllck1ldGFkYXRhKHR5cGUpO1xuICAgIHJldHVybiB7XG4gICAgICByZWZlcmVuY2U6IGlkZW50aWZpZXIucmVmZXJlbmNlLFxuICAgICAgZGlEZXBzOiB0aGlzLl9nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShpZGVudGlmaWVyLnJlZmVyZW5jZSwgZGVwZW5kZW5jaWVzLCB0aHJvd09uVW5rbm93bkRlcHMpLFxuICAgICAgbGlmZWN5Y2xlSG9va3M6IGdldEFsbExpZmVjeWNsZUhvb2tzKHRoaXMuX3JlZmxlY3RvciwgaWRlbnRpZmllci5yZWZlcmVuY2UpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIF9nZXRGYWN0b3J5TWV0YWRhdGEoZmFjdG9yeTogRnVuY3Rpb24sIGRlcGVuZGVuY2llczogYW55W118bnVsbCA9IG51bGwpOlxuICAgICAgY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEge1xuICAgIGZhY3RvcnkgPSByZXNvbHZlRm9yd2FyZFJlZihmYWN0b3J5KTtcbiAgICByZXR1cm4ge3JlZmVyZW5jZTogZmFjdG9yeSwgZGlEZXBzOiB0aGlzLl9nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShmYWN0b3J5LCBkZXBlbmRlbmNpZXMpfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZXRhZGF0YSBmb3IgdGhlIGdpdmVuIHBpcGUuXG4gICAqIFRoaXMgYXNzdW1lcyBgbG9hZE5nTW9kdWxlRGlyZWN0aXZlQW5kUGlwZU1ldGFkYXRhYCBoYXMgYmVlbiBjYWxsZWQgZmlyc3QuXG4gICAqL1xuICBnZXRQaXBlTWV0YWRhdGEocGlwZVR5cGU6IGFueSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhfG51bGwge1xuICAgIGNvbnN0IHBpcGVNZXRhID0gdGhpcy5fcGlwZUNhY2hlLmdldChwaXBlVHlwZSk7XG4gICAgaWYgKCFwaXBlTWV0YSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBnZXRQaXBlTWV0YWRhdGEgY2FuIG9ubHkgYmUgY2FsbGVkIGFmdGVyIGxvYWROZ01vZHVsZURpcmVjdGl2ZUFuZFBpcGVNZXRhZGF0YSBmb3IgYSBtb2R1bGUgdGhhdCBkZWNsYXJlcyBpdC4gUGlwZSAke3N0cmluZ2lmeVR5cGUocGlwZVR5cGUpfS5gKSxcbiAgICAgICAgICBwaXBlVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBwaXBlTWV0YSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0UGlwZVN1bW1hcnkocGlwZVR5cGU6IGFueSk6IGNwbC5Db21waWxlUGlwZVN1bW1hcnkge1xuICAgIGNvbnN0IHBpcGVTdW1tYXJ5ID1cbiAgICAgICAgPGNwbC5Db21waWxlUGlwZVN1bW1hcnk+dGhpcy5fbG9hZFN1bW1hcnkocGlwZVR5cGUsIGNwbC5Db21waWxlU3VtbWFyeUtpbmQuUGlwZSk7XG4gICAgaWYgKCFwaXBlU3VtbWFyeSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBDb3VsZCBub3QgbG9hZCB0aGUgc3VtbWFyeSBmb3IgcGlwZSAke3N0cmluZ2lmeVR5cGUocGlwZVR5cGUpfS5gKSxcbiAgICAgICAgICBwaXBlVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBwaXBlU3VtbWFyeTtcbiAgfVxuXG4gIGdldE9yTG9hZFBpcGVNZXRhZGF0YShwaXBlVHlwZTogYW55KTogY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGEge1xuICAgIGxldCBwaXBlTWV0YSA9IHRoaXMuX3BpcGVDYWNoZS5nZXQocGlwZVR5cGUpO1xuICAgIGlmICghcGlwZU1ldGEpIHtcbiAgICAgIHBpcGVNZXRhID0gdGhpcy5fbG9hZFBpcGVNZXRhZGF0YShwaXBlVHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBwaXBlTWV0YTtcbiAgfVxuXG4gIHByaXZhdGUgX2xvYWRQaXBlTWV0YWRhdGEocGlwZVR5cGU6IGFueSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICBwaXBlVHlwZSA9IHJlc29sdmVGb3J3YXJkUmVmKHBpcGVUeXBlKTtcbiAgICBjb25zdCBwaXBlQW5ub3RhdGlvbiA9IHRoaXMuX3BpcGVSZXNvbHZlci5yZXNvbHZlKHBpcGVUeXBlKSAhO1xuXG4gICAgY29uc3QgcGlwZU1ldGEgPSBuZXcgY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGEoe1xuICAgICAgdHlwZTogdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKHBpcGVUeXBlKSxcbiAgICAgIG5hbWU6IHBpcGVBbm5vdGF0aW9uLm5hbWUsXG4gICAgICBwdXJlOiAhIXBpcGVBbm5vdGF0aW9uLnB1cmVcbiAgICB9KTtcbiAgICB0aGlzLl9waXBlQ2FjaGUuc2V0KHBpcGVUeXBlLCBwaXBlTWV0YSk7XG4gICAgdGhpcy5fc3VtbWFyeUNhY2hlLnNldChwaXBlVHlwZSwgcGlwZU1ldGEudG9TdW1tYXJ5KCkpO1xuICAgIHJldHVybiBwaXBlTWV0YTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldERlcGVuZGVuY2llc01ldGFkYXRhKFxuICAgICAgdHlwZU9yRnVuYzogVHlwZXxGdW5jdGlvbiwgZGVwZW5kZW5jaWVzOiBhbnlbXXxudWxsLFxuICAgICAgdGhyb3dPblVua25vd25EZXBzID0gdHJ1ZSk6IGNwbC5Db21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSB7XG4gICAgbGV0IGhhc1Vua25vd25EZXBzID0gZmFsc2U7XG4gICAgY29uc3QgcGFyYW1zID0gZGVwZW5kZW5jaWVzIHx8IHRoaXMuX3JlZmxlY3Rvci5wYXJhbWV0ZXJzKHR5cGVPckZ1bmMpIHx8IFtdO1xuXG4gICAgY29uc3QgZGVwZW5kZW5jaWVzTWV0YWRhdGE6IGNwbC5Db21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSA9IHBhcmFtcy5tYXAoKHBhcmFtKSA9PiB7XG4gICAgICBsZXQgaXNBdHRyaWJ1dGUgPSBmYWxzZTtcbiAgICAgIGxldCBpc0hvc3QgPSBmYWxzZTtcbiAgICAgIGxldCBpc1NlbGYgPSBmYWxzZTtcbiAgICAgIGxldCBpc1NraXBTZWxmID0gZmFsc2U7XG4gICAgICBsZXQgaXNPcHRpb25hbCA9IGZhbHNlO1xuICAgICAgbGV0IHRva2VuOiBhbnkgPSBudWxsO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW0pKSB7XG4gICAgICAgIHBhcmFtLmZvckVhY2goKHBhcmFtRW50cnk6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChjcmVhdGVIb3N0LmlzVHlwZU9mKHBhcmFtRW50cnkpKSB7XG4gICAgICAgICAgICBpc0hvc3QgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY3JlYXRlU2VsZi5pc1R5cGVPZihwYXJhbUVudHJ5KSkge1xuICAgICAgICAgICAgaXNTZWxmID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyZWF0ZVNraXBTZWxmLmlzVHlwZU9mKHBhcmFtRW50cnkpKSB7XG4gICAgICAgICAgICBpc1NraXBTZWxmID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyZWF0ZU9wdGlvbmFsLmlzVHlwZU9mKHBhcmFtRW50cnkpKSB7XG4gICAgICAgICAgICBpc09wdGlvbmFsID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyZWF0ZUF0dHJpYnV0ZS5pc1R5cGVPZihwYXJhbUVudHJ5KSkge1xuICAgICAgICAgICAgaXNBdHRyaWJ1dGUgPSB0cnVlO1xuICAgICAgICAgICAgdG9rZW4gPSAocGFyYW1FbnRyeSBhcyBhbnkpLmF0dHJpYnV0ZU5hbWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjcmVhdGVJbmplY3QuaXNUeXBlT2YocGFyYW1FbnRyeSkpIHtcbiAgICAgICAgICAgIHRva2VuID0gKHBhcmFtRW50cnkgYXMgYW55KS50b2tlbjtcbiAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICBjcmVhdGVJbmplY3Rpb25Ub2tlbi5pc1R5cGVPZihwYXJhbUVudHJ5KSB8fFxuICAgICAgICAgICAgICAocGFyYW1FbnRyeSBhcyBhbnkpIGluc3RhbmNlb2YgU3RhdGljU3ltYm9sKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHBhcmFtRW50cnk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpc1ZhbGlkVHlwZShwYXJhbUVudHJ5KSAmJiB0b2tlbiA9PSBudWxsKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHBhcmFtRW50cnk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gcGFyYW07XG4gICAgICB9XG4gICAgICBpZiAodG9rZW4gPT0gbnVsbCkge1xuICAgICAgICBoYXNVbmtub3duRGVwcyA9IHRydWU7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNBdHRyaWJ1dGUsXG4gICAgICAgIGlzSG9zdCxcbiAgICAgICAgaXNTZWxmLFxuICAgICAgICBpc1NraXBTZWxmLFxuICAgICAgICBpc09wdGlvbmFsLFxuICAgICAgICB0b2tlbjogdGhpcy5fZ2V0VG9rZW5NZXRhZGF0YSh0b2tlbilcbiAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGlmIChoYXNVbmtub3duRGVwcykge1xuICAgICAgY29uc3QgZGVwc1Rva2VucyA9XG4gICAgICAgICAgZGVwZW5kZW5jaWVzTWV0YWRhdGEubWFwKChkZXApID0+IGRlcC50b2tlbiA/IHN0cmluZ2lmeVR5cGUoZGVwLnRva2VuKSA6ICc/Jykuam9pbignLCAnKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgICAgIGBDYW4ndCByZXNvbHZlIGFsbCBwYXJhbWV0ZXJzIGZvciAke3N0cmluZ2lmeVR5cGUodHlwZU9yRnVuYyl9OiAoJHtkZXBzVG9rZW5zfSkuYDtcbiAgICAgIGlmICh0aHJvd09uVW5rbm93bkRlcHMgfHwgdGhpcy5fY29uZmlnLnN0cmljdEluamVjdGlvblBhcmFtZXRlcnMpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3Ioc3ludGF4RXJyb3IobWVzc2FnZSksIHR5cGVPckZ1bmMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29uc29sZS53YXJuKGBXYXJuaW5nOiAke21lc3NhZ2V9IFRoaXMgd2lsbCBiZWNvbWUgYW4gZXJyb3IgaW4gQW5ndWxhciB2Ni54YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlcGVuZGVuY2llc01ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0VG9rZW5NZXRhZGF0YSh0b2tlbjogYW55KTogY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhIHtcbiAgICB0b2tlbiA9IHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKTtcbiAgICBsZXQgY29tcGlsZVRva2VuOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGE7XG4gICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbXBpbGVUb2tlbiA9IHt2YWx1ZTogdG9rZW59O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21waWxlVG9rZW4gPSB7aWRlbnRpZmllcjoge3JlZmVyZW5jZTogdG9rZW59fTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBpbGVUb2tlbjtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFByb3ZpZGVyc01ldGFkYXRhKFxuICAgICAgcHJvdmlkZXJzOiBQcm92aWRlcltdLCB0YXJnZXRFbnRyeUNvbXBvbmVudHM6IGNwbC5Db21waWxlRW50cnlDb21wb25lbnRNZXRhZGF0YVtdLFxuICAgICAgZGVidWdJbmZvPzogc3RyaW5nLCBjb21waWxlUHJvdmlkZXJzOiBjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGFbXSA9IFtdLFxuICAgICAgdHlwZT86IGFueSk6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YVtdIHtcbiAgICBwcm92aWRlcnMuZm9yRWFjaCgocHJvdmlkZXI6IGFueSwgcHJvdmlkZXJJZHg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJvdmlkZXIpKSB7XG4gICAgICAgIHRoaXMuX2dldFByb3ZpZGVyc01ldGFkYXRhKHByb3ZpZGVyLCB0YXJnZXRFbnRyeUNvbXBvbmVudHMsIGRlYnVnSW5mbywgY29tcGlsZVByb3ZpZGVycyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgICAgICAgbGV0IHByb3ZpZGVyTWV0YTogY3BsLlByb3ZpZGVyTWV0YSA9IHVuZGVmaW5lZCAhO1xuICAgICAgICBpZiAocHJvdmlkZXIgJiYgdHlwZW9mIHByb3ZpZGVyID09PSAnb2JqZWN0JyAmJiBwcm92aWRlci5oYXNPd25Qcm9wZXJ0eSgncHJvdmlkZScpKSB7XG4gICAgICAgICAgdGhpcy5fdmFsaWRhdGVQcm92aWRlcihwcm92aWRlcik7XG4gICAgICAgICAgcHJvdmlkZXJNZXRhID0gbmV3IGNwbC5Qcm92aWRlck1ldGEocHJvdmlkZXIucHJvdmlkZSwgcHJvdmlkZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzVmFsaWRUeXBlKHByb3ZpZGVyKSkge1xuICAgICAgICAgIHByb3ZpZGVyTWV0YSA9IG5ldyBjcGwuUHJvdmlkZXJNZXRhKHByb3ZpZGVyLCB7dXNlQ2xhc3M6IHByb3ZpZGVyfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgPT09IHZvaWQgMCkge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICBgRW5jb3VudGVyZWQgdW5kZWZpbmVkIHByb3ZpZGVyISBVc3VhbGx5IHRoaXMgbWVhbnMgeW91IGhhdmUgYSBjaXJjdWxhciBkZXBlbmRlbmNpZXMuIFRoaXMgbWlnaHQgYmUgY2F1c2VkIGJ5IHVzaW5nICdiYXJyZWwnIGluZGV4LnRzIGZpbGVzLmApKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgcHJvdmlkZXJzSW5mbyA9XG4gICAgICAgICAgICAgICg8c3RyaW5nW10+cHJvdmlkZXJzLnJlZHVjZShcbiAgICAgICAgICAgICAgICAgICAoc29GYXI6IHN0cmluZ1tdLCBzZWVuUHJvdmlkZXI6IGFueSwgc2VlblByb3ZpZGVySWR4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgIGlmIChzZWVuUHJvdmlkZXJJZHggPCBwcm92aWRlcklkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICBzb0Zhci5wdXNoKGAke3N0cmluZ2lmeVR5cGUoc2VlblByb3ZpZGVyKX1gKTtcbiAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VlblByb3ZpZGVySWR4ID09IHByb3ZpZGVySWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHNvRmFyLnB1c2goYD8ke3N0cmluZ2lmeVR5cGUoc2VlblByb3ZpZGVyKX0/YCk7XG4gICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlZW5Qcm92aWRlcklkeCA9PSBwcm92aWRlcklkeCArIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgc29GYXIucHVzaCgnLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gc29GYXI7XG4gICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICBbXSkpXG4gICAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgICAgc3ludGF4RXJyb3IoXG4gICAgICAgICAgICAgICAgICBgSW52YWxpZCAke2RlYnVnSW5mbyA/IGRlYnVnSW5mbyA6ICdwcm92aWRlcid9IC0gb25seSBpbnN0YW5jZXMgb2YgUHJvdmlkZXIgYW5kIFR5cGUgYXJlIGFsbG93ZWQsIGdvdDogWyR7cHJvdmlkZXJzSW5mb31dYCksXG4gICAgICAgICAgICAgIHR5cGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvdmlkZXJNZXRhLnRva2VuID09PVxuICAgICAgICAgICAgdGhpcy5fcmVmbGVjdG9yLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShJZGVudGlmaWVycy5BTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTKSkge1xuICAgICAgICAgIHRhcmdldEVudHJ5Q29tcG9uZW50cy5wdXNoKC4uLnRoaXMuX2dldEVudHJ5Q29tcG9uZW50c0Zyb21Qcm92aWRlcihwcm92aWRlck1ldGEsIHR5cGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb21waWxlUHJvdmlkZXJzLnB1c2godGhpcy5nZXRQcm92aWRlck1ldGFkYXRhKHByb3ZpZGVyTWV0YSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBpbGVQcm92aWRlcnM7XG4gIH1cblxuICBwcml2YXRlIF92YWxpZGF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAocHJvdmlkZXIuaGFzT3duUHJvcGVydHkoJ3VzZUNsYXNzJykgJiYgcHJvdmlkZXIudXNlQ2xhc3MgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3Ioc3ludGF4RXJyb3IoXG4gICAgICAgICAgYEludmFsaWQgcHJvdmlkZXIgZm9yICR7c3RyaW5naWZ5VHlwZShwcm92aWRlci5wcm92aWRlKX0uIHVzZUNsYXNzIGNhbm5vdCBiZSAke3Byb3ZpZGVyLnVzZUNsYXNzfS5cbiAgICAgICAgICAgVXN1YWxseSBpdCBoYXBwZW5zIHdoZW46XG4gICAgICAgICAgIDEuIFRoZXJlJ3MgYSBjaXJjdWxhciBkZXBlbmRlbmN5IChtaWdodCBiZSBjYXVzZWQgYnkgdXNpbmcgaW5kZXgudHMgKGJhcnJlbCkgZmlsZXMpLlxuICAgICAgICAgICAyLiBDbGFzcyB3YXMgdXNlZCBiZWZvcmUgaXQgd2FzIGRlY2xhcmVkLiBVc2UgZm9yd2FyZFJlZiBpbiB0aGlzIGNhc2UuYCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEVudHJ5Q29tcG9uZW50c0Zyb21Qcm92aWRlcihwcm92aWRlcjogY3BsLlByb3ZpZGVyTWV0YSwgdHlwZT86IGFueSk6XG4gICAgICBjcGwuQ29tcGlsZUVudHJ5Q29tcG9uZW50TWV0YWRhdGFbXSB7XG4gICAgY29uc3QgY29tcG9uZW50czogY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBjb2xsZWN0ZWRJZGVudGlmaWVyczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSA9IFtdO1xuXG4gICAgaWYgKHByb3ZpZGVyLnVzZUZhY3RvcnkgfHwgcHJvdmlkZXIudXNlRXhpc3RpbmcgfHwgcHJvdmlkZXIudXNlQ2xhc3MpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIHN5bnRheEVycm9yKGBUaGUgQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUyB0b2tlbiBvbmx5IHN1cHBvcnRzIHVzZVZhbHVlIWApLCB0eXBlKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBpZiAoIXByb3ZpZGVyLm11bHRpKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBzeW50YXhFcnJvcihgVGhlIEFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMgdG9rZW4gb25seSBzdXBwb3J0cyAnbXVsdGkgPSB0cnVlJyFgKSxcbiAgICAgICAgICB0eXBlKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBleHRyYWN0SWRlbnRpZmllcnMocHJvdmlkZXIudXNlVmFsdWUsIGNvbGxlY3RlZElkZW50aWZpZXJzKTtcbiAgICBjb2xsZWN0ZWRJZGVudGlmaWVycy5mb3JFYWNoKChpZGVudGlmaWVyKSA9PiB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuX2dldEVudHJ5Q29tcG9uZW50TWV0YWRhdGEoaWRlbnRpZmllci5yZWZlcmVuY2UsIGZhbHNlKTtcbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICBjb21wb25lbnRzLnB1c2goZW50cnkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21wb25lbnRzO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RW50cnlDb21wb25lbnRNZXRhZGF0YShkaXJUeXBlOiBhbnksIHRocm93SWZOb3RGb3VuZCA9IHRydWUpOlxuICAgICAgY3BsLkNvbXBpbGVFbnRyeUNvbXBvbmVudE1ldGFkYXRhfG51bGwge1xuICAgIGNvbnN0IGRpck1ldGEgPSB0aGlzLmdldE5vbk5vcm1hbGl6ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJUeXBlKTtcbiAgICBpZiAoZGlyTWV0YSAmJiBkaXJNZXRhLm1ldGFkYXRhLmlzQ29tcG9uZW50KSB7XG4gICAgICByZXR1cm4ge2NvbXBvbmVudFR5cGU6IGRpclR5cGUsIGNvbXBvbmVudEZhY3Rvcnk6IGRpck1ldGEubWV0YWRhdGEuY29tcG9uZW50RmFjdG9yeSAhfTtcbiAgICB9XG4gICAgY29uc3QgZGlyU3VtbWFyeSA9XG4gICAgICAgIDxjcGwuQ29tcGlsZURpcmVjdGl2ZVN1bW1hcnk+dGhpcy5fbG9hZFN1bW1hcnkoZGlyVHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5EaXJlY3RpdmUpO1xuICAgIGlmIChkaXJTdW1tYXJ5ICYmIGRpclN1bW1hcnkuaXNDb21wb25lbnQpIHtcbiAgICAgIHJldHVybiB7Y29tcG9uZW50VHlwZTogZGlyVHlwZSwgY29tcG9uZW50RmFjdG9yeTogZGlyU3VtbWFyeS5jb21wb25lbnRGYWN0b3J5ICF9O1xuICAgIH1cbiAgICBpZiAodGhyb3dJZk5vdEZvdW5kKSB7XG4gICAgICB0aHJvdyBzeW50YXhFcnJvcihgJHtkaXJUeXBlLm5hbWV9IGNhbm5vdCBiZSB1c2VkIGFzIGFuIGVudHJ5IGNvbXBvbmVudC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9nZXRJbmplY3RhYmxlVHlwZU1ldGFkYXRhKHR5cGU6IFR5cGUsIGRlcGVuZGVuY2llczogYW55W118bnVsbCA9IG51bGwpOlxuICAgICAgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEge1xuICAgIGNvbnN0IHR5cGVTdW1tYXJ5ID0gdGhpcy5fbG9hZFN1bW1hcnkodHlwZSwgY3BsLkNvbXBpbGVTdW1tYXJ5S2luZC5JbmplY3RhYmxlKTtcbiAgICBpZiAodHlwZVN1bW1hcnkpIHtcbiAgICAgIHJldHVybiB0eXBlU3VtbWFyeS50eXBlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZ2V0VHlwZU1ldGFkYXRhKHR5cGUsIGRlcGVuZGVuY2llcyk7XG4gIH1cblxuICBnZXRQcm92aWRlck1ldGFkYXRhKHByb3ZpZGVyOiBjcGwuUHJvdmlkZXJNZXRhKTogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICBsZXQgY29tcGlsZURlcHM6IGNwbC5Db21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGFbXSA9IHVuZGVmaW5lZCAhO1xuICAgIGxldCBjb21waWxlVHlwZU1ldGFkYXRhOiBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YSA9IG51bGwgITtcbiAgICBsZXQgY29tcGlsZUZhY3RvcnlNZXRhZGF0YTogY3BsLkNvbXBpbGVGYWN0b3J5TWV0YWRhdGEgPSBudWxsICE7XG4gICAgbGV0IHRva2VuOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEgPSB0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHByb3ZpZGVyLnRva2VuKTtcblxuICAgIGlmIChwcm92aWRlci51c2VDbGFzcykge1xuICAgICAgY29tcGlsZVR5cGVNZXRhZGF0YSA9XG4gICAgICAgICAgdGhpcy5fZ2V0SW5qZWN0YWJsZVR5cGVNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIGNvbXBpbGVEZXBzID0gY29tcGlsZVR5cGVNZXRhZGF0YS5kaURlcHM7XG4gICAgICBpZiAocHJvdmlkZXIudG9rZW4gPT09IHByb3ZpZGVyLnVzZUNsYXNzKSB7XG4gICAgICAgIC8vIHVzZSB0aGUgY29tcGlsZVR5cGVNZXRhZGF0YSBhcyBpdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBsaWZlY3ljbGVIb29rcy4uLlxuICAgICAgICB0b2tlbiA9IHtpZGVudGlmaWVyOiBjb21waWxlVHlwZU1ldGFkYXRhfTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyLnVzZUZhY3RvcnkpIHtcbiAgICAgIGNvbXBpbGVGYWN0b3J5TWV0YWRhdGEgPSB0aGlzLl9nZXRGYWN0b3J5TWV0YWRhdGEocHJvdmlkZXIudXNlRmFjdG9yeSwgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICAgIGNvbXBpbGVEZXBzID0gY29tcGlsZUZhY3RvcnlNZXRhZGF0YS5kaURlcHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgIHVzZUNsYXNzOiBjb21waWxlVHlwZU1ldGFkYXRhLFxuICAgICAgdXNlVmFsdWU6IHByb3ZpZGVyLnVzZVZhbHVlLFxuICAgICAgdXNlRmFjdG9yeTogY29tcGlsZUZhY3RvcnlNZXRhZGF0YSxcbiAgICAgIHVzZUV4aXN0aW5nOiBwcm92aWRlci51c2VFeGlzdGluZyA/IHRoaXMuX2dldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudXNlRXhpc3RpbmcpIDogdW5kZWZpbmVkLFxuICAgICAgZGVwczogY29tcGlsZURlcHMsXG4gICAgICBtdWx0aTogcHJvdmlkZXIubXVsdGlcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcmllc01ldGFkYXRhKFxuICAgICAgcXVlcmllczoge1trZXk6IHN0cmluZ106IFF1ZXJ5fSwgaXNWaWV3UXVlcnk6IGJvb2xlYW4sXG4gICAgICBkaXJlY3RpdmVUeXBlOiBUeXBlKTogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10ge1xuICAgIGNvbnN0IHJlczogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10gPSBbXTtcblxuICAgIE9iamVjdC5rZXlzKHF1ZXJpZXMpLmZvckVhY2goKHByb3BlcnR5TmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBxdWVyeSA9IHF1ZXJpZXNbcHJvcGVydHlOYW1lXTtcbiAgICAgIGlmIChxdWVyeS5pc1ZpZXdRdWVyeSA9PT0gaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcmVzLnB1c2godGhpcy5fZ2V0UXVlcnlNZXRhZGF0YShxdWVyeSwgcHJvcGVydHlOYW1lLCBkaXJlY3RpdmVUeXBlKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfcXVlcnlWYXJCaW5kaW5ncyhzZWxlY3RvcjogYW55KTogc3RyaW5nW10geyByZXR1cm4gc2VsZWN0b3Iuc3BsaXQoL1xccyosXFxzKi8pOyB9XG5cbiAgcHJpdmF0ZSBfZ2V0UXVlcnlNZXRhZGF0YShxOiBRdWVyeSwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHR5cGVPckZ1bmM6IFR5cGV8RnVuY3Rpb24pOlxuICAgICAgY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgICBsZXQgc2VsZWN0b3JzOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGFbXTtcbiAgICBpZiAodHlwZW9mIHEuc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICBzZWxlY3RvcnMgPVxuICAgICAgICAgIHRoaXMuX3F1ZXJ5VmFyQmluZGluZ3MocS5zZWxlY3RvcikubWFwKHZhck5hbWUgPT4gdGhpcy5fZ2V0VG9rZW5NZXRhZGF0YSh2YXJOYW1lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghcS5zZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIHN5bnRheEVycm9yKFxuICAgICAgICAgICAgICAgIGBDYW4ndCBjb25zdHJ1Y3QgYSBxdWVyeSBmb3IgdGhlIHByb3BlcnR5IFwiJHtwcm9wZXJ0eU5hbWV9XCIgb2YgXCIke3N0cmluZ2lmeVR5cGUodHlwZU9yRnVuYyl9XCIgc2luY2UgdGhlIHF1ZXJ5IHNlbGVjdG9yIHdhc24ndCBkZWZpbmVkLmApLFxuICAgICAgICAgICAgdHlwZU9yRnVuYyk7XG4gICAgICAgIHNlbGVjdG9ycyA9IFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0b3JzID0gW3RoaXMuX2dldFRva2VuTWV0YWRhdGEocS5zZWxlY3RvcildO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzZWxlY3RvcnMsXG4gICAgICBmaXJzdDogcS5maXJzdCxcbiAgICAgIGRlc2NlbmRhbnRzOiBxLmRlc2NlbmRhbnRzLCBwcm9wZXJ0eU5hbWUsXG4gICAgICByZWFkOiBxLnJlYWQgPyB0aGlzLl9nZXRUb2tlbk1ldGFkYXRhKHEucmVhZCkgOiBudWxsICEsXG4gICAgICBzdGF0aWM6IHEuc3RhdGljXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcG9ydEVycm9yKGVycm9yOiBhbnksIHR5cGU/OiBhbnksIG90aGVyVHlwZT86IGFueSkge1xuICAgIGlmICh0aGlzLl9lcnJvckNvbGxlY3Rvcikge1xuICAgICAgdGhpcy5fZXJyb3JDb2xsZWN0b3IoZXJyb3IsIHR5cGUpO1xuICAgICAgaWYgKG90aGVyVHlwZSkge1xuICAgICAgICB0aGlzLl9lcnJvckNvbGxlY3RvcihlcnJvciwgb3RoZXJUeXBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5BcnJheSh0cmVlOiBhbnlbXSwgb3V0OiBBcnJheTxhbnk+ID0gW10pOiBBcnJheTxhbnk+IHtcbiAgaWYgKHRyZWUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyZWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSByZXNvbHZlRm9yd2FyZFJlZih0cmVlW2ldKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICAgIGZsYXR0ZW5BcnJheShpdGVtLCBvdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIGRlZHVwZUFycmF5KGFycmF5OiBhbnlbXSk6IEFycmF5PGFueT4ge1xuICBpZiAoYXJyYXkpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycmF5KSk7XG4gIH1cbiAgcmV0dXJuIFtdO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuQW5kRGVkdXBlQXJyYXkodHJlZTogYW55W10pOiBBcnJheTxhbnk+IHtcbiAgcmV0dXJuIGRlZHVwZUFycmF5KGZsYXR0ZW5BcnJheSh0cmVlKSk7XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRUeXBlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICh2YWx1ZSBpbnN0YW5jZW9mIFN0YXRpY1N5bWJvbCkgfHwgKHZhbHVlIGluc3RhbmNlb2YgVHlwZSk7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RJZGVudGlmaWVycyh2YWx1ZTogYW55LCB0YXJnZXRJZGVudGlmaWVyczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSkge1xuICB2aXNpdFZhbHVlKHZhbHVlLCBuZXcgX0NvbXBpbGVWYWx1ZUNvbnZlcnRlcigpLCB0YXJnZXRJZGVudGlmaWVycyk7XG59XG5cbmNsYXNzIF9Db21waWxlVmFsdWVDb252ZXJ0ZXIgZXh0ZW5kcyBWYWx1ZVRyYW5zZm9ybWVyIHtcbiAgdmlzaXRPdGhlcih2YWx1ZTogYW55LCB0YXJnZXRJZGVudGlmaWVyczogY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGFbXSk6IGFueSB7XG4gICAgdGFyZ2V0SWRlbnRpZmllcnMucHVzaCh7cmVmZXJlbmNlOiB2YWx1ZX0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVR5cGUodHlwZTogYW55KTogc3RyaW5nIHtcbiAgaWYgKHR5cGUgaW5zdGFuY2VvZiBTdGF0aWNTeW1ib2wpIHtcbiAgICByZXR1cm4gYCR7dHlwZS5uYW1lfSBpbiAke3R5cGUuZmlsZVBhdGh9YDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyaW5naWZ5KHR5cGUpO1xuICB9XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgYSBjb21wb25lbnQgaXMgc3RpbGwgYmVpbmcgbG9hZGVkIGluIGEgc3luY2hyb25vdXMgY29tcGlsZS5cbiAqL1xuZnVuY3Rpb24gY29tcG9uZW50U3RpbGxMb2FkaW5nRXJyb3IoY29tcFR5cGU6IFR5cGUpIHtcbiAgY29uc3QgZXJyb3IgPVxuICAgICAgRXJyb3IoYENhbid0IGNvbXBpbGUgc3luY2hyb25vdXNseSBhcyAke3N0cmluZ2lmeShjb21wVHlwZSl9IGlzIHN0aWxsIGJlaW5nIGxvYWRlZCFgKTtcbiAgKGVycm9yIGFzIGFueSlbRVJST1JfQ09NUE9ORU5UX1RZUEVdID0gY29tcFR5cGU7XG4gIHJldHVybiBlcnJvcjtcbn1cbiJdfQ==