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
    
  }

}
