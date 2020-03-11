import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface SelectItem {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-data-stores',
  templateUrl: './data-stores.component.html',
  styleUrls: ['./data-stores.component.css']
})
export class DataStoresComponent implements OnInit {

  hidePassword = true;

  postgresDataStore = false;
  snowflakeDataStore = false;
  oracleDataStore = false;
  mysqlDataStore = false;
  tgdbDataStore = false;
  dgraphDataStore = false;

  dataStores: SelectItem[] = [
    { value: 'Postgres', viewValue: 'Postgres' },
    { value: 'Snowflake', viewValue: 'Snowflake' },
    { value: 'Oracle', viewValue: 'Oracle' },
    { value: 'MySQL', viewValue: 'MySQL' },
    { value: 'TGDB', viewValue: 'TGDB' },
    { value: 'Dgraph', viewValue: 'Dgraph' }
  ];

  @Input() dataStoreForm: FormGroup;

  constructor() { }

  ngOnInit() {

    this.onFormChanges();
  }


  onDataStoreSelected(event) {
    console.log("Option selected: ", event);

    this.postgresDataStore = false;
    this.snowflakeDataStore = false;
    this.oracleDataStore = false;
    this.mysqlDataStore = false;
    this.tgdbDataStore = false;
    this.dgraphDataStore = false;

    if (event.value == "Postgres") {

      this.dataStoreForm.patchValue({
        postgres: {
          host: '',
          port: '',
          databaseName: '',
          user: '',
          password: ''
        },
        snowflake: {
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme'
        },
        tgdb: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        },
        dgraph: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.postgresDataStore = true;
    }
    else if (event.value == "Snowflake") {

      this.dataStoreForm.patchValue({
        snowflake: {
          accountName: '',
          warehouse: '',
          database: '',
          schema: '',
          username: '',
          password: '',
          role: ''
        },
        postgres: {
          host: 'changeme',
          port: 'changeme',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        tgdb: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        },
        dgraph: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.snowflakeDataStore = true;
    }
    else if (event.value == "TGDB") {

      this.dataStoreForm.patchValue({
        tgdb: {
          url: '',
          username: '',
          password: ''
        },
        postgres: {
          host: 'changeme',
          port: 'changeme',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        snowflake: {
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme'
        },
        dgraph: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.tgdbDataStore = true;
    }
    else if (event.value == "Dgraph") {

      this.dataStoreForm.patchValue({
        dgraph: {
          url: '',
          username: '',
          password: ''
        },
        postgres: {
          host: 'changeme',
          port: 'changeme',
          databaseName: 'changeme',
          user: 'changeme',
          password: 'changeme'
        },
        snowflake: {
          accountName: 'changeme',
          warehouse: 'changeme',
          database: 'changeme',
          schema: 'changeme',
          username: 'changeme',
          password: 'changeme',
          role: 'changeme'
        },
        tgdb: {
          url: 'changeme',
          username: 'changeme',
          password: 'changeme'
        }
      });

      this.dgraphDataStore = true;
    }

  }

  stepSubmitted() {
    // this.dataStoreForm.get('dataStore').markAsTouched();
    // this.dataStoreForm.get('dataStore').updateValueAndValidity();
    // this.transportForm.get('personalDetails').get('lastname').markAsTouched();
    // this.transportForm.get('personalDetails').get('lastname').updateValueAndValidity();
  }

  onFormChanges(): void {
    this.dataStoreForm.valueChanges.subscribe(val => {

      if (this.dataStoreForm.get('protocol').value == "") {

        this.postgresDataStore = false;
        this.snowflakeDataStore = false;
        this.oracleDataStore = false;
        this.mysqlDataStore = false;
        this.tgdbDataStore = false;
        this.dgraphDataStore = false;
      }

    });
  }

}
