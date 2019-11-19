(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/transformer", ["require", "exports", "@angular/compiler-cli/ngcc/src/analysis/decoration_analyzer", "@angular/compiler-cli/ngcc/src/analysis/module_with_providers_analyzer", "@angular/compiler-cli/ngcc/src/analysis/ngcc_references_registry", "@angular/compiler-cli/ngcc/src/analysis/private_declarations_analyzer", "@angular/compiler-cli/ngcc/src/analysis/switch_marker_analyzer", "@angular/compiler-cli/ngcc/src/host/commonjs_host", "@angular/compiler-cli/ngcc/src/host/esm2015_host", "@angular/compiler-cli/ngcc/src/host/esm5_host", "@angular/compiler-cli/ngcc/src/host/umd_host", "@angular/compiler-cli/ngcc/src/rendering/commonjs_rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/dts_renderer", "@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/renderer", "@angular/compiler-cli/ngcc/src/rendering/umd_rendering_formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var decoration_analyzer_1 = require("@angular/compiler-cli/ngcc/src/analysis/decoration_analyzer");
    var module_with_providers_analyzer_1 = require("@angular/compiler-cli/ngcc/src/analysis/module_with_providers_analyzer");
    var ngcc_references_registry_1 = require("@angular/compiler-cli/ngcc/src/analysis/ngcc_references_registry");
    var private_declarations_analyzer_1 = require("@angular/compiler-cli/ngcc/src/analysis/private_declarations_analyzer");
    var switch_marker_analyzer_1 = require("@angular/compiler-cli/ngcc/src/analysis/switch_marker_analyzer");
    var commonjs_host_1 = require("@angular/compiler-cli/ngcc/src/host/commonjs_host");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    var esm5_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm5_host");
    var umd_host_1 = require("@angular/compiler-cli/ngcc/src/host/umd_host");
    var commonjs_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/commonjs_rendering_formatter");
    var dts_renderer_1 = require("@angular/compiler-cli/ngcc/src/rendering/dts_renderer");
    var esm5_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/esm5_rendering_formatter");
    var esm_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter");
    var renderer_1 = require("@angular/compiler-cli/ngcc/src/rendering/renderer");
    var umd_rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/umd_rendering_formatter");
    /**
     * A Package is stored in a directory on disk and that directory can contain one or more package
     * formats - e.g. fesm2015, UMD, etc. Additionally, each package provides typings (`.d.ts` files).
     *
     * Each of these formats exposes one or more entry points, which are source files that need to be
     * parsed to identify the decorated exported classes that need to be analyzed and compiled by one or
     * more `DecoratorHandler` objects.
     *
     * Each entry point to a package is identified by a `package.json` which contains properties that
     * indicate what formatted bundles are accessible via this end-point.
     *
     * Each bundle is identified by a root `SourceFile` that can be parsed and analyzed to
     * identify classes that need to be transformed; and then finally rendered and written to disk.
     *
     * Along with the source files, the corresponding source maps (either inline or external) and
     * `.d.ts` files are transformed accordingly.
     *
     * - Flat file packages have all the classes in a single file.
     * - Other packages may re-export classes from other non-entry point files.
     * - Some formats may contain multiple "modules" in a single file.
     */
    var Transformer = /** @class */ (function () {
        function Transformer(fs, logger) {
            this.fs = fs;
            this.logger = logger;
        }
        /**
         * Transform the source (and typings) files of a bundle.
         * @param bundle the bundle to transform.
         * @returns information about the files that were transformed.
         */
        Transformer.prototype.transform = function (bundle) {
            var reflectionHost = this.getHost(bundle);
            // Parse and analyze the files.
            var _a = this.analyzeProgram(reflectionHost, bundle), decorationAnalyses = _a.decorationAnalyses, switchMarkerAnalyses = _a.switchMarkerAnalyses, privateDeclarationsAnalyses = _a.privateDeclarationsAnalyses, moduleWithProvidersAnalyses = _a.moduleWithProvidersAnalyses;
            // Transform the source files and source maps.
            var srcFormatter = this.getRenderingFormatter(reflectionHost, bundle);
            var renderer = new renderer_1.Renderer(srcFormatter, this.fs, this.logger, bundle);
            var renderedFiles = renderer.renderProgram(decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses);
            if (bundle.dts) {
                var dtsFormatter = new esm_rendering_formatter_1.EsmRenderingFormatter(reflectionHost, bundle.isCore);
                var dtsRenderer = new dts_renderer_1.DtsRenderer(dtsFormatter, this.fs, this.logger, reflectionHost, bundle);
                var renderedDtsFiles = dtsRenderer.renderProgram(decorationAnalyses, privateDeclarationsAnalyses, moduleWithProvidersAnalyses);
                renderedFiles = renderedFiles.concat(renderedDtsFiles);
            }
            return renderedFiles;
        };
        Transformer.prototype.getHost = function (bundle) {
            var typeChecker = bundle.src.program.getTypeChecker();
            switch (bundle.format) {
                case 'esm2015':
                    return new esm2015_host_1.Esm2015ReflectionHost(this.logger, bundle.isCore, typeChecker, bundle.dts);
                case 'esm5':
                    return new esm5_host_1.Esm5ReflectionHost(this.logger, bundle.isCore, typeChecker, bundle.dts);
                case 'umd':
                    return new umd_host_1.UmdReflectionHost(this.logger, bundle.isCore, bundle.src.program, bundle.src.host, bundle.dts);
                case 'commonjs':
                    return new commonjs_host_1.CommonJsReflectionHost(this.logger, bundle.isCore, bundle.src.program, bundle.src.host, bundle.dts);
                default:
                    throw new Error("Reflection host for \"" + bundle.format + "\" not yet implemented.");
            }
        };
        Transformer.prototype.getRenderingFormatter = function (host, bundle) {
            switch (bundle.format) {
                case 'esm2015':
                    return new esm_rendering_formatter_1.EsmRenderingFormatter(host, bundle.isCore);
                case 'esm5':
                    return new esm5_rendering_formatter_1.Esm5RenderingFormatter(host, bundle.isCore);
                case 'umd':
                    if (!(host instanceof umd_host_1.UmdReflectionHost)) {
                        throw new Error('UmdRenderer requires a UmdReflectionHost');
                    }
                    return new umd_rendering_formatter_1.UmdRenderingFormatter(host, bundle.isCore);
                case 'commonjs':
                    return new commonjs_rendering_formatter_1.CommonJsRenderingFormatter(host, bundle.isCore);
                default:
                    throw new Error("Renderer for \"" + bundle.format + "\" not yet implemented.");
            }
        };
        Transformer.prototype.analyzeProgram = function (reflectionHost, bundle) {
            var referencesRegistry = new ngcc_references_registry_1.NgccReferencesRegistry(reflectionHost);
            var switchMarkerAnalyzer = new switch_marker_analyzer_1.SwitchMarkerAnalyzer(reflectionHost, bundle.entryPoint.package);
            var switchMarkerAnalyses = switchMarkerAnalyzer.analyzeProgram(bundle.src.program);
            var decorationAnalyzer = new decoration_analyzer_1.DecorationAnalyzer(this.fs, bundle, reflectionHost, referencesRegistry);
            var decorationAnalyses = decorationAnalyzer.analyzeProgram();
            var moduleWithProvidersAnalyzer = bundle.dts && new module_with_providers_analyzer_1.ModuleWithProvidersAnalyzer(reflectionHost, referencesRegistry);
            var moduleWithProvidersAnalyses = moduleWithProvidersAnalyzer &&
                moduleWithProvidersAnalyzer.analyzeProgram(bundle.src.program);
            var privateDeclarationsAnalyzer = new private_declarations_analyzer_1.PrivateDeclarationsAnalyzer(reflectionHost, referencesRegistry);
            var privateDeclarationsAnalyses = privateDeclarationsAnalyzer.analyzeProgram(bundle.src.program);
            return { decorationAnalyses: decorationAnalyses, switchMarkerAnalyses: switchMarkerAnalyses, privateDeclarationsAnalyses: privateDeclarationsAnalyses,
                moduleWithProvidersAnalyses: moduleWithProvidersAnalyses };
        };
        return Transformer;
    }());
    exports.Transformer = Transformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcGFja2FnZXMvdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxtR0FBaUY7SUFDakYseUhBQW9IO0lBQ3BILDZHQUE0RTtJQUM1RSx1SEFBa0c7SUFDbEcseUdBQThGO0lBQzlGLG1GQUE2RDtJQUM3RCxpRkFBMkQ7SUFDM0QsMkVBQXFEO0lBRXJELHlFQUFtRDtJQUVuRCxzSEFBcUY7SUFDckYsc0ZBQXNEO0lBQ3RELDhHQUE2RTtJQUM3RSw0R0FBMkU7SUFDM0UsOEVBQStDO0lBRS9DLDRHQUEyRTtJQUkzRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDSDtRQUNFLHFCQUFvQixFQUFjLEVBQVUsTUFBYztZQUF0QyxPQUFFLEdBQUYsRUFBRSxDQUFZO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFHLENBQUM7UUFFOUQ7Ozs7V0FJRztRQUNILCtCQUFTLEdBQVQsVUFBVSxNQUF3QjtZQUNoQyxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTVDLCtCQUErQjtZQUN6QixJQUFBLGdEQUMyRSxFQUQxRSwwQ0FBa0IsRUFBRSw4Q0FBb0IsRUFBRSw0REFBMkIsRUFDckUsNERBQTBFLENBQUM7WUFFbEYsOENBQThDO1lBQzlDLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFeEUsSUFBTSxRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUUsSUFBSSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEs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QVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Q29tcGlsZWRGaWxlLCBEZWNvcmF0aW9uQW5hbHl6ZXJ9IGZyb20gJy4uL2FuYWx5c2lzL2RlY29yYXRpb25fYW5hbHl6ZXInO1xuaW1wb3J0IHtNb2R1bGVXaXRoUHJvdmlkZXJzQW5hbHlzZXMsIE1vZHVsZVdpdGhQcm92aWRlcnNBbmFseXplcn0gZnJvbSAnLi4vYW5hbHlzaXMvbW9kdWxlX3dpdGhfcHJvdmlkZXJzX2FuYWx5emVyJztcbmltcG9ydCB7TmdjY1JlZmVyZW5jZXNSZWdpc3RyeX0gZnJvbSAnLi4vYW5hbHlzaXMvbmdjY19yZWZlcmVuY2VzX3JlZ2lzdHJ5JztcbmltcG9ydCB7RXhwb3J0SW5mbywgUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5emVyfSBmcm9tICcuLi9hbmFseXNpcy9wcml2YXRlX2RlY2xhcmF0aW9uc19hbmFseXplcic7XG5pbXBvcnQge1N3aXRjaE1hcmtlckFuYWx5c2VzLCBTd2l0Y2hNYXJrZXJBbmFseXplcn0gZnJvbSAnLi4vYW5hbHlzaXMvc3dpdGNoX21hcmtlcl9hbmFseXplcic7XG5pbXBvcnQge0NvbW1vbkpzUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL2hvc3QvY29tbW9uanNfaG9zdCc7XG5pbXBvcnQge0VzbTIwMTVSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vaG9zdC9lc20yMDE1X2hvc3QnO1xuaW1wb3J0IHtFc201UmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL2hvc3QvZXNtNV9ob3N0JztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5pbXBvcnQge1VtZFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L3VtZF9ob3N0JztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlcic7XG5pbXBvcnQge0NvbW1vbkpzUmVuZGVyaW5nRm9ybWF0dGVyfSBmcm9tICcuLi9yZW5kZXJpbmcvY29tbW9uanNfcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5pbXBvcnQge0R0c1JlbmRlcmVyfSBmcm9tICcuLi9yZW5kZXJpbmcvZHRzX3JlbmRlcmVyJztcbmltcG9ydCB7RXNtNVJlbmRlcmluZ0Zvcm1hdHRlcn0gZnJvbSAnLi4vcmVuZGVyaW5nL2VzbTVfcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5pbXBvcnQge0VzbVJlbmRlcmluZ0Zvcm1hdHRlcn0gZnJvbSAnLi4vcmVuZGVyaW5nL2VzbV9yZW5kZXJpbmdfZm9ybWF0dGVyJztcbmltcG9ydCB7UmVuZGVyZXJ9IGZyb20gJy4uL3JlbmRlcmluZy9yZW5kZXJlcic7XG5pbXBvcnQge1JlbmRlcmluZ0Zvcm1hdHRlcn0gZnJvbSAnLi4vcmVuZGVyaW5nL3JlbmRlcmluZ19mb3JtYXR0ZXInO1xuaW1wb3J0IHtVbWRSZW5kZXJpbmdGb3JtYXR0ZXJ9IGZyb20gJy4uL3JlbmRlcmluZy91bWRfcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5pbXBvcnQge0ZpbGVUb1dyaXRlfSBmcm9tICcuLi9yZW5kZXJpbmcvdXRpbHMnO1xuaW1wb3J0IHtFbnRyeVBvaW50QnVuZGxlfSBmcm9tICcuL2VudHJ5X3BvaW50X2J1bmRsZSc7XG5cbi8qKlxuICogQSBQYWNrYWdlIGlzIHN0b3JlZCBpbiBhIGRpcmVjdG9yeSBvbiBkaXNrIGFuZCB0aGF0IGRpcmVjdG9yeSBjYW4gY29udGFpbiBvbmUgb3IgbW9yZSBwYWNrYWdlXG4gKiBmb3JtYXRzIC0gZS5nLiBmZXNtMjAxNSwgVU1ELCBldGMuIEFkZGl0aW9uYWxseSwgZWFjaCBwYWNrYWdlIHByb3ZpZGVzIHR5cGluZ3MgKGAuZC50c2AgZmlsZXMpLlxuICpcbiAqIEVhY2ggb2YgdGhlc2UgZm9ybWF0cyBleHBvc2VzIG9uZSBvciBtb3JlIGVudHJ5IHBvaW50cywgd2hpY2ggYXJlIHNvdXJjZSBmaWxlcyB0aGF0IG5lZWQgdG8gYmVcbiAqIHBhcnNlZCB0byBpZGVudGlmeSB0aGUgZGVjb3JhdGVkIGV4cG9ydGVkIGNsYXNzZXMgdGhhdCBuZWVkIHRvIGJlIGFuYWx5emVkIGFuZCBjb21waWxlZCBieSBvbmUgb3JcbiAqIG1vcmUgYERlY29yYXRvckhhbmRsZXJgIG9iamVjdHMuXG4gKlxuICogRWFjaCBlbnRyeSBwb2ludCB0byBhIHBhY2thZ2UgaXMgaWRlbnRpZmllZCBieSBhIGBwYWNrYWdlLmpzb25gIHdoaWNoIGNvbnRhaW5zIHByb3BlcnRpZXMgdGhhdFxuICogaW5kaWNhdGUgd2hhdCBmb3JtYXR0ZWQgYnVuZGxlcyBhcmUgYWNjZXNzaWJsZSB2aWEgdGhpcyBlbmQtcG9pbnQuXG4gKlxuICogRWFjaCBidW5kbGUgaXMgaWRlbnRpZmllZCBieSBhIHJvb3QgYFNvdXJjZUZpbGVgIHRoYXQgY2FuIGJlIHBhcnNlZCBhbmQgYW5hbHl6ZWQgdG9cbiAqIGlkZW50aWZ5IGNsYXNzZXMgdGhhdCBuZWVkIHRvIGJlIHRyYW5zZm9ybWVkOyBhbmQgdGhlbiBmaW5hbGx5IHJlbmRlcmVkIGFuZCB3cml0dGVuIHRvIGRpc2suXG4gKlxuICogQWxvbmcgd2l0aCB0aGUgc291cmNlIGZpbGVzLCB0aGUgY29ycmVzcG9uZGluZyBzb3VyY2UgbWFwcyAoZWl0aGVyIGlubGluZSBvciBleHRlcm5hbCkgYW5kXG4gKiBgLmQudHNgIGZpbGVzIGFyZSB0cmFuc2Zvcm1lZCBhY2NvcmRpbmdseS5cbiAqXG4gKiAtIEZsYXQgZmlsZSBwYWNrYWdlcyBoYXZlIGFsbCB0aGUgY2xhc3NlcyBpbiBhIHNpbmdsZSBmaWxlLlxuICogLSBPdGhlciBwYWNrYWdlcyBtYXkgcmUtZXhwb3J0IGNsYXNzZXMgZnJvbSBvdGhlciBub24tZW50cnkgcG9pbnQgZmlsZXMuXG4gKiAtIFNvbWUgZm9ybWF0cyBtYXkgY29udGFpbiBtdWx0aXBsZSBcIm1vZHVsZXNcIiBpbiBhIHNpbmdsZSBmaWxlLlxuICovXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZzOiBGaWxlU3lzdGVtLCBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyKSB7fVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gdGhlIHNvdXJjZSAoYW5kIHR5cGluZ3MpIGZpbGVzIG9mIGEgYnVuZGxlLlxuICAgKiBAcGFyYW0gYnVuZGxlIHRoZSBidW5kbGUgdG8gdHJhbnNmb3JtLlxuICAgKiBAcmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZmlsZXMgdGhhdCB3ZXJlIHRyYW5zZm9ybWVkLlxuICAgKi9cbiAgdHJhbnNmb3JtKGJ1bmRsZTogRW50cnlQb2ludEJ1bmRsZSk6IEZpbGVUb1dyaXRlW10ge1xuICAgIGNvbnN0IHJlZmxlY3Rpb25Ib3N0ID0gdGhpcy5nZXRIb3N0KGJ1bmRsZSk7XG5cbiAgICAvLyBQYXJzZSBhbmQgYW5hbHl6ZSB0aGUgZmlsZXMuXG4gICAgY29uc3Qge2RlY29yYXRpb25BbmFseXNlcywgc3dpdGNoTWFya2VyQW5hbHlzZXMsIHByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcyxcbiAgICAgICAgICAgbW9kdWxlV2l0aFByb3ZpZGVyc0FuYWx5c2VzfSA9IHRoaXMuYW5hbHl6ZVByb2dyYW0ocmVmbGVjdGlvbkhvc3QsIGJ1bmRsZSk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIHNvdXJjZSBmaWxlcyBhbmQgc291cmNlIG1hcHMuXG4gICAgY29uc3Qgc3JjRm9ybWF0dGVyID0gdGhpcy5nZXRSZW5kZXJpbmdGb3JtYXR0ZXIocmVmbGVjdGlvbkhvc3QsIGJ1bmRsZSk7XG5cbiAgICBjb25zdCByZW5kZXJlciA9IG5ldyBSZW5kZXJlcihzcmNGb3JtYXR0ZXIsIHRoaXMuZnMsIHRoaXMubG9nZ2VyLCBidW5kbGUpO1xuICAgIGxldCByZW5kZXJlZEZpbGVzID0gcmVuZGVyZXIucmVuZGVyUHJvZ3JhbShcbiAgICAgICAgZGVjb3JhdGlvbkFuYWx5c2VzLCBzd2l0Y2hNYXJrZXJBbmFseXNlcywgcHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzKTtcblxuICAgIGlmIChidW5kbGUuZHRzKSB7XG4gICAgICBjb25zdCBkdHNGb3JtYXR0ZXIgPSBuZXcgRXNtUmVuZGVyaW5nRm9ybWF0dGVyKHJlZmxlY3Rpb25Ib3N0LCBidW5kbGUuaXNDb3JlKTtcbiAgICAgIGNvbnN0IGR0c1JlbmRlcmVyID1cbiAgICAgICAgICBuZXcgRHRzUmVuZGVyZXIoZHRzRm9ybWF0dGVyLCB0aGlzLmZzLCB0aGlzLmxvZ2dlciwgcmVmbGVjdGlvbkhvc3QsIGJ1bmRsZSk7XG4gICAgICBjb25zdCByZW5kZXJlZER0c0ZpbGVzID0gZHRzUmVuZGVyZXIucmVuZGVyUHJvZ3JhbShcbiAgICAgICAgICBkZWNvcmF0aW9uQW5hbHlzZXMsIHByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcywgbW9kdWxlV2l0aFByb3ZpZGVyc0FuYWx5c2VzKTtcbiAgICAgIHJlbmRlcmVkRmlsZXMgPSByZW5kZXJlZEZpbGVzLmNvbmNhdChyZW5kZXJlZER0c0ZpbGVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVuZGVyZWRGaWxlcztcbiAgfVxuXG4gIGdldEhvc3QoYnVuZGxlOiBFbnRyeVBvaW50QnVuZGxlKTogTmdjY1JlZmxlY3Rpb25Ib3N0IHtcbiAgICBjb25zdCB0eXBlQ2hlY2tlciA9IGJ1bmRsZS5zcmMucHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuICAgIHN3aXRjaCAoYnVuZGxlLmZvcm1hdCkge1xuICAgICAgY2FzZSAnZXNtMjAxNSc6XG4gICAgICAgIHJldHVybiBuZXcgRXNtMjAxNVJlZmxlY3Rpb25Ib3N0KHRoaXMubG9nZ2VyLCBidW5kbGUuaXNDb3JlLCB0eXBlQ2hlY2tlciwgYnVuZGxlLmR0cyk7XG4gICAgICBjYXNlICdlc201JzpcbiAgICAgICAgcmV0dXJuIG5ldyBFc201UmVmbGVjdGlvbkhvc3QodGhpcy5sb2dnZXIsIGJ1bmRsZS5pc0NvcmUsIHR5cGVDaGVja2VyLCBidW5kbGUuZHRzKTtcbiAgICAgIGNhc2UgJ3VtZCc6XG4gICAgICAgIHJldHVybiBuZXcgVW1kUmVmbGVjdGlvbkhvc3QoXG4gICAgICAgICAgICB0aGlzLmxvZ2dlciwgYnVuZGxlLmlzQ29yZSwgYnVuZGxlLnNyYy5wcm9ncmFtLCBidW5kbGUuc3JjLmhvc3QsIGJ1bmRsZS5kdHMpO1xuICAgICAgY2FzZSAnY29tbW9uanMnOlxuICAgICAgICByZXR1cm4gbmV3IENvbW1vbkpzUmVmbGVjdGlvbkhvc3QoXG4gICAgICAgICAgICB0aGlzLmxvZ2dlciwgYnVuZGxlLmlzQ29yZSwgYnVuZGxlLnNyYy5wcm9ncmFtLCBidW5kbGUuc3JjLmhvc3QsIGJ1bmRsZS5kdHMpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZWZsZWN0aW9uIGhvc3QgZm9yIFwiJHtidW5kbGUuZm9ybWF0fVwiIG5vdCB5ZXQgaW1wbGVtZW50ZWQuYCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UmVuZGVyaW5nRm9ybWF0dGVyKGhvc3Q6IE5nY2NSZWZsZWN0aW9uSG9zdCwgYnVuZGxlOiBFbnRyeVBvaW50QnVuZGxlKTogUmVuZGVyaW5nRm9ybWF0dGVyIHtcbiAgICBzd2l0Y2ggKGJ1bmRsZS5mb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2VzbTIwMTUnOlxuICAgICAgICByZXR1cm4gbmV3IEVzbVJlbmRlcmluZ0Zvcm1hdHRlcihob3N0LCBidW5kbGUuaXNDb3JlKTtcbiAgICAgIGNhc2UgJ2VzbTUnOlxuICAgICAgICByZXR1cm4gbmV3IEVzbTVSZW5kZXJpbmdGb3JtYXR0ZXIoaG9zdCwgYnVuZGxlLmlzQ29yZSk7XG4gICAgICBjYXNlICd1bWQnOlxuICAgICAgICBpZiAoIShob3N0IGluc3RhbmNlb2YgVW1kUmVmbGVjdGlvbkhvc3QpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbWRSZW5kZXJlciByZXF1aXJlcyBhIFVtZFJlZmxlY3Rpb25Ib3N0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBVbWRSZW5kZXJpbmdGb3JtYXR0ZXIoaG9zdCwgYnVuZGxlLmlzQ29yZSk7XG4gICAgICBjYXNlICdjb21tb25qcyc6XG4gICAgICAgIHJldHVybiBuZXcgQ29tbW9uSnNSZW5kZXJpbmdGb3JtYXR0ZXIoaG9zdCwgYnVuZGxlLmlzQ29yZSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlbmRlcmVyIGZvciBcIiR7YnVuZGxlLmZvcm1hdH1cIiBub3QgeWV0IGltcGxlbWVudGVkLmApO1xuICAgIH1cbiAgfVxuXG4gIGFuYWx5emVQcm9ncmFtKHJlZmxlY3Rpb25Ib3N0OiBOZ2NjUmVmbGVjdGlvbkhvc3QsIGJ1bmRsZTogRW50cnlQb2ludEJ1bmRsZSk6IFByb2dyYW1BbmFseXNlcyB7XG4gICAgY29uc3QgcmVmZXJlbmNlc1JlZ2lzdHJ5ID0gbmV3IE5nY2NSZWZlcmVuY2VzUmVnaXN0cnkocmVmbGVjdGlvbkhvc3QpO1xuXG4gICAgY29uc3Qgc3dpdGNoTWFya2VyQW5hbHl6ZXIgPVxuICAgICAgICBuZXcgU3dpdGNoTWFya2VyQW5hbHl6ZXIocmVmbGVjdGlvbkhvc3QsIGJ1bmRsZS5lbnRyeVBvaW50LnBhY2thZ2UpO1xuICAgIGNvbnN0IHN3aXRjaE1hcmtlckFuYWx5c2VzID0gc3dpdGNoTWFya2VyQW5hbHl6ZXIuYW5hbHl6ZVByb2dyYW0oYnVuZGxlLnNyYy5wcm9ncmFtKTtcblxuICAgIGNvbnN0IGRlY29yYXRpb25BbmFseXplciA9XG4gICAgICAgIG5ldyBEZWNvcmF0aW9uQW5hbHl6ZXIodGhpcy5mcywgYnVuZGxlLCByZWZsZWN0aW9uSG9zdCwgcmVmZXJlbmNlc1JlZ2lzdHJ5KTtcbiAgICBjb25zdCBkZWNvcmF0aW9uQW5hbHlzZXMgPSBkZWNvcmF0aW9uQW5hbHl6ZXIuYW5hbHl6ZVByb2dyYW0oKTtcblxuICAgIGNvbnN0IG1vZHVsZVdpdGhQcm92aWRlcnNBbmFseXplciA9XG4gICAgICAgIGJ1bmRsZS5kdHMgJiYgbmV3IE1vZHVsZVdpdGhQcm92aWRlcnNBbmFseXplcihyZWZsZWN0aW9uSG9zdCwgcmVmZXJlbmNlc1JlZ2lzdHJ5KTtcbiAgICBjb25zdCBtb2R1bGVXaXRoUHJvdmlkZXJzQW5hbHlzZXMgPSBtb2R1bGVXaXRoUHJvdmlkZXJzQW5hbHl6ZXIgJiZcbiAgICAgICAgbW9kdWxlV2l0aFByb3ZpZGVyc0FuYWx5emVyLmFuYWx5emVQcm9ncmFtKGJ1bmRsZS5zcmMucHJvZ3JhbSk7XG5cbiAgICBjb25zdCBwcml2YXRlRGVjbGFyYXRpb25zQW5hbHl6ZXIgPVxuICAgICAgICBuZXcgUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5emVyKHJlZmxlY3Rpb25Ib3N0LCByZWZlcmVuY2VzUmVnaXN0cnkpO1xuICAgIGNvbnN0IHByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlcyA9XG4gICAgICAgIHByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXplci5hbmFseXplUHJvZ3JhbShidW5kbGUuc3JjLnByb2dyYW0pO1xuXG4gICAgcmV0dXJuIHtkZWNvcmF0aW9uQW5hbHlzZXMsIHN3aXRjaE1hcmtlckFuYWx5c2VzLCBwcml2YXRlRGVjbGFyYXRpb25zQW5hbHlzZXMsXG4gICAgICAgICAgICBtb2R1bGVXaXRoUHJvdmlkZXJzQW5hbHlzZXN9O1xuICB9XG59XG5cblxuaW50ZXJmYWNlIFByb2dyYW1BbmFseXNlcyB7XG4gIGRlY29yYXRpb25BbmFseXNlczogTWFwPHRzLlNvdXJjZUZpbGUsIENvbXBpbGVkRmlsZT47XG4gIHN3aXRjaE1hcmtlckFuYWx5c2VzOiBTd2l0Y2hNYXJrZXJBbmFseXNlcztcbiAgcHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzOiBFeHBvcnRJbmZvW107XG4gIG1vZHVsZVdpdGhQcm92aWRlcnNBbmFseXNlczogTW9kdWxlV2l0aFByb3ZpZGVyc0FuYWx5c2VzfG51bGw7XG59XG4iXX0=