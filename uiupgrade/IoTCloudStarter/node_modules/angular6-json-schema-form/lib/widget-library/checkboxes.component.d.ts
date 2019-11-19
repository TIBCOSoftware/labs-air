import { AbstractControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { JsonSchemaFormService, TitleMapItem } from '../json-schema-form.service';
export declare class CheckboxesComponent implements OnInit {
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    layoutOrientation: string;
    formArray: AbstractControl;
    checkboxList: TitleMapItem[];
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: any): void;
}
