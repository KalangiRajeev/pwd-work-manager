import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MbMovementRegisterPageRoutingModule } from './mb-movement-register-routing.module';

import { MbMovementRegisterPage } from './mb-movement-register.page';
import { FormMbEntryComponent } from './form-mb-entry/form-mb-entry.component';
import { DetailsMbRecordComponent } from './details-mb-record/details-mb-record.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MbMovementRegisterPageRoutingModule,
    ReactiveFormsModule,
    AngularMaterialModule
  ],
  declarations: [
    MbMovementRegisterPage,
    FormMbEntryComponent,
    DetailsMbRecordComponent
  ]
})
export class MbMovementRegisterPageModule {}
