import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolsViewComponent } from './protocols-view.component';

describe('ProtocolsViewComponent', () => {
  let component: ProtocolsViewComponent;
  let fixture: ComponentFixture<ProtocolsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtocolsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
