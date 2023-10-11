import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillRegisterPage } from './bill-register.page';

describe('BillRegisterPage', () => {
  let component: BillRegisterPage;
  let fixture: ComponentFixture<BillRegisterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BillRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
