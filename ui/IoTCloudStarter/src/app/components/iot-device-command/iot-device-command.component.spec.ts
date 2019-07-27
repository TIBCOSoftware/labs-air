import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDeviceCommandComponent } from './iot-device-command.component';

describe('IotDeviceCommandComponent', () => {
  let component: IotDeviceCommandComponent;
  let fixture: ComponentFixture<IotDeviceCommandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDeviceCommandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDeviceCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
