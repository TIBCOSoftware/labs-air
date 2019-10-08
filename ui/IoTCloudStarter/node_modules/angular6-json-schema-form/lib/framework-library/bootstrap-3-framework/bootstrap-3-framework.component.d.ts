import { ChangeDetectorRef, OnChanges, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../../json-schema-form.service';
/**
 * Bootstrap 3 framework for Angular JSON Schema Form.
 *
 */
export declare class Bootstrap3FrameworkComponent implements OnInit, OnChanges {
    changeDetector: ChangeDetectorRef;
    jsf: JsonSchemaFormService;
    frameworkInitialized: boolean;
    widgetOptions: any;
    widgetLayoutNode: any;
    options: any;
    formControl: any;
    debugOutput: any;
    debug: any;
    parentArray: any;
    isOrderable: boolean;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(changeDetector: ChangeDetectorRef, jsf: JsonSchemaFormService);
    readonly showRemoveButton: boolean;
    ngOnInit(): void;
    ngOnChanges(): void;
    initializeFramework(): void;
    updateHelpBlock(status: any): void;
    setTitle(): string;
    removeItem(): void;
}
