import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDeviceSummaryComponent } from './iot-device-summary.component';

describe('IotDeviceSummaryComponent', () => {
  let component: IotDeviceSummaryComponent;
  let fixture: ComponentFixture<IotDeviceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDeviceSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDeviceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
