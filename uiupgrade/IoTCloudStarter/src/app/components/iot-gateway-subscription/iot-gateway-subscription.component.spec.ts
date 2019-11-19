import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewaySubscriptionComponent } from './iot-gateway-subscription.component';

describe('IotGatewaySubscriptionComponent', () => {
  let component: IotGatewaySubscriptionComponent;
  let fixture: ComponentFixture<IotGatewaySubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotGatewaySubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewaySubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
