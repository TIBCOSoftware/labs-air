import * as tslib_1 from "tslib";
import { Framework } from '../framework';
import { Injectable } from '@angular/core';
import { NoFrameworkComponent } from './no-framework.component';
// No framework - plain HTML controls (styles from form layout only)
var NoFramework = /** @class */ (function (_super) {
    tslib_1.__extends(NoFramework, _super);
    function NoFramework() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'no-framework';
        _this.framework = NoFrameworkComponent;
        return _this;
    }
    NoFramework = tslib_1.__decorate([
        Injectable()
    ], NoFramework);
    return NoFramework;
}(Framework));
export { NoFramework };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8uZnJhbWV3b3JrLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi9mcmFtZXdvcmstbGlicmFyeS9uby1mcmFtZXdvcmsvbm8uZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsb0VBQW9FO0FBR3BFO0lBQWlDLHVDQUFTO0lBRDFDO1FBQUEscUVBS0M7UUFIQyxVQUFJLEdBQUcsY0FBYyxDQUFDO1FBRXRCLGVBQVMsR0FBRyxvQkFBb0IsQ0FBQzs7SUFDbkMsQ0FBQztJQUpZLFdBQVc7UUFEdkIsVUFBVSxFQUFFO09BQ0EsV0FBVyxDQUl2QjtJQUFELGtCQUFDO0NBQUEsQUFKRCxDQUFpQyxTQUFTLEdBSXpDO1NBSlksV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZyYW1ld29yayB9IGZyb20gJy4uL2ZyYW1ld29yayc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOb0ZyYW1ld29ya0NvbXBvbmVudCB9IGZyb20gJy4vbm8tZnJhbWV3b3JrLmNvbXBvbmVudCc7XG4vLyBObyBmcmFtZXdvcmsgLSBwbGFpbiBIVE1MIGNvbnRyb2xzIChzdHlsZXMgZnJvbSBmb3JtIGxheW91dCBvbmx5KVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTm9GcmFtZXdvcmsgZXh0ZW5kcyBGcmFtZXdvcmsge1xuICBuYW1lID0gJ25vLWZyYW1ld29yayc7XG5cbiAgZnJhbWV3b3JrID0gTm9GcmFtZXdvcmtDb21wb25lbnQ7XG59XG4iXX0=