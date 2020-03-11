import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-streaming',
  templateUrl: './data-streaming.component.html',
  styleUrls: ['./data-streaming.component.css']
})
export class DataStreamingComponent implements OnInit {

  @Input() streamingForm: FormGroup;

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
