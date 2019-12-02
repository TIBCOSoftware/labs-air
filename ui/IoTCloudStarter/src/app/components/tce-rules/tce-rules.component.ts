import { Component, OnInit } from '@angular/core';
import {BusinessRule} from '../../shared/models/be.model';
import {BewsService} from '../../services/bews/bews.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-tce-rules',
  templateUrl: './tce-rules.component.html',
  styleUrls: ['./tce-rules.component.css']
})
export class TceRulesComponent implements OnInit {

  projectList: any[] = [];
  maximum = '';
  minimum = '';

  message = '';
  options: FormGroup;
  bRule: BusinessRule = new BusinessRule();
  private stepNumber = 0;
  private history = '';

  constructor(private bewsService: BewsService) {

  }

  ngOnInit() {
 
    this.getProjects();
  }

  deployRule() {
    this.history = '';
    this.stepNumber = 0;
    this.bewsService.deployRule(this.bRule).subscribe(
      next => {
        if (next !== undefined) {
          console.log(next);
          if (next.REPORT) {
            // this.message = next.REPORT;
          }
        }
      }, error => console.log(error)
    );
  }

  updateShippingMode(){
    console.log('Update Shipping mode: ' , this.options.value.deliveryMode);
    this.bRule.shippingMode = this.options.value.deliveryMode;
  }

  getHistory(): string {
    return this.history;
  }

  onProjectSelected(event) {

  }

  getProjects() {
    console.log("Getting Projects called")

    this.bewsService.getProjects().subscribe(
      next => {
        if (next !== undefined) {
          console.log(next)
        }
      }, error => console.log(error)
    )
  }

}
