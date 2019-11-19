import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayDashboardComponent } from './iot-gateway-dashboard.component';

describe('IotGatewayDashboardComponent', () => {
  let component: IotGatewayDashboardComponent;
  let fixture: ComponentFixture<IotGatewayDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotGatewayDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
