import * as tslib_1 from "tslib";
import { Framework } from '../framework';
import { Injectable } from '@angular/core';
import { NoFrameworkComponent } from './no-framework.component';
// No framework - plain HTML controls (styles from form layout only)
let NoFramework = class NoFramework extends Framework {
    // No framework - plain HTML controls (styles from form layout only)
    constructor() {
        super(...arguments);
        this.name = 'no-framework';
        this.framework = NoFrameworkComponent;
    }
};
NoFramework = tslib_1.__decorate([
    Injectable()
], NoFramework);
export { NoFramework };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8uZnJhbWV3b3JrLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi9mcmFtZXdvcmstbGlicmFyeS9uby1mcmFtZXdvcmsvbm8uZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsb0VBQW9FO0FBR3BFLElBQWEsV0FBVyxHQUF4QixNQUFhLFdBQVksU0FBUSxTQUFTO0lBSDFDLG9FQUFvRTtJQUVwRTs7UUFFRSxTQUFJLEdBQUcsY0FBYyxDQUFDO1FBRXRCLGNBQVMsR0FBRyxvQkFBb0IsQ0FBQztJQUNuQyxDQUFDO0NBQUEsQ0FBQTtBQUpZLFdBQVc7SUFEdkIsVUFBVSxFQUFFO0dBQ0EsV0FBVyxDQUl2QjtTQUpZLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGcmFtZXdvcmsgfSBmcm9tICcuLi9mcmFtZXdvcmsnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTm9GcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL25vLWZyYW1ld29yay5jb21wb25lbnQnO1xuLy8gTm8gZnJhbWV3b3JrIC0gcGxhaW4gSFRNTCBjb250cm9scyAoc3R5bGVzIGZyb20gZm9ybSBsYXlvdXQgb25seSlcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5vRnJhbWV3b3JrIGV4dGVuZHMgRnJhbWV3b3JrIHtcbiAgbmFtZSA9ICduby1mcmFtZXdvcmsnO1xuXG4gIGZyYW1ld29yayA9IE5vRnJhbWV3b3JrQ29tcG9uZW50O1xufVxuIl19