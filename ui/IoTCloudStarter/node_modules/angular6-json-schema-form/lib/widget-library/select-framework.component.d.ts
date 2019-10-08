import { ComponentFactoryResolver, ComponentRef, OnChanges, OnInit, ViewContainerRef } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
export declare class SelectFrameworkComponent implements OnChanges, OnInit {
    private componentFactory;
    private jsf;
    newComponent: ComponentRef<any>;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    widgetContainer: ViewContainerRef;
    constructor(componentFactory: ComponentFactoryResolver, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    ngOnChanges(): void;
    updateComponent(): void;
}
