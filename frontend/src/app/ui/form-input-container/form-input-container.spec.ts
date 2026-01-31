import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputContainer } from './form-input-container';

describe('FormInputContainer', () => {
  let component: FormInputContainer;
  let fixture: ComponentFixture<FormInputContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInputContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
