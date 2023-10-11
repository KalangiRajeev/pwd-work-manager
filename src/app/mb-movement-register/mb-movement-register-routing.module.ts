import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MbMovementRegisterPage } from './mb-movement-register.page';
import { FormMbEntryComponent } from './form-mb-entry/form-mb-entry.component';
import { DetailsMbRecordComponent } from './details-mb-record/details-mb-record.component';

const routes: Routes = [
  {
    path: '',
    component: MbMovementRegisterPage
  },
  {
    path: 'create',
    component: FormMbEntryComponent
  },
  {
    path: 'details/:mbId',
    component: DetailsMbRecordComponent
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
