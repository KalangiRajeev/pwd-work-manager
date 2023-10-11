import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PwdOfficesPage } from './pwd-offices.page';
import { FormPwdOfficesComponent } from './form-pwd-offices/form-pwd-offices.component';

const routes: Routes = [
  {
    path: '',
    component: PwdOfficesPage
  },
  {
    path: 'create',
    component: FormPwdOfficesComponent
  },
  {
    path: 'edit/:officeId',
    component: FormPwdOfficesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PwdOfficesPageRoutingModule {}
