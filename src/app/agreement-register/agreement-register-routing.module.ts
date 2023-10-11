import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgreementRegisterPage } from './agreement-register.page';
import { FormAgtRegisterComponent } from './form-agt-register/form-agt-register.component';
import { DetailsAgtRegisterComponent } from './details-agt-register/details-agt-register.component';
import { AddMeasurementsComponent } from './add-measurements/add-measurements.component';
import { AddBillComponent } from './add-bill/add-bill.component';
import { FormSupplAgtComponent } from './form-suppl-agt/form-suppl-agt.component';

const routes: Routes = [
  {
    path: '',
    component: AgreementRegisterPage
  },
  {
    path: 'create',
    component: FormAgtRegisterComponent
  },
  {
    path: 'details/:id',
    component: DetailsAgtRegisterComponent
  },
  {
    path: 'edit/:id',
    component: FormAgtRegisterComponent
  },
  {
    path: ':officeId/add-measurements/:agtRegId/:agtNo',
    component: AddMeasurementsComponent
  },
  {
    path: ':officeId/add-measurements/:agtRegId/:agtNo/edit/:msmtId',
    component: AddMeasurementsComponent
  },
  {
    path: ':officeId/add-bill/:agtRegId/:agtNo',
    component: AddBillComponent 
  },
  {
    path: ':officeId/add-bill/:agtRegId/:agtNo/edit/:billId',
    component: AddBillComponent
  },
  {
    path: ':agtRegId/suppl-agt/create',
    component: FormSupplAgtComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgreementRegisterPageRoutingModule {}
