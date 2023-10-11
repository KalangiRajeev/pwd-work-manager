import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PwdOfficesPageRoutingModule } from './pwd-offices-routing.module';

import { PwdOfficesPage } from './pwd-offices.page';
import { FormPwdOfficesComponent } from './form-pwd-offices/form-pwd-offices.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PwdOfficesPageRoutingModule,
    ReactiveFormsModule,
    AngularMaterialModule
  ],
  declarations: [
    PwdOfficesPage,
    FormPwdOfficesComponent
  ]
})
export class PwdOfficesPageModule {}
