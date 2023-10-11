import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PwdAgenciesPage } from './pwd-agencies.page';
import { FormPwdAgenciesComponent } from './form-pwd-agencies/form-pwd-agencies.component';

const routes: Routes = [
  {
    path: '',
    component: PwdAgenciesPage
  },
  {
    path: 'create',
    component: FormPwdAgenciesComponent
  },
  {
    path: 'edit/:id',
    component: FormPwdAgenciesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PwdAgenciesPageRoutingModule { }
