import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaporamaComponent } from './maporama.component';

describe('MaporamaComponent', () => {
  let component: MaporamaComponent;
  let fixture: ComponentFixture<MaporamaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaporamaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaporamaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
