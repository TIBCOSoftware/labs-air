import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotRulesComponent } from './iot-rules.component';

describe('IotRulesComponent', () => {
  let component: IotRulesComponent;
  let fixture: ComponentFixture<IotRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
