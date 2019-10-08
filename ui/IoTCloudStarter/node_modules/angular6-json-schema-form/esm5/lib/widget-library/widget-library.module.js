import * as tslib_1 from "tslib";
import { BASIC_WIDGETS } from './index';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonSchemaFormService } from '../json-schema-form.service';
import { NgModule } from '@angular/core';
import { OrderableDirective } from './orderable.directive';
var WidgetLibraryModule = /** @class */ (function () {
    function WidgetLibraryModule() {
    }
    WidgetLibraryModule_1 = WidgetLibraryModule;
    WidgetLibraryModule.forRoot = function () {
        return {
            ngModule: WidgetLibraryModule_1,
            providers: [JsonSchemaFormService]
        };
    };
    var WidgetLibraryModule_1;
    WidgetLibraryModule = WidgetLibraryModule_1 = tslib_1.__decorate([
        NgModule({
            imports: [CommonModule, FormsModule, ReactiveFormsModule],
            declarations: tslib_1.__spread(BASIC_WIDGETS, [OrderableDirective]),
            exports: tslib_1.__spread(BASIC_WIDGETS, [OrderableDirective]),
            entryComponents: tslib_1.__spread(BASIC_WIDGETS),
            providers: [JsonSchemaFormService]
        })
    ], WidgetLibraryModule);
    return WidgetLibraryModule;
}());
export { WidgetLibraryModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LWxpYnJhcnkubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjYtanNvbi1zY2hlbWEtZm9ybS8iLCJzb3VyY2VzIjpbImxpYi93aWRnZXQtbGlicmFyeS93aWRnZXQtbGlicmFyeS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDeEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVMzRDtJQUFBO0lBT0EsQ0FBQzs0QkFQWSxtQkFBbUI7SUFDdkIsMkJBQU8sR0FBZDtRQUNFLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQW1CO1lBQzdCLFNBQVMsRUFBRSxDQUFFLHFCQUFxQixDQUFFO1NBQ3JDLENBQUM7SUFDSixDQUFDOztJQU5VLG1CQUFtQjtRQVAvQixRQUFRLENBQUM7WUFDUixPQUFPLEVBQVUsQ0FBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixDQUFFO1lBQ25FLFlBQVksbUJBQVUsYUFBYSxHQUFFLGtCQUFrQixFQUFFO1lBQ3pELE9BQU8sbUJBQWUsYUFBYSxHQUFFLGtCQUFrQixFQUFFO1lBQ3pELGVBQWUsbUJBQU8sYUFBYSxDQUFFO1lBQ3JDLFNBQVMsRUFBUSxDQUFFLHFCQUFxQixDQUFFO1NBQzNDLENBQUM7T0FDVyxtQkFBbUIsQ0FPL0I7SUFBRCwwQkFBQztDQUFBLEFBUEQsSUFPQztTQVBZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJBU0lDX1dJREdFVFMgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5pbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT3JkZXJhYmxlRGlyZWN0aXZlIH0gZnJvbSAnLi9vcmRlcmFibGUuZGlyZWN0aXZlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogICAgICAgICBbIENvbW1vbk1vZHVsZSwgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgXSxcbiAgZGVjbGFyYXRpb25zOiAgICBbIC4uLkJBU0lDX1dJREdFVFMsIE9yZGVyYWJsZURpcmVjdGl2ZSBdLFxuICBleHBvcnRzOiAgICAgICAgIFsgLi4uQkFTSUNfV0lER0VUUywgT3JkZXJhYmxlRGlyZWN0aXZlIF0sXG4gIGVudHJ5Q29tcG9uZW50czogWyAuLi5CQVNJQ19XSURHRVRTIF0sXG4gIHByb3ZpZGVyczogICAgICAgWyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgXVxufSlcbmV4cG9ydCBjbGFzcyBXaWRnZXRMaWJyYXJ5TW9kdWxlIHtcbiAgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBXaWRnZXRMaWJyYXJ5TW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbIEpzb25TY2hlbWFGb3JtU2VydmljZSBdXG4gICAgfTtcbiAgfVxufVxuIl19