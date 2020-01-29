import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveAppsCockpitComponent } from './live-apps-cockpit.component';

describe('LiveAppsCockpitComponent', () => {
  let component: LiveAppsCockpitComponent;
  let fixture: ComponentFixture<LiveAppsCockpitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveAppsCockpitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveAppsCockpitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
