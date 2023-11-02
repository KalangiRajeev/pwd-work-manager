import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgreementRegisterPageRoutingModule } from './agreement-register-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { AddBillComponent } from './add-bill/add-bill.component';
import { AddMeasurementsComponent } from './add-measurements/add-measurements.component';
import { AgreementRegisterPage } from './agreement-register.page';
import { DetailsAgtRegisterComponent } from './details-agt-register/details-agt-register.component';
import { FormAgtRegisterComponent } from './form-agt-register/form-agt-register.component';
import { FormSupplAgtComponent } from './form-suppl-agt/form-suppl-agt.component';
import { FormUploadDocsComponent } from './form-upload-docs/form-upload-docs.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgreementRegisterPageRoutingModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
  declarations: [
    AgreementRegisterPage, 
    FormAgtRegisterComponent,
    DetailsAgtRegisterComponent,
    AddMeasurementsComponent,
    AddBillComponent,
    FormSupplAgtComponent,
    FormUploadDocsComponent
  ]
})
export class AgreementRegisterPageModule {}
