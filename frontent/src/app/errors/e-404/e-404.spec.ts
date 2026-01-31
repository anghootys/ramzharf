import { ComponentFixture, TestBed } from '@angular/core/testing';

import { E404 } from './e-404';

describe('E404', () => {
  let component: E404;
  let fixture: ComponentFixture<E404>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [E404]
    })
    .compileComponents();

    fixture = TestBed.createComponent(E404);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
