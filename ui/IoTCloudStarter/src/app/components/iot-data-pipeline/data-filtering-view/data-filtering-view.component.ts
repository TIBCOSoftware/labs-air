import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-filtering-view',
  templateUrl: './data-filtering-view.component.html',
  styleUrls: ['./data-filtering-view.component.css']
})
export class DataFilteringViewComponent implements OnInit {

  @Input() filteringForm: FormGroup;
  
  constructor() { }

  ngOnInit() {
  }

}
