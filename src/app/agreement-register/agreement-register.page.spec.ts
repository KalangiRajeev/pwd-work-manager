import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgreementRegisterPage } from './agreement-register.page';

describe('AgreementRegisterPage', () => {
  let component: AgreementRegisterPage;
  let fixture: ComponentFixture<AgreementRegisterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AgreementRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
