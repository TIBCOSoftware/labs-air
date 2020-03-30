import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStoresComponent } from './data-stores.component';

describe('DataStoresComponent', () => {
  let component: DataStoresComponent;
  let fixture: ComponentFixture<DataStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
