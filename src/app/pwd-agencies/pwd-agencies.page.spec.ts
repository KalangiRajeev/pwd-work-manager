import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PwdAgenciesPage } from './pwd-agencies.page';

describe('PwdAgenciesPage', () => {
  let component: PwdAgenciesPage;
  let fixture: ComponentFixture<PwdAgenciesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PwdAgenciesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
