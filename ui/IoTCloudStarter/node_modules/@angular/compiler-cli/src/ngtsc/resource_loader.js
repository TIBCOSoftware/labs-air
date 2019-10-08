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
        define("@angular/compiler-cli/src/ngtsc/resource_loader", ["require", "exports", "tslib", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var CSS_PREPROCESSOR_EXT = /(\.scss|\.less|\.styl)$/;
    /**
     * `ResourceLoader` which delegates to a `CompilerHost` resource loading method.
     */
    var HostResourceLoader = /** @class */ (function () {
        function HostResourceLoader(host, options) {
            this.host = host;
            this.options = options;
            this.cache = new Map();
            this.fetching = new Map();
            this.canPreload = !!this.host.readResource;
        }
        /**
         * Resolve the url of a resource relative to the file that contains the reference to it.
         * The return value of this method can be used in the `load()` and `preload()` methods.
         *
         * Uses the provided CompilerHost if it supports mapping resources to filenames.
         * Otherwise, uses a fallback mechanism that searches the module resolution candidates.
         *
         * @param url The, possibly relative, url of the resource.
         * @param fromFile The path to the file that contains the URL of the resource.
         * @returns A resolved url of resource.
         * @throws An error if the resource cannot be resolved.
         */
        HostResourceLoader.prototype.resolve = function (url, fromFile) {
            var resolvedUrl = null;
            if (this.host.resourceNameToFileName) {
                resolvedUrl = this.host.resourceNameToFileName(url, fromFile);
            }
            else {
                resolvedUrl = this.fallbackResolve(url, fromFile);
            }
            if (resolvedUrl === null) {
                throw new Error("HostResourceResolver: could not resolve " + url + " in context of " + fromFile + ")");
            }
            return resolvedUrl;
        };
        /**
         * Preload the specified resource, asynchronously.
         *
         * Once the resource is loaded, its value is cached so it can be accessed synchronously via the
         * `load()` method.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to preload.
         * @returns A Promise that is resolved once the resource has been loaded or `undefined` if the
         * file has already been loaded.
         * @throws An Error if pre-loading is not available.
         */
        HostResourceLoader.prototype.preload = function (resolvedUrl) {
            var _this = this;
            if (!this.host.readResource) {
                throw new Error('HostResourceLoader: the CompilerHost provided does not support pre-loading resources.');
            }
            if (this.cache.has(resolvedUrl)) {
                return undefined;
            }
            else if (this.fetching.has(resolvedUrl)) {
                return this.fetching.get(resolvedUrl);
            }
            var result = this.host.readResource(resolvedUrl);
            if (typeof result === 'string') {
                this.cache.set(resolvedUrl, result);
                return undefined;
            }
            else {
                var fetchCompletion = result.then(function (str) {
                    _this.fetching.delete(resolvedUrl);
                    _this.cache.set(resolvedUrl, str);
                });
                this.fetching.set(resolvedUrl, fetchCompletion);
                return fetchCompletion;
            }
        };
        /**
         * Load the resource at the given url, synchronously.
         *
         * The contents of the resource may have been cached by a previous call to `preload()`.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to load.
         * @returns The contents of the resource.
         */
        HostResourceLoader.prototype.load = function (resolvedUrl) {
            if (this.cache.has(resolvedUrl)) {
                return this.cache.get(resolvedUrl);
            }
            var result = this.host.readResource ? this.host.readResource(resolvedUrl) :
                this.host.readFile(resolvedUrl);
            if (typeof result !== 'string') {
                throw new Error("HostResourceLoader: loader(" + resolvedUrl + ") returned a Promise");
            }
            this.cache.set(resolvedUrl, result);
            return result;
        };
        /**
         * Attempt to resolve `url` in the context of `fromFile`, while respecting the rootDirs
         * option from the tsconfig. First, normalize the file name.
         */
        HostResourceLoader.prototype.fallbackResolve = function (url, fromFile) {
            var e_1, _a;
            // Strip a leading '/' if one is present.
            if (url.startsWith('/')) {
                url = url.substr(1);
                // Do not take current file location into account if we process absolute path.
                fromFile = '';
            }
            // Turn absolute paths into relative paths.
            if (!url.startsWith('.')) {
                url = "./" + url;
            }
            var candidateLocations = this.getCandidateLocations(url, fromFile);
            try {
                for (var candidateLocations_1 = tslib_1.__values(candidateLocations), candidateLocations_1_1 = candidateLocations_1.next(); !candidateLocations_1_1.done; candidateLocations_1_1 = candidateLocations_1.next()) {
                    var candidate = candidateLocations_1_1.value;
                    if (this.host.fileExists(candidate)) {
                        return candidate;
                    }
                    else if (CSS_PREPROCESSOR_EXT.test(candidate)) {
                        /**
                         * If the user specified styleUrl points to *.scss, but the Sass compiler was run before
                         * Angular, then the resource may have been generated as *.css. Simply try the resolution
                         * again.
                         */
                        var cssFallbackUrl = candidate.replace(CSS_PREPROCESSOR_EXT, '.css');
                        if (this.host.fileExists(cssFallbackUrl)) {
                            return cssFallbackUrl;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (candidateLocations_1_1 && !candidateLocations_1_1.done && (_a = candidateLocations_1.return)) _a.call(candidateLocations_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        /**
         * TypeScript provides utilities to resolve module names, but not resource files (which aren't
         * a part of the ts.Program). However, TypeScript's module resolution can be used creatively
         * to locate where resource files should be expected to exist. Since module resolution returns
         * a list of file names that were considered, the loader can enumerate the possible locations
         * for the file by setting up a module resolution for it that will fail.
         */
        HostResourceLoader.prototype.getCandidateLocations = function (url, fromFile) {
            // clang-format off
            var failedLookup = ts.resolveModuleName(url + '.$ngresource$', fromFile, this.options, this.host);
            // clang-format on
            if (failedLookup.failedLookupLocations === undefined) {
                throw new Error("Internal error: expected to find failedLookupLocations during resolution of resource '" + url + "' in context of " + fromFile);
            }
            return failedLookup.failedLookupLocations
                .filter(function (candidate) { return candidate.endsWith('.$ngresource$.ts'); })
                .map(function (candidate) { return candidate.replace(/\.\$ngresource\$\.ts$/, ''); });
        };
        return HostResourceLoader;
    }());
    exports.HostResourceLoader = HostResourceLoader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9yZXNvdXJjZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBSWpDLElBQU0sb0JBQW9CLEdBQUcseUJBQXlCLENBQUM7SUFFdkQ7O09BRUc7SUFDSDtRQU1FLDRCQUFvQixJQUFrQixFQUFVLE9BQTJCO1lBQXZELFNBQUksR0FBSixJQUFJLENBQWM7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFvQjtZQUxuRSxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFDbEMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1lBRXBELGVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFFd0MsQ0FBQztRQUUvRTs7Ozs7Ozs7Ozs7V0FXRztRQUNILG9DQUFPLEdBQVAsVUFBUSxHQUFXLEVBQUUsUUFBZ0I7WUFDbkMsSUFBSSxXQUFXLEdBQWdCLElBQUksQ0FBQztZQUNwQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ3BDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMvRDtpQkFBTTtnQkFDTCxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDbkQ7WUFDRCxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7Z0JBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTJDLEdBQUcsdUJBQWtCLFFBQVEsTUFBRyxDQUFDLENBQUM7YUFDOUY7WUFDRCxPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDO1FB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Q0gseUJBQUM7SUFBRCxDQUFDLEFBMUpELElBMEpDO0lBMUpZLGdEQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0NvbXBpbGVySG9zdH0gZnJvbSAnLi4vdHJhbnNmb3JtZXJzL2FwaSc7XG5pbXBvcnQge1Jlc291cmNlTG9hZGVyfSBmcm9tICcuL2Fubm90YXRpb25zL3NyYy9hcGknO1xuXG5jb25zdCBDU1NfUFJFUFJPQ0VTU09SX0VYVCA9IC8oXFwuc2Nzc3xcXC5sZXNzfFxcLnN0eWwpJC87XG5cbi8qKlxuICogYFJlc291cmNlTG9hZGVyYCB3aGljaCBkZWxlZ2F0ZXMgdG8gYSBgQ29tcGlsZXJIb3N0YCByZXNvdXJjZSBsb2FkaW5nIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEhvc3RSZXNvdXJjZUxvYWRlciBpbXBsZW1lbnRzIFJlc291cmNlTG9hZGVyIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgZmV0Y2hpbmcgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTx2b2lkPj4oKTtcblxuICBjYW5QcmVsb2FkID0gISF0aGlzLmhvc3QucmVhZFJlc291cmNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdDogQ29tcGlsZXJIb3N0LCBwcml2YXRlIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucykge31cblxuICAvKipcbiAgICogUmVzb2x2ZSB0aGUgdXJsIG9mIGEgcmVzb3VyY2UgcmVsYXRpdmUgdG8gdGhlIGZpbGUgdGhhdCBjb250YWlucyB0aGUgcmVmZXJlbmNlIHRvIGl0LlxuICAgKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoaXMgbWV0aG9kIGNhbiBiZSB1c2VkIGluIHRoZSBgbG9hZCgpYCBhbmQgYHByZWxvYWQoKWAgbWV0aG9kcy5cbiAgICpcbiAgICogVXNlcyB0aGUgcHJvdmlkZWQgQ29tcGlsZXJIb3N0IGlmIGl0IHN1cHBvcnRzIG1hcHBpbmcgcmVzb3VyY2VzIHRvIGZpbGVuYW1lcy5cbiAgICogT3RoZXJ3aXNlLCB1c2VzIGEgZmFsbGJhY2sgbWVjaGFuaXNtIHRoYXQgc2VhcmNoZXMgdGhlIG1vZHVsZSByZXNvbHV0aW9uIGNhbmRpZGF0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVGhlLCBwb3NzaWJseSByZWxhdGl2ZSwgdXJsIG9mIHRoZSByZXNvdXJjZS5cbiAgICogQHBhcmFtIGZyb21GaWxlIFRoZSBwYXRoIHRvIHRoZSBmaWxlIHRoYXQgY29udGFpbnMgdGhlIFVSTCBvZiB0aGUgcmVzb3VyY2UuXG4gICAqIEByZXR1cm5zIEEgcmVzb2x2ZWQgdXJsIG9mIHJlc291cmNlLlxuICAgKiBAdGhyb3dzIEFuIGVycm9yIGlmIHRoZSByZXNvdXJjZSBjYW5ub3QgYmUgcmVzb2x2ZWQuXG4gICAqL1xuICByZXNvbHZlKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzb2x2ZWRVcmw6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBpZiAodGhpcy5ob3N0LnJlc291cmNlTmFtZVRvRmlsZU5hbWUpIHtcbiAgICAgIHJlc29sdmVkVXJsID0gdGhpcy5ob3N0LnJlc291cmNlTmFtZVRvRmlsZU5hbWUodXJsLCBmcm9tRmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmVkVXJsID0gdGhpcy5mYWxsYmFja1Jlc29sdmUodXJsLCBmcm9tRmlsZSk7XG4gICAgfVxuICAgIGlmIChyZXNvbHZlZFVybCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBIb3N0UmVzb3VyY2VSZXNvbHZlcjogY291bGQgbm90IHJlc29sdmUgJHt1cmx9IGluIGNvbnRleHQgb2YgJHtmcm9tRmlsZX0pYCk7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZFVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVsb2FkIHRoZSBzcGVjaWZpZWQgcmVzb3VyY2UsIGFzeW5jaHJvbm91c2x5LlxuICAgKlxuICAgKiBPbmNlIHRoZSByZXNvdXJjZSBpcyBsb2FkZWQsIGl0cyB2YWx1ZSBpcyBjYWNoZWQgc28gaXQgY2FuIGJlIGFjY2Vzc2VkIHN5bmNocm9ub3VzbHkgdmlhIHRoZVxuICAgKiBgbG9hZCgpYCBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSByZXNvbHZlZFVybCBUaGUgdXJsIChyZXNvbHZlZCBieSBhIGNhbGwgdG8gYHJlc29sdmUoKWApIG9mIHRoZSByZXNvdXJjZSB0byBwcmVsb2FkLlxuICAgKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvbmNlIHRoZSByZXNvdXJjZSBoYXMgYmVlbiBsb2FkZWQgb3IgYHVuZGVmaW5lZGAgaWYgdGhlXG4gICAqIGZpbGUgaGFzIGFscmVhZHkgYmVlbiBsb2FkZWQuXG4gICAqIEB0aHJvd3MgQW4gRXJyb3IgaWYgcHJlLWxvYWRpbmcgaXMgbm90IGF2YWlsYWJsZS5cbiAgICovXG4gIHByZWxvYWQocmVzb2x2ZWRVcmw6IHN0cmluZyk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkIHtcbiAgICBpZiAoIXRoaXMuaG9zdC5yZWFkUmVzb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnSG9zdFJlc291cmNlTG9hZGVyOiB0aGUgQ29tcGlsZXJIb3N0IHByb3ZpZGVkIGRvZXMgbm90IHN1cHBvcnQgcHJlLWxvYWRpbmcgcmVzb3VyY2VzLicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jYWNoZS5oYXMocmVzb2x2ZWRVcmwpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodGhpcy5mZXRjaGluZy5oYXMocmVzb2x2ZWRVcmwpKSB7XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaGluZy5nZXQocmVzb2x2ZWRVcmwpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuaG9zdC5yZWFkUmVzb3VyY2UocmVzb2x2ZWRVcmwpO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5jYWNoZS5zZXQocmVzb2x2ZWRVcmwsIHJlc3VsdCk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmZXRjaENvbXBsZXRpb24gPSByZXN1bHQudGhlbihzdHIgPT4ge1xuICAgICAgICB0aGlzLmZldGNoaW5nLmRlbGV0ZShyZXNvbHZlZFVybCk7XG4gICAgICAgIHRoaXMuY2FjaGUuc2V0KHJlc29sdmVkVXJsLCBzdHIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmZldGNoaW5nLnNldChyZXNvbHZlZFVybCwgZmV0Y2hDb21wbGV0aW9uKTtcbiAgICAgIHJldHVybiBmZXRjaENvbXBsZXRpb247XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIHJlc291cmNlIGF0IHRoZSBnaXZlbiB1cmwsIHN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIFRoZSBjb250ZW50cyBvZiB0aGUgcmVzb3VyY2UgbWF5IGhhdmUgYmVlbiBjYWNoZWQgYnkgYSBwcmV2aW91cyBjYWxsIHRvIGBwcmVsb2FkKClgLlxuICAgKlxuICAgKiBAcGFyYW0gcmVzb2x2ZWRVcmwgVGhlIHVybCAocmVzb2x2ZWQgYnkgYSBjYWxsIHRvIGByZXNvbHZlKClgKSBvZiB0aGUgcmVzb3VyY2UgdG8gbG9hZC5cbiAgICogQHJldHVybnMgVGhlIGNvbnRlbnRzIG9mIHRoZSByZXNvdXJjZS5cbiAgICovXG4gIGxvYWQocmVzb2x2ZWRVcmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKHJlc29sdmVkVXJsKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KHJlc29sdmVkVXJsKSAhO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuaG9zdC5yZWFkUmVzb3VyY2UgPyB0aGlzLmhvc3QucmVhZFJlc291cmNlKHJlc29sdmVkVXJsKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9zdC5yZWFkRmlsZShyZXNvbHZlZFVybCk7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEhvc3RSZXNvdXJjZUxvYWRlcjogbG9hZGVyKCR7cmVzb2x2ZWRVcmx9KSByZXR1cm5lZCBhIFByb21pc2VgKTtcbiAgICB9XG4gICAgdGhpcy5jYWNoZS5zZXQocmVzb2x2ZWRVcmwsIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0IHRvIHJlc29sdmUgYHVybGAgaW4gdGhlIGNvbnRleHQgb2YgYGZyb21GaWxlYCwgd2hpbGUgcmVzcGVjdGluZyB0aGUgcm9vdERpcnNcbiAgICogb3B0aW9uIGZyb20gdGhlIHRzY29uZmlnLiBGaXJzdCwgbm9ybWFsaXplIHRoZSBmaWxlIG5hbWUuXG4gICAqL1xuICBwcml2YXRlIGZhbGxiYWNrUmVzb2x2ZSh1cmw6IHN0cmluZywgZnJvbUZpbGU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICAvLyBTdHJpcCBhIGxlYWRpbmcgJy8nIGlmIG9uZSBpcyBwcmVzZW50LlxuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICB1cmwgPSB1cmwuc3Vic3RyKDEpO1xuXG4gICAgICAvLyBEbyBub3QgdGFrZSBjdXJyZW50IGZpbGUgbG9jYXRpb24gaW50byBhY2NvdW50IGlmIHdlIHByb2Nlc3MgYWJzb2x1dGUgcGF0aC5cbiAgICAgIGZyb21GaWxlID0gJyc7XG4gICAgfVxuICAgIC8vIFR1cm4gYWJzb2x1dGUgcGF0aHMgaW50byByZWxhdGl2ZSBwYXRocy5cbiAgICBpZiAoIXVybC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgIHVybCA9IGAuLyR7dXJsfWA7XG4gICAgfVxuXG4gICAgY29uc3QgY2FuZGlkYXRlTG9jYXRpb25zID0gdGhpcy5nZXRDYW5kaWRhdGVMb2NhdGlvbnModXJsLCBmcm9tRmlsZSk7XG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlTG9jYXRpb25zKSB7XG4gICAgICBpZiAodGhpcy5ob3N0LmZpbGVFeGlzdHMoY2FuZGlkYXRlKSkge1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgfSBlbHNlIGlmIChDU1NfUFJFUFJPQ0VTU09SX0VYVC50ZXN0KGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSB1c2VyIHNwZWNpZmllZCBzdHlsZVVybCBwb2ludHMgdG8gKi5zY3NzLCBidXQgdGhlIFNhc3MgY29tcGlsZXIgd2FzIHJ1biBiZWZvcmVcbiAgICAgICAgICogQW5ndWxhciwgdGhlbiB0aGUgcmVzb3VyY2UgbWF5IGhhdmUgYmVlbiBnZW5lcmF0ZWQgYXMgKi5jc3MuIFNpbXBseSB0cnkgdGhlIHJlc29sdXRpb25cbiAgICAgICAgICogYWdhaW4uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjc3NGYWxsYmFja1VybCA9IGNhbmRpZGF0ZS5yZXBsYWNlKENTU19QUkVQUk9DRVNTT1JfRVhULCAnLmNzcycpO1xuICAgICAgICBpZiAodGhpcy5ob3N0LmZpbGVFeGlzdHMoY3NzRmFsbGJhY2tVcmwpKSB7XG4gICAgICAgICAgcmV0dXJuIGNzc0ZhbGxiYWNrVXJsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogVHlwZVNjcmlwdCBwcm92aWRlcyB1dGlsaXRpZXMgdG8gcmVzb2x2ZSBtb2R1bGUgbmFtZXMsIGJ1dCBub3QgcmVzb3VyY2UgZmlsZXMgKHdoaWNoIGFyZW4ndFxuICAgKiBhIHBhcnQgb2YgdGhlIHRzLlByb2dyYW0pLiBIb3dldmVyLCBUeXBlU2NyaXB0J3MgbW9kdWxlIHJlc29sdXRpb24gY2FuIGJlIHVzZWQgY3JlYXRpdmVseVxuICAgKiB0byBsb2NhdGUgd2hlcmUgcmVzb3VyY2UgZmlsZXMgc2hvdWxkIGJlIGV4cGVjdGVkIHRvIGV4aXN0LiBTaW5jZSBtb2R1bGUgcmVzb2x1dGlvbiByZXR1cm5zXG4gICAqIGEgbGlzdCBvZiBmaWxlIG5hbWVzIHRoYXQgd2VyZSBjb25zaWRlcmVkLCB0aGUgbG9hZGVyIGNhbiBlbnVtZXJhdGUgdGhlIHBvc3NpYmxlIGxvY2F0aW9uc1xuICAgKiBmb3IgdGhlIGZpbGUgYnkgc2V0dGluZyB1cCBhIG1vZHVsZSByZXNvbHV0aW9uIGZvciBpdCB0aGF0IHdpbGwgZmFpbC5cbiAgICovXG4gIHByaXZhdGUgZ2V0Q2FuZGlkYXRlTG9jYXRpb25zKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIC8vIGBmYWlsZWRMb29rdXBMb2NhdGlvbnNgIGlzIGluIHRoZSBuYW1lIG9mIHRoZSB0eXBlIHRzLlJlc29sdmVkTW9kdWxlV2l0aEZhaWxlZExvb2t1cExvY2F0aW9uc1xuICAgIC8vIGJ1dCBpcyBtYXJrZWQgQGludGVybmFsIGluIFR5cGVTY3JpcHQuIFNlZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMjg3NzAuXG4gICAgdHlwZSBSZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnMgPVxuICAgICAgICB0cy5SZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnMgJiB7ZmFpbGVkTG9va3VwTG9jYXRpb25zOiBSZWFkb25seUFycmF5PHN0cmluZz59O1xuXG4gICAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICAgIGNvbnN0IGZhaWxlZExvb2t1cCA9IHRzLnJlc29sdmVNb2R1bGVOYW1lKHVybCArICcuJG5ncmVzb3VyY2UkJywgZnJvbUZpbGUsIHRoaXMub3B0aW9ucywgdGhpcy5ob3N0KSBhcyBSZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnM7XG4gICAgLy8gY2xhbmctZm9ybWF0IG9uXG4gICAgaWYgKGZhaWxlZExvb2t1cC5mYWlsZWRMb29rdXBMb2NhdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBJbnRlcm5hbCBlcnJvcjogZXhwZWN0ZWQgdG8gZmluZCBmYWlsZWRMb29rdXBMb2NhdGlvbnMgZHVyaW5nIHJlc29sdXRpb24gb2YgcmVzb3VyY2UgJyR7dXJsfScgaW4gY29udGV4dCBvZiAke2Zyb21GaWxlfWApO1xuICAgIH1cblxuICAgIHJldHVybiBmYWlsZWRMb29rdXAuZmFpbGVkTG9va3VwTG9jYXRpb25zXG4gICAgICAgIC5maWx0ZXIoY2FuZGlkYXRlID0+IGNhbmRpZGF0ZS5lbmRzV2l0aCgnLiRuZ3Jlc291cmNlJC50cycpKVxuICAgICAgICAubWFwKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUucmVwbGFjZSgvXFwuXFwkbmdyZXNvdXJjZVxcJFxcLnRzJC8sICcnKSk7XG4gIH1cbn1cbiJdfQ==