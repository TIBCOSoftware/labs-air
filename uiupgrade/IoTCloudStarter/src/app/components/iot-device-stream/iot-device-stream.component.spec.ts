import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDeviceStreamComponent } from './iot-device-stream.component';

describe('IotDeviceStreamComponent', () => {
  let component: IotDeviceStreamComponent;
  let fixture: ComponentFixture<IotDeviceStreamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDeviceStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDeviceStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
