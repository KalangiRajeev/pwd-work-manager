import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MbMovementRegisterPage } from './mb-movement-register.page';

describe('MbMovementRegisterPage', () => {
  let component: MbMovementRegisterPage;
  let fixture: ComponentFixture<MbMovementRegisterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MbMovementRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
