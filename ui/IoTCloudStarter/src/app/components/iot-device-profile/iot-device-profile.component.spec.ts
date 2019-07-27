import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDeviceProfileComponent } from './iot-device-profile.component';

describe('IotDeviceProfileComponent', () => {
  let component: IotDeviceProfileComponent;
  let fixture: ComponentFixture<IotDeviceProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDeviceProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDeviceProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
