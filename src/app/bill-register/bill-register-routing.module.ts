import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BillRegisterPage } from './bill-register.page';

const routes: Routes = [
  {
    path: '',
    component: BillRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillRegisterPageRoutingModule {}
