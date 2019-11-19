import * as tslib_1 from "tslib";
import { CommonModule } from '@angular/common';
import { Framework } from '../framework';
import { FrameworkLibraryService } from '../framework-library.service';
import { JsonSchemaFormService } from '../../json-schema-form.service';
import { NgModule } from '@angular/core';
import { NoFramework } from './no.framework';
import { NoFrameworkComponent } from './no-framework.component';
import { WidgetLibraryModule } from '../../widget-library/widget-library.module';
import { WidgetLibraryService } from '../../widget-library/widget-library.service';
// No framework - plain HTML controls (styles from form layout only)
var NoFrameworkModule = /** @class */ (function () {
    function NoFrameworkModule() {
    }
    NoFrameworkModule = tslib_1.__decorate([
        NgModule({
            imports: [CommonModule, WidgetLibraryModule],
            declarations: [NoFrameworkComponent],
            exports: [NoFrameworkComponent],
            providers: [JsonSchemaFormService, FrameworkLibraryService, WidgetLibraryService,
                { provide: Framework, useClass: NoFramework, multi: true }
            ],
            entryComponents: [NoFrameworkComponent]
        })
    ], NoFrameworkModule);
    return NoFrameworkModule;
}());
export { NoFrameworkModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8tZnJhbWV3b3JrLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvbm8tZnJhbWV3b3JrL25vLWZyYW1ld29yay5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUNqRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUVuRixvRUFBb0U7QUFXcEU7SUFBQTtJQUFpQyxDQUFDO0lBQXJCLGlCQUFpQjtRQVQ3QixRQUFRLENBQUM7WUFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUM7WUFDNUMsWUFBWSxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDcEMsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDL0IsU0FBUyxFQUFFLENBQUMscUJBQXFCLEVBQUUsdUJBQXVCLEVBQUUsb0JBQW9CO2dCQUM5RSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2FBQzNEO1lBQ0QsZUFBZSxFQUFFLENBQUMsb0JBQW9CLENBQUM7U0FDeEMsQ0FBQztPQUNXLGlCQUFpQixDQUFJO0lBQUQsd0JBQUM7Q0FBQSxBQUFsQyxJQUFrQztTQUFyQixpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgRnJhbWV3b3JrIH0gZnJvbSAnLi4vZnJhbWV3b3JrJztcbmltcG9ydCB7IEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlIH0gZnJvbSAnLi4vZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICcuLi8uLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5vRnJhbWV3b3JrIH0gZnJvbSAnLi9uby5mcmFtZXdvcmsnO1xuaW1wb3J0IHsgTm9GcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL25vLWZyYW1ld29yay5jb21wb25lbnQnO1xuaW1wb3J0IHsgV2lkZ2V0TGlicmFyeU1vZHVsZSB9IGZyb20gJy4uLy4uL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5Lm1vZHVsZSc7XG5pbXBvcnQgeyBXaWRnZXRMaWJyYXJ5U2VydmljZSB9IGZyb20gJy4uLy4uL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5LnNlcnZpY2UnO1xuXG4vLyBObyBmcmFtZXdvcmsgLSBwbGFpbiBIVE1MIGNvbnRyb2xzIChzdHlsZXMgZnJvbSBmb3JtIGxheW91dCBvbmx5KVxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBXaWRnZXRMaWJyYXJ5TW9kdWxlXSxcbiAgZGVjbGFyYXRpb25zOiBbTm9GcmFtZXdvcmtDb21wb25lbnRdLFxuICBleHBvcnRzOiBbTm9GcmFtZXdvcmtDb21wb25lbnRdLFxuICBwcm92aWRlcnM6IFtKc29uU2NoZW1hRm9ybVNlcnZpY2UsIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLCBXaWRnZXRMaWJyYXJ5U2VydmljZSxcbiAgICB7IHByb3ZpZGU6IEZyYW1ld29yaywgdXNlQ2xhc3M6IE5vRnJhbWV3b3JrLCBtdWx0aTogdHJ1ZSB9XG4gIF0sXG4gIGVudHJ5Q29tcG9uZW50czogW05vRnJhbWV3b3JrQ29tcG9uZW50XVxufSlcbmV4cG9ydCBjbGFzcyBOb0ZyYW1ld29ya01vZHVsZSB7IH1cbiJdfQ==