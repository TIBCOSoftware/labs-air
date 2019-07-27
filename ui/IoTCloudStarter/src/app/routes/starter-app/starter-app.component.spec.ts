import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StarterAppComponent } from './starter-app.component';

describe('HomeComponent', () => {
  let component: StarterAppComponent;
  let fixture: ComponentFixture<StarterAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StarterAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StarterAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
