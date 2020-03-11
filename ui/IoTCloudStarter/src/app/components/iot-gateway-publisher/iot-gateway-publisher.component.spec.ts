import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayPublisherComponent } from './iot-gateway-publisher.component';

describe('IotGatewayPublisherComponent', () => {
  let component: IotGatewayPublisherComponent;
  let fixture: ComponentFixture<IotGatewayPublisherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotGatewayPublisherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayPublisherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
