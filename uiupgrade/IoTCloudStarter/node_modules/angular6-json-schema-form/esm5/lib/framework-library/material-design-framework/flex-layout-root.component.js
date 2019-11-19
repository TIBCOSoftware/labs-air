import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
var FlexLayoutRootComponent = /** @class */ (function () {
    function FlexLayoutRootComponent(jsf) {
        this.jsf = jsf;
        this.isFlexItem = false;
    }
    FlexLayoutRootComponent.prototype.removeItem = function (item) {
        this.jsf.removeItem(item);
    };
    // Set attributes for flexbox child
    // (container attributes are set in flex-layout-section.component)
    FlexLayoutRootComponent.prototype.getFlexAttribute = function (node, attribute) {
        var index = ['flex-grow', 'flex-shrink', 'flex-basis'].indexOf(attribute);
        return ((node.options || {}).flex || '').split(/\s+/)[index] ||
            (node.options || {})[attribute] || ['1', '1', 'auto'][index];
    };
    FlexLayoutRootComponent.prototype.showWidget = function (layoutNode) {
        return this.jsf.evaluateCondition(layoutNode, this.dataIndex);
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], FlexLayoutRootComponent.prototype, "dataIndex", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], FlexLayoutRootComponent.prototype, "layoutIndex", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], FlexLayoutRootComponent.prototype, "layout", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], FlexLayoutRootComponent.prototype, "isFlexItem", void 0);
    FlexLayoutRootComponent = tslib_1.__decorate([
        Component({
            // tslint:disable-next-line:component-selector
            selector: 'flex-layout-root-widget',
            template: "\n    <div *ngFor=\"let layoutNode of layout; let i = index\"\n      [class.form-flex-item]=\"isFlexItem\"\n      [style.flex-grow]=\"getFlexAttribute(layoutNode, 'flex-grow')\"\n      [style.flex-shrink]=\"getFlexAttribute(layoutNode, 'flex-shrink')\"\n      [style.flex-basis]=\"getFlexAttribute(layoutNode, 'flex-basis')\"\n      [style.align-self]=\"(layoutNode?.options || {})['align-self']\"\n      [style.order]=\"layoutNode?.options?.order\"\n      [fxFlex]=\"layoutNode?.options?.fxFlex\"\n      [fxFlexOrder]=\"layoutNode?.options?.fxFlexOrder\"\n      [fxFlexOffset]=\"layoutNode?.options?.fxFlexOffset\"\n      [fxFlexAlign]=\"layoutNode?.options?.fxFlexAlign\">\n      <select-framework-widget *ngIf=\"showWidget(layoutNode)\"\n        [dataIndex]=\"layoutNode?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])\"\n        [layoutIndex]=\"(layoutIndex || []).concat(i)\"\n        [layoutNode]=\"layoutNode\"></select-framework-widget>\n    <div>",
            changeDetection: ChangeDetectionStrategy.Default
        }),
        tslib_1.__metadata("design:paramtypes", [JsonSchemaFormService])
    ], FlexLayoutRootComponent);
    return FlexLayoutRootComponent;
}());
export { FlexLayoutRootComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1sYXlvdXQtcm9vdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyNi1qc29uLXNjaGVtYS1mb3JtLyIsInNvdXJjZXMiOlsibGliL2ZyYW1ld29yay1saWJyYXJ5L21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsvZmxleC1sYXlvdXQtcm9vdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBeUJ2RTtJQU1FLGlDQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBSDNCLGVBQVUsR0FBRyxLQUFLLENBQUM7SUFJeEIsQ0FBQztJQUVMLDRDQUFVLEdBQVYsVUFBVyxJQUFJO1FBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxrRUFBa0U7SUFDbEUsa0RBQWdCLEdBQWhCLFVBQWlCLElBQVMsRUFBRSxTQUFpQjtRQUMzQyxJQUFNLEtBQUssR0FBRyxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDMUQsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsNENBQVUsR0FBVixVQUFXLFVBQWU7UUFDeEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQXZCUTtRQUFSLEtBQUssRUFBRTs7OERBQXFCO0lBQ3BCO1FBQVIsS0FBSyxFQUFFOztnRUFBdUI7SUFDdEI7UUFBUixLQUFLLEVBQUU7OzJEQUFlO0lBQ2Q7UUFBUixLQUFLLEVBQUU7OytEQUFvQjtJQUpqQix1QkFBdUI7UUF0Qm5DLFNBQVMsQ0FBQztZQUNULDhDQUE4QztZQUM5QyxRQUFRLEVBQUUseUJBQXlCO1lBQ25DLFFBQVEsRUFBRSwwOEJBZ0JGO1lBQ1IsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87U0FDakQsQ0FBQztpREFRZSxxQkFBcUI7T0FQekIsdUJBQXVCLENBeUJuQztJQUFELDhCQUFDO0NBQUEsQUF6QkQsSUF5QkM7U0F6QlksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSB9IGZyb20gJy4uLy4uL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZSc7XG5cblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdmbGV4LWxheW91dC1yb290LXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiAqbmdGb3I9XCJsZXQgbGF5b3V0Tm9kZSBvZiBsYXlvdXQ7IGxldCBpID0gaW5kZXhcIlxuICAgICAgW2NsYXNzLmZvcm0tZmxleC1pdGVtXT1cImlzRmxleEl0ZW1cIlxuICAgICAgW3N0eWxlLmZsZXgtZ3Jvd109XCJnZXRGbGV4QXR0cmlidXRlKGxheW91dE5vZGUsICdmbGV4LWdyb3cnKVwiXG4gICAgICBbc3R5bGUuZmxleC1zaHJpbmtdPVwiZ2V0RmxleEF0dHJpYnV0ZShsYXlvdXROb2RlLCAnZmxleC1zaHJpbmsnKVwiXG4gICAgICBbc3R5bGUuZmxleC1iYXNpc109XCJnZXRGbGV4QXR0cmlidXRlKGxheW91dE5vZGUsICdmbGV4LWJhc2lzJylcIlxuICAgICAgW3N0eWxlLmFsaWduLXNlbGZdPVwiKGxheW91dE5vZGU/Lm9wdGlvbnMgfHwge30pWydhbGlnbi1zZWxmJ11cIlxuICAgICAgW3N0eWxlLm9yZGVyXT1cImxheW91dE5vZGU/Lm9wdGlvbnM/Lm9yZGVyXCJcbiAgICAgIFtmeEZsZXhdPVwibGF5b3V0Tm9kZT8ub3B0aW9ucz8uZnhGbGV4XCJcbiAgICAgIFtmeEZsZXhPcmRlcl09XCJsYXlvdXROb2RlPy5vcHRpb25zPy5meEZsZXhPcmRlclwiXG4gICAgICBbZnhGbGV4T2Zmc2V0XT1cImxheW91dE5vZGU/Lm9wdGlvbnM/LmZ4RmxleE9mZnNldFwiXG4gICAgICBbZnhGbGV4QWxpZ25dPVwibGF5b3V0Tm9kZT8ub3B0aW9ucz8uZnhGbGV4QWxpZ25cIj5cbiAgICAgIDxzZWxlY3QtZnJhbWV3b3JrLXdpZGdldCAqbmdJZj1cInNob3dXaWRnZXQobGF5b3V0Tm9kZSlcIlxuICAgICAgICBbZGF0YUluZGV4XT1cImxheW91dE5vZGU/LmFycmF5SXRlbSA/IChkYXRhSW5kZXggfHwgW10pLmNvbmNhdChpKSA6IChkYXRhSW5kZXggfHwgW10pXCJcbiAgICAgICAgW2xheW91dEluZGV4XT1cIihsYXlvdXRJbmRleCB8fCBbXSkuY29uY2F0KGkpXCJcbiAgICAgICAgW2xheW91dE5vZGVdPVwibGF5b3V0Tm9kZVwiPjwvc2VsZWN0LWZyYW1ld29yay13aWRnZXQ+XG4gICAgPGRpdj5gLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG59KVxuZXhwb3J0IGNsYXNzIEZsZXhMYXlvdXRSb290Q29tcG9uZW50IHtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBsYXlvdXQ6IGFueVtdO1xuICBASW5wdXQoKSBpc0ZsZXhJdGVtID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIHJlbW92ZUl0ZW0oaXRlbSkge1xuICAgIHRoaXMuanNmLnJlbW92ZUl0ZW0oaXRlbSk7XG4gIH1cblxuICAvLyBTZXQgYXR0cmlidXRlcyBmb3IgZmxleGJveCBjaGlsZFxuICAvLyAoY29udGFpbmVyIGF0dHJpYnV0ZXMgYXJlIHNldCBpbiBmbGV4LWxheW91dC1zZWN0aW9uLmNvbXBvbmVudClcbiAgZ2V0RmxleEF0dHJpYnV0ZShub2RlOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgaW5kZXggPSBbJ2ZsZXgtZ3JvdycsICdmbGV4LXNocmluaycsICdmbGV4LWJhc2lzJ10uaW5kZXhPZihhdHRyaWJ1dGUpO1xuICAgIHJldHVybiAoKG5vZGUub3B0aW9ucyB8fCB7fSkuZmxleCB8fCAnJykuc3BsaXQoL1xccysvKVtpbmRleF0gfHxcbiAgICAgIChub2RlLm9wdGlvbnMgfHwge30pW2F0dHJpYnV0ZV0gfHwgWycxJywgJzEnLCAnYXV0byddW2luZGV4XTtcbiAgfVxuXG4gIHNob3dXaWRnZXQobGF5b3V0Tm9kZTogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuanNmLmV2YWx1YXRlQ29uZGl0aW9uKGxheW91dE5vZGUsIHRoaXMuZGF0YUluZGV4KTtcbiAgfVxufVxuIl19