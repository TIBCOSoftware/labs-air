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
        define("@angular/compiler-cli/src/ngtsc/util/src/typescript", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var TS = /\.tsx?$/i;
    var D_TS = /\.d\.ts$/i;
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    function isDtsPath(filePath) {
        return D_TS.test(filePath);
    }
    exports.isDtsPath = isDtsPath;
    function isNonDeclarationTsPath(filePath) {
        return TS.test(filePath) && !D_TS.test(filePath);
    }
    exports.isNonDeclarationTsPath = isNonDeclarationTsPath;
    function isFromDtsFile(node) {
        var sf = node.getSourceFile();
        if (sf === undefined) {
            sf = ts.getOriginalNode(node).getSourceFile();
        }
        return sf !== undefined && sf.isDeclarationFile;
    }
    exports.isFromDtsFile = isFromDtsFile;
    function nodeNameForError(node) {
        if (node.name !== undefined && ts.isIdentifier(node.name)) {
            return node.name.text;
        }
        else {
            var kind = ts.SyntaxKind[node.kind];
            var _a = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart()), line = _a.line, character = _a.character;
            return kind + "@" + line + ":" + character;
        }
    }
    exports.nodeNameForError = nodeNameForError;
    function getSourceFile(node) {
        // In certain transformation contexts, `ts.Node.getSourceFile()` can actually return `undefined`,
        // despite the type signature not allowing it. In that event, get the `ts.SourceFile` via the
        // original node instead (which works).
        var directSf = node.getSourceFile();
        return directSf !== undefined ? directSf : ts.getOriginalNode(node).getSourceFile();
    }
    exports.getSourceFile = getSourceFile;
    function getSourceFileOrNull(program, fileName) {
        return program.getSourceFile(fileName) || null;
    }
    exports.getSourceFileOrNull = getSourceFileOrNull;
    function identifierOfNode(decl) {
        if (decl.name !== undefined && ts.isIdentifier(decl.name)) {
            return decl.name;
        }
        else {
            return null;
        }
    }
    exports.identifierOfNode = identifierOfNode;
    function isDeclaration(node) {
        return false || ts.isEnumDeclaration(node) || ts.isClassDeclaration(node) ||
            ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node);
    }
    exports.isDeclaration = isDeclaration;
    function isExported(node) {
        var topLevel = node;
        if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList(node.parent)) {
            topLevel = node.parent.parent;
        }
        return topLevel.modifiers !== undefined &&
            topLevel.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.ExportKeyword; });
    }
    exports.isExported = isExported;
    function getRootDirs(host, options) {
        var rootDirs = [];
        if (options.rootDirs !== undefined) {
            rootDirs.push.apply(rootDirs, tslib_1.__spread(options.rootDirs));
        }
        else if (options.rootDir !== undefined) {
            rootDirs.push(options.rootDir);
        }
        else {
            rootDirs.push(host.getCurrentDirectory());
        }
        // In Windows the above might not always return posix separated paths
        // See:
        // https://github.com/Microsoft/TypeScript/blob/3f7357d37f66c842d70d835bc925ec2a873ecfec/src/compiler/sys.ts#L650
        // Also compiler options might be set via an API which doesn't normalize paths
        return rootDirs.map(function (rootDir) { return file_system_1.absoluteFrom(rootDir); });
    }
    exports.getRootDirs = getRootDirs;
    function nodeDebugInfo(node) {
        var sf = getSourceFile(node);
        var _a = ts.getLineAndCharacterOfPosition(sf, node.pos), line = _a.line, character = _a.character;
        return "[" + sf.fileName + ": " + ts.SyntaxKind[node.kind] + " @ " + line + ":" + character + "]";
    }
    exports.nodeDebugInfo = nodeDebugInfo;
    /**
     * Resolve the specified `moduleName` using the given `compilerOptions` and `compilerHost`.
     *
     * This helper will attempt to use the `CompilerHost.resolveModuleNames()` method if available.
     * Otherwise it will fallback on the `ts.ResolveModuleName()` function.
     */
    function resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost) {
        if (compilerHost.resolveModuleNames) {
            return compilerHost.resolveModuleNames([moduleName], containingFile)[0];
        }
        else {
            return ts.resolveModuleName(moduleName, containingFile, compilerOptions, compilerHost)
                .resolvedModule;
        }
    }
    exports.resolveModuleName = resolveModuleName;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdXRpbC9zcmMvdHlwZXNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxJQUFNLEVBQUUsR0FBRyxVQUFVLENBQUM7SUFDdEIsSUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDO0lBRXpCLCtCQUFpQztJQUNqQywyRUFBK0Q7SUFFL0QsU0FBZ0IsU0FBUyxDQUFDLFFBQWdCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRkQsOEJBRUM7SUFFRCxTQUFnQixzQkFBc0IsQ0FBQyxRQUFnQjtRQUNyRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFGRCx3REFFQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxJQUFhO1FBQ3pDLElBQUksRUFBRSxHQUE0QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdkQsSUFBSSxFQUFFLEtBQUssU0FBUyxFQUFFO1lBQ3BCLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQy9DO1FBQ0QsT0FBTyxFQUFFLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNsRCxDQUFDO0lBTkQsc0NBTUM7SUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFnQztRQUMvRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pELE9BQU8sSUFBSSxD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VUFBQSxPQUFPLElBQUksT0FBQSwwQkFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7SUFDeEQsQ0FBQztJQWZELGtDQWVDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQWE7UUFDekMsSUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLElBQUEsbURBQWtFLEVBQWpFLGNBQUksRUFBRSx3QkFBMkQsQ0FBQztRQUN6RSxPQUFPLE1BQUksRUFBRSxDQUFDLFFBQVEsVUFBSyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBTSxJQUFJLFNBQUksU0FBUyxNQUFHLENBQUM7SUFDaEYsQ0FBQztJQUpELHNDQUlDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixpQkFBaUIsQ0FDN0IsVUFBa0IsRUFBRSxjQUFzQixFQUFFLGVBQW1DLEVBQy9FLFlBQTZCO1FBQy9CLElBQUksWUFBWSxDQUFDLGtCQUFrQixFQUFFO1lBQ25DLE9BQU8sWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekU7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQztpQkFDakYsY0FBYyxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQVRELDhDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5jb25zdCBUUyA9IC9cXC50c3g/JC9pO1xuY29uc3QgRF9UUyA9IC9cXC5kXFwudHMkL2k7XG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgYWJzb2x1dGVGcm9tfSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0R0c1BhdGgoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gRF9UUy50ZXN0KGZpbGVQYXRoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTm9uRGVjbGFyYXRpb25Uc1BhdGgoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gVFMudGVzdChmaWxlUGF0aCkgJiYgIURfVFMudGVzdChmaWxlUGF0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Zyb21EdHNGaWxlKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgbGV0IHNmOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCA9IG5vZGUuZ2V0U291cmNlRmlsZSgpO1xuICBpZiAoc2YgPT09IHVuZGVmaW5lZCkge1xuICAgIHNmID0gdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpLmdldFNvdXJjZUZpbGUoKTtcbiAgfVxuICByZXR1cm4gc2YgIT09IHVuZGVmaW5lZCAmJiBzZi5pc0RlY2xhcmF0aW9uRmlsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVOYW1lRm9yRXJyb3Iobm9kZTogdHMuTm9kZSAmIHtuYW1lPzogdHMuTm9kZX0pOiBzdHJpbmcge1xuICBpZiAobm9kZS5uYW1lICE9PSB1bmRlZmluZWQgJiYgdHMuaXNJZGVudGlmaWVyKG5vZGUubmFtZSkpIHtcbiAgICByZXR1cm4gbm9kZS5uYW1lLnRleHQ7XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qga2luZCA9IHRzLlN5bnRheEtpbmRbbm9kZS5raW5kXTtcbiAgICBjb25zdCB7bGluZSwgY2hhcmFjdGVyfSA9XG4gICAgICAgIHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKG5vZGUuZ2V0U291cmNlRmlsZSgpLCBub2RlLmdldFN0YXJ0KCkpO1xuICAgIHJldHVybiBgJHtraW5kfUAke2xpbmV9OiR7Y2hhcmFjdGVyfWA7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZpbGUobm9kZTogdHMuTm9kZSk6IHRzLlNvdXJjZUZpbGUge1xuICAvLyBJbiBjZXJ0YWluIHRyYW5zZm9ybWF0aW9uIGNvbnRleHRzLCBgdHMuTm9kZS5nZXRTb3VyY2VGaWxlKClgIGNhbiBhY3R1YWxseSByZXR1cm4gYHVuZGVmaW5lZGAsXG4gIC8vIGRlc3BpdGUgdGhlIHR5cGUgc2lnbmF0dXJlIG5vdCBhbGxvd2luZyBpdC4gSW4gdGhhdCBldmVudCwgZ2V0IHRoZSBgdHMuU291cmNlRmlsZWAgdmlhIHRoZVxuICAvLyBvcmlnaW5hbCBub2RlIGluc3RlYWQgKHdoaWNoIHdvcmtzKS5cbiAgY29uc3QgZGlyZWN0U2YgPSBub2RlLmdldFNvdXJjZUZpbGUoKSBhcyB0cy5Tb3VyY2VGaWxlIHwgdW5kZWZpbmVkO1xuICByZXR1cm4gZGlyZWN0U2YgIT09IHVuZGVmaW5lZCA/IGRpcmVjdFNmIDogdHMuZ2V0T3JpZ2luYWxOb2RlKG5vZGUpLmdldFNvdXJjZUZpbGUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZpbGVPck51bGwocHJvZ3JhbTogdHMuUHJvZ3JhbSwgZmlsZU5hbWU6IEFic29sdXRlRnNQYXRoKTogdHMuU291cmNlRmlsZXxcbiAgICBudWxsIHtcbiAgcmV0dXJuIHByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSkgfHwgbnVsbDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpZmllck9mTm9kZShkZWNsOiB0cy5Ob2RlICYge25hbWU/OiB0cy5Ob2RlfSk6IHRzLklkZW50aWZpZXJ8bnVsbCB7XG4gIGlmIChkZWNsLm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSkge1xuICAgIHJldHVybiBkZWNsLm5hbWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuRGVjbGFyYXRpb24ge1xuICByZXR1cm4gZmFsc2UgfHwgdHMuaXNFbnVtRGVjbGFyYXRpb24obm9kZSkgfHwgdHMuaXNDbGFzc0RlY2xhcmF0aW9uKG5vZGUpIHx8XG4gICAgICB0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24obm9kZSkgfHwgdHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFeHBvcnRlZChub2RlOiB0cy5EZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICBsZXQgdG9wTGV2ZWw6IHRzLk5vZGUgPSBub2RlO1xuICBpZiAodHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKG5vZGUpICYmIHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbkxpc3Qobm9kZS5wYXJlbnQpKSB7XG4gICAgdG9wTGV2ZWwgPSBub2RlLnBhcmVudC5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHRvcExldmVsLm1vZGlmaWVycyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0b3BMZXZlbC5tb2RpZmllcnMuc29tZShtb2RpZmllciA9PiBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um9vdERpcnMoaG9zdDogdHMuQ29tcGlsZXJIb3N0LCBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpOiBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgY29uc3Qgcm9vdERpcnM6IHN0cmluZ1tdID0gW107XG4gIGlmIChvcHRpb25zLnJvb3REaXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICByb290RGlycy5wdXNoKC4uLm9wdGlvbnMucm9vdERpcnMpO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMucm9vdERpciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcm9vdERpcnMucHVzaChvcHRpb25zLnJvb3REaXIpO1xuICB9IGVsc2Uge1xuICAgIHJvb3REaXJzLnB1c2goaG9zdC5nZXRDdXJyZW50RGlyZWN0b3J5KCkpO1xuICB9XG5cbiAgLy8gSW4gV2luZG93cyB0aGUgYWJvdmUgbWlnaHQgbm90IGFsd2F5cyByZXR1cm4gcG9zaXggc2VwYXJhdGVkIHBhdGhzXG4gIC8vIFNlZTpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvM2Y3MzU3ZDM3ZjY2Yzg0MmQ3MGQ4MzViYzkyNWVjMmE4NzNlY2ZlYy9zcmMvY29tcGlsZXIvc3lzLnRzI0w2NTBcbiAgLy8gQWxzbyBjb21waWxlciBvcHRpb25zIG1pZ2h0IGJlIHNldCB2aWEgYW4gQVBJIHdoaWNoIGRvZXNuJ3Qgbm9ybWFsaXplIHBhdGhzXG4gIHJldHVybiByb290RGlycy5tYXAocm9vdERpciA9PiBhYnNvbHV0ZUZyb20ocm9vdERpcikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9kZURlYnVnSW5mbyhub2RlOiB0cy5Ob2RlKTogc3RyaW5nIHtcbiAgY29uc3Qgc2YgPSBnZXRTb3VyY2VGaWxlKG5vZGUpO1xuICBjb25zdCB7bGluZSwgY2hhcmFjdGVyfSA9IHRzLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKHNmLCBub2RlLnBvcyk7XG4gIHJldHVybiBgWyR7c2YuZmlsZU5hbWV9OiAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX0gQCAke2xpbmV9OiR7Y2hhcmFjdGVyfV1gO1xufVxuXG4vKipcbiAqIFJlc29sdmUgdGhlIHNwZWNpZmllZCBgbW9kdWxlTmFtZWAgdXNpbmcgdGhlIGdpdmVuIGBjb21waWxlck9wdGlvbnNgIGFuZCBgY29tcGlsZXJIb3N0YC5cbiAqXG4gKiBUaGlzIGhlbHBlciB3aWxsIGF0dGVtcHQgdG8gdXNlIHRoZSBgQ29tcGlsZXJIb3N0LnJlc29sdmVNb2R1bGVOYW1lcygpYCBtZXRob2QgaWYgYXZhaWxhYmxlLlxuICogT3RoZXJ3aXNlIGl0IHdpbGwgZmFsbGJhY2sgb24gdGhlIGB0cy5SZXNvbHZlTW9kdWxlTmFtZSgpYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVNb2R1bGVOYW1lKFxuICAgIG1vZHVsZU5hbWU6IHN0cmluZywgY29udGFpbmluZ0ZpbGU6IHN0cmluZywgY29tcGlsZXJPcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsXG4gICAgY29tcGlsZXJIb3N0OiB0cy5Db21waWxlckhvc3QpOiB0cy5SZXNvbHZlZE1vZHVsZXx1bmRlZmluZWQge1xuICBpZiAoY29tcGlsZXJIb3N0LnJlc29sdmVNb2R1bGVOYW1lcykge1xuICAgIHJldHVybiBjb21waWxlckhvc3QucmVzb2x2ZU1vZHVsZU5hbWVzKFttb2R1bGVOYW1lXSwgY29udGFpbmluZ0ZpbGUpWzBdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0cy5yZXNvbHZlTW9kdWxlTmFtZShtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZSwgY29tcGlsZXJPcHRpb25zLCBjb21waWxlckhvc3QpXG4gICAgICAgIC5yZXNvbHZlZE1vZHVsZTtcbiAgfVxufSJdfQ==