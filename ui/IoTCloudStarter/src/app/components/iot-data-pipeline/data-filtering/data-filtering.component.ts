import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-filtering',
  templateUrl: './data-filtering.component.html',
  styleUrls: ['./data-filtering.component.css']
})
export class DataFilteringComponent implements OnInit {

  @Input() filteringForm: FormGroup;

  constructor() { }

  ngOnInit() {
  }

  stepSubmitted() {
    // this.transportForm.get('transport').markAsTouched();
    // this.transportForm.get('transport').updateValueAndValidity();
    // this.transportForm.get('personalDetails').get('lastname').markAsTouched();
    // this.transportForm.get('personalDetails').get('lastname').updateValueAndValidity();
  }

}
