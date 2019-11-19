import * as tslib_1 from "tslib";
import { buildTitleMap } from '../../shared';
import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
let MaterialButtonGroupComponent = class MaterialButtonGroupComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.radiosList = [];
        this.vertical = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.radiosList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
        this.jsf.initializeControl(this);
    }
    updateValue(value) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, value);
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], MaterialButtonGroupComponent.prototype, "layoutNode", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], MaterialButtonGroupComponent.prototype, "layoutIndex", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], MaterialButtonGroupComponent.prototype, "dataIndex", void 0);
MaterialButtonGroupComponent = tslib_1.__decorate([
    Component({
        // tslint:disable-next-line:component-selector
        selector: 'material-button-group-widget',
        template: `
    <div>
      <div *ngIf="options?.title">
        <label
          [attr.for]="'control' + layoutNode?._id"
          [class]="options?.labelHtmlClass || ''"
          [style.display]="options?.notitle ? 'none' : ''"
          [innerHTML]="options?.title"></label>
      </div>
      <mat-button-toggle-group
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [disabled]="controlDisabled || options?.readonly"
        [name]="controlName"
        [value]="controlValue"
        [vertical]="!!options.vertical">
        <mat-button-toggle *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value"
          (click)="updateValue(radioItem?.value)">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-button-toggle>
      </mat-button-toggle-group>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>`,
        styles: [` mat-error { font-size: 75%; } `]
    }),
    tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
], MaterialButtonGroupComponent);
export { MaterialButtonGroupComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtYnV0dG9uLWdyb3VwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXI2LWpzb24tc2NoZW1hLWZvcm0vIiwic291cmNlcyI6WyJsaWIvZnJhbWV3b3JrLWxpYnJhcnkvbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay9tYXRlcmlhbC1idXR0b24tZ3JvdXAuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBbUN2RSxJQUFhLDRCQUE0QixHQUF6QyxNQUFhLDRCQUE0QjtJQWF2QyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBVnBDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBRXJCLGVBQVUsR0FBVSxFQUFFLENBQUM7UUFDdkIsYUFBUSxHQUFHLEtBQUssQ0FBQztJQU9iLENBQUM7SUFFTCxRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQ3hCLENBQUM7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBSztRQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNGLENBQUE7QUFyQlU7SUFBUixLQUFLLEVBQUU7O2dFQUFpQjtBQUNoQjtJQUFSLEtBQUssRUFBRTs7aUVBQXVCO0FBQ3RCO0lBQVIsS0FBSyxFQUFFOzsrREFBcUI7QUFYbEIsNEJBQTRCO0lBaEN4QyxTQUFTLENBQUM7UUFDVCw4Q0FBOEM7UUFDOUMsUUFBUSxFQUFFLDhCQUE4QjtRQUN4QyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBMEJEO2lCQUNFLGlDQUFpQztLQUM3QyxDQUFDOzZDQWVlLHFCQUFxQjtHQWR6Qiw0QkFBNEIsQ0E4QnhDO1NBOUJZLDRCQUE0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IGJ1aWxkVGl0bGVNYXAgfSBmcm9tICcuLi8uLi9zaGFyZWQnO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICcuLi8uLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuXG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnbWF0ZXJpYWwtYnV0dG9uLWdyb3VwLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdj5cbiAgICAgIDxkaXYgKm5nSWY9XCJvcHRpb25zPy50aXRsZVwiPlxuICAgICAgICA8bGFiZWxcbiAgICAgICAgICBbYXR0ci5mb3JdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkXCJcbiAgICAgICAgICBbY2xhc3NdPVwib3B0aW9ucz8ubGFiZWxIdG1sQ2xhc3MgfHwgJydcIlxuICAgICAgICAgIFtzdHlsZS5kaXNwbGF5XT1cIm9wdGlvbnM/Lm5vdGl0bGUgPyAnbm9uZScgOiAnJ1wiXG4gICAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy50aXRsZVwiPjwvbGFiZWw+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cFxuICAgICAgICBbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZCArICdTdGF0dXMnXCJcbiAgICAgICAgW2F0dHIucmVhZG9ubHldPVwib3B0aW9ucz8ucmVhZG9ubHkgPyAncmVhZG9ubHknIDogbnVsbFwiXG4gICAgICAgIFthdHRyLnJlcXVpcmVkXT1cIm9wdGlvbnM/LnJlcXVpcmVkXCJcbiAgICAgICAgW2Rpc2FibGVkXT1cImNvbnRyb2xEaXNhYmxlZCB8fCBvcHRpb25zPy5yZWFkb25seVwiXG4gICAgICAgIFtuYW1lXT1cImNvbnRyb2xOYW1lXCJcbiAgICAgICAgW3ZhbHVlXT1cImNvbnRyb2xWYWx1ZVwiXG4gICAgICAgIFt2ZXJ0aWNhbF09XCIhIW9wdGlvbnMudmVydGljYWxcIj5cbiAgICAgICAgPG1hdC1idXR0b24tdG9nZ2xlICpuZ0Zvcj1cImxldCByYWRpb0l0ZW0gb2YgcmFkaW9zTGlzdFwiXG4gICAgICAgICAgW2lkXT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZCArICcvJyArIHJhZGlvSXRlbT8ubmFtZVwiXG4gICAgICAgICAgW3ZhbHVlXT1cInJhZGlvSXRlbT8udmFsdWVcIlxuICAgICAgICAgIChjbGljayk9XCJ1cGRhdGVWYWx1ZShyYWRpb0l0ZW0/LnZhbHVlKVwiPlxuICAgICAgICAgIDxzcGFuIFtpbm5lckhUTUxdPVwicmFkaW9JdGVtPy5uYW1lXCI+PC9zcGFuPlxuICAgICAgICA8L21hdC1idXR0b24tdG9nZ2xlPlxuICAgICAgPC9tYXQtYnV0dG9uLXRvZ2dsZS1ncm91cD5cbiAgICAgIDxtYXQtZXJyb3IgKm5nSWY9XCJvcHRpb25zPy5zaG93RXJyb3JzICYmIG9wdGlvbnM/LmVycm9yTWVzc2FnZVwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZXJyb3JNZXNzYWdlXCI+PC9tYXQtZXJyb3I+XG4gICAgPC9kaXY+YCxcbiAgICBzdHlsZXM6IFtgIG1hdC1lcnJvciB7IGZvbnQtc2l6ZTogNzUlOyB9IGBdLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbEJ1dHRvbkdyb3VwQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgZm9ybUNvbnRyb2w6IEFic3RyYWN0Q29udHJvbDtcbiAgY29udHJvbE5hbWU6IHN0cmluZztcbiAgY29udHJvbFZhbHVlOiBhbnk7XG4gIGNvbnRyb2xEaXNhYmxlZCA9IGZhbHNlO1xuICBib3VuZENvbnRyb2wgPSBmYWxzZTtcbiAgb3B0aW9uczogYW55O1xuICByYWRpb3NMaXN0OiBhbnlbXSA9IFtdO1xuICB2ZXJ0aWNhbCA9IGZhbHNlO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge307XG4gICAgdGhpcy5yYWRpb3NMaXN0ID0gYnVpbGRUaXRsZU1hcChcbiAgICAgIHRoaXMub3B0aW9ucy50aXRsZU1hcCB8fCB0aGlzLm9wdGlvbnMuZW51bU5hbWVzLFxuICAgICAgdGhpcy5vcHRpb25zLmVudW0sIHRydWVcbiAgICApO1xuICAgIHRoaXMuanNmLmluaXRpYWxpemVDb250cm9sKHRoaXMpO1xuICB9XG5cbiAgdXBkYXRlVmFsdWUodmFsdWUpIHtcbiAgICB0aGlzLm9wdGlvbnMuc2hvd0Vycm9ycyA9IHRydWU7XG4gICAgdGhpcy5qc2YudXBkYXRlVmFsdWUodGhpcywgdmFsdWUpO1xuICB9XG59XG4iXX0=