import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MbMovementRegisterPage } from './mb-movement-register.page';
import { FormMbEntryComponent } from './form-mb-entry/form-mb-entry.component';
import { DetailsMbRecordComponent } from './details-mb-record/details-mb-record.component';

const routes: Routes = [
  {
    path: ':officeId',
    component: MbMovementRegisterPage
  },
  {
    path: 'details/:mbId',
    component: DetailsMbRecordComponent
  },
  {
    path: 'create/mb',
    component: FormMbEntryComponent
  },
  {
    path: 'edit/:id',
    component: FormMbEntryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MbMovementRegisterPageRoutingModule {}
