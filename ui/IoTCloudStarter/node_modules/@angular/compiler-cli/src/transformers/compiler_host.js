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
        define("@angular/compiler-cli/src/transformers/compiler_host", ["require", "exports", "tslib", "@angular/compiler", "path", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/transformers/metadata_reader", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var path = require("path");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var metadata_reader_1 = require("@angular/compiler-cli/src/transformers/metadata_reader");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    var NODE_MODULES_PACKAGE_NAME = /node_modules\/((\w|-|\.)+|(@(\w|-|\.)+\/(\w|-|\.)+))/;
    var EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
    var CSS_PREPROCESSOR_EXT = /(\.scss|\.less|\.styl)$/;
    var wrapHostForTest = null;
    function setWrapHostForTest(wrapFn) {
        wrapHostForTest = wrapFn;
    }
    exports.setWrapHostForTest = setWrapHostForTest;
    function createCompilerHost(_a) {
        var options = _a.options, _b = _a.tsHost, tsHost = _b === void 0 ? ts.createCompilerHost(options, true) : _b;
        if (wrapHostForTest !== null) {
            tsHost = wrapHostForTest(tsHost);
        }
        return tsHost;
    }
    exports.createCompilerHost = createCompilerHost;
    function assert(condition) {
        if (!condition) {
            // TODO(chuckjaz): do the right thing
        }
        return condition;
    }
    /**
     * Implements the following hosts based on an api.CompilerHost:
     * - ts.CompilerHost to be consumed by a ts.Program
     * - AotCompilerHost for @angular/compiler
     * - TypeCheckHost for mapping ts errors to ng errors (via translateDiagnostics)
     */
    var TsCompilerAotCompilerTypeCheckHostAdapter = /** @class */ (function () {
        function TsCompilerAotCompilerTypeCheckHostAdapter(rootFiles, options, context, metadataProvider, codeGenerator, librarySummaries) {
            var _this = this;
            if (librarySummaries === void 0) { librarySummaries = new Map(); }
            this.rootFiles = rootFiles;
            this.options = options;
            this.context = context;
            this.metadataProvider = metadataProvider;
            this.codeGenerator = codeGenerator;
            this.librarySummaries = librarySummaries;
            this.metadataReaderCache = metadata_reader_1.createMetadataReaderCache();
            this.fileNameToModuleNameCache = new Map();
            this.flatModuleIndexCache = new Map();
            this.flatModuleIndexNames = new Set();
            this.flatModuleIndexRedirectNames = new Set();
            this.originalSourceFiles = new Map();
            this.originalFileExistsCache = new Map();
            this.generatedSourceFiles = new Map();
            this.generatedCodeFor = new Map();
            this.emitter = new compiler_1.TypeScriptEmitter();
            this.getDefaultLibFileName = function (options) {
                return _this.context.getDefaultLibFileName(options);
            };
            this.getCurrentDirectory = function () { return _this.context.getCurrentDirectory(); };
            this.getCanonicalFileName = function (fileName) { return _this.context.getCanonicalFileName(fileName); };
            this.useCaseSensitiveFileNames = function () { return _this.context.useCaseSensitiveFileNames(); };
            this.getNewLine = function () { return _this.context.getNewLine(); };
            // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
            // https://github.com/Microsoft/TypeScript/issues/9552
            this.realpath = function (p) { return p; };
            this.writeFile = this.context.writeFile.bind(this.context);
            this.moduleResolutionCache = ts.createModuleResolutionCache(this.context.getCurrentDirectory(), this.context.getCanonicalFileName.bind(this.context));
            var basePath = this.options.basePath;
            this.rootDirs =
                (this.options.rootDirs || [this.options.basePath]).map(function (p) { return path.resolve(basePath, p); });
            if (context.getDirectories) {
                this.getDirectories = function (path) { return context.getDirectories(path); };
            }
            if (context.directoryExists) {
                this.directoryExists = function (directoryName) { return context.directoryExists(directoryName); };
            }
            if (context.getCancellationToken) {
                this.getCancellationToken = function () { return context.getCancellationToken(); };
            }
            if (context.getDefaultLibLocation) {
                this.getDefaultLibLocation = function () { return context.getDefaultLibLocation(); };
            }
            if (context.resolveTypeReferenceDirectives) {
                this.resolveTypeReferenceDirectives = function (names, containingFile) {
                    return context.resolveTypeReferenceDirectives(names, containingFile);
                };
            }
            if (context.trace) {
                this.trace = function (s) { return context.trace(s); };
            }
            if (context.fileNameToModuleName) {
                this.fileNameToModuleName = context.fileNameToModuleName.bind(context);
            }
            // Note: don't copy over context.moduleNameToFileName as we first
            // normalize undefined containingFile to a filled containingFile.
            if (context.resourceNameToFileName) {
                this.resourceNameToFileName = context.resourceNameToFileName.bind(context);
            }
            if (context.toSummaryFileName) {
                this.toSummaryFileName = context.toSummaryFileName.bind(context);
            }
            if (context.fromSummaryFileName) {
                this.fromSummaryFileName = context.fromSummaryFileName.bind(context);
            }
            this.metadataReaderHost = {
                cacheMetadata: function () { return true; },
                getSourceFileMetadata: function (filePath) {
                    var sf = _this.getOriginalSourceFile(filePath);
                    return sf ? _this.metadataProvider.getMetadata(sf) : undefined;
                },
                fileExists: function (filePath) { return _this.originalFileExists(filePath); },
                readFile: function (filePath) { return assert(_this.context.readFile(filePath)); },
            };
        }
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.resolveModuleName = function (moduleName, containingFile) {
            var rm = ts.resolveModuleName(moduleName, containingFile.replace(/\\/g, '/'), this.options, this, this.moduleResolutionCache)
                .resolvedModule;
            if (rm && this.isSourceFile(rm.resolvedFileName) && util_1.DTS.test(rm.resolvedFileName)) {
                // Case: generateCodeForLibraries = true and moduleName is
                // a .d.ts file in a node_modules folder.
                // Need to set isExternalLibraryImport to false so that generated files for that file
                // are emitted.
                rm.isExternalLibraryImport = false;
            }
            return rm;
        };
        // Note: We implement this method so that TypeScript and Angular share the same
        // ts.ModuleResolutionCache
        // and that we can tell ts.Program about our different opinion about
        // ResolvedModule.isExternalLibraryImport
        // (see our isSourceFile method).
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.resolveModuleNames = function (moduleNames, containingFile) {
            var _this = this;
            // TODO(tbosch): this seems to be a typing error in TypeScript,
            // as it contains assertions that the result contains the same number of entries
            // as the given module names.
            return moduleNames.map(function (moduleName) { return _this.resolveModuleName(moduleName, containingFile); });
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.moduleNameToFileName = function (m, containingFile) {
            if (!containingFile) {
                if (m.indexOf('.') === 0) {
                    throw new Error('Resolution of relative paths requires a containing file.');
                }
                // Any containing file gives the same result for absolute imports
                containingFile = this.rootFiles[0];
            }
            if (this.context.moduleNameToFileName) {
                return this.context.moduleNameToFileName(m, containingFile);
            }
            var resolved = this.resolveModuleName(m, containingFile);
            return resolved ? resolved.resolvedFileName : null;
        };
        /**
         * We want a moduleId that will appear in import statements in the generated code
         * which will be written to `containingFile`.
         *
         * Note that we also generate files for files in node_modules, as libraries
         * only ship .metadata.json files but not the generated code.
         *
         * Logic:
         * 1. if the importedFile and the containingFile are from the project sources
         *    or from the same node_modules package, use a relative path
         * 2. if the importedFile is in a node_modules package,
         *    use a path that starts with the package name.
         * 3. Error if the containingFile is in the node_modules package
         *    and the importedFile is in the project soures,
         *    as that is a violation of the principle that node_modules packages cannot
         *    import project sources.
         */
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.fileNameToModuleName = function (importedFile, containingFile) {
            var cacheKey = importedFile + ":" + containingFile;
            var moduleName = this.fileNameToModuleNameCache.get(cacheKey);
            if (moduleName != null) {
                return moduleName;
            }
            var originalImportedFile = importedFile;
            if (this.options.traceResolution) {
                console.error('fileNameToModuleName from containingFile', containingFile, 'to importedFile', importedFile);
            }
            // drop extension
            importedFile = importedFile.replace(EXT, '');
            var importedFilePackageName = getPackageName(importedFile);
            var containingFilePackageName = getPackageName(containingFile);
            if (importedFilePackageName === containingFilePackageName ||
                util_1.GENERATED_FILES.test(originalImportedFile)) {
                var rootedContainingFile = util_1.relativeToRootDirs(containingFile, this.rootDirs);
                var rootedImportedFile = util_1.relativeToRootDirs(importedFile, this.rootDirs);
                if (rootedContainingFile !== containingFile && rootedImportedFile !== importedFile) {
                    // if both files are contained in the `rootDirs`, then strip the rootDirs
                    containingFile = rootedContainingFile;
                    importedFile = rootedImportedFile;
                }
                moduleName = dotRelative(path.dirname(containingFile), importedFile);
            }
            else if (importedFilePackageName) {
                moduleName = stripNodeModulesPrefix(importedFile);
                if (originalImportedFile.endsWith('.d.ts')) {
                    // the moduleName for these typings could be shortented to the npm package name
                    // if the npm package typings matches the importedFile
                    try {
                        var modulePath = importedFile.substring(0, importedFile.length - moduleName.length) +
                            importedFilePackageName;
                        var packageJson = require(modulePath + '/package.json');
                        var packageTypings = file_system_1.join(modulePath, packageJson.typings);
                        if (packageTypings === originalImportedFile) {
                            moduleName = importedFilePackageName;
                        }
                    }
                    catch (_a) {
                        // the above require() will throw if there is no package.json file
                        // and this is safe to ignore and correct to keep the longer
                        // moduleName in this case
                    }
                }
            }
            else {
                throw new Error("Trying to import a source file from a node_modules package: import " + originalImportedFile + " from " + containingFile);
            }
            this.fileNameToModuleNameCache.set(cacheKey, moduleName);
            return moduleName;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.resourceNameToFileName = function (resourceName, containingFile) {
            // Note: we convert package paths into relative paths to be compatible with the the
            // previous implementation of UrlResolver.
            var firstChar = resourceName[0];
            if (firstChar === '/') {
                resourceName = resourceName.slice(1);
            }
            else if (firstChar !== '.') {
                resourceName = "./" + resourceName;
            }
            var filePathWithNgResource = this.moduleNameToFileName(addNgResourceSuffix(resourceName), containingFile);
            // If the user specified styleUrl pointing to *.scss, but the Sass compiler was run before
            // Angular, then the resource may have been generated as *.css. Simply try the resolution again.
            if (!filePathWithNgResource && CSS_PREPROCESSOR_EXT.test(resourceName)) {
                var fallbackResourceName = resourceName.replace(CSS_PREPROCESSOR_EXT, '.css');
                filePathWithNgResource =
                    this.moduleNameToFileName(addNgResourceSuffix(fallbackResourceName), containingFile);
            }
            var result = filePathWithNgResource ? stripNgResourceSuffix(filePathWithNgResource) : null;
            // Used under Bazel to report more specific error with remediation advice
            if (!result && this.context.reportMissingResource) {
                this.context.reportMissingResource(resourceName);
            }
            return result;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.toSummaryFileName = function (fileName, referringSrcFileName) {
            return this.fileNameToModuleName(fileName, referringSrcFileName);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.fromSummaryFileName = function (fileName, referringLibFileName) {
            var resolved = this.moduleNameToFileName(fileName, referringLibFileName);
            if (!resolved) {
                throw new Error("Could not resolve " + fileName + " from " + referringLibFileName);
            }
            return resolved;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.parseSourceSpanOf = function (fileName, line, character) {
            var data = this.generatedSourceFiles.get(fileName);
            if (data && data.emitCtx) {
                return data.emitCtx.spanOf(line, character);
            }
            return null;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getOriginalSourceFile = function (filePath, languageVersion, onError) {
            // Note: we need the explicit check via `has` as we also cache results
            // that were null / undefined.
            if (this.originalSourceFiles.has(filePath)) {
                return this.originalSourceFiles.get(filePath);
            }
            if (!languageVersion) {
                languageVersion = this.options.target || ts.ScriptTarget.Latest;
            }
            // Note: This can also return undefined,
            // as the TS typings are not correct!
            var sf = this.context.getSourceFile(filePath, languageVersion, onError) || null;
            this.originalSourceFiles.set(filePath, sf);
            return sf;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.updateGeneratedFile = function (genFile) {
            if (!genFile.stmts) {
                throw new Error("Invalid Argument: Expected a GenerateFile with statements. " + genFile.genFileUrl);
            }
            var oldGenFile = this.generatedSourceFiles.get(genFile.genFileUrl);
            if (!oldGenFile) {
                throw new Error("Illegal State: previous GeneratedFile not found for " + genFile.genFileUrl + ".");
            }
            var newRefs = genFileExternalReferences(genFile);
            var oldRefs = oldGenFile.externalReferences;
            var refsAreEqual = oldRefs.size === newRefs.size;
            if (refsAreEqual) {
                newRefs.forEach(function (r) { return refsAreEqual = refsAreEqual && oldRefs.has(r); });
            }
            if (!refsAreEqual) {
                throw new Error("Illegal State: external references changed in " + genFile.genFileUrl + ".\nOld: " + Array.from(oldRefs) + ".\nNew: " + Array.from(newRefs));
            }
            return this.addGeneratedFile(genFile, newRefs);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.addGeneratedFile = function (genFile, externalReferences) {
            if (!genFile.stmts) {
                throw new Error("Invalid Argument: Expected a GenerateFile with statements. " + genFile.genFileUrl);
            }
            var _a = this.emitter.emitStatementsAndContext(genFile.genFileUrl, genFile.stmts, /* preamble */ '', 
            /* emitSourceMaps */ false), sourceText = _a.sourceText, context = _a.context;
            var sf = ts.createSourceFile(genFile.genFileUrl, sourceText, this.options.target || ts.ScriptTarget.Latest);
            if (this.options.module === ts.ModuleKind.AMD || this.options.module === ts.ModuleKind.UMD) {
                if (this.context.amdModuleName) {
                    var moduleName = this.context.amdModuleName(sf);
                    if (moduleName)
                        sf.moduleName = moduleName;
                }
                else if (/node_modules/.test(genFile.genFileUrl)) {
                    // If we are generating an ngModule file under node_modules, we know the right module name
                    // We don't need the host to supply a function in this case.
                    sf.moduleName = stripNodeModulesPrefix(genFile.genFileUrl.replace(EXT, ''));
                }
            }
            this.generatedSourceFiles.set(genFile.genFileUrl, {
                sourceFile: sf,
                emitCtx: context, externalReferences: externalReferences,
            });
            return sf;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.shouldGenerateFile = function (fileName) {
            var _this = this;
            // TODO(tbosch): allow generating files that are not in the rootDir
            // See https://github.com/angular/angular/issues/19337
            if (!util_1.isInRootDir(fileName, this.options)) {
                return { generate: false };
            }
            var genMatch = util_1.GENERATED_FILES.exec(fileName);
            if (!genMatch) {
                return { generate: false };
            }
            var _a = tslib_1.__read(genMatch, 4), base = _a[1], genSuffix = _a[2], suffix = _a[3];
            if (suffix !== 'ts' && suffix !== 'tsx') {
                return { generate: false };
            }
            var baseFileName;
            if (genSuffix.indexOf('ngstyle') >= 0) {
                // Note: ngstyle files have names like `afile.css.ngstyle.ts`
                if (!this.originalFileExists(base)) {
                    return { generate: false };
                }
            }
            else {
                // Note: on-the-fly generated files always have a `.ts` suffix,
                // but the file from which we generated it can be a `.ts`/ `.tsx`/ `.d.ts`
                // (see options.generateCodeForLibraries).
                baseFileName = [base + ".ts", base + ".tsx", base + ".d.ts"].find(function (baseFileName) { return _this.isSourceFile(baseFileName) && _this.originalFileExists(baseFileName); });
                if (!baseFileName) {
                    return { generate: false };
                }
            }
            return { generate: true, baseFileName: baseFileName };
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.shouldGenerateFilesFor = function (fileName) {
            // TODO(tbosch): allow generating files that are not in the rootDir
            // See https://github.com/angular/angular/issues/19337
            return !util_1.GENERATED_FILES.test(fileName) && this.isSourceFile(fileName) &&
                util_1.isInRootDir(fileName, this.options);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getSourceFile = function (fileName, languageVersion, onError) {
            var _this = this;
            // Note: Don't exit early in this method to make sure
            // we always have up to date references on the file!
            var genFileNames = [];
            var sf = this.getGeneratedFile(fileName);
            if (!sf) {
                var summary = this.librarySummaries.get(fileName);
                if (summary) {
                    if (!summary.sourceFile) {
                        summary.sourceFile = ts.createSourceFile(fileName, summary.text, this.options.target || ts.ScriptTarget.Latest);
                    }
                    sf = summary.sourceFile;
                    genFileNames = [];
                }
            }
            if (!sf) {
                sf = this.getOriginalSourceFile(fileName);
                var cachedGenFiles = this.generatedCodeFor.get(fileName);
                if (cachedGenFiles) {
                    genFileNames = cachedGenFiles;
                }
                else {
                    if (!this.options.noResolve && this.shouldGenerateFilesFor(fileName)) {
                        genFileNames = this.codeGenerator.findGeneratedFileNames(fileName).filter(function (fileName) { return _this.shouldGenerateFile(fileName).generate; });
                    }
                    this.generatedCodeFor.set(fileName, genFileNames);
                }
            }
            if (sf) {
                addReferencesToSourceFile(sf, genFileNames);
            }
            // TODO(tbosch): TypeScript's typings for getSourceFile are incorrect,
            // as it can very well return undefined.
            return sf;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getGeneratedFile = function (fileName) {
            var genSrcFile = this.generatedSourceFiles.get(fileName);
            if (genSrcFile) {
                return genSrcFile.sourceFile;
            }
            var _a = this.shouldGenerateFile(fileName), generate = _a.generate, baseFileName = _a.baseFileName;
            if (generate) {
                var genFile = this.codeGenerator.generateFile(fileName, baseFileName);
                return this.addGeneratedFile(genFile, genFileExternalReferences(genFile));
            }
            return null;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.originalFileExists = function (fileName) {
            var fileExists = this.originalFileExistsCache.get(fileName);
            if (fileExists == null) {
                fileExists = this.context.fileExists(fileName);
                this.originalFileExistsCache.set(fileName, fileExists);
            }
            return fileExists;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.fileExists = function (fileName) {
            fileName = stripNgResourceSuffix(fileName);
            if (this.librarySummaries.has(fileName) || this.generatedSourceFiles.has(fileName)) {
                return true;
            }
            if (this.shouldGenerateFile(fileName).generate) {
                return true;
            }
            return this.originalFileExists(fileName);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.loadSummary = function (filePath) {
            var summary = this.librarySummaries.get(filePath);
            if (summary) {
                return summary.text;
            }
            if (this.originalFileExists(filePath)) {
                return assert(this.context.readFile(filePath));
            }
            return null;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.isSourceFile = function (filePath) {
            // Don't generate any files nor typecheck them
            // if skipTemplateCodegen is set and fullTemplateTypeCheck is not yet set,
            // for backwards compatibility.
            if (this.options.skipTemplateCodegen && !this.options.fullTemplateTypeCheck) {
                return false;
            }
            // If we have a summary from a previous compilation,
            // treat the file never as a source file.
            if (this.librarySummaries.has(filePath)) {
                return false;
            }
            if (util_1.GENERATED_FILES.test(filePath)) {
                return false;
            }
            if (this.options.generateCodeForLibraries === false && util_1.DTS.test(filePath)) {
                return false;
            }
            if (util_1.DTS.test(filePath)) {
                // Check for a bundle index.
                if (this.hasBundleIndex(filePath)) {
                    var normalFilePath = path.normalize(filePath);
                    return this.flatModuleIndexNames.has(normalFilePath) ||
                        this.flatModuleIndexRedirectNames.has(normalFilePath);
                }
            }
            return true;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.readFile = function (fileName) {
            var summary = this.librarySummaries.get(fileName);
            if (summary) {
                return summary.text;
            }
            return this.context.readFile(fileName);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getMetadataFor = function (filePath) {
            return metadata_reader_1.readMetadata(filePath, this.metadataReaderHost, this.metadataReaderCache);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.loadResource = function (filePath) {
            if (this.context.readResource)
                return this.context.readResource(filePath);
            if (!this.originalFileExists(filePath)) {
                throw compiler_1.syntaxError("Error: Resource file not found: " + filePath);
            }
            return assert(this.context.readFile(filePath));
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getOutputName = function (filePath) {
            return path.relative(this.getCurrentDirectory(), filePath);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.hasBundleIndex = function (filePath) {
            var _this = this;
            var checkBundleIndex = function (directory) {
                var result = _this.flatModuleIndexCache.get(directory);
                if (result == null) {
                    if (path.basename(directory) == 'node_module') {
                        // Don't look outside the node_modules this package is installed in.
                        result = false;
                    }
                    else {
                        // A bundle index exists if the typings .d.ts file has a metadata.json that has an
                        // importAs.
                        try {
                            var packageFile = path.join(directory, 'package.json');
                            if (_this.originalFileExists(packageFile)) {
                                // Once we see a package.json file, assume false until it we find the bundle index.
                                result = false;
                                var packageContent = JSON.parse(assert(_this.context.readFile(packageFile)));
                                if (packageContent.typings) {
                                    var typings = path.normalize(path.join(directory, packageContent.typings));
                                    if (util_1.DTS.test(typings)) {
                                        var metadataFile = typings.replace(util_1.DTS, '.metadata.json');
                                        if (_this.originalFileExists(metadataFile)) {
                                            var metadata = JSON.parse(assert(_this.context.readFile(metadataFile)));
                                            if (metadata.flatModuleIndexRedirect) {
                                                _this.flatModuleIndexRedirectNames.add(typings);
                                                // Note: don't set result = true,
                                                // as this would mark this folder
                                                // as having a bundleIndex too early without
                                                // filling the bundleIndexNames.
                                            }
                                            else if (metadata.importAs) {
                                                _this.flatModuleIndexNames.add(typings);
                                                result = true;
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                var parent = path.dirname(directory);
                                if (parent != directory) {
                                    // Try the parent directory.
                                    result = checkBundleIndex(parent);
                                }
                                else {
                                    result = false;
                                }
                            }
                        }
                        catch (_a) {
                            // If we encounter any errors assume we this isn't a bundle index.
                            result = false;
                        }
                    }
                    _this.flatModuleIndexCache.set(directory, result);
                }
                return result;
            };
            return checkBundleIndex(path.dirname(filePath));
        };
        return TsCompilerAotCompilerTypeCheckHostAdapter;
    }());
    exports.TsCompilerAotCompilerTypeCheckHostAdapter = TsCompilerAotCompilerTypeCheckHostAdapter;
    function genFileExternalReferences(genFile) {
        return new Set(compiler_1.collectExternalReferences(genFile.stmts).map(function (er) { return er.moduleName; }));
    }
    function addReferencesToSourceFile(sf, genFileNames) {
        // Note: as we modify ts.SourceFiles we need to keep the original
        // value for `referencedFiles` around in cache the original host is caching ts.SourceFiles.
        // Note: cloning the ts.SourceFile is expensive as the nodes in have parent pointers,
        // i.e. we would also need to clone and adjust all nodes.
        var originalReferencedFiles = sf.originalReferencedFiles;
        if (!originalReferencedFiles) {
            originalReferencedFiles = sf.referencedFiles;
            sf.originalReferencedFiles = originalReferencedFiles;
        }
        var newReferencedFiles = tslib_1.__spread(originalReferencedFiles);
        genFileNames.forEach(function (gf) { return newReferencedFiles.push({ fileName: gf, pos: 0, end: 0 }); });
        sf.referencedFiles = newReferencedFiles;
    }
    function getOriginalReferences(sourceFile) {
        return sourceFile && sourceFile.originalReferencedFiles;
    }
    exports.getOriginalReferences = getOriginalReferences;
    function dotRelative(from, to) {
        var rPath = path.relative(from, to).replace(/\\/g, '/');
        return rPath.startsWith('.') ? rPath : './' + rPath;
    }
    /**
     * Moves the path into `genDir` folder while preserving the `node_modules` directory.
     */
    function getPackageName(filePath) {
        var match = NODE_MODULES_PACKAGE_NAME.exec(filePath);
        return match ? match[1] : null;
    }
    function stripNodeModulesPrefix(filePath) {
        return filePath.replace(/.*node_modules\//, '');
    }
    function getNodeModulesPrefix(filePath) {
        var match = /.*node_modules\//.exec(filePath);
        return match ? match[1] : null;
    }
    function stripNgResourceSuffix(fileName) {
        return fileName.replace(/\.\$ngresource\$.*/, '');
    }
    function addNgResourceSuffix(fileName) {
        return fileName + ".$ngresource$";
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvdHJhbnNmb3JtZXJzL2NvbXBpbGVyX2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQW9LO0lBQ3BLLDJCQUE2QjtJQUM3QiwrQkFBaUM7SUFJakMsMkVBQTBDO0lBRzFDLDBGQUE4RjtJQUM5RixvRUFBNkU7SUFFN0UsSUFBTSx5QkFBeUIsR0FBRyxzREFBc0QsQ0FBQztJQUN6RixJQUFNLEdBQUcsR0FBRyxrQ0FBa0MsQ0FBQztJQUMvQyxJQUFNLG9CQUFvQixHQUFHLHlCQUF5QixDQUFDO0lBRXZELElBQUksZUFBZSxHQUFzRCxJQUFJLENBQUM7SUFFOUUsU0FBZ0Isa0JBQWtCLENBQUMsTUFBMkQ7UUFFNUYsZUFBZSxHQUFHLE1BQU0sQ0FBQztJQUMzQixDQUFDO0lBSEQsZ0RBR0M7SUFFRCxTQUFnQixrQkFBa0IsQ0FDOUIsRUFDd0Q7WUFEdkQsb0JBQU8sRUFBRSxjQUE2QyxFQUE3QyxrRUFBNkM7UUFFekQsSUFBSSxlQUFlLEtBQUssSUFBSSxFQUFFO1lBQzVCLE1BQU0sR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBUEQsZ0RBT0M7SUFpQkQsU0FBUyxNQUFNLENBQUksU0FBK0I7UUFDaEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNkLHFDQUFxQztTQUN0QztRQUNELE9BQU8sU0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNIO1FBNEJFLG1EQUNZLFNBQWdDLEVBQVUsT0FBd0IsRUFDbEUsT0FBcUIsRUFBVSxnQkFBa0MsRUFDakUsYUFBNEIsRUFDNUIsZ0JBQW9EO1lBSmhFLGlCQTBEQztZQXREVyxpQ0FBQSxFQUFB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R29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QW90Q29tcGlsZXJIb3N0LCBFbWl0dGVyVmlzaXRvckNvbnRleHQsIEdlbmVyYXRlZEZpbGUsIFBhcnNlU291cmNlU3BhbiwgVHlwZVNjcmlwdEVtaXR0ZXIsIGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXMsIHN5bnRheEVycm9yfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7VHlwZUNoZWNrSG9zdH0gZnJvbSAnLi4vZGlhZ25vc3RpY3MvdHJhbnNsYXRlX2RpYWdub3N0aWNzJztcbmltcG9ydCB7TW9kdWxlTWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2luZGV4JztcbmltcG9ydCB7am9pbn0gZnJvbSAnLi4vbmd0c2MvZmlsZV9zeXN0ZW0nO1xuXG5pbXBvcnQge0NvbXBpbGVySG9zdCwgQ29tcGlsZXJPcHRpb25zLCBMaWJyYXJ5U3VtbWFyeX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtNZXRhZGF0YVJlYWRlckhvc3QsIGNyZWF0ZU1ldGFkYXRhUmVhZGVyQ2FjaGUsIHJlYWRNZXRhZGF0YX0gZnJvbSAnLi9tZXRhZGF0YV9yZWFkZXInO1xuaW1wb3J0IHtEVFMsIEdFTkVSQVRFRF9GSUxFUywgaXNJblJvb3REaXIsIHJlbGF0aXZlVG9Sb290RGlyc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgTk9ERV9NT0RVTEVTX1BBQ0tBR0VfTkFNRSA9IC9ub2RlX21vZHVsZXNcXC8oKFxcd3wtfFxcLikrfChAKFxcd3wtfFxcLikrXFwvKFxcd3wtfFxcLikrKSkvO1xuY29uc3QgRVhUID0gLyhcXC50c3xcXC5kXFwudHN8XFwuanN8XFwuanN4fFxcLnRzeCkkLztcbmNvbnN0IENTU19QUkVQUk9DRVNTT1JfRVhUID0gLyhcXC5zY3NzfFxcLmxlc3N8XFwuc3R5bCkkLztcblxubGV0IHdyYXBIb3N0Rm9yVGVzdDogKChob3N0OiB0cy5Db21waWxlckhvc3QpID0+IHRzLkNvbXBpbGVySG9zdCl8bnVsbCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRXcmFwSG9zdEZvclRlc3Qod3JhcEZuOiAoKGhvc3Q6IHRzLkNvbXBpbGVySG9zdCkgPT4gdHMuQ29tcGlsZXJIb3N0KSB8IG51bGwpOlxuICAgIHZvaWQge1xuICB3cmFwSG9zdEZvclRlc3QgPSB3cmFwRm47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21waWxlckhvc3QoXG4gICAge29wdGlvbnMsIHRzSG9zdCA9IHRzLmNyZWF0ZUNvbXBpbGVySG9zdChvcHRpb25zLCB0cnVlKX06XG4gICAgICAgIHtvcHRpb25zOiBDb21waWxlck9wdGlvbnMsIHRzSG9zdD86IHRzLkNvbXBpbGVySG9zdH0pOiBDb21waWxlckhvc3Qge1xuICBpZiAod3JhcEhvc3RGb3JUZXN0ICE9PSBudWxsKSB7XG4gICAgdHNIb3N0ID0gd3JhcEhvc3RGb3JUZXN0KHRzSG9zdCk7XG4gIH1cbiAgcmV0dXJuIHRzSG9zdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVByb3ZpZGVyIHtcbiAgZ2V0TWV0YWRhdGEoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZDtcbn1cblxuaW50ZXJmYWNlIEdlblNvdXJjZUZpbGUge1xuICBleHRlcm5hbFJlZmVyZW5jZXM6IFNldDxzdHJpbmc+O1xuICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlO1xuICBlbWl0Q3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29kZUdlbmVyYXRvciB7XG4gIGdlbmVyYXRlRmlsZShnZW5GaWxlTmFtZTogc3RyaW5nLCBiYXNlRmlsZU5hbWU/OiBzdHJpbmcpOiBHZW5lcmF0ZWRGaWxlO1xuICBmaW5kR2VuZXJhdGVkRmlsZU5hbWVzKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0PFQ+KGNvbmRpdGlvbjogVCB8IG51bGwgfCB1bmRlZmluZWQpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAvLyBUT0RPKGNodWNramF6KTogZG8gdGhlIHJpZ2h0IHRoaW5nXG4gIH1cbiAgcmV0dXJuIGNvbmRpdGlvbiAhO1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgdGhlIGZvbGxvd2luZyBob3N0cyBiYXNlZCBvbiBhbiBhcGkuQ29tcGlsZXJIb3N0OlxuICogLSB0cy5Db21waWxlckhvc3QgdG8gYmUgY29uc3VtZWQgYnkgYSB0cy5Qcm9ncmFtXG4gKiAtIEFvdENvbXBpbGVySG9zdCBmb3IgQGFuZ3VsYXIvY29tcGlsZXJcbiAqIC0gVHlwZUNoZWNrSG9zdCBmb3IgbWFwcGluZyB0cyBlcnJvcnMgdG8gbmcgZXJyb3JzICh2aWEgdHJhbnNsYXRlRGlhZ25vc3RpY3MpXG4gKi9cbmV4cG9ydCBjbGFzcyBUc0NvbXBpbGVyQW90Q29tcGlsZXJUeXBlQ2hlY2tIb3N0QWRhcHRlciBpbXBsZW1lbnRzIHRzLkNvbXBpbGVySG9zdCwgQW90Q29tcGlsZXJIb3N0LFxuICAgIFR5cGVDaGVja0hvc3Qge1xuICBwcml2YXRlIG1ldGFkYXRhUmVhZGVyQ2FjaGUgPSBjcmVhdGVNZXRhZGF0YVJlYWRlckNhY2hlKCk7XG4gIHByaXZhdGUgZmlsZU5hbWVUb01vZHVsZU5hbWVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgZmxhdE1vZHVsZUluZGV4Q2FjaGUgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBmbGF0TW9kdWxlSW5kZXhOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIGZsYXRNb2R1bGVJbmRleFJlZGlyZWN0TmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSByb290RGlyczogc3RyaW5nW107XG4gIHByaXZhdGUgbW9kdWxlUmVzb2x1dGlvbkNhY2hlOiB0cy5Nb2R1bGVSZXNvbHV0aW9uQ2FjaGU7XG4gIHByaXZhdGUgb3JpZ2luYWxTb3VyY2VGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlfG51bGw+KCk7XG4gIHByaXZhdGUgb3JpZ2luYWxGaWxlRXhpc3RzQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBnZW5lcmF0ZWRTb3VyY2VGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBHZW5Tb3VyY2VGaWxlPigpO1xuICBwcml2YXRlIGdlbmVyYXRlZENvZGVGb3IgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gIHByaXZhdGUgZW1pdHRlciA9IG5ldyBUeXBlU2NyaXB0RW1pdHRlcigpO1xuICBwcml2YXRlIG1ldGFkYXRhUmVhZGVySG9zdDogTWV0YWRhdGFSZWFkZXJIb3N0O1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBnZXRDYW5jZWxsYXRpb25Ub2tlbiAhOiAoKSA9PiB0cy5DYW5jZWxsYXRpb25Ub2tlbjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIGdldERlZmF1bHRMaWJMb2NhdGlvbiAhOiAoKSA9PiBzdHJpbmc7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICB0cmFjZSAhOiAoczogc3RyaW5nKSA9PiB2b2lkO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgZ2V0RGlyZWN0b3JpZXMgITogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nW107XG4gIHJlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcz86XG4gICAgICAobmFtZXM6IHN0cmluZ1tdLCBjb250YWluaW5nRmlsZTogc3RyaW5nKSA9PiB0cy5SZXNvbHZlZFR5cGVSZWZlcmVuY2VEaXJlY3RpdmVbXTtcbiAgZGlyZWN0b3J5RXhpc3RzPzogKGRpcmVjdG9yeU5hbWU6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcm9vdEZpbGVzOiBSZWFkb25seUFycmF5PHN0cmluZz4sIHByaXZhdGUgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zLFxuICAgICAgcHJpdmF0ZSBjb250ZXh0OiBDb21waWxlckhvc3QsIHByaXZhdGUgbWV0YWRhdGFQcm92aWRlcjogTWV0YWRhdGFQcm92aWRlcixcbiAgICAgIHByaXZhdGUgY29kZUdlbmVyYXRvcjogQ29kZUdlbmVyYXRvcixcbiAgICAgIHByaXZhdGUgbGlicmFyeVN1bW1hcmllcyA9IG5ldyBNYXA8c3RyaW5nLCBMaWJyYXJ5U3VtbWFyeT4oKSkge1xuICAgIHRoaXMubW9kdWxlUmVzb2x1dGlvbkNhY2hlID0gdHMuY3JlYXRlTW9kdWxlUmVzb2x1dGlvbkNhY2hlKFxuICAgICAgICB0aGlzLmNvbnRleHQuZ2V0Q3VycmVudERpcmVjdG9yeSAhKCksIHRoaXMuY29udGV4dC5nZXRDYW5vbmljYWxGaWxlTmFtZS5iaW5kKHRoaXMuY29udGV4dCkpO1xuICAgIGNvbnN0IGJhc2VQYXRoID0gdGhpcy5vcHRpb25zLmJhc2VQYXRoICE7XG4gICAgdGhpcy5yb290RGlycyA9XG4gICAgICAgICh0aGlzLm9wdGlvbnMucm9vdERpcnMgfHwgW3RoaXMub3B0aW9ucy5iYXNlUGF0aCAhXSkubWFwKHAgPT4gcGF0aC5yZXNvbHZlKGJhc2VQYXRoLCBwKSk7XG4gICAgaWYgKGNvbnRleHQuZ2V0RGlyZWN0b3JpZXMpIHtcbiAgICAgIHRoaXMuZ2V0RGlyZWN0b3JpZXMgPSBwYXRoID0+IGNvbnRleHQuZ2V0RGlyZWN0b3JpZXMgIShwYXRoKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQuZGlyZWN0b3J5RXhpc3RzKSB7XG4gICAgICB0aGlzLmRpcmVjdG9yeUV4aXN0cyA9IGRpcmVjdG9yeU5hbWUgPT4gY29udGV4dC5kaXJlY3RvcnlFeGlzdHMgIShkaXJlY3RvcnlOYW1lKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQuZ2V0Q2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgIHRoaXMuZ2V0Q2FuY2VsbGF0aW9uVG9rZW4gPSAoKSA9PiBjb250ZXh0LmdldENhbmNlbGxhdGlvblRva2VuICEoKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQuZ2V0RGVmYXVsdExpYkxvY2F0aW9uKSB7XG4gICAgICB0aGlzLmdldERlZmF1bHRMaWJMb2NhdGlvbiA9ICgpID0+IGNvbnRleHQuZ2V0RGVmYXVsdExpYkxvY2F0aW9uICEoKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQucmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzKSB7XG4gICAgICAvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggVHlwZVNjcmlwdCAyLjkgYW5kIG9sZGVyIHNpbmNlIHJldHVyblxuICAgICAgLy8gdHlwZSBoYXMgY2hhbmdlZCBmcm9tICh0cy5SZXNvbHZlZFR5cGVSZWZlcmVuY2VEaXJlY3RpdmUgfCB1bmRlZmluZWQpW11cbiAgICAgIC8vIHRvIHRzLlJlc29sdmVkVHlwZVJlZmVyZW5jZURpcmVjdGl2ZVtdIGluIFR5cGVzY3JpcHQgMy4wXG4gICAgICB0eXBlIHRzM1Jlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcyA9IChuYW1lczogc3RyaW5nW10sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpID0+XG4gICAgICAgICAgdHMuUmVzb2x2ZWRUeXBlUmVmZXJlbmNlRGlyZWN0aXZlW107XG4gICAgICB0aGlzLnJlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcyA9IChuYW1lczogc3RyaW5nW10sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpID0+XG4gICAgICAgICAgKGNvbnRleHQucmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzIGFzIHRzM1Jlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcykgIShcbiAgICAgICAgICAgICAgbmFtZXMsIGNvbnRhaW5pbmdGaWxlKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQudHJhY2UpIHtcbiAgICAgIHRoaXMudHJhY2UgPSBzID0+IGNvbnRleHQudHJhY2UgIShzKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQuZmlsZU5hbWVUb01vZHVsZU5hbWUpIHtcbiAgICAgIHRoaXMuZmlsZU5hbWVUb01vZHVsZU5hbWUgPSBjb250ZXh0LmZpbGVOYW1lVG9Nb2R1bGVOYW1lLmJpbmQoY29udGV4dCk7XG4gICAgfVxuICAgIC8vIE5vdGU6IGRvbid0IGNvcHkgb3ZlciBjb250ZXh0Lm1vZHVsZU5hbWVUb0ZpbGVOYW1lIGFzIHdlIGZpcnN0XG4gICAgLy8gbm9ybWFsaXplIHVuZGVmaW5lZCBjb250YWluaW5nRmlsZSB0byBhIGZpbGxlZCBjb250YWluaW5nRmlsZS5cbiAgICBpZiAoY29udGV4dC5yZXNvdXJjZU5hbWVUb0ZpbGVOYW1lKSB7XG4gICAgICB0aGlzLnJlc291cmNlTmFtZVRvRmlsZU5hbWUgPSBjb250ZXh0LnJlc291cmNlTmFtZVRvRmlsZU5hbWUuYmluZChjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQudG9TdW1tYXJ5RmlsZU5hbWUpIHtcbiAgICAgIHRoaXMudG9TdW1tYXJ5RmlsZU5hbWUgPSBjb250ZXh0LnRvU3VtbWFyeUZpbGVOYW1lLmJpbmQoY29udGV4dCk7XG4gICAgfVxuICAgIGlmIChjb250ZXh0LmZyb21TdW1tYXJ5RmlsZU5hbWUpIHtcbiAgICAgIHRoaXMuZnJvbVN1bW1hcnlGaWxlTmFtZSA9IGNvbnRleHQuZnJvbVN1bW1hcnlGaWxlTmFtZS5iaW5kKGNvbnRleHQpO1xuICAgIH1cbiAgICB0aGlzLm1ldGFkYXRhUmVhZGVySG9zdCA9IHtcbiAgICAgIGNhY2hlTWV0YWRhdGE6ICgpID0+IHRydWUsXG4gICAgICBnZXRTb3VyY2VGaWxlTWV0YWRhdGE6IChmaWxlUGF0aCkgPT4ge1xuICAgICAgICBjb25zdCBzZiA9IHRoaXMuZ2V0T3JpZ2luYWxTb3VyY2VGaWxlKGZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIHNmID8gdGhpcy5tZXRhZGF0YVByb3ZpZGVyLmdldE1ldGFkYXRhKHNmKSA6IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICBmaWxlRXhpc3RzOiAoZmlsZVBhdGgpID0+IHRoaXMub3JpZ2luYWxGaWxlRXhpc3RzKGZpbGVQYXRoKSxcbiAgICAgIHJlYWRGaWxlOiAoZmlsZVBhdGgpID0+IGFzc2VydCh0aGlzLmNvbnRleHQucmVhZEZpbGUoZmlsZVBhdGgpKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlTW9kdWxlTmFtZShtb2R1bGVOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiB0cy5SZXNvbHZlZE1vZHVsZVxuICAgICAgfHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgcm0gPSB0cy5yZXNvbHZlTW9kdWxlTmFtZShcbiAgICAgICAgICAgICAgICAgICAgIG1vZHVsZU5hbWUsIGNvbnRhaW5pbmdGaWxlLnJlcGxhY2UoL1xcXFwvZywgJy8nKSwgdGhpcy5vcHRpb25zLCB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVSZXNvbHV0aW9uQ2FjaGUpXG4gICAgICAgICAgICAgICAgICAgLnJlc29sdmVkTW9kdWxlO1xuICAgIGlmIChybSAmJiB0aGlzLmlzU291cmNlRmlsZShybS5yZXNvbHZlZEZpbGVOYW1lKSAmJiBEVFMudGVzdChybS5yZXNvbHZlZEZpbGVOYW1lKSkge1xuICAgICAgLy8gQ2FzZTogZ2VuZXJhdGVDb2RlRm9yTGlicmFyaWVzID0gdHJ1ZSBhbmQgbW9kdWxlTmFtZSBpc1xuICAgICAgLy8gYSAuZC50cyBmaWxlIGluIGEgbm9kZV9tb2R1bGVzIGZvbGRlci5cbiAgICAgIC8vIE5lZWQgdG8gc2V0IGlzRXh0ZXJuYWxMaWJyYXJ5SW1wb3J0IHRvIGZhbHNlIHNvIHRoYXQgZ2VuZXJhdGVkIGZpbGVzIGZvciB0aGF0IGZpbGVcbiAgICAgIC8vIGFyZSBlbWl0dGVkLlxuICAgICAgcm0uaXNFeHRlcm5hbExpYnJhcnlJbXBvcnQgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHJtO1xuICB9XG5cbiAgLy8gTm90ZTogV2UgaW1wbGVtZW50IHRoaXMgbWV0aG9kIHNvIHRoYXQgVHlwZVNjcmlwdCBhbmQgQW5ndWxhciBzaGFyZSB0aGUgc2FtZVxuICAvLyB0cy5Nb2R1bGVSZXNvbHV0aW9uQ2FjaGVcbiAgLy8gYW5kIHRoYXQgd2UgY2FuIHRlbGwgdHMuUHJvZ3JhbSBhYm91dCBvdXIgZGlmZmVyZW50IG9waW5pb24gYWJvdXRcbiAgLy8gUmVzb2x2ZWRNb2R1bGUuaXNFeHRlcm5hbExpYnJhcnlJbXBvcnRcbiAgLy8gKHNlZSBvdXIgaXNTb3VyY2VGaWxlIG1ldGhvZCkuXG4gIHJlc29sdmVNb2R1bGVOYW1lcyhtb2R1bGVOYW1lczogc3RyaW5nW10sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiB0cy5SZXNvbHZlZE1vZHVsZVtdIHtcbiAgICAvLyBUT0RPKHRib3NjaCk6IHRoaXMgc2VlbXMgdG8gYmUgYSB0eXBpbmcgZXJyb3IgaW4gVHlwZVNjcmlwdCxcbiAgICAvLyBhcyBpdCBjb250YWlucyBhc3NlcnRpb25zIHRoYXQgdGhlIHJlc3VsdCBjb250YWlucyB0aGUgc2FtZSBudW1iZXIgb2YgZW50cmllc1xuICAgIC8vIGFzIHRoZSBnaXZlbiBtb2R1bGUgbmFtZXMuXG4gICAgcmV0dXJuIDx0cy5SZXNvbHZlZE1vZHVsZVtdPm1vZHVsZU5hbWVzLm1hcChcbiAgICAgICAgbW9kdWxlTmFtZSA9PiB0aGlzLnJlc29sdmVNb2R1bGVOYW1lKG1vZHVsZU5hbWUsIGNvbnRhaW5pbmdGaWxlKSk7XG4gIH1cblxuICBtb2R1bGVOYW1lVG9GaWxlTmFtZShtOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmICghY29udGFpbmluZ0ZpbGUpIHtcbiAgICAgIGlmIChtLmluZGV4T2YoJy4nKSA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc29sdXRpb24gb2YgcmVsYXRpdmUgcGF0aHMgcmVxdWlyZXMgYSBjb250YWluaW5nIGZpbGUuJyk7XG4gICAgICB9XG4gICAgICAvLyBBbnkgY29udGFpbmluZyBmaWxlIGdpdmVzIHRoZSBzYW1lIHJlc3VsdCBmb3IgYWJzb2x1dGUgaW1wb3J0c1xuICAgICAgY29udGFpbmluZ0ZpbGUgPSB0aGlzLnJvb3RGaWxlc1swXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY29udGV4dC5tb2R1bGVOYW1lVG9GaWxlTmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5tb2R1bGVOYW1lVG9GaWxlTmFtZShtLCBjb250YWluaW5nRmlsZSk7XG4gICAgfVxuICAgIGNvbnN0IHJlc29sdmVkID0gdGhpcy5yZXNvbHZlTW9kdWxlTmFtZShtLCBjb250YWluaW5nRmlsZSk7XG4gICAgcmV0dXJuIHJlc29sdmVkID8gcmVzb2x2ZWQucmVzb2x2ZWRGaWxlTmFtZSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogV2Ugd2FudCBhIG1vZHVsZUlkIHRoYXQgd2lsbCBhcHBlYXIgaW4gaW1wb3J0IHN0YXRlbWVudHMgaW4gdGhlIGdlbmVyYXRlZCBjb2RlXG4gICAqIHdoaWNoIHdpbGwgYmUgd3JpdHRlbiB0byBgY29udGFpbmluZ0ZpbGVgLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgd2UgYWxzbyBnZW5lcmF0ZSBmaWxlcyBmb3IgZmlsZXMgaW4gbm9kZV9tb2R1bGVzLCBhcyBsaWJyYXJpZXNcbiAgICogb25seSBzaGlwIC5tZXRhZGF0YS5qc29uIGZpbGVzIGJ1dCBub3QgdGhlIGdlbmVyYXRlZCBjb2RlLlxuICAgKlxuICAgKiBMb2dpYzpcbiAgICogMS4gaWYgdGhlIGltcG9ydGVkRmlsZSBhbmQgdGhlIGNvbnRhaW5pbmdGaWxlIGFyZSBmcm9tIHRoZSBwcm9qZWN0IHNvdXJjZXNcbiAgICogICAgb3IgZnJvbSB0aGUgc2FtZSBub2RlX21vZHVsZXMgcGFja2FnZSwgdXNlIGEgcmVsYXRpdmUgcGF0aFxuICAgKiAyLiBpZiB0aGUgaW1wb3J0ZWRGaWxlIGlzIGluIGEgbm9kZV9tb2R1bGVzIHBhY2thZ2UsXG4gICAqICAgIHVzZSBhIHBhdGggdGhhdCBzdGFydHMgd2l0aCB0aGUgcGFja2FnZSBuYW1lLlxuICAgKiAzLiBFcnJvciBpZiB0aGUgY29udGFpbmluZ0ZpbGUgaXMgaW4gdGhlIG5vZGVfbW9kdWxlcyBwYWNrYWdlXG4gICAqICAgIGFuZCB0aGUgaW1wb3J0ZWRGaWxlIGlzIGluIHRoZSBwcm9qZWN0IHNvdXJlcyxcbiAgICogICAgYXMgdGhhdCBpcyBhIHZpb2xhdGlvbiBvZiB0aGUgcHJpbmNpcGxlIHRoYXQgbm9kZV9tb2R1bGVzIHBhY2thZ2VzIGNhbm5vdFxuICAgKiAgICBpbXBvcnQgcHJvamVjdCBzb3VyY2VzLlxuICAgKi9cbiAgZmlsZU5hbWVUb01vZHVsZU5hbWUoaW1wb3J0ZWRGaWxlOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gYCR7aW1wb3J0ZWRGaWxlfToke2NvbnRhaW5pbmdGaWxlfWA7XG4gICAgbGV0IG1vZHVsZU5hbWUgPSB0aGlzLmZpbGVOYW1lVG9Nb2R1bGVOYW1lQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICBpZiAobW9kdWxlTmFtZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gbW9kdWxlTmFtZTtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnaW5hbEltcG9ydGVkRmlsZSA9IGltcG9ydGVkRmlsZTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYWNlUmVzb2x1dGlvbikge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAnZmlsZU5hbWVUb01vZHVsZU5hbWUgZnJvbSBjb250YWluaW5nRmlsZScsIGNvbnRhaW5pbmdGaWxlLCAndG8gaW1wb3J0ZWRGaWxlJyxcbiAgICAgICAgICBpbXBvcnRlZEZpbGUpO1xuICAgIH1cblxuICAgIC8vIGRyb3AgZXh0ZW5zaW9uXG4gICAgaW1wb3J0ZWRGaWxlID0gaW1wb3J0ZWRGaWxlLnJlcGxhY2UoRVhULCAnJyk7XG4gICAgY29uc3QgaW1wb3J0ZWRGaWxlUGFja2FnZU5hbWUgPSBnZXRQYWNrYWdlTmFtZShpbXBvcnRlZEZpbGUpO1xuICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlUGFja2FnZU5hbWUgPSBnZXRQYWNrYWdlTmFtZShjb250YWluaW5nRmlsZSk7XG5cbiAgICBpZiAoaW1wb3J0ZWRGaWxlUGFja2FnZU5hbWUgPT09IGNvbnRhaW5pbmdGaWxlUGFja2FnZU5hbWUgfHxcbiAgICAgICAgR0VORVJBVEVEX0ZJTEVTLnRlc3Qob3JpZ2luYWxJbXBvcnRlZEZpbGUpKSB7XG4gICAgICBjb25zdCByb290ZWRDb250YWluaW5nRmlsZSA9IHJlbGF0aXZlVG9Sb290RGlycyhjb250YWluaW5nRmlsZSwgdGhpcy5yb290RGlycyk7XG4gICAgICBjb25zdCByb290ZWRJbXBvcnRlZEZpbGUgPSByZWxhdGl2ZVRvUm9vdERpcnMoaW1wb3J0ZWRGaWxlLCB0aGlzLnJvb3REaXJzKTtcblxuICAgICAgaWYgKHJvb3RlZENvbnRhaW5pbmdGaWxlICE9PSBjb250YWluaW5nRmlsZSAmJiByb290ZWRJbXBvcnRlZEZpbGUgIT09IGltcG9ydGVkRmlsZSkge1xuICAgICAgICAvLyBpZiBib3RoIGZpbGVzIGFyZSBjb250YWluZWQgaW4gdGhlIGByb290RGlyc2AsIHRoZW4gc3RyaXAgdGhlIHJvb3REaXJzXG4gICAgICAgIGNvbnRhaW5pbmdGaWxlID0gcm9vdGVkQ29udGFpbmluZ0ZpbGU7XG4gICAgICAgIGltcG9ydGVkRmlsZSA9IHJvb3RlZEltcG9ydGVkRmlsZTtcbiAgICAgIH1cbiAgICAgIG1vZHVsZU5hbWUgPSBkb3RSZWxhdGl2ZShwYXRoLmRpcm5hbWUoY29udGFpbmluZ0ZpbGUpLCBpbXBvcnRlZEZpbGUpO1xuICAgIH0gZWxzZSBpZiAoaW1wb3J0ZWRGaWxlUGFja2FnZU5hbWUpIHtcbiAgICAgIG1vZHVsZU5hbWUgPSBzdHJpcE5vZGVNb2R1bGVzUHJlZml4KGltcG9ydGVkRmlsZSk7XG4gICAgICBpZiAob3JpZ2luYWxJbXBvcnRlZEZpbGUuZW5kc1dpdGgoJy5kLnRzJykpIHtcbiAgICAgICAgLy8gdGhlIG1vZHVsZU5hbWUgZm9yIHRoZXNlIHR5cGluZ3MgY291bGQgYmUgc2hvcnRlbnRlZCB0byB0aGUgbnBtIHBhY2thZ2UgbmFtZVxuICAgICAgICAvLyBpZiB0aGUgbnBtIHBhY2thZ2UgdHlwaW5ncyBtYXRjaGVzIHRoZSBpbXBvcnRlZEZpbGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBtb2R1bGVQYXRoID0gaW1wb3J0ZWRGaWxlLnN1YnN0cmluZygwLCBpbXBvcnRlZEZpbGUubGVuZ3RoIC0gbW9kdWxlTmFtZS5sZW5ndGgpICtcbiAgICAgICAgICAgICAgaW1wb3J0ZWRGaWxlUGFja2FnZU5hbWU7XG4gICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPSByZXF1aXJlKG1vZHVsZVBhdGggKyAnL3BhY2thZ2UuanNvbicpO1xuICAgICAgICAgIGNvbnN0IHBhY2thZ2VUeXBpbmdzID0gam9pbihtb2R1bGVQYXRoLCBwYWNrYWdlSnNvbi50eXBpbmdzKTtcbiAgICAgICAgICBpZiAocGFja2FnZVR5cGluZ3MgPT09IG9yaWdpbmFsSW1wb3J0ZWRGaWxlKSB7XG4gICAgICAgICAgICBtb2R1bGVOYW1lID0gaW1wb3J0ZWRGaWxlUGFja2FnZU5hbWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyB0aGUgYWJvdmUgcmVxdWlyZSgpIHdpbGwgdGhyb3cgaWYgdGhlcmUgaXMgbm8gcGFja2FnZS5qc29uIGZpbGVcbiAgICAgICAgICAvLyBhbmQgdGhpcyBpcyBzYWZlIHRvIGlnbm9yZSBhbmQgY29ycmVjdCB0byBrZWVwIHRoZSBsb25nZXJcbiAgICAgICAgICAvLyBtb2R1bGVOYW1lIGluIHRoaXMgY2FzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGltcG9ydCBhIHNvdXJjZSBmaWxlIGZyb20gYSBub2RlX21vZHVsZXMgcGFja2FnZTogaW1wb3J0ICR7b3JpZ2luYWxJbXBvcnRlZEZpbGV9IGZyb20gJHtjb250YWluaW5nRmlsZX1gKTtcbiAgICB9XG5cbiAgICB0aGlzLmZpbGVOYW1lVG9Nb2R1bGVOYW1lQ2FjaGUuc2V0KGNhY2hlS2V5LCBtb2R1bGVOYW1lKTtcbiAgICByZXR1cm4gbW9kdWxlTmFtZTtcbiAgfVxuXG4gIHJlc291cmNlTmFtZVRvRmlsZU5hbWUocmVzb3VyY2VOYW1lOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgLy8gTm90ZTogd2UgY29udmVydCBwYWNrYWdlIHBhdGhzIGludG8gcmVsYXRpdmUgcGF0aHMgdG8gYmUgY29tcGF0aWJsZSB3aXRoIHRoZSB0aGVcbiAgICAvLyBwcmV2aW91cyBpbXBsZW1lbnRhdGlvbiBvZiBVcmxSZXNvbHZlci5cbiAgICBjb25zdCBmaXJzdENoYXIgPSByZXNvdXJjZU5hbWVbMF07XG4gICAgaWYgKGZpcnN0Q2hhciA9PT0gJy8nKSB7XG4gICAgICByZXNvdXJjZU5hbWUgPSByZXNvdXJjZU5hbWUuc2xpY2UoMSk7XG4gICAgfSBlbHNlIGlmIChmaXJzdENoYXIgIT09ICcuJykge1xuICAgICAgcmVzb3VyY2VOYW1lID0gYC4vJHtyZXNvdXJjZU5hbWV9YDtcbiAgICB9XG4gICAgbGV0IGZpbGVQYXRoV2l0aE5nUmVzb3VyY2UgPVxuICAgICAgICB0aGlzLm1vZHVsZU5hbWVUb0ZpbGVOYW1lKGFkZE5nUmVzb3VyY2VTdWZmaXgocmVzb3VyY2VOYW1lKSwgY29udGFpbmluZ0ZpbGUpO1xuICAgIC8vIElmIHRoZSB1c2VyIHNwZWNpZmllZCBzdHlsZVVybCBwb2ludGluZyB0byAqLnNjc3MsIGJ1dCB0aGUgU2FzcyBjb21waWxlciB3YXMgcnVuIGJlZm9yZVxuICAgIC8vIEFuZ3VsYXIsIHRoZW4gdGhlIHJlc291cmNlIG1heSBoYXZlIGJlZW4gZ2VuZXJhdGVkIGFzICouY3NzLiBTaW1wbHkgdHJ5IHRoZSByZXNvbHV0aW9uIGFnYWluLlxuICAgIGlmICghZmlsZVBhdGhXaXRoTmdSZXNvdXJjZSAmJiBDU1NfUFJFUFJPQ0VTU09SX0VYVC50ZXN0KHJlc291cmNlTmFtZSkpIHtcbiAgICAgIGNvbnN0IGZhbGxiYWNrUmVzb3VyY2VOYW1lID0gcmVzb3VyY2VOYW1lLnJlcGxhY2UoQ1NTX1BSRVBST0NFU1NPUl9FWFQsICcuY3NzJyk7XG4gICAgICBmaWxlUGF0aFdpdGhOZ1Jlc291cmNlID1cbiAgICAgICAgICB0aGlzLm1vZHVsZU5hbWVUb0ZpbGVOYW1lKGFkZE5nUmVzb3VyY2VTdWZmaXgoZmFsbGJhY2tSZXNvdXJjZU5hbWUpLCBjb250YWluaW5nRmlsZSk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGZpbGVQYXRoV2l0aE5nUmVzb3VyY2UgPyBzdHJpcE5nUmVzb3VyY2VTdWZmaXgoZmlsZVBhdGhXaXRoTmdSZXNvdXJjZSkgOiBudWxsO1xuICAgIC8vIFVzZWQgdW5kZXIgQmF6ZWwgdG8gcmVwb3J0IG1vcmUgc3BlY2lmaWMgZXJyb3Igd2l0aCByZW1lZGlhdGlvbiBhZHZpY2VcbiAgICBpZiAoIXJlc3VsdCAmJiAodGhpcy5jb250ZXh0IGFzIGFueSkucmVwb3J0TWlzc2luZ1Jlc291cmNlKSB7XG4gICAgICAodGhpcy5jb250ZXh0IGFzIGFueSkucmVwb3J0TWlzc2luZ1Jlc291cmNlKHJlc291cmNlTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB0b1N1bW1hcnlGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nLCByZWZlcnJpbmdTcmNGaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5maWxlTmFtZVRvTW9kdWxlTmFtZShmaWxlTmFtZSwgcmVmZXJyaW5nU3JjRmlsZU5hbWUpO1xuICB9XG5cbiAgZnJvbVN1bW1hcnlGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nLCByZWZlcnJpbmdMaWJGaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMubW9kdWxlTmFtZVRvRmlsZU5hbWUoZmlsZU5hbWUsIHJlZmVycmluZ0xpYkZpbGVOYW1lKTtcbiAgICBpZiAoIXJlc29sdmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCByZXNvbHZlICR7ZmlsZU5hbWV9IGZyb20gJHtyZWZlcnJpbmdMaWJGaWxlTmFtZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc29sdmVkO1xuICB9XG5cbiAgcGFyc2VTb3VyY2VTcGFuT2YoZmlsZU5hbWU6IHN0cmluZywgbGluZTogbnVtYmVyLCBjaGFyYWN0ZXI6IG51bWJlcik6IFBhcnNlU291cmNlU3BhbnxudWxsIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZW5lcmF0ZWRTb3VyY2VGaWxlcy5nZXQoZmlsZU5hbWUpO1xuICAgIGlmIChkYXRhICYmIGRhdGEuZW1pdEN0eCkge1xuICAgICAgcmV0dXJuIGRhdGEuZW1pdEN0eC5zcGFuT2YobGluZSwgY2hhcmFjdGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldE9yaWdpbmFsU291cmNlRmlsZShcbiAgICAgIGZpbGVQYXRoOiBzdHJpbmcsIGxhbmd1YWdlVmVyc2lvbj86IHRzLlNjcmlwdFRhcmdldCxcbiAgICAgIG9uRXJyb3I/OiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCl8dW5kZWZpbmVkKTogdHMuU291cmNlRmlsZXxudWxsIHtcbiAgICAvLyBOb3RlOiB3ZSBuZWVkIHRoZSBleHBsaWNpdCBjaGVjayB2aWEgYGhhc2AgYXMgd2UgYWxzbyBjYWNoZSByZXN1bHRzXG4gICAgLy8gdGhhdCB3ZXJlIG51bGwgLyB1bmRlZmluZWQuXG4gICAgaWYgKHRoaXMub3JpZ2luYWxTb3VyY2VGaWxlcy5oYXMoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbFNvdXJjZUZpbGVzLmdldChmaWxlUGF0aCkgITtcbiAgICB9XG4gICAgaWYgKCFsYW5ndWFnZVZlcnNpb24pIHtcbiAgICAgIGxhbmd1YWdlVmVyc2lvbiA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdDtcbiAgICB9XG4gICAgLy8gTm90ZTogVGhpcyBjYW4gYWxzbyByZXR1cm4gdW5kZWZpbmVkLFxuICAgIC8vIGFzIHRoZSBUUyB0eXBpbmdzIGFyZSBub3QgY29ycmVjdCFcbiAgICBjb25zdCBzZiA9IHRoaXMuY29udGV4dC5nZXRTb3VyY2VGaWxlKGZpbGVQYXRoLCBsYW5ndWFnZVZlcnNpb24sIG9uRXJyb3IpIHx8IG51bGw7XG4gICAgdGhpcy5vcmlnaW5hbFNvdXJjZUZpbGVzLnNldChmaWxlUGF0aCwgc2YpO1xuICAgIHJldHVybiBzZjtcbiAgfVxuXG4gIHVwZGF0ZUdlbmVyYXRlZEZpbGUoZ2VuRmlsZTogR2VuZXJhdGVkRmlsZSk6IHRzLlNvdXJjZUZpbGUge1xuICAgIGlmICghZ2VuRmlsZS5zdG10cykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBJbnZhbGlkIEFyZ3VtZW50OiBFeHBlY3RlZCBhIEdlbmVyYXRlRmlsZSB3aXRoIHN0YXRlbWVudHMuICR7Z2VuRmlsZS5nZW5GaWxlVXJsfWApO1xuICAgIH1cbiAgICBjb25zdCBvbGRHZW5GaWxlID0gdGhpcy5nZW5lcmF0ZWRTb3VyY2VGaWxlcy5nZXQoZ2VuRmlsZS5nZW5GaWxlVXJsKTtcbiAgICBpZiAoIW9sZEdlbkZpbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSWxsZWdhbCBTdGF0ZTogcHJldmlvdXMgR2VuZXJhdGVkRmlsZSBub3QgZm91bmQgZm9yICR7Z2VuRmlsZS5nZW5GaWxlVXJsfS5gKTtcbiAgICB9XG4gICAgY29uc3QgbmV3UmVmcyA9IGdlbkZpbGVFeHRlcm5hbFJlZmVyZW5jZXMoZ2VuRmlsZSk7XG4gICAgY29uc3Qgb2xkUmVmcyA9IG9sZEdlbkZpbGUuZXh0ZXJuYWxSZWZlcmVuY2VzO1xuICAgIGxldCByZWZzQXJlRXF1YWwgPSBvbGRSZWZzLnNpemUgPT09IG5ld1JlZnMuc2l6ZTtcbiAgICBpZiAocmVmc0FyZUVxdWFsKSB7XG4gICAgICBuZXdSZWZzLmZvckVhY2gociA9PiByZWZzQXJlRXF1YWwgPSByZWZzQXJlRXF1YWwgJiYgb2xkUmVmcy5oYXMocikpO1xuICAgIH1cbiAgICBpZiAoIXJlZnNBcmVFcXVhbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBJbGxlZ2FsIFN0YXRlOiBleHRlcm5hbCByZWZlcmVuY2VzIGNoYW5nZWQgaW4gJHtnZW5GaWxlLmdlbkZpbGVVcmx9Llxcbk9sZDogJHtBcnJheS5mcm9tKG9sZFJlZnMpfS5cXG5OZXc6ICR7QXJyYXkuZnJvbShuZXdSZWZzKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkR2VuZXJhdGVkRmlsZShnZW5GaWxlLCBuZXdSZWZzKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkR2VuZXJhdGVkRmlsZShnZW5GaWxlOiBHZW5lcmF0ZWRGaWxlLCBleHRlcm5hbFJlZmVyZW5jZXM6IFNldDxzdHJpbmc+KTogdHMuU291cmNlRmlsZSB7XG4gICAgaWYgKCFnZW5GaWxlLnN0bXRzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEludmFsaWQgQXJndW1lbnQ6IEV4cGVjdGVkIGEgR2VuZXJhdGVGaWxlIHdpdGggc3RhdGVtZW50cy4gJHtnZW5GaWxlLmdlbkZpbGVVcmx9YCk7XG4gICAgfVxuICAgIGNvbnN0IHtzb3VyY2VUZXh0LCBjb250ZXh0fSA9IHRoaXMuZW1pdHRlci5lbWl0U3RhdGVtZW50c0FuZENvbnRleHQoXG4gICAgICAgIGdlbkZpbGUuZ2VuRmlsZVVybCwgZ2VuRmlsZS5zdG10cywgLyogcHJlYW1ibGUgKi8gJycsXG4gICAgICAgIC8qIGVtaXRTb3VyY2VNYXBzICovIGZhbHNlKTtcbiAgICBjb25zdCBzZiA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIGdlbkZpbGUuZ2VuRmlsZVVybCwgc291cmNlVGV4dCwgdGhpcy5vcHRpb25zLnRhcmdldCB8fCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0KTtcbiAgICBpZiAodGhpcy5vcHRpb25zLm1vZHVsZSA9PT0gdHMuTW9kdWxlS2luZC5BTUQgfHwgdGhpcy5vcHRpb25zLm1vZHVsZSA9PT0gdHMuTW9kdWxlS2luZC5VTUQpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRleHQuYW1kTW9kdWxlTmFtZSkge1xuICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gdGhpcy5jb250ZXh0LmFtZE1vZHVsZU5hbWUoc2YpO1xuICAgICAgICBpZiAobW9kdWxlTmFtZSkgc2YubW9kdWxlTmFtZSA9IG1vZHVsZU5hbWU7XG4gICAgICB9IGVsc2UgaWYgKC9ub2RlX21vZHVsZXMvLnRlc3QoZ2VuRmlsZS5nZW5GaWxlVXJsKSkge1xuICAgICAgICAvLyBJZiB3ZSBhcmUgZ2VuZXJhdGluZyBhbiBuZ01vZHVsZSBmaWxlIHVuZGVyIG5vZGVfbW9kdWxlcywgd2Uga25vdyB0aGUgcmlnaHQgbW9kdWxlIG5hbWVcbiAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0aGUgaG9zdCB0byBzdXBwbHkgYSBmdW5jdGlvbiBpbiB0aGlzIGNhc2UuXG4gICAgICAgIHNmLm1vZHVsZU5hbWUgPSBzdHJpcE5vZGVNb2R1bGVzUHJlZml4KGdlbkZpbGUuZ2VuRmlsZVVybC5yZXBsYWNlKEVYVCwgJycpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5nZW5lcmF0ZWRTb3VyY2VGaWxlcy5zZXQoZ2VuRmlsZS5nZW5GaWxlVXJsLCB7XG4gICAgICBzb3VyY2VGaWxlOiBzZixcbiAgICAgIGVtaXRDdHg6IGNvbnRleHQsIGV4dGVybmFsUmVmZXJlbmNlcyxcbiAgICB9KTtcbiAgICByZXR1cm4gc2Y7XG4gIH1cblxuICBzaG91bGRHZW5lcmF0ZUZpbGUoZmlsZU5hbWU6IHN0cmluZyk6IHtnZW5lcmF0ZTogYm9vbGVhbiwgYmFzZUZpbGVOYW1lPzogc3RyaW5nfSB7XG4gICAgLy8gVE9ETyh0Ym9zY2gpOiBhbGxvdyBnZW5lcmF0aW5nIGZpbGVzIHRoYXQgYXJlIG5vdCBpbiB0aGUgcm9vdERpclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xOTMzN1xuICAgIGlmICghaXNJblJvb3REaXIoZmlsZU5hbWUsIHRoaXMub3B0aW9ucykpIHtcbiAgICAgIHJldHVybiB7Z2VuZXJhdGU6IGZhbHNlfTtcbiAgICB9XG4gICAgY29uc3QgZ2VuTWF0Y2ggPSBHRU5FUkFURURfRklMRVMuZXhlYyhmaWxlTmFtZSk7XG4gICAgaWYgKCFnZW5NYXRjaCkge1xuICAgICAgcmV0dXJuIHtnZW5lcmF0ZTogZmFsc2V9O1xuICAgIH1cbiAgICBjb25zdCBbLCBiYXNlLCBnZW5TdWZmaXgsIHN1ZmZpeF0gPSBnZW5NYXRjaDtcbiAgICBpZiAoc3VmZml4ICE9PSAndHMnICYmIHN1ZmZpeCAhPT0gJ3RzeCcpIHtcbiAgICAgIHJldHVybiB7Z2VuZXJhdGU6IGZhbHNlfTtcbiAgICB9XG4gICAgbGV0IGJhc2VGaWxlTmFtZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgICBpZiAoZ2VuU3VmZml4LmluZGV4T2YoJ25nc3R5bGUnKSA+PSAwKSB7XG4gICAgICAvLyBOb3RlOiBuZ3N0eWxlIGZpbGVzIGhhdmUgbmFtZXMgbGlrZSBgYWZpbGUuY3NzLm5nc3R5bGUudHNgXG4gICAgICBpZiAoIXRoaXMub3JpZ2luYWxGaWxlRXhpc3RzKGJhc2UpKSB7XG4gICAgICAgIHJldHVybiB7Z2VuZXJhdGU6IGZhbHNlfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm90ZTogb24tdGhlLWZseSBnZW5lcmF0ZWQgZmlsZXMgYWx3YXlzIGhhdmUgYSBgLnRzYCBzdWZmaXgsXG4gICAgICAvLyBidXQgdGhlIGZpbGUgZnJvbSB3aGljaCB3ZSBnZW5lcmF0ZWQgaXQgY2FuIGJlIGEgYC50c2AvIGAudHN4YC8gYC5kLnRzYFxuICAgICAgLy8gKHNlZSBvcHRpb25zLmdlbmVyYXRlQ29kZUZvckxpYnJhcmllcykuXG4gICAgICBiYXNlRmlsZU5hbWUgPSBbYCR7YmFzZX0udHNgLCBgJHtiYXNlfS50c3hgLCBgJHtiYXNlfS5kLnRzYF0uZmluZChcbiAgICAgICAgICBiYXNlRmlsZU5hbWUgPT4gdGhpcy5pc1NvdXJjZUZpbGUoYmFzZUZpbGVOYW1lKSAmJiB0aGlzLm9yaWdpbmFsRmlsZUV4aXN0cyhiYXNlRmlsZU5hbWUpKTtcbiAgICAgIGlmICghYmFzZUZpbGVOYW1lKSB7XG4gICAgICAgIHJldHVybiB7Z2VuZXJhdGU6IGZhbHNlfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtnZW5lcmF0ZTogdHJ1ZSwgYmFzZUZpbGVOYW1lfTtcbiAgfVxuXG4gIHNob3VsZEdlbmVyYXRlRmlsZXNGb3IoZmlsZU5hbWU6IHN0cmluZykge1xuICAgIC8vIFRPRE8odGJvc2NoKTogYWxsb3cgZ2VuZXJhdGluZyBmaWxlcyB0aGF0IGFyZSBub3QgaW4gdGhlIHJvb3REaXJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTkzMzdcbiAgICByZXR1cm4gIUdFTkVSQVRFRF9GSUxFUy50ZXN0KGZpbGVOYW1lKSAmJiB0aGlzLmlzU291cmNlRmlsZShmaWxlTmFtZSkgJiZcbiAgICAgICAgaXNJblJvb3REaXIoZmlsZU5hbWUsIHRoaXMub3B0aW9ucyk7XG4gIH1cblxuICBnZXRTb3VyY2VGaWxlKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgbGFuZ3VhZ2VWZXJzaW9uOiB0cy5TY3JpcHRUYXJnZXQsXG4gICAgICBvbkVycm9yPzogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpfHVuZGVmaW5lZCk6IHRzLlNvdXJjZUZpbGUge1xuICAgIC8vIE5vdGU6IERvbid0IGV4aXQgZWFybHkgaW4gdGhpcyBtZXRob2QgdG8gbWFrZSBzdXJlXG4gICAgLy8gd2UgYWx3YXlzIGhhdmUgdXAgdG8gZGF0ZSByZWZlcmVuY2VzIG9uIHRoZSBmaWxlIVxuICAgIGxldCBnZW5GaWxlTmFtZXM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHNmID0gdGhpcy5nZXRHZW5lcmF0ZWRGaWxlKGZpbGVOYW1lKTtcbiAgICBpZiAoIXNmKSB7XG4gICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5saWJyYXJ5U3VtbWFyaWVzLmdldChmaWxlTmFtZSk7XG4gICAgICBpZiAoc3VtbWFyeSkge1xuICAgICAgICBpZiAoIXN1bW1hcnkuc291cmNlRmlsZSkge1xuICAgICAgICAgIHN1bW1hcnkuc291cmNlRmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgICAgICAgIGZpbGVOYW1lLCBzdW1tYXJ5LnRleHQsIHRoaXMub3B0aW9ucy50YXJnZXQgfHwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgc2YgPSBzdW1tYXJ5LnNvdXJjZUZpbGU7XG4gICAgICAgIGdlbkZpbGVOYW1lcyA9IFtdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXNmKSB7XG4gICAgICBzZiA9IHRoaXMuZ2V0T3JpZ2luYWxTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgICAgIGNvbnN0IGNhY2hlZEdlbkZpbGVzID0gdGhpcy5nZW5lcmF0ZWRDb2RlRm9yLmdldChmaWxlTmFtZSk7XG4gICAgICBpZiAoY2FjaGVkR2VuRmlsZXMpIHtcbiAgICAgICAgZ2VuRmlsZU5hbWVzID0gY2FjaGVkR2VuRmlsZXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5ub1Jlc29sdmUgJiYgdGhpcy5zaG91bGRHZW5lcmF0ZUZpbGVzRm9yKGZpbGVOYW1lKSkge1xuICAgICAgICAgIGdlbkZpbGVOYW1lcyA9IHRoaXMuY29kZUdlbmVyYXRvci5maW5kR2VuZXJhdGVkRmlsZU5hbWVzKGZpbGVOYW1lKS5maWx0ZXIoXG4gICAgICAgICAgICAgIGZpbGVOYW1lID0+IHRoaXMuc2hvdWxkR2VuZXJhdGVGaWxlKGZpbGVOYW1lKS5nZW5lcmF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nZW5lcmF0ZWRDb2RlRm9yLnNldChmaWxlTmFtZSwgZ2VuRmlsZU5hbWVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNmKSB7XG4gICAgICBhZGRSZWZlcmVuY2VzVG9Tb3VyY2VGaWxlKHNmLCBnZW5GaWxlTmFtZXMpO1xuICAgIH1cbiAgICAvLyBUT0RPKHRib3NjaCk6IFR5cGVTY3JpcHQncyB0eXBpbmdzIGZvciBnZXRTb3VyY2VGaWxlIGFyZSBpbmNvcnJlY3QsXG4gICAgLy8gYXMgaXQgY2FuIHZlcnkgd2VsbCByZXR1cm4gdW5kZWZpbmVkLlxuICAgIHJldHVybiBzZiAhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRHZW5lcmF0ZWRGaWxlKGZpbGVOYW1lOiBzdHJpbmcpOiB0cy5Tb3VyY2VGaWxlfG51bGwge1xuICAgIGNvbnN0IGdlblNyY0ZpbGUgPSB0aGlzLmdlbmVyYXRlZFNvdXJjZUZpbGVzLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKGdlblNyY0ZpbGUpIHtcbiAgICAgIHJldHVybiBnZW5TcmNGaWxlLnNvdXJjZUZpbGU7XG4gICAgfVxuICAgIGNvbnN0IHtnZW5lcmF0ZSwgYmFzZUZpbGVOYW1lfSA9IHRoaXMuc2hvdWxkR2VuZXJhdGVGaWxlKGZpbGVOYW1lKTtcbiAgICBpZiAoZ2VuZXJhdGUpIHtcbiAgICAgIGNvbnN0IGdlbkZpbGUgPSB0aGlzLmNvZGVHZW5lcmF0b3IuZ2VuZXJhdGVGaWxlKGZpbGVOYW1lLCBiYXNlRmlsZU5hbWUpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkR2VuZXJhdGVkRmlsZShnZW5GaWxlLCBnZW5GaWxlRXh0ZXJuYWxSZWZlcmVuY2VzKGdlbkZpbGUpKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIG9yaWdpbmFsRmlsZUV4aXN0cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgbGV0IGZpbGVFeGlzdHMgPSB0aGlzLm9yaWdpbmFsRmlsZUV4aXN0c0NhY2hlLmdldChmaWxlTmFtZSk7XG4gICAgaWYgKGZpbGVFeGlzdHMgPT0gbnVsbCkge1xuICAgICAgZmlsZUV4aXN0cyA9IHRoaXMuY29udGV4dC5maWxlRXhpc3RzKGZpbGVOYW1lKTtcbiAgICAgIHRoaXMub3JpZ2luYWxGaWxlRXhpc3RzQ2FjaGUuc2V0KGZpbGVOYW1lLCBmaWxlRXhpc3RzKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbGVFeGlzdHM7XG4gIH1cblxuICBmaWxlRXhpc3RzKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBmaWxlTmFtZSA9IHN0cmlwTmdSZXNvdXJjZVN1ZmZpeChmaWxlTmFtZSk7XG4gICAgaWYgKHRoaXMubGlicmFyeVN1bW1hcmllcy5oYXMoZmlsZU5hbWUpIHx8IHRoaXMuZ2VuZXJhdGVkU291cmNlRmlsZXMuaGFzKGZpbGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLnNob3VsZEdlbmVyYXRlRmlsZShmaWxlTmFtZSkuZ2VuZXJhdGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vcmlnaW5hbEZpbGVFeGlzdHMoZmlsZU5hbWUpO1xuICB9XG5cbiAgbG9hZFN1bW1hcnkoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5saWJyYXJ5U3VtbWFyaWVzLmdldChmaWxlUGF0aCk7XG4gICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgIHJldHVybiBzdW1tYXJ5LnRleHQ7XG4gICAgfVxuICAgIGlmICh0aGlzLm9yaWdpbmFsRmlsZUV4aXN0cyhmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiBhc3NlcnQodGhpcy5jb250ZXh0LnJlYWRGaWxlKGZpbGVQYXRoKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaXNTb3VyY2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBEb24ndCBnZW5lcmF0ZSBhbnkgZmlsZXMgbm9yIHR5cGVjaGVjayB0aGVtXG4gICAgLy8gaWYgc2tpcFRlbXBsYXRlQ29kZWdlbiBpcyBzZXQgYW5kIGZ1bGxUZW1wbGF0ZVR5cGVDaGVjayBpcyBub3QgeWV0IHNldCxcbiAgICAvLyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5za2lwVGVtcGxhdGVDb2RlZ2VuICYmICF0aGlzLm9wdGlvbnMuZnVsbFRlbXBsYXRlVHlwZUNoZWNrKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIElmIHdlIGhhdmUgYSBzdW1tYXJ5IGZyb20gYSBwcmV2aW91cyBjb21waWxhdGlvbixcbiAgICAvLyB0cmVhdCB0aGUgZmlsZSBuZXZlciBhcyBhIHNvdXJjZSBmaWxlLlxuICAgIGlmICh0aGlzLmxpYnJhcnlTdW1tYXJpZXMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoR0VORVJBVEVEX0ZJTEVTLnRlc3QoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZ2VuZXJhdGVDb2RlRm9yTGlicmFyaWVzID09PSBmYWxzZSAmJiBEVFMudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKERUUy50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgLy8gQ2hlY2sgZm9yIGEgYnVuZGxlIGluZGV4LlxuICAgICAgaWYgKHRoaXMuaGFzQnVuZGxlSW5kZXgoZmlsZVBhdGgpKSB7XG4gICAgICAgIGNvbnN0IG5vcm1hbEZpbGVQYXRoID0gcGF0aC5ub3JtYWxpemUoZmlsZVBhdGgpO1xuICAgICAgICByZXR1cm4gdGhpcy5mbGF0TW9kdWxlSW5kZXhOYW1lcy5oYXMobm9ybWFsRmlsZVBhdGgpIHx8XG4gICAgICAgICAgICB0aGlzLmZsYXRNb2R1bGVJbmRleFJlZGlyZWN0TmFtZXMuaGFzKG5vcm1hbEZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZWFkRmlsZShmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMubGlicmFyeVN1bW1hcmllcy5nZXQoZmlsZU5hbWUpO1xuICAgIGlmIChzdW1tYXJ5KSB7XG4gICAgICByZXR1cm4gc3VtbWFyeS50ZXh0O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb250ZXh0LnJlYWRGaWxlKGZpbGVOYW1lKTtcbiAgfVxuXG4gIGdldE1ldGFkYXRhRm9yKGZpbGVQYXRoOiBzdHJpbmcpOiBNb2R1bGVNZXRhZGF0YVtdfHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHJlYWRNZXRhZGF0YShmaWxlUGF0aCwgdGhpcy5tZXRhZGF0YVJlYWRlckhvc3QsIHRoaXMubWV0YWRhdGFSZWFkZXJDYWNoZSk7XG4gIH1cblxuICBsb2FkUmVzb3VyY2UoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPnxzdHJpbmcge1xuICAgIGlmICh0aGlzLmNvbnRleHQucmVhZFJlc291cmNlKSByZXR1cm4gdGhpcy5jb250ZXh0LnJlYWRSZXNvdXJjZShmaWxlUGF0aCk7XG4gICAgaWYgKCF0aGlzLm9yaWdpbmFsRmlsZUV4aXN0cyhmaWxlUGF0aCkpIHtcbiAgICAgIHRocm93IHN5bnRheEVycm9yKGBFcnJvcjogUmVzb3VyY2UgZmlsZSBub3QgZm91bmQ6ICR7ZmlsZVBhdGh9YCk7XG4gICAgfVxuICAgIHJldHVybiBhc3NlcnQodGhpcy5jb250ZXh0LnJlYWRGaWxlKGZpbGVQYXRoKSk7XG4gIH1cblxuICBnZXRPdXRwdXROYW1lKGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKHRoaXMuZ2V0Q3VycmVudERpcmVjdG9yeSgpLCBmaWxlUGF0aCk7XG4gIH1cblxuICBwcml2YXRlIGhhc0J1bmRsZUluZGV4KGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBjaGVja0J1bmRsZUluZGV4ID0gKGRpcmVjdG9yeTogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICBsZXQgcmVzdWx0ID0gdGhpcy5mbGF0TW9kdWxlSW5kZXhDYWNoZS5nZXQoZGlyZWN0b3J5KTtcbiAgICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgICBpZiAocGF0aC5iYXNlbmFtZShkaXJlY3RvcnkpID09ICdub2RlX21vZHVsZScpIHtcbiAgICAgICAgICAvLyBEb24ndCBsb29rIG91dHNpZGUgdGhlIG5vZGVfbW9kdWxlcyB0aGlzIHBhY2thZ2UgaXMgaW5zdGFsbGVkIGluLlxuICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEEgYnVuZGxlIGluZGV4IGV4aXN0cyBpZiB0aGUgdHlwaW5ncyAuZC50cyBmaWxlIGhhcyBhIG1ldGFkYXRhLmpzb24gdGhhdCBoYXMgYW5cbiAgICAgICAgICAvLyBpbXBvcnRBcy5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGFja2FnZUZpbGUgPSBwYXRoLmpvaW4oZGlyZWN0b3J5LCAncGFja2FnZS5qc29uJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5hbEZpbGVFeGlzdHMocGFja2FnZUZpbGUpKSB7XG4gICAgICAgICAgICAgIC8vIE9uY2Ugd2Ugc2VlIGEgcGFja2FnZS5qc29uIGZpbGUsIGFzc3VtZSBmYWxzZSB1bnRpbCBpdCB3ZSBmaW5kIHRoZSBidW5kbGUgaW5kZXguXG4gICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgICBjb25zdCBwYWNrYWdlQ29udGVudDogYW55ID0gSlNPTi5wYXJzZShhc3NlcnQodGhpcy5jb250ZXh0LnJlYWRGaWxlKHBhY2thZ2VGaWxlKSkpO1xuICAgICAgICAgICAgICBpZiAocGFja2FnZUNvbnRlbnQudHlwaW5ncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGluZ3MgPSBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4oZGlyZWN0b3J5LCBwYWNrYWdlQ29udGVudC50eXBpbmdzKSk7XG4gICAgICAgICAgICAgICAgaWYgKERUUy50ZXN0KHR5cGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YUZpbGUgPSB0eXBpbmdzLnJlcGxhY2UoRFRTLCAnLm1ldGFkYXRhLmpzb24nKTtcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9yaWdpbmFsRmlsZUV4aXN0cyhtZXRhZGF0YUZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gSlNPTi5wYXJzZShhc3NlcnQodGhpcy5jb250ZXh0LnJlYWRGaWxlKG1ldGFkYXRhRmlsZSkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmZsYXRNb2R1bGVJbmRleFJlZGlyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbGF0TW9kdWxlSW5kZXhSZWRpcmVjdE5hbWVzLmFkZCh0eXBpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBkb24ndCBzZXQgcmVzdWx0ID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBhcyB0aGlzIHdvdWxkIG1hcmsgdGhpcyBmb2xkZXJcbiAgICAgICAgICAgICAgICAgICAgICAvLyBhcyBoYXZpbmcgYSBidW5kbGVJbmRleCB0b28gZWFybHkgd2l0aG91dFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGZpbGxpbmcgdGhlIGJ1bmRsZUluZGV4TmFtZXMuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEuaW1wb3J0QXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYXRNb2R1bGVJbmRleE5hbWVzLmFkZCh0eXBpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBwYXRoLmRpcm5hbWUoZGlyZWN0b3J5KTtcbiAgICAgICAgICAgICAgaWYgKHBhcmVudCAhPSBkaXJlY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAvLyBUcnkgdGhlIHBhcmVudCBkaXJlY3RvcnkuXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY2hlY2tCdW5kbGVJbmRleChwYXJlbnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBlbmNvdW50ZXIgYW55IGVycm9ycyBhc3N1bWUgd2UgdGhpcyBpc24ndCBhIGJ1bmRsZSBpbmRleC5cbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZsYXRNb2R1bGVJbmRleENhY2hlLnNldChkaXJlY3RvcnksIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICByZXR1cm4gY2hlY2tCdW5kbGVJbmRleChwYXRoLmRpcm5hbWUoZmlsZVBhdGgpKTtcbiAgfVxuXG4gIGdldERlZmF1bHRMaWJGaWxlTmFtZSA9IChvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpID0+XG4gICAgICB0aGlzLmNvbnRleHQuZ2V0RGVmYXVsdExpYkZpbGVOYW1lKG9wdGlvbnMpXG4gIGdldEN1cnJlbnREaXJlY3RvcnkgPSAoKSA9PiB0aGlzLmNvbnRleHQuZ2V0Q3VycmVudERpcmVjdG9yeSgpO1xuICBnZXRDYW5vbmljYWxGaWxlTmFtZSA9IChmaWxlTmFtZTogc3RyaW5nKSA9PiB0aGlzLmNvbnRleHQuZ2V0Q2Fub25pY2FsRmlsZU5hbWUoZmlsZU5hbWUpO1xuICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzID0gKCkgPT4gdGhpcy5jb250ZXh0LnVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMoKTtcbiAgZ2V0TmV3TGluZSA9ICgpID0+IHRoaXMuY29udGV4dC5nZXROZXdMaW5lKCk7XG4gIC8vIE1ha2Ugc3VyZSB3ZSBkbyBub3QgYGhvc3QucmVhbHBhdGgoKWAgZnJvbSBUUyBhcyB3ZSBkbyBub3Qgd2FudCB0byByZXNvbHZlIHN5bWxpbmtzLlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzk1NTJcbiAgcmVhbHBhdGggPSAocDogc3RyaW5nKSA9PiBwO1xuICB3cml0ZUZpbGUgPSB0aGlzLmNvbnRleHQud3JpdGVGaWxlLmJpbmQodGhpcy5jb250ZXh0KTtcbn1cblxuZnVuY3Rpb24gZ2VuRmlsZUV4dGVybmFsUmVmZXJlbmNlcyhnZW5GaWxlOiBHZW5lcmF0ZWRGaWxlKTogU2V0PHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFNldChjb2xsZWN0RXh0ZXJuYWxSZWZlcmVuY2VzKGdlbkZpbGUuc3RtdHMgISkubWFwKGVyID0+IGVyLm1vZHVsZU5hbWUgISkpO1xufVxuXG5mdW5jdGlvbiBhZGRSZWZlcmVuY2VzVG9Tb3VyY2VGaWxlKHNmOiB0cy5Tb3VyY2VGaWxlLCBnZW5GaWxlTmFtZXM6IHN0cmluZ1tdKSB7XG4gIC8vIE5vdGU6IGFzIHdlIG1vZGlmeSB0cy5Tb3VyY2VGaWxlcyB3ZSBuZWVkIHRvIGtlZXAgdGhlIG9yaWdpbmFsXG4gIC8vIHZhbHVlIGZvciBgcmVmZXJlbmNlZEZpbGVzYCBhcm91bmQgaW4gY2FjaGUgdGhlIG9yaWdpbmFsIGhvc3QgaXMgY2FjaGluZyB0cy5Tb3VyY2VGaWxlcy5cbiAgLy8gTm90ZTogY2xvbmluZyB0aGUgdHMuU291cmNlRmlsZSBpcyBleHBlbnNpdmUgYXMgdGhlIG5vZGVzIGluIGhhdmUgcGFyZW50IHBvaW50ZXJzLFxuICAvLyBpLmUuIHdlIHdvdWxkIGFsc28gbmVlZCB0byBjbG9uZSBhbmQgYWRqdXN0IGFsbCBub2Rlcy5cbiAgbGV0IG9yaWdpbmFsUmVmZXJlbmNlZEZpbGVzOiBSZWFkb25seUFycmF5PHRzLkZpbGVSZWZlcmVuY2U+ID1cbiAgICAgIChzZiBhcyBhbnkpLm9yaWdpbmFsUmVmZXJlbmNlZEZpbGVzO1xuICBpZiAoIW9yaWdpbmFsUmVmZXJlbmNlZEZpbGVzKSB7XG4gICAgb3JpZ2luYWxSZWZlcmVuY2VkRmlsZXMgPSBzZi5yZWZlcmVuY2VkRmlsZXM7XG4gICAgKHNmIGFzIGFueSkub3JpZ2luYWxSZWZlcmVuY2VkRmlsZXMgPSBvcmlnaW5hbFJlZmVyZW5jZWRGaWxlcztcbiAgfVxuICBjb25zdCBuZXdSZWZlcmVuY2VkRmlsZXMgPSBbLi4ub3JpZ2luYWxSZWZlcmVuY2VkRmlsZXNdO1xuICBnZW5GaWxlTmFtZXMuZm9yRWFjaChnZiA9PiBuZXdSZWZlcmVuY2VkRmlsZXMucHVzaCh7ZmlsZU5hbWU6IGdmLCBwb3M6IDAsIGVuZDogMH0pKTtcbiAgc2YucmVmZXJlbmNlZEZpbGVzID0gbmV3UmVmZXJlbmNlZEZpbGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JpZ2luYWxSZWZlcmVuY2VzKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5GaWxlUmVmZXJlbmNlW118dW5kZWZpbmVkIHtcbiAgcmV0dXJuIHNvdXJjZUZpbGUgJiYgKHNvdXJjZUZpbGUgYXMgYW55KS5vcmlnaW5hbFJlZmVyZW5jZWRGaWxlcztcbn1cblxuZnVuY3Rpb24gZG90UmVsYXRpdmUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgclBhdGg6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgcmV0dXJuIHJQYXRoLnN0YXJ0c1dpdGgoJy4nKSA/IHJQYXRoIDogJy4vJyArIHJQYXRoO1xufVxuXG4vKipcbiAqIE1vdmVzIHRoZSBwYXRoIGludG8gYGdlbkRpcmAgZm9sZGVyIHdoaWxlIHByZXNlcnZpbmcgdGhlIGBub2RlX21vZHVsZXNgIGRpcmVjdG9yeS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGFja2FnZU5hbWUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgbWF0Y2ggPSBOT0RFX01PRFVMRVNfUEFDS0FHRV9OQU1FLmV4ZWMoZmlsZVBhdGgpO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHN0cmlwTm9kZU1vZHVsZXNQcmVmaXgoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBmaWxlUGF0aC5yZXBsYWNlKC8uKm5vZGVfbW9kdWxlc1xcLy8sICcnKTtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9kZU1vZHVsZXNQcmVmaXgoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgbWF0Y2ggPSAvLipub2RlX21vZHVsZXNcXC8vLmV4ZWMoZmlsZVBhdGgpO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHN0cmlwTmdSZXNvdXJjZVN1ZmZpeChmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGZpbGVOYW1lLnJlcGxhY2UoL1xcLlxcJG5ncmVzb3VyY2VcXCQuKi8sICcnKTtcbn1cblxuZnVuY3Rpb24gYWRkTmdSZXNvdXJjZVN1ZmZpeChmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke2ZpbGVOYW1lfS4kbmdyZXNvdXJjZSRgO1xufVxuIl19