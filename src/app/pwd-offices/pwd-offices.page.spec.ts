import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PwdOfficesPage } from './pwd-offices.page';

describe('PwdOfficesPage', () => {
  let component: PwdOfficesPage;
  let fixture: ComponentFixture<PwdOfficesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PwdOfficesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
