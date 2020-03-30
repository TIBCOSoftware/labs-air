import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-stores-view',
  templateUrl: './data-stores-view.component.html',
  styleUrls: ['./data-stores-view.component.css']
})
export class DataStoresViewComponent implements OnInit {

  hidePassword = true;

  postgresDataStore = false;
  snowflakeDataStore = false;
  oracleDataStore = false;
  mysqlDataStore = false;
  tgdbDataStore = false;
  dgraphDataStore = false;

  @Input() dataStoreForm: FormGroup;

  constructor() { }

  ngOnInit() {

    this.onFormChanges();
  }

  onFormChanges(): void {
    this.dataStoreForm.valueChanges.subscribe(val => {
      
      let dataStore = this.dataStoreForm.get('dataStore').value;

      this.postgresDataStore = false;
      this.snowflakeDataStore = false;
      this.oracleDataStore = false;
      this.mysqlDataStore = false;
      this.tgdbDataStore = false;
      this.dgraphDataStore = false;

      if (dataStore == "Postgres") {
        this.postgresDataStore = true;
      }
      else if (dataStore == "Snowflake") {
        this.snowflakeDataStore = true;
      }
      else if (dataStore == "TGDB") {
        this.tgdbDataStore = true;
      }
      else if (dataStore == "Dgraph") {
        this.dgraphDataStore = true;
      }

    });
  }

}
