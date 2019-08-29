import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotNotificationsComponent } from './iot-notifications.component';

describe('IotNotificationsComponent', () => {
  let component: IotNotificationsComponent;
  let fixture: ComponentFixture<IotNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
