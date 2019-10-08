import * as tslib_1 from "tslib";
import { Framework } from './framework';
import { hasOwn } from '../shared/utility.functions';
import { Inject, Injectable } from '@angular/core';
import { WidgetLibraryService } from '../widget-library/widget-library.service';
// Possible future frameworks:
// - Foundation 6:
//   http://justindavis.co/2017/06/15/using-foundation-6-in-angular-4/
//   https://github.com/zurb/foundation-sites
// - Semantic UI:
//   https://github.com/edcarroll/ng2-semantic-ui
//   https://github.com/vladotesanovic/ngSemantic
var FrameworkLibraryService = /** @class */ (function () {
    function FrameworkLibraryService(frameworks, widgetLibrary) {
        var _this = this;
        this.frameworks = frameworks;
        this.widgetLibrary = widgetLibrary;
        this.activeFramework = null;
        this.loadExternalAssets = false;
        this.frameworkLibrary = {};
        this.frameworks.forEach(function (framework) {
            return _this.frameworkLibrary[framework.name] = framework;
        });
        this.defaultFramework = this.frameworks[0].name;
        this.setFramework(this.defaultFramework);
    }
    FrameworkLibraryService.prototype.setLoadExternalAssets = function (loadExternalAssets) {
        if (loadExternalAssets === void 0) { loadExternalAssets = true; }
        this.loadExternalAssets = !!loadExternalAssets;
    };
    FrameworkLibraryService.prototype.setFramework = function (framework, loadExternalAssets) {
        if (framework === void 0) { framework = this.defaultFramework; }
        if (loadExternalAssets === void 0) { loadExternalAssets = this.loadExternalAssets; }
        this.activeFramework =
            typeof framework === 'string' && this.hasFramework(framework) ?
                this.frameworkLibrary[framework] :
                typeof framework === 'object' && hasOwn(framework, 'framework') ?
                    framework :
                    this.frameworkLibrary[this.defaultFramework];
        return this.registerFrameworkWidgets(this.activeFramework);
    };
    FrameworkLibraryService.prototype.registerFrameworkWidgets = function (framework) {
        return hasOwn(framework, 'widgets') ?
            this.widgetLibrary.registerFrameworkWidgets(framework.widgets) :
            this.widgetLibrary.unRegisterFrameworkWidgets();
    };
    FrameworkLibraryService.prototype.hasFramework = function (type) {
        return hasOwn(this.frameworkLibrary, type);
    };
    FrameworkLibraryService.prototype.getFramework = function () {
        if (!this.activeFramework) {
            this.setFramework('default', true);
        }
        return this.activeFramework.framework;
    };
    FrameworkLibraryService.prototype.getFrameworkWidgets = function () {
        return this.activeFramework.widgets || {};
    };
    FrameworkLibraryService.prototype.getFrameworkStylesheets = function (load) {
        if (load === void 0) { load = this.loadExternalAssets; }
        return (load && this.activeFramework.stylesheets) || [];
    };
    FrameworkLibraryService.prototype.getFrameworkScripts = function (load) {
        if (load === void 0) { load = this.loadExternalAssets; }
        return (load && this.activeFramework.scripts) || [];
    };
    FrameworkLibraryService = tslib_1.__decorate([
        Injectable(),
        tslib_1.__param(0, Inject(Framework)),
        tslib_1.__param(1, Inject(WidgetLibraryService)),
        tslib_1.__metadata("design:paramtypes", [Array, WidgetLibraryService])
    ], FrameworkLibraryService);
    return FrameworkLibraryService;
}());
export { FrameworkLibraryService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFFaEYsOEJBQThCO0FBQzlCLGtCQUFrQjtBQUNsQixzRUFBc0U7QUFDdEUsNkNBQTZDO0FBQzdDLGlCQUFpQjtBQUNqQixpREFBaUQ7QUFDakQsaURBQWlEO0FBR2pEO0lBUUUsaUNBQzZCLFVBQWlCLEVBQ04sYUFBbUM7UUFGM0UsaUJBU0M7UUFSNEIsZUFBVSxHQUFWLFVBQVUsQ0FBTztRQUNOLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtRQVQzRSxvQkFBZSxHQUFjLElBQUksQ0FBQztRQUdsQyx1QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFFM0IscUJBQWdCLEdBQWtDLEVBQUUsQ0FBQztRQU1uRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVM7WUFDL0IsT0FBQSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVM7UUFBakQsQ0FBaUQsQ0FDbEQsQ0FBQztRQUNGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNoRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTSx1REFBcUIsR0FBNUIsVUFBNkIsa0JBQXlCO1FBQXpCLG1DQUFBLEVBQUEseUJBQXlCO1FBQ3BELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUM7SUFDakQsQ0FBQztJQUVNLDhDQUFZLEdBQW5CLFVBQ0UsU0FBbUQsRUFDbkQsa0JBQTRDO1FBRDVDLDBCQUFBLEVBQUEsWUFBOEIsSUFBSSxDQUFDLGdCQUFnQjtRQUNuRCxtQ0FBQSxFQUFBLHFCQUFxQixJQUFJLENBQUMsa0JBQWtCO1FBRTVDLElBQUksQ0FBQyxlQUFlO1lBQ2xCLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUMvRCxTQUFTLENBQUMsQ0FBQztvQkFDWCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCwwREFBd0IsR0FBeEIsVUFBeUIsU0FBb0I7UUFDM0MsT0FBTyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLDhDQUFZLEdBQW5CLFVBQW9CLElBQVk7UUFDOUIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFTSw4Q0FBWSxHQUFuQjtRQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FBRTtRQUNsRSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO0lBQ3hDLENBQUM7SUFFTSxxREFBbUIsR0FBMUI7UUFDRSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBRU0seURBQXVCLEdBQTlCLFVBQStCLElBQXVDO1FBQXZDLHFCQUFBLEVBQUEsT0FBZ0IsSUFBSSxDQUFDLGtCQUFrQjtRQUNwRSxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFTSxxREFBbUIsR0FBMUIsVUFBMkIsSUFBdUM7UUFBdkMscUJBQUEsRUFBQSxPQUFnQixJQUFJLENBQUMsa0JBQWtCO1FBQ2hFLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEQsQ0FBQztJQTdEVSx1QkFBdUI7UUFEbkMsVUFBVSxFQUFFO1FBVVIsbUJBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2pCLG1CQUFBLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO3dEQUF3QixvQkFBb0I7T0FWaEUsdUJBQXVCLENBOERuQztJQUFELDhCQUFDO0NBQUEsQUE5REQsSUE4REM7U0E5RFksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRnJhbWV3b3JrIH0gZnJvbSAnLi9mcmFtZXdvcmsnO1xuaW1wb3J0IHsgaGFzT3duIH0gZnJvbSAnLi4vc2hhcmVkL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgV2lkZ2V0TGlicmFyeVNlcnZpY2UgfSBmcm9tICcuLi93aWRnZXQtbGlicmFyeS93aWRnZXQtbGlicmFyeS5zZXJ2aWNlJztcblxuLy8gUG9zc2libGUgZnV0dXJlIGZyYW1ld29ya3M6XG4vLyAtIEZvdW5kYXRpb24gNjpcbi8vICAgaHR0cDovL2p1c3RpbmRhdmlzLmNvLzIwMTcvMDYvMTUvdXNpbmctZm91bmRhdGlvbi02LWluLWFuZ3VsYXItNC9cbi8vICAgaHR0cHM6Ly9naXRodWIuY29tL3p1cmIvZm91bmRhdGlvbi1zaXRlc1xuLy8gLSBTZW1hbnRpYyBVSTpcbi8vICAgaHR0cHM6Ly9naXRodWIuY29tL2VkY2Fycm9sbC9uZzItc2VtYW50aWMtdWlcbi8vICAgaHR0cHM6Ly9naXRodWIuY29tL3ZsYWRvdGVzYW5vdmljL25nU2VtYW50aWNcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlIHtcbiAgYWN0aXZlRnJhbWV3b3JrOiBGcmFtZXdvcmsgPSBudWxsO1xuICBzdHlsZXNoZWV0czogKEhUTUxTdHlsZUVsZW1lbnR8SFRNTExpbmtFbGVtZW50KVtdO1xuICBzY3JpcHRzOiBIVE1MU2NyaXB0RWxlbWVudFtdO1xuICBsb2FkRXh0ZXJuYWxBc3NldHMgPSBmYWxzZTtcbiAgZGVmYXVsdEZyYW1ld29yazogc3RyaW5nO1xuICBmcmFtZXdvcmtMaWJyYXJ5OiB7IFtuYW1lOiBzdHJpbmddOiBGcmFtZXdvcmsgfSA9IHt9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoRnJhbWV3b3JrKSBwcml2YXRlIGZyYW1ld29ya3M6IGFueVtdLFxuICAgIEBJbmplY3QoV2lkZ2V0TGlicmFyeVNlcnZpY2UpIHByaXZhdGUgd2lkZ2V0TGlicmFyeTogV2lkZ2V0TGlicmFyeVNlcnZpY2VcbiAgKSB7XG4gICAgdGhpcy5mcmFtZXdvcmtzLmZvckVhY2goZnJhbWV3b3JrID0+XG4gICAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnlbZnJhbWV3b3JrLm5hbWVdID0gZnJhbWV3b3JrXG4gICAgKTtcbiAgICB0aGlzLmRlZmF1bHRGcmFtZXdvcmsgPSB0aGlzLmZyYW1ld29ya3NbMF0ubmFtZTtcbiAgICB0aGlzLnNldEZyYW1ld29yayh0aGlzLmRlZmF1bHRGcmFtZXdvcmspO1xuICB9XG5cbiAgcHVibGljIHNldExvYWRFeHRlcm5hbEFzc2V0cyhsb2FkRXh0ZXJuYWxBc3NldHMgPSB0cnVlKTogdm9pZCB7XG4gICAgdGhpcy5sb2FkRXh0ZXJuYWxBc3NldHMgPSAhIWxvYWRFeHRlcm5hbEFzc2V0cztcbiAgfVxuXG4gIHB1YmxpYyBzZXRGcmFtZXdvcmsoXG4gICAgZnJhbWV3b3JrOiBzdHJpbmd8RnJhbWV3b3JrID0gdGhpcy5kZWZhdWx0RnJhbWV3b3JrLFxuICAgIGxvYWRFeHRlcm5hbEFzc2V0cyA9IHRoaXMubG9hZEV4dGVybmFsQXNzZXRzXG4gICk6IGJvb2xlYW4ge1xuICAgIHRoaXMuYWN0aXZlRnJhbWV3b3JrID1cbiAgICAgIHR5cGVvZiBmcmFtZXdvcmsgPT09ICdzdHJpbmcnICYmIHRoaXMuaGFzRnJhbWV3b3JrKGZyYW1ld29yaykgP1xuICAgICAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnlbZnJhbWV3b3JrXSA6XG4gICAgICB0eXBlb2YgZnJhbWV3b3JrID09PSAnb2JqZWN0JyAmJiBoYXNPd24oZnJhbWV3b3JrLCAnZnJhbWV3b3JrJykgP1xuICAgICAgICBmcmFtZXdvcmsgOlxuICAgICAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnlbdGhpcy5kZWZhdWx0RnJhbWV3b3JrXTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RlckZyYW1ld29ya1dpZGdldHModGhpcy5hY3RpdmVGcmFtZXdvcmspO1xuICB9XG5cbiAgcmVnaXN0ZXJGcmFtZXdvcmtXaWRnZXRzKGZyYW1ld29yazogRnJhbWV3b3JrKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhhc093bihmcmFtZXdvcmssICd3aWRnZXRzJykgP1xuICAgICAgdGhpcy53aWRnZXRMaWJyYXJ5LnJlZ2lzdGVyRnJhbWV3b3JrV2lkZ2V0cyhmcmFtZXdvcmsud2lkZ2V0cykgOlxuICAgICAgdGhpcy53aWRnZXRMaWJyYXJ5LnVuUmVnaXN0ZXJGcmFtZXdvcmtXaWRnZXRzKCk7XG4gIH1cblxuICBwdWJsaWMgaGFzRnJhbWV3b3JrKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBoYXNPd24odGhpcy5mcmFtZXdvcmtMaWJyYXJ5LCB0eXBlKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRGcmFtZXdvcmsoKTogYW55IHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlRnJhbWV3b3JrKSB7IHRoaXMuc2V0RnJhbWV3b3JrKCdkZWZhdWx0JywgdHJ1ZSk7IH1cbiAgICByZXR1cm4gdGhpcy5hY3RpdmVGcmFtZXdvcmsuZnJhbWV3b3JrO1xuICB9XG5cbiAgcHVibGljIGdldEZyYW1ld29ya1dpZGdldHMoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVGcmFtZXdvcmsud2lkZ2V0cyB8fCB7fTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRGcmFtZXdvcmtTdHlsZXNoZWV0cyhsb2FkOiBib29sZWFuID0gdGhpcy5sb2FkRXh0ZXJuYWxBc3NldHMpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIChsb2FkICYmIHRoaXMuYWN0aXZlRnJhbWV3b3JrLnN0eWxlc2hlZXRzKSB8fCBbXTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRGcmFtZXdvcmtTY3JpcHRzKGxvYWQ6IGJvb2xlYW4gPSB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0cyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gKGxvYWQgJiYgdGhpcy5hY3RpdmVGcmFtZXdvcmsuc2NyaXB0cykgfHwgW107XG4gIH1cbn1cbiJdfQ==