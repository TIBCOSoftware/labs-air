import * as tslib_1 from "tslib";
import { Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
let FlexLayoutSectionComponent = class FlexLayoutSectionComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.expanded = true;
        this.containerType = 'div';
    }
    get sectionTitle() {
        return this.options.notitle ? null : this.jsf.setItemTitle(this);
    }
    ngOnInit() {
        this.jsf.initializeControl(this);
        this.options = this.layoutNode.options || {};
        this.expanded = typeof this.options.expanded === 'boolean' ?
            this.options.expanded : !this.options.expandable;
        switch (this.layoutNode.type) {
            case 'section':
            case 'array':
            case 'fieldset':
            case 'advancedfieldset':
            case 'authfieldset':
            case 'optionfieldset':
            case 'selectfieldset':
                this.containerType = 'fieldset';
                break;
            case 'card':
                this.containerType = 'card';
                break;
            case 'expansion-panel':
                this.containerType = 'expansion-panel';
                break;
            default: // 'div', 'flex', 'tab', 'conditional', 'actions'
                this.containerType = 'div';
        }
    }
    toggleExpanded() {
        if (this.options.expandable) {
            this.expanded = !this.expanded;
        }
    }
    // Set attributes for flexbox container
    // (child attributes are set in flex-layout-root.component)
    getFlexAttribute(attribute) {
        const flexActive = this.layoutNode.type === 'flex' ||
            !!this.options.displayFlex ||
            this.options.display === 'flex';
        // if (attribute !== 'flex' && !flexActive) { return null; }
        switch (attribute) {
            case 'is-flex':
                return flexActive;
            case 'display':
                return flexActive ? 'flex' : 'initial';
            case 'flex-direction':
            case 'flex-wrap':
                const index = ['flex-direction', 'flex-wrap'].indexOf(attribute);
                return (this.options['flex-flow'] || '').split(/\s+/)[index] ||
                    this.options[attribute] || ['column', 'nowrap'][index];
            case 'justify-content':
            case 'align-items':
            case 'align-content':
                return this.options[attribute];
            case 'layout':
                return (this.options.fxLayout || 'row') +
                    this.options.fxLayoutWrap ? ' ' + this.options.fxLayoutWrap : '';
        }
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], FlexLayoutSectionComponent.prototype, "layoutNode", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], FlexLayoutSectionComponent.prototype, "layoutIndex", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], FlexLayoutSectionComponent.prototype, "dataIndex", void 0);
FlexLayoutSectionComponent = tslib_1.__decorate([
    Component({
        // tslint:disable-next-line:component-selector
        selector: 'flex-layout-section-widget',
        template: `
    <div *ngIf="containerType === 'div'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <label *ngIf="sectionTitle"
        [class]="'legend ' + (options?.labelHtmlClass || '')"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></label>
      <flex-layout-root-widget *ngIf="expanded"
        [layout]="layoutNode.items"
        [dataIndex]="dataIndex"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.align-content]="getFlexAttribute('align-content')"
        [fxLayout]="getFlexAttribute('layout')"
        [fxLayoutGap]="options?.fxLayoutGap"
        [fxLayoutAlign]="options?.fxLayoutAlign"
        [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>

    <fieldset *ngIf="containerType === 'fieldset'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded"
      [disabled]="options?.readonly">
      <legend *ngIf="sectionTitle"
        [class]="'legend ' + (options?.labelHtmlClass || '')"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></legend>
      <flex-layout-root-widget *ngIf="expanded"
        [layout]="layoutNode.items"
        [dataIndex]="dataIndex"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.align-content]="getFlexAttribute('align-content')"
        [fxLayout]="getFlexAttribute('layout')"
        [fxLayoutGap]="options?.fxLayoutGap"
        [fxLayoutAlign]="options?.fxLayoutAlign"
        [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </fieldset>

    <mat-card *ngIf="containerType === 'card'"
      [ngClass]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <mat-card-header *ngIf="sectionTitle">
        <legend
          [class]="'legend ' + (options?.labelHtmlClass || '')"
          [innerHTML]="sectionTitle"
          (click)="toggleExpanded()"></legend>
      </mat-card-header>
      <mat-card-content *ngIf="expanded">
        <fieldset [disabled]="options?.readonly">
          <flex-layout-root-widget *ngIf="expanded"
            [layout]="layoutNode.items"
            [dataIndex]="dataIndex"
            [layoutIndex]="layoutIndex"
            [isFlexItem]="getFlexAttribute('is-flex')"
            [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
            [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
            [style.display]="getFlexAttribute('display')"
            [style.flex-direction]="getFlexAttribute('flex-direction')"
            [style.flex-wrap]="getFlexAttribute('flex-wrap')"
            [style.justify-content]="getFlexAttribute('justify-content')"
            [style.align-items]="getFlexAttribute('align-items')"
            [style.align-content]="getFlexAttribute('align-content')"
            [fxLayout]="getFlexAttribute('layout')"
            [fxLayoutGap]="options?.fxLayoutGap"
            [fxLayoutAlign]="options?.fxLayoutAlign"
            [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
          </fieldset>
      </mat-card-content>
      <mat-card-footer>
        <mat-error *ngIf="options?.showErrors && options?.errorMessage"
          [innerHTML]="options?.errorMessage"></mat-error>
      </mat-card-footer>
    </mat-card>

    <mat-expansion-panel *ngIf="containerType === 'expansion-panel'"
      [expanded]="expanded"
      [hideToggle]="!options?.expandable">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <legend *ngIf="sectionTitle"
            [class]="options?.labelHtmlClass"
            [innerHTML]="sectionTitle"
            (click)="toggleExpanded()"></legend>
        </mat-panel-title>
      </mat-expansion-panel-header>
      <fieldset [disabled]="options?.readonly">
        <flex-layout-root-widget *ngIf="expanded"
          [layout]="layoutNode.items"
          [dataIndex]="dataIndex"
          [layoutIndex]="layoutIndex"
          [isFlexItem]="getFlexAttribute('is-flex')"
          [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
          [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
          [style.display]="getFlexAttribute('display')"
          [style.flex-direction]="getFlexAttribute('flex-direction')"
          [style.flex-wrap]="getFlexAttribute('flex-wrap')"
          [style.justify-content]="getFlexAttribute('justify-content')"
          [style.align-items]="getFlexAttribute('align-items')"
          [style.align-content]="getFlexAttribute('align-content')"
          [fxLayout]="getFlexAttribute('layout')"
          [fxLayoutGap]="options?.fxLayoutGap"
          [fxLayoutAlign]="options?.fxLayoutAlign"
          [attr.fxFlexFill]="options?.fxLayoutAlign"></flex-layout-root-widget>
      </fieldset>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </mat-expansion-panel>`,
        styles: [`
    fieldset { border: 0; margin: 0; padding: 0; }
    .legend { font-weight: bold; }
    .expandable > .legend:before { content: '▶'; padding-right: .3em; }
    .expanded > .legend:before { content: '▼'; padding-right: .2em; }
  `]
    }),
    tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
], FlexLayoutSectionComponent);
export { FlexLayoutSectionComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2ZyYW1ld29yay1saWJyYXJ5L21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsvZmxleC1sYXlvdXQtc2VjdGlvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBOEl2RSxJQUFhLDBCQUEwQixHQUF2QyxNQUFhLDBCQUEwQjtJQWFyQyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBVnBDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBRXJCLGFBQVEsR0FBRyxJQUFJLENBQUM7UUFDaEIsa0JBQWEsR0FBRyxLQUFLLENBQUM7SUFPbEIsQ0FBQztJQUVMLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFD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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWlJZTtpQkFDaEI7Ozs7O0dBS1I7S0FDRixDQUFDOzZDQWVlLHFCQUFxQjtHQWR6QiwwQkFBMEIsQ0F1RXRDO1NBdkVZLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdmbGV4LWxheW91dC1zZWN0aW9uLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiAqbmdJZj1cImNvbnRhaW5lclR5cGUgPT09ICdkaXYnXCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIlxuICAgICAgW2NsYXNzLmV4cGFuZGFibGVdPVwib3B0aW9ucz8uZXhwYW5kYWJsZSAmJiAhZXhwYW5kZWRcIlxuICAgICAgW2NsYXNzLmV4cGFuZGVkXT1cIm9wdGlvbnM/LmV4cGFuZGFibGUgJiYgZXhwYW5kZWRcIj5cbiAgICAgIDxsYWJlbCAqbmdJZj1cInNlY3Rpb25UaXRsZVwiXG4gICAgICAgIFtjbGFzc109XCInbGVnZW5kICcgKyAob3B0aW9ucz8ubGFiZWxIdG1sQ2xhc3MgfHwgJycpXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICAoY2xpY2spPVwidG9nZ2xlRXhwYW5kZWQoKVwiPjwvbGFiZWw+XG4gICAgICA8ZmxleC1sYXlvdXQtcm9vdC13aWRnZXQgKm5nSWY9XCJleHBhbmRlZFwiXG4gICAgICAgIFtsYXlvdXRdPVwibGF5b3V0Tm9kZS5pdGVtc1wiXG4gICAgICAgIFtkYXRhSW5kZXhdPVwiZGF0YUluZGV4XCJcbiAgICAgICAgW2xheW91dEluZGV4XT1cImxheW91dEluZGV4XCJcbiAgICAgICAgW2lzRmxleEl0ZW1dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnaXMtZmxleCcpXCJcbiAgICAgICAgW2NsYXNzLmZvcm0tZmxleC1jb2x1bW5dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKSA9PT0gJ2NvbHVtbidcIlxuICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LXJvd109XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAncm93J1wiXG4gICAgICAgIFtzdHlsZS5kaXNwbGF5XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2Rpc3BsYXknKVwiXG4gICAgICAgIFtzdHlsZS5mbGV4LWRpcmVjdGlvbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpXCJcbiAgICAgICAgW3N0eWxlLmZsZXgtd3JhcF09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LXdyYXAnKVwiXG4gICAgICAgIFtzdHlsZS5qdXN0aWZ5LWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnanVzdGlmeS1jb250ZW50JylcIlxuICAgICAgICBbc3R5bGUuYWxpZ24taXRlbXNdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24taXRlbXMnKVwiXG4gICAgICAgIFtzdHlsZS5hbGlnbi1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWNvbnRlbnQnKVwiXG4gICAgICAgIFtmeExheW91dF09XCJnZXRGbGV4QXR0cmlidXRlKCdsYXlvdXQnKVwiXG4gICAgICAgIFtmeExheW91dEdhcF09XCJvcHRpb25zPy5meExheW91dEdhcFwiXG4gICAgICAgIFtmeExheW91dEFsaWduXT1cIm9wdGlvbnM/LmZ4TGF5b3V0QWxpZ25cIlxuICAgICAgICBbYXR0ci5meEZsZXhGaWxsXT1cIm9wdGlvbnM/LmZ4TGF5b3V0QWxpZ25cIj48L2ZsZXgtbGF5b3V0LXJvb3Qtd2lkZ2V0PlxuICAgICAgPG1hdC1lcnJvciAqbmdJZj1cIm9wdGlvbnM/LnNob3dFcnJvcnMgJiYgb3B0aW9ucz8uZXJyb3JNZXNzYWdlXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5lcnJvck1lc3NhZ2VcIj48L21hdC1lcnJvcj5cbiAgICA8L2Rpdj5cblxuICAgIDxmaWVsZHNldCAqbmdJZj1cImNvbnRhaW5lclR5cGUgPT09ICdmaWVsZHNldCdcIlxuICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/Lmh0bWxDbGFzcyB8fCAnJ1wiXG4gICAgICBbY2xhc3MuZXhwYW5kYWJsZV09XCJvcHRpb25zPy5leHBhbmRhYmxlICYmICFleHBhbmRlZFwiXG4gICAgICBbY2xhc3MuZXhwYW5kZWRdPVwib3B0aW9ucz8uZXhwYW5kYWJsZSAmJiBleHBhbmRlZFwiXG4gICAgICBbZGlzYWJsZWRdPVwib3B0aW9ucz8ucmVhZG9ubHlcIj5cbiAgICAgIDxsZWdlbmQgKm5nSWY9XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICBbY2xhc3NdPVwiJ2xlZ2VuZCAnICsgKG9wdGlvbnM/LmxhYmVsSHRtbENsYXNzIHx8ICcnKVwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgKGNsaWNrKT1cInRvZ2dsZUV4cGFuZGVkKClcIj48L2xlZ2VuZD5cbiAgICAgIDxmbGV4LWxheW91dC1yb290LXdpZGdldCAqbmdJZj1cImV4cGFuZGVkXCJcbiAgICAgICAgW2xheW91dF09XCJsYXlvdXROb2RlLml0ZW1zXCJcbiAgICAgICAgW2RhdGFJbmRleF09XCJkYXRhSW5kZXhcIlxuICAgICAgICBbbGF5b3V0SW5kZXhdPVwibGF5b3V0SW5kZXhcIlxuICAgICAgICBbaXNGbGV4SXRlbV09XCJnZXRGbGV4QXR0cmlidXRlKCdpcy1mbGV4JylcIlxuICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LWNvbHVtbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAnY29sdW1uJ1wiXG4gICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtcm93XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdyb3cnXCJcbiAgICAgICAgW3N0eWxlLmRpc3BsYXldPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZGlzcGxheScpXCJcbiAgICAgICAgW3N0eWxlLmZsZXgtZGlyZWN0aW9uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJylcIlxuICAgICAgICBbc3R5bGUuZmxleC13cmFwXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtd3JhcCcpXCJcbiAgICAgICAgW3N0eWxlLmp1c3RpZnktY29udGVudF09XCJnZXRGbGV4QXR0cmlidXRlKCdqdXN0aWZ5LWNvbnRlbnQnKVwiXG4gICAgICAgIFtzdHlsZS5hbGlnbi1pdGVtc109XCJnZXRGbGV4QXR0cmlidXRlKCdhbGlnbi1pdGVtcycpXCJcbiAgICAgICAgW3N0eWxlLmFsaWduLWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24tY29udGVudCcpXCJcbiAgICAgICAgW2Z4TGF5b3V0XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2xheW91dCcpXCJcbiAgICAgICAgW2Z4TGF5b3V0R2FwXT1cIm9wdGlvbnM/LmZ4TGF5b3V0R2FwXCJcbiAgICAgICAgW2Z4TGF5b3V0QWxpZ25dPVwib3B0aW9ucz8uZnhMYXlvdXRBbGlnblwiXG4gICAgICAgIFthdHRyLmZ4RmxleEZpbGxdPVwib3B0aW9ucz8uZnhMYXlvdXRBbGlnblwiPjwvZmxleC1sYXlvdXQtcm9vdC13aWRnZXQ+XG4gICAgICA8bWF0LWVycm9yICpuZ0lmPVwib3B0aW9ucz8uc2hvd0Vycm9ycyAmJiBvcHRpb25zPy5lcnJvck1lc3NhZ2VcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmVycm9yTWVzc2FnZVwiPjwvbWF0LWVycm9yPlxuICAgIDwvZmllbGRzZXQ+XG5cbiAgICA8bWF0LWNhcmQgKm5nSWY9XCJjb250YWluZXJUeXBlID09PSAnY2FyZCdcIlxuICAgICAgW25nQ2xhc3NdPVwib3B0aW9ucz8uaHRtbENsYXNzIHx8ICcnXCJcbiAgICAgIFtjbGFzcy5leHBhbmRhYmxlXT1cIm9wdGlvbnM/LmV4cGFuZGFibGUgJiYgIWV4cGFuZGVkXCJcbiAgICAgIFtjbGFzcy5leHBhbmRlZF09XCJvcHRpb25zPy5leHBhbmRhYmxlICYmIGV4cGFuZGVkXCI+XG4gICAgICA8bWF0LWNhcmQtaGVhZGVyICpuZ0lmPVwic2VjdGlvblRpdGxlXCI+XG4gICAgICAgIDxsZWdlbmRcbiAgICAgICAgICBbY2xhc3NdPVwiJ2xlZ2VuZCAnICsgKG9wdGlvbnM/LmxhYmVsSHRtbENsYXNzIHx8ICcnKVwiXG4gICAgICAgICAgW2lubmVySFRNTF09XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICAgIChjbGljayk9XCJ0b2dnbGVFeHBhbmRlZCgpXCI+PC9sZWdlbmQ+XG4gICAgICA8L21hdC1jYXJkLWhlYWRlcj5cbiAgICAgIDxtYXQtY2FyZC1jb250ZW50ICpuZ0lmPVwiZXhwYW5kZWRcIj5cbiAgICAgICAgPGZpZWxkc2V0IFtkaXNhYmxlZF09XCJvcHRpb25zPy5yZWFkb25seVwiPlxuICAgICAgICAgIDxmbGV4LWxheW91dC1yb290LXdpZGdldCAqbmdJZj1cImV4cGFuZGVkXCJcbiAgICAgICAgICAgIFtsYXlvdXRdPVwibGF5b3V0Tm9kZS5pdGVtc1wiXG4gICAgICAgICAgICBbZGF0YUluZGV4XT1cImRhdGFJbmRleFwiXG4gICAgICAgICAgICBbbGF5b3V0SW5kZXhdPVwibGF5b3V0SW5kZXhcIlxuICAgICAgICAgICAgW2lzRmxleEl0ZW1dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnaXMtZmxleCcpXCJcbiAgICAgICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtY29sdW1uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdjb2x1bW4nXCJcbiAgICAgICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtcm93XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdyb3cnXCJcbiAgICAgICAgICAgIFtzdHlsZS5kaXNwbGF5XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2Rpc3BsYXknKVwiXG4gICAgICAgICAgICBbc3R5bGUuZmxleC1kaXJlY3Rpb25dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKVwiXG4gICAgICAgICAgICBbc3R5bGUuZmxleC13cmFwXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtd3JhcCcpXCJcbiAgICAgICAgICAgIFtzdHlsZS5qdXN0aWZ5LWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnanVzdGlmeS1jb250ZW50JylcIlxuICAgICAgICAgICAgW3N0eWxlLmFsaWduLWl0ZW1zXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWl0ZW1zJylcIlxuICAgICAgICAgICAgW3N0eWxlLmFsaWduLWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24tY29udGVudCcpXCJcbiAgICAgICAgICAgIFtmeExheW91dF09XCJnZXRGbGV4QXR0cmlidXRlKCdsYXlvdXQnKVwiXG4gICAgICAgICAgICBbZnhMYXlvdXRHYXBdPVwib3B0aW9ucz8uZnhMYXlvdXRHYXBcIlxuICAgICAgICAgICAgW2Z4TGF5b3V0QWxpZ25dPVwib3B0aW9ucz8uZnhMYXlvdXRBbGlnblwiXG4gICAgICAgICAgICBbYXR0ci5meEZsZXhGaWxsXT1cIm9wdGlvbnM/LmZ4TGF5b3V0QWxpZ25cIj48L2ZsZXgtbGF5b3V0LXJvb3Qtd2lkZ2V0PlxuICAgICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICA8L21hdC1jYXJkLWNvbnRlbnQ+XG4gICAgICA8bWF0LWNhcmQtZm9vdGVyPlxuICAgICAgICA8bWF0LWVycm9yICpuZ0lmPVwib3B0aW9ucz8uc2hvd0Vycm9ycyAmJiBvcHRpb25zPy5lcnJvck1lc3NhZ2VcIlxuICAgICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8uZXJyb3JNZXNzYWdlXCI+PC9tYXQtZXJyb3I+XG4gICAgICA8L21hdC1jYXJkLWZvb3Rlcj5cbiAgICA8L21hdC1jYXJkPlxuXG4gICAgPG1hdC1leHBhbnNpb24tcGFuZWwgKm5nSWY9XCJjb250YWluZXJUeXBlID09PSAnZXhwYW5zaW9uLXBhbmVsJ1wiXG4gICAgICBbZXhwYW5kZWRdPVwiZXhwYW5kZWRcIlxuICAgICAgW2hpZGVUb2dnbGVdPVwiIW9wdGlvbnM/LmV4cGFuZGFibGVcIj5cbiAgICAgIDxtYXQtZXhwYW5zaW9uLXBhbmVsLWhlYWRlcj5cbiAgICAgICAgPG1hdC1wYW5lbC10aXRsZT5cbiAgICAgICAgICA8bGVnZW5kICpuZ0lmPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgICAgIFtjbGFzc109XCJvcHRpb25zPy5sYWJlbEh0bWxDbGFzc1wiXG4gICAgICAgICAgICBbaW5uZXJIVE1MXT1cInNlY3Rpb25UaXRsZVwiXG4gICAgICAgICAgICAoY2xpY2spPVwidG9nZ2xlRXhwYW5kZWQoKVwiPjwvbGVnZW5kPlxuICAgICAgICA8L21hdC1wYW5lbC10aXRsZT5cbiAgICAgIDwvbWF0LWV4cGFuc2lvbi1wYW5lbC1oZWFkZXI+XG4gICAgICA8ZmllbGRzZXQgW2Rpc2FibGVkXT1cIm9wdGlvbnM/LnJlYWRvbmx5XCI+XG4gICAgICAgIDxmbGV4LWxheW91dC1yb290LXdpZGdldCAqbmdJZj1cImV4cGFuZGVkXCJcbiAgICAgICAgICBbbGF5b3V0XT1cImxheW91dE5vZGUuaXRlbXNcIlxuICAgICAgICAgIFtkYXRhSW5kZXhdPVwiZGF0YUluZGV4XCJcbiAgICAgICAgICBbbGF5b3V0SW5kZXhdPVwibGF5b3V0SW5kZXhcIlxuICAgICAgICAgIFtpc0ZsZXhJdGVtXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2lzLWZsZXgnKVwiXG4gICAgICAgICAgW2NsYXNzLmZvcm0tZmxleC1jb2x1bW5dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKSA9PT0gJ2NvbHVtbidcIlxuICAgICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtcm93XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdyb3cnXCJcbiAgICAgICAgICBbc3R5bGUuZGlzcGxheV09XCJnZXRGbGV4QXR0cmlidXRlKCdkaXNwbGF5JylcIlxuICAgICAgICAgIFtzdHlsZS5mbGV4LWRpcmVjdGlvbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpXCJcbiAgICAgICAgICBbc3R5bGUuZmxleC13cmFwXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtd3JhcCcpXCJcbiAgICAgICAgICBbc3R5bGUuanVzdGlmeS1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2p1c3RpZnktY29udGVudCcpXCJcbiAgICAgICAgICBbc3R5bGUuYWxpZ24taXRlbXNdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24taXRlbXMnKVwiXG4gICAgICAgICAgW3N0eWxlLmFsaWduLWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24tY29udGVudCcpXCJcbiAgICAgICAgICBbZnhMYXlvdXRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnbGF5b3V0JylcIlxuICAgICAgICAgIFtmeExheW91dEdhcF09XCJvcHRpb25zPy5meExheW91dEdhcFwiXG4gICAgICAgICAgW2Z4TGF5b3V0QWxpZ25dPVwib3B0aW9ucz8uZnhMYXlvdXRBbGlnblwiXG4gICAgICAgICAgW2F0dHIuZnhGbGV4RmlsbF09XCJvcHRpb25zPy5meExheW91dEFsaWduXCI+PC9mbGV4LWxheW91dC1yb290LXdpZGdldD5cbiAgICAgIDwvZmllbGRzZXQ+XG4gICAgICA8bWF0LWVycm9yICpuZ0lmPVwib3B0aW9ucz8uc2hvd0Vycm9ycyAmJiBvcHRpb25zPy5lcnJvck1lc3NhZ2VcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmVycm9yTWVzc2FnZVwiPjwvbWF0LWVycm9yPlxuICAgIDwvbWF0LWV4cGFuc2lvbi1wYW5lbD5gLFxuICBzdHlsZXM6IFtgXG4gICAgZmllbGRzZXQgeyBib3JkZXI6IDA7IG1hcmdpbjogMDsgcGFkZGluZzogMDsgfVxuICAgIC5sZWdlbmQgeyBmb250LXdlaWdodDogYm9sZDsgfVxuICAgIC5leHBhbmRhYmxlID4gLmxlZ2VuZDpiZWZvcmUgeyBjb250ZW50OiAn4pa2JzsgcGFkZGluZy1yaWdodDogLjNlbTsgfVxuICAgIC5leHBhbmRlZCA+IC5sZWdlbmQ6YmVmb3JlIHsgY29udGVudDogJ+KWvCc7IHBhZGRpbmctcmlnaHQ6IC4yZW07IH1cbiAgYF0sXG59KVxuZXhwb3J0IGNsYXNzIEZsZXhMYXlvdXRTZWN0aW9uQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgZm9ybUNvbnRyb2w6IEFic3RyYWN0Q29udHJvbDtcbiAgY29udHJvbE5hbWU6IHN0cmluZztcbiAgY29udHJvbFZhbHVlOiBhbnk7XG4gIGNvbnRyb2xEaXNhYmxlZCA9IGZhbHNlO1xuICBib3VuZENvbnRyb2wgPSBmYWxzZTtcbiAgb3B0aW9uczogYW55O1xuICBleHBhbmRlZCA9IHRydWU7XG4gIGNvbnRhaW5lclR5cGUgPSAnZGl2JztcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIGdldCBzZWN0aW9uVGl0bGUoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5ub3RpdGxlID8gbnVsbCA6IHRoaXMuanNmLnNldEl0ZW1UaXRsZSh0aGlzKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuanNmLmluaXRpYWxpemVDb250cm9sKHRoaXMpO1xuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuZXhwYW5kZWQgPSB0eXBlb2YgdGhpcy5vcHRpb25zLmV4cGFuZGVkID09PSAnYm9vbGVhbicgP1xuICAgICAgdGhpcy5vcHRpb25zLmV4cGFuZGVkIDogIXRoaXMub3B0aW9ucy5leHBhbmRhYmxlO1xuICAgIHN3aXRjaCAodGhpcy5sYXlvdXROb2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3NlY3Rpb24nOiBjYXNlICdhcnJheSc6IGNhc2UgJ2ZpZWxkc2V0JzogY2FzZSAnYWR2YW5jZWRmaWVsZHNldCc6XG4gICAgICBjYXNlICdhdXRoZmllbGRzZXQnOiBjYXNlICdvcHRpb25maWVsZHNldCc6IGNhc2UgJ3NlbGVjdGZpZWxkc2V0JzpcbiAgICAgICAgdGhpcy5jb250YWluZXJUeXBlID0gJ2ZpZWxkc2V0JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjYXJkJzpcbiAgICAgICAgdGhpcy5jb250YWluZXJUeXBlID0gJ2NhcmQnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V4cGFuc2lvbi1wYW5lbCc6XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHlwZSA9ICdleHBhbnNpb24tcGFuZWwnO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vICdkaXYnLCAnZmxleCcsICd0YWInLCAnY29uZGl0aW9uYWwnLCAnYWN0aW9ucydcbiAgICAgICAgdGhpcy5jb250YWluZXJUeXBlID0gJ2Rpdic7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlRXhwYW5kZWQoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5leHBhbmRhYmxlKSB7IHRoaXMuZXhwYW5kZWQgPSAhdGhpcy5leHBhbmRlZDsgfVxuICB9XG5cbiAgLy8gU2V0IGF0dHJpYnV0ZXMgZm9yIGZsZXhib3ggY29udGFpbmVyXG4gIC8vIChjaGlsZCBhdHRyaWJ1dGVzIGFyZSBzZXQgaW4gZmxleC1sYXlvdXQtcm9vdC5jb21wb25lbnQpXG4gIGdldEZsZXhBdHRyaWJ1dGUoYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmbGV4QWN0aXZlOiBib29sZWFuID1cbiAgICAgIHRoaXMubGF5b3V0Tm9kZS50eXBlID09PSAnZmxleCcgfHxcbiAgICAgICEhdGhpcy5vcHRpb25zLmRpc3BsYXlGbGV4IHx8XG4gICAgICB0aGlzLm9wdGlvbnMuZGlzcGxheSA9PT0gJ2ZsZXgnO1xuICAgIC8vIGlmIChhdHRyaWJ1dGUgIT09ICdmbGV4JyAmJiAhZmxleEFjdGl2ZSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIHN3aXRjaCAoYXR0cmlidXRlKSB7XG4gICAgICBjYXNlICdpcy1mbGV4JzpcbiAgICAgICAgcmV0dXJuIGZsZXhBY3RpdmU7XG4gICAgICBjYXNlICdkaXNwbGF5JzpcbiAgICAgICAgcmV0dXJuIGZsZXhBY3RpdmUgPyAnZmxleCcgOiAnaW5pdGlhbCc7XG4gICAgICBjYXNlICdmbGV4LWRpcmVjdGlvbic6IGNhc2UgJ2ZsZXgtd3JhcCc6XG4gICAgICAgIGNvbnN0IGluZGV4ID0gWydmbGV4LWRpcmVjdGlvbicsICdmbGV4LXdyYXAnXS5pbmRleE9mKGF0dHJpYnV0ZSk7XG4gICAgICAgIHJldHVybiAodGhpcy5vcHRpb25zWydmbGV4LWZsb3cnXSB8fCAnJykuc3BsaXQoL1xccysvKVtpbmRleF0gfHxcbiAgICAgICAgICB0aGlzLm9wdGlvbnNbYXR0cmlidXRlXSB8fCBbJ2NvbHVtbicsICdub3dyYXAnXVtpbmRleF07XG4gICAgICBjYXNlICdqdXN0aWZ5LWNvbnRlbnQnOiBjYXNlICdhbGlnbi1pdGVtcyc6IGNhc2UgJ2FsaWduLWNvbnRlbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW2F0dHJpYnV0ZV07XG4gICAgICBjYXNlICdsYXlvdXQnOlxuICAgICAgICByZXR1cm4gKHRoaXMub3B0aW9ucy5meExheW91dCB8fCAncm93JykgK1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5meExheW91dFdyYXAgPyAnICcgKyB0aGlzLm9wdGlvbnMuZnhMYXlvdXRXcmFwIDogJyc7XG5cbiAgICB9XG4gIH1cbn1cbiJdfQ==