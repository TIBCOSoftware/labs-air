import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFilteringViewComponent } from './data-filtering-view.component';

describe('DataFilteringViewComponent', () => {
  let component: DataFilteringViewComponent;
  let fixture: ComponentFixture<DataFilteringViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFilteringViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFilteringViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
