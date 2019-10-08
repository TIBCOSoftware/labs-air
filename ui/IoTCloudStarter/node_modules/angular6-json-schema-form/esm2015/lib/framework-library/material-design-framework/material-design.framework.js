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
let MaterialDesignFramework = class MaterialDesignFramework extends Framework {
    // Material Design Framework
    // https://github.com/angular/material2
    constructor() {
        super(...arguments);
        this.name = 'material-design';
        this.framework = MaterialDesignFrameworkComponent;
        this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        this.widgets = {
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
    }
};
MaterialDesignFramework = tslib_1.__decorate([
    Injectable()
], MaterialDesignFramework);
export { MaterialDesignFramework };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay9tYXRlcmlhbC1kZXNpZ24uZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDbkYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDakYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDMUUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDOUUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDekYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDeEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHMUUsNEJBQTRCO0FBQzVCLHVDQUF1QztBQUd2QyxJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF3QixTQUFRLFNBQVM7SUFKdEQsNEJBQTRCO0lBQzVCLHVDQUF1QztJQUV2Qzs7UUFFRSxTQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFFekIsY0FBUyxHQUFHLGdDQUFnQyxDQUFDO1FBRTdDLGdCQUFXLEdBQUc7WUFDWixtREFBbUQ7WUFDbkQsMERBQTBEO1NBQzNELENBQUM7UUFFRixZQUFPLEdBQUc7WUFDUixNQUFNLEVBQWEsdUJBQXVCO1lBQzFDLFNBQVMsRUFBVSwwQkFBMEI7WUFDN0MsTUFBTSxFQUFhLDZCQUE2QjtZQUNoRCxRQUFRLEVBQVcsdUJBQXVCO1lBQzFDLGNBQWMsRUFBSyw0QkFBNEI7WUFDL0MsVUFBVSxFQUFTLHlCQUF5QjtZQUM1QyxZQUFZLEVBQU8sMkJBQTJCO1lBQzlDLFdBQVcsRUFBUSx5QkFBeUI7WUFDNUMsTUFBTSxFQUFhLDJCQUEyQjtZQUM5QyxNQUFNLEVBQWEscUJBQXFCO1lBQ3hDLFFBQVEsRUFBVyx1QkFBdUI7WUFDMUMsUUFBUSxFQUFXLHNCQUFzQjtZQUN6QyxRQUFRLEVBQVcsdUJBQXVCO1lBQzFDLFFBQVEsRUFBVyx1QkFBdUI7WUFDMUMsUUFBUSxFQUFXLHVCQUF1QjtZQUMxQyxTQUFTLEVBQVUsd0JBQXdCO1lBQzNDLE1BQU0sRUFBYSxxQkFBcUI7WUFDeEMsTUFBTSxFQUFhLHNCQUFzQjtZQUN6QyxVQUFVLEVBQVMseUJBQXlCO1lBQzVDLFVBQVUsRUFBUyxNQUFNO1lBQ3pCLFFBQVEsRUFBVyxRQUFRO1lBQzNCLE1BQU0sRUFBYSxTQUFTO1lBQzVCLE9BQU8sRUFBWSxNQUFNO1lBQ3pCLGlCQUFpQixFQUFFLFNBQVM7WUFDNUIsUUFBUSxFQUFXLE1BQU07WUFDekIsT0FBTyxFQUFZLE1BQU07WUFDekIsU0FBUyxFQUFVLFFBQVE7WUFDM0IsY0FBYyxFQUFLLGNBQWM7WUFDakMsT0FBTyxFQUFZLFFBQVE7WUFDM0IsUUFBUSxFQUFXLFFBQVE7WUFDM0IsV0FBVyxFQUFRLFdBQVc7WUFDOUIsUUFBUSxFQUFXLFNBQVM7U0FDN0IsQ0FBQztJQUNKLENBQUM7Q0FBQSxDQUFBO0FBNUNZLHVCQUF1QjtJQURuQyxVQUFVLEVBQUU7R0FDQSx1QkFBdUIsQ0E0Q25DO1NBNUNZLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZsZXhMYXlvdXRSb290Q29tcG9uZW50IH0gZnJvbSAnLi9mbGV4LWxheW91dC1yb290LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGbGV4TGF5b3V0U2VjdGlvbkNvbXBvbmVudCB9IGZyb20gJy4vZmxleC1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgRnJhbWV3b3JrIH0gZnJvbSAnLi4vZnJhbWV3b3JrJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1hdGVyaWFsQWRkUmVmZXJlbmNlQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1hZGQtcmVmZXJlbmNlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbEJ1dHRvbkNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtYnV0dG9uLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbEJ1dHRvbkdyb3VwQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1idXR0b24tZ3JvdXAuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsQ2hlY2tib3hDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLWNoZWNrYm94LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbENoZWNrYm94ZXNDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLWNoZWNrYm94ZXMuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsQ2hpcExpc3RDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLWNoaXAtbGlzdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxEYXRlcGlja2VyQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1kYXRlcGlja2VyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbERlc2lnbkZyYW1ld29ya0NvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxGaWxlQ29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1maWxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbElucHV0Q29tcG9uZW50IH0gZnJvbSAnLi9tYXRlcmlhbC1pbnB1dC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxOdW1iZXJDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLW51bWJlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxPbmVPZkNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtb25lLW9mLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbFJhZGlvc0NvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtcmFkaW9zLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbFNlbGVjdENvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtc2VsZWN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbFNsaWRlckNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtc2xpZGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNYXRlcmlhbFN0ZXBwZXJDb21wb25lbnQgfSBmcm9tICcuL21hdGVyaWFsLXN0ZXBwZXIuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdGVyaWFsVGFic0NvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtdGFicy5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxUZXh0YXJlYUNvbXBvbmVudCB9IGZyb20gJy4vbWF0ZXJpYWwtdGV4dGFyZWEuY29tcG9uZW50JztcblxuXG4vLyBNYXRlcmlhbCBEZXNpZ24gRnJhbWV3b3JrXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9tYXRlcmlhbDJcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsRGVzaWduRnJhbWV3b3JrIGV4dGVuZHMgRnJhbWV3b3JrIHtcbiAgbmFtZSA9ICdtYXRlcmlhbC1kZXNpZ24nO1xuXG4gIGZyYW1ld29yayA9IE1hdGVyaWFsRGVzaWduRnJhbWV3b3JrQ29tcG9uZW50O1xuXG4gIHN0eWxlc2hlZXRzID0gW1xuICAgICcvL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2ljb24/ZmFtaWx5PU1hdGVyaWFsK0ljb25zJyxcbiAgICAnLy9mb250cy5nb29nbGVhcGlzLmNvbS9jc3M/ZmFtaWx5PVJvYm90bzozMDAsNDAwLDUwMCw3MDAnLFxuICBdO1xuXG4gIHdpZGdldHMgPSB7XG4gICAgJ3Jvb3QnOiAgICAgICAgICAgIEZsZXhMYXlvdXRSb290Q29tcG9uZW50LFxuICAgICdzZWN0aW9uJzogICAgICAgICBGbGV4TGF5b3V0U2VjdGlvbkNvbXBvbmVudCxcbiAgICAnJHJlZic6ICAgICAgICAgICAgTWF0ZXJpYWxBZGRSZWZlcmVuY2VDb21wb25lbnQsXG4gICAgJ2J1dHRvbic6ICAgICAgICAgIE1hdGVyaWFsQnV0dG9uQ29tcG9uZW50LFxuICAgICdidXR0b24tZ3JvdXAnOiAgICBNYXRlcmlhbEJ1dHRvbkdyb3VwQ29tcG9uZW50LFxuICAgICdjaGVja2JveCc6ICAgICAgICBNYXRlcmlhbENoZWNrYm94Q29tcG9uZW50LFxuICAgICdjaGVja2JveGVzJzogICAgICBNYXRlcmlhbENoZWNrYm94ZXNDb21wb25lbnQsXG4gICAgJ2NoaXAtbGlzdCc6ICAgICAgIE1hdGVyaWFsQ2hpcExpc3RDb21wb25lbnQsXG4gICAgJ2RhdGUnOiAgICAgICAgICAgIE1hdGVyaWFsRGF0ZXBpY2tlckNvbXBvbmVudCxcbiAgICAnZmlsZSc6ICAgICAgICAgICAgTWF0ZXJpYWxGaWxlQ29tcG9uZW50LFxuICAgICdudW1iZXInOiAgICAgICAgICBNYXRlcmlhbE51bWJlckNvbXBvbmVudCxcbiAgICAnb25lLW9mJzogICAgICAgICAgTWF0ZXJpYWxPbmVPZkNvbXBvbmVudCxcbiAgICAncmFkaW9zJzogICAgICAgICAgTWF0ZXJpYWxSYWRpb3NDb21wb25lbnQsXG4gICAgJ3NlbGVjdCc6ICAgICAgICAgIE1hdGVyaWFsU2VsZWN0Q29tcG9uZW50LFxuICAgICdzbGlkZXInOiAgICAgICAgICBNYXRlcmlhbFNsaWRlckNvbXBvbmVudCxcbiAgICAnc3RlcHBlcic6ICAgICAgICAgTWF0ZXJpYWxTdGVwcGVyQ29tcG9uZW50LFxuICAgICd0YWJzJzogICAgICAgICAgICBNYXRlcmlhbFRhYnNDb21wb25lbnQsXG4gICAgJ3RleHQnOiAgICAgICAgICAgIE1hdGVyaWFsSW5wdXRDb21wb25lbnQsXG4gICAgJ3RleHRhcmVhJzogICAgICAgIE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnQsXG4gICAgJ2FsdC1kYXRlJzogICAgICAgICdkYXRlJyxcbiAgICAnYW55LW9mJzogICAgICAgICAgJ29uZS1vZicsXG4gICAgJ2NhcmQnOiAgICAgICAgICAgICdzZWN0aW9uJyxcbiAgICAnY29sb3InOiAgICAgICAgICAgJ3RleHQnLFxuICAgICdleHBhbnNpb24tcGFuZWwnOiAnc2VjdGlvbicsXG4gICAgJ2hpZGRlbic6ICAgICAgICAgICdub25lJyxcbiAgICAnaW1hZ2UnOiAgICAgICAgICAgJ25vbmUnLFxuICAgICdpbnRlZ2VyJzogICAgICAgICAnbnVtYmVyJyxcbiAgICAncmFkaW9idXR0b25zJzogICAgJ2J1dHRvbi1ncm91cCcsXG4gICAgJ3JhbmdlJzogICAgICAgICAgICdzbGlkZXInLFxuICAgICdzdWJtaXQnOiAgICAgICAgICAnYnV0dG9uJyxcbiAgICAndGFnc2lucHV0JzogICAgICAgJ2NoaXAtbGlzdCcsXG4gICAgJ3dpemFyZCc6ICAgICAgICAgICdzdGVwcGVyJyxcbiAgfTtcbn1cbiJdfQ==