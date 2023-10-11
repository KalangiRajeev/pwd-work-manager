import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PwdAgenciesPageRoutingModule } from './pwd-agencies-routing.module';

import { PwdAgenciesPage } from './pwd-agencies.page';
import { FormPwdAgenciesComponent } from './form-pwd-agencies/form-pwd-agencies.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PwdAgenciesPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [
    PwdAgenciesPage,
    FormPwdAgenciesComponent
  ]
})
export class PwdAgenciesPageModule { }
