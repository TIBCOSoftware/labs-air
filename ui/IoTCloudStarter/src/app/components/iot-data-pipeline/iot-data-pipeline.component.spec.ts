import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDataPipelineComponent } from './iot-data-pipeline.component';

describe('IotDataPipelineComponent', () => {
  let component: IotDataPipelineComponent;
  let fixture: ComponentFixture<IotDataPipelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDataPipelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDataPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
