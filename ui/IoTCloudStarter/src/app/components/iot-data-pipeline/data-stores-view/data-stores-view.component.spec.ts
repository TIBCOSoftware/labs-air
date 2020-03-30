import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStoresViewComponent } from './data-stores-view.component';

describe('DataStoresViewComponent', () => {
  let component: DataStoresViewComponent;
  let fixture: ComponentFixture<DataStoresViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataStoresViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataStoresViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
