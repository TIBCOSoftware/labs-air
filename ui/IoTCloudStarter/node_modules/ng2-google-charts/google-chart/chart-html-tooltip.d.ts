import { ElementRef } from '@angular/core';
export declare class ChartHTMLTooltip {
    static readonly PIXELS: string;
    private tooltipDOMElement;
    constructor(el: ElementRef);
    setPosition(x: number, y: number): void;
    getDOMElement(): ElementRef;
}
