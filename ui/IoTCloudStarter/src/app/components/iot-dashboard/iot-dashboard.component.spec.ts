import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotDashboardComponent } from './iot-dashboard.component';

describe('IotDashboardComponent', () => {
  let component: IotDashboardComponent;
  let fixture: ComponentFixture<IotDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
