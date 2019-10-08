import * as tslib_1 from "tslib";
import { FlexLayoutRootComponent } from './flex-layout-root.component';
import { FlexLayoutSectionComponent } from './flex-layout-section.component';
import { Framework } from '../framework';
import { Injectable } from '@angular/core';
import { MaterialAddReferenceComponent } from './material-add-reference.component';
import { MaterialButtonComponent } from './material-button.component';
import { MaterialButtonGroupComponent } from './material-button-group.component';
import { MaterialCheckboxComponent } from './material-checkbox.component';
import { MaterialCheckboxesComponent } from './material-checkboxes.component';
import { MaterialChipListComponent } from './material-chip-list.component';
import { MaterialDatepickerComponent } from './material-datepicker.component';
import { MaterialDesignFrameworkComponent } from './material-design-framework.component';
import { MaterialFileComponent } from './material-file.component';
import { MaterialInputComponent } from './material-input.component';
import { MaterialNumberComponent } from './material-number.component';
import { MaterialOneOfComponent } from './material-one-of.component';
import { MaterialRadiosComponent } from './material-radios.component';
import { MaterialSelectComponent } from './material-select.component';
import { MaterialSliderComponent } from './material-slider.component';
import { MaterialStepperComponent } from './material-stepper.component';
import { MaterialTabsComponent } from './material-tabs.component';
import { MaterialTextareaComponent } from './material-textarea.component';
// Material Design Framework
// https://github.com/angular/material2
var MaterialDesignFramework = /** @class */ (function (_super) {
    tslib_1.__extends(MaterialDesignFramework, _super);
    function MaterialDesignFramework() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'material-design';
        _this.framework = MaterialDesignFrameworkComponent;
        _this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        _this.widgets = {
            'root': FlexLayoutRootComponent,
            'section': FlexLayoutSectionComponent,
            '$ref': MaterialAddReferenceComponent,
            'button': MaterialButtonComponent,
            'button-group': MaterialButtonGroupComponent,
            'checkbox': MaterialCheckboxComponent,
            'checkboxes': MaterialCheckboxesComponent,
            'chip-list': MaterialChipListComponent,
            'date': MaterialDatepickerComponent,
            'file': MaterialFileComponent,
            'number': MaterialNumberComponent,
            'one-of': MaterialOneOfComponent,
            'radios': MaterialRadiosComponent,
            'select': MaterialSelectComponent,
            'slider': MaterialSliderComponent,
            'stepper': MaterialStepperComponent,
            'tabs': MaterialTabsComponent,
            'text': MaterialInputComponent,
            'textarea': MaterialTextareaComponent,
            'alt-date': 'date',
            'any-of': 'one-of',
            'card': 'section',
            'color': 'text',
            'expansion-panel': 'section',
            'hidden': 'none',
            'image': 'none',
            'integer': 'number',
            'radiobuttons': 'button-group',
            'range': 'slider',
            'submit': 'button',
            'tagsinput': 'chip-list',
            'wizard': 'stepper',
        };
        return _this;
    }
    MaterialDesignFramework = tslib_1.__decorate([
        Injectable()
    ], MaterialDesignFramework);
    return MaterialDesignFramework;
}(Framework));
export { MaterialDesignFramework };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay9tYXRlcmlhbC1kZXNpZ24uZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDbkYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDakYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDMUUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDOUUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDekYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDeEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHMUUsNEJBQTRCO0FBQzVCLHVDQUF1QztBQUd2QztJQUE2QyxtREFBUztJQUR0RDtRQUFBLHFFQTZDQztRQTNDQyxVQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFFekIsZUFBUyxHQUFHLGdDQUFnQyxDQUFDO1FBRTdDLGlCQUFXLEdBQUc7WUFDWixtREFBbUQ7WUFDbkQsMERBQTBEO1NBQzNELENBQUM7UUFFRixhQUFPLEdBQUc7WUFDUixNQUFNLEVBQWEsdUJBQXVCO1lBQzFDLFNBQVMsRUFBVSwwQkFBMEI7WUFDN0MsTUFBTSxFQUFhLDZCQUE2QjtZQUNoRCxRQUFRLEVBQVcsdUJBQXVCO1lBQzFDLGNBQWMsRUFBSyw0QkFBNEI7WUFDL0MsVUFBVSxFQUFTLHlCQUF5QjtZQUM1QyxZQUFZLEVBQU8sMkJBQTJCO1lBQzlDLFdBQVcsRUFBUSx5QkFBeUI7WUFDNUMsTUFBTSxFQUFhLDJCQUEyQjtZQUM5QyxNQUFNLEVBQWEscUJBQXFCO1lBQ3hDLFFBQVEsRUFBVyx1QkFBdUI7WUFDMUMsUUFBUSxFQUFXLHNCQUFzQjtZQUN6QyxRQUFRLEVBQVcsdUJBQXVCO1lBQzFDLFFBQVEsRUFBVyx1QkFBdUI7WUFDMUMsUUFBUSxFQUFXLHVCQUF1QjtZQUMxQyxTQUFTLEVBQVUsd0JBQXdCO1lBQzNDLE1BQU0sRUFBYSxxQkFBcUI7WUFDeEMsTUFBTSxFQUFhLHNCQUFzQjtZQUN6QyxVQUFVLEVBQVMseUJBQXlCO1lBQzVDLFVBQVUsRUFBUyxNQUFNO1lBQ3pCLFFBQVEsRUFBVyxRQUFRO1lBQzNCLE1BQU0sRUFBYSxTQUFTO1lBQzVCLE9BQU8sRUFBWSxNQUFNO1lBQ3pCLGlCQUFpQixFQUFFLFNBQVM7WUFDNUIsUUFBUSxFQUFXLE1BQU07WUFDekIsT0FBTyxFQUFZLE1BQU07WUFDekIsU0FBUyxFQUFVLFFBQVE7WUFDM0IsY0FBYyxFQUFLLGNBQWM7WUFDakMsT0FBTyxFQUFZLFFBQVE7WUFDM0IsUUFBUSxFQUFXLFFBQVE7WUFDM0IsV0FBVyxFQUFRLFdBQVc7WUFDOUIsUUFBUSxFQUFXLFNBQVM7U0FDN0IsQ0FBQzs7SUFDSixDQUFDO0lBNUNZLHVCQUF1QjtRQURuQyxVQUFVLEVBQUU7T0FDQSx1QkFBdUIsQ0E0Q25DO0lBQUQsOEJBQUM7Q0FBQSxBQTVDRCxDQUE2QyxTQUFTLEdBNENyRDtTQTVDWSx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGbGV4TGF5b3V0Um9vdENvbXBvbmVudCB9IGZyb20gJy4vZmxleC1sYXlvdXQtcm9vdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgRmxleExheW91dFNlY3Rpb25Db21wb25lbnQgfSBmcm9tICcuL2ZsZXgtbGF5b3V0LXNlY3Rpb24uY29tcG9uZW50JztcbmltcG9ydCB7IEZyYW1ld29yayB9IGZyb20gJy4uL2ZyYW1ld29yayc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxCdXR0b25Db21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLWJ1dHRvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxCdXR0b25Hcm91cENvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtYnV0dG9uLWdyb3VwLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbENoZWNrYm94Q29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1jaGVja2JveC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxDaGVja2JveGVzQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1jaGVja2JveGVzLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbENoaXBMaXN0Q29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1jaGlwLWxpc3QuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsRGF0ZXBpY2tlckNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtZGF0ZXBpY2tlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsRmlsZUNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtZmlsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxJbnB1dENvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtaW5wdXQuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsTnVtYmVyQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1udW1iZXIuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsT25lT2ZDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLW9uZS1vZi5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxSYWRpb3NDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXJhZGlvcy5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxTZWxlY3RDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXNlbGVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxTbGlkZXJDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXNsaWRlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxTdGVwcGVyQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1zdGVwcGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbFRhYnNDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXRhYnMuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXRleHRhcmVhLmNvbXBvbmVudCc7XG5cblxuLy8gTWF0ZXJpYWwgRGVzaWduIEZyYW1ld29ya1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvbWF0ZXJpYWwyXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbERlc2lnbkZyYW1ld29yayBleHRlbmRzIEZyYW1ld29yayB7XG4gIG5hbWUgPSAnbWF0ZXJpYWwtZGVzaWduJztcblxuICBmcmFtZXdvcmsgPSBNYXRlcmlhbERlc2lnbkZyYW1ld29ya0NvbXBvbmVudDtcblxuICBzdHlsZXNoZWV0cyA9IFtcbiAgICAnLy9mb250cy5nb29nbGVhcGlzLmNvbS9pY29uP2ZhbWlseT1NYXRlcmlhbCtJY29ucycsXG4gICAgJy8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1Sb2JvdG86MzAwLDQwMCw1MDAsNzAwJyxcbiAgXTtcblxuICB3aWRnZXRzID0ge1xuICAgICdyb290JzogICAgICAgICAgICBGbGV4TGF5b3V0Um9vdENvbXBvbmVudCxcbiAgICAnc2VjdGlvbic6ICAgICAgICAgRmxleExheW91dFNlY3Rpb25Db21wb25lbnQsXG4gICAgJyRyZWYnOiAgICAgICAgICAgIE1hdGVyaWFsQWRkUmVmZXJlbmNlQ29tcG9uZW50LFxuICAgICdidXR0b24nOiAgICAgICAgICBNYXRlcmlhbEJ1dHRvbkNvbXBvbmVudCxcbiAgICAnYnV0dG9uLWdyb3VwJzogICAgTWF0ZXJpYWxCdXR0b25Hcm91cENvbXBvbmVudCxcbiAgICAnY2hlY2tib3gnOiAgICAgICAgTWF0ZXJpYWxDaGVja2JveENvbXBvbmVudCxcbiAgICAnY2hlY2tib3hlcyc6ICAgICAgTWF0ZXJpYWxDaGVja2JveGVzQ29tcG9uZW50LFxuICAgICdjaGlwLWxpc3QnOiAgICAgICBNYXRlcmlhbENoaXBMaXN0Q29tcG9uZW50LFxuICAgICdkYXRlJzogICAgICAgICAgICBNYXRlcmlhbERhdGVwaWNrZXJDb21wb25lbnQsXG4gICAgJ2ZpbGUnOiAgICAgICAgICAgIE1hdGVyaWFsRmlsZUNvbXBvbmVudCxcbiAgICAnbnVtYmVyJzogICAgICAgICAgTWF0ZXJpYWxOdW1iZXJDb21wb25lbnQsXG4gICAgJ29uZS1vZic6ICAgICAgICAgIE1hdGVyaWFsT25lT2ZDb21wb25lbnQsXG4gICAgJ3JhZGlvcyc6ICAgICAgICAgIE1hdGVyaWFsUmFkaW9zQ29tcG9uZW50LFxuICAgICdzZWxlY3QnOiAgICAgICAgICBNYXRlcmlhbFNlbGVjdENvbXBvbmVudCxcbiAgICAnc2xpZGVyJzogICAgICAgICAgTWF0ZXJpYWxTbGlkZXJDb21wb25lbnQsXG4gICAgJ3N0ZXBwZXInOiAgICAgICAgIE1hdGVyaWFsU3RlcHBlckNvbXBvbmVudCxcbiAgICAndGFicyc6ICAgICAgICAgICAgTWF0ZXJpYWxUYWJzQ29tcG9uZW50LFxuICAgICd0ZXh0JzogICAgICAgICAgICBNYXRlcmlhbElucHV0Q29tcG9uZW50LFxuICAgICd0ZXh0YXJlYSc6ICAgICAgICBNYXRlcmlhbFRleHRhcmVhQ29tcG9uZW50LFxuICAgICdhbHQtZGF0ZSc6ICAgICAgICAnZGF0ZScsXG4gICAgJ2FueS1vZic6ICAgICAgICAgICdvbmUtb2YnLFxuICAgICdjYXJkJzogICAgICAgICAgICAnc2VjdGlvbicsXG4gICAgJ2NvbG9yJzogICAgICAgICAgICd0ZXh0JyxcbiAgICAnZXhwYW5zaW9uLXBhbmVsJzogJ3NlY3Rpb24nLFxuICAgICdoaWRkZW4nOiAgICAgICAgICAnbm9uZScsXG4gICAgJ2ltYWdlJzogICAgICAgICAgICdub25lJyxcbiAgICAnaW50ZWdlcic6ICAgICAgICAgJ251bWJlcicsXG4gICAgJ3JhZGlvYnV0dG9ucyc6ICAgICdidXR0b24tZ3JvdXAnLFxuICAgICdyYW5nZSc6ICAgICAgICAgICAnc2xpZGVyJyxcbiAgICAnc3VibWl0JzogICAgICAgICAgJ2J1dHRvbicsXG4gICAgJ3RhZ3NpbnB1dCc6ICAgICAgICdjaGlwLWxpc3QnLFxuICAgICd3aXphcmQnOiAgICAgICAgICAnc3RlcHBlcicsXG4gIH07XG59XG4iXX0=