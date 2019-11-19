import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotGatewayComponent } from './iot-gateway.component';

describe('IotGatewayComponent', () => {
  let component: IotGatewayComponent;
  let fixture: ComponentFixture<IotGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
