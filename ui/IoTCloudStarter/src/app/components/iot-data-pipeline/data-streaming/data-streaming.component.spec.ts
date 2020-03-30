import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStreamingComponent } from './data-streaming.component';

describe('DataStreamingComponent', () => {
  let component: DataStreamingComponent;
  let fixture: ComponentFixture<DataStreamingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataStreamingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataStreamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
