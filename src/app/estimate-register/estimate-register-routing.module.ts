import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstimateRegisterPage } from './estimate-register.page';

const routes: Routes = [
  {
    path: ':officeId',
    component: EstimateRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstimateRegisterPageRoutingModule {}
