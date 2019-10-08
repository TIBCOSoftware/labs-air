import { AbstractControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { JsonSchemaFormService, TitleMapItem } from '../../json-schema-form.service';
export declare class MaterialCheckboxesComponent implements OnInit {
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    horizontalList: boolean;
    formArray: AbstractControl;
    checkboxList: TitleMapItem[];
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    readonly allChecked: boolean;
    readonly someChecked: boolean;
    updateValue(): void;
    updateAllValues(event: any): void;
}
