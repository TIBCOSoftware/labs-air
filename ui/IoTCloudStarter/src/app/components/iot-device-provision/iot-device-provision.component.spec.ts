import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDeviceProvisionComponent } from './iot-device-provision.component';

describe('IotDeviceProvisionComponent', () => {
  let component: IotDeviceProvisionComponent;
  let fixture: ComponentFixture<IotDeviceProvisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDeviceProvisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDeviceProvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
