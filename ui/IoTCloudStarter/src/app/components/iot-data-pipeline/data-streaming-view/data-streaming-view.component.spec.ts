import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStreamingViewComponent } from './data-streaming-view.component';

describe('DataStreamingViewComponent', () => {
  let component: DataStreamingViewComponent;
  let fixture: ComponentFixture<DataStreamingViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataStreamingViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataStreamingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
