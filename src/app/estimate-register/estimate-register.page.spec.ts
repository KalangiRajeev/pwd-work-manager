import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstimateRegisterPage } from './estimate-register.page';

describe('EstimateRegisterPage', () => {
  let component: EstimateRegisterPage;
  let fixture: ComponentFixture<EstimateRegisterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EstimateRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
