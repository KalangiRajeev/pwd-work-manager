import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EstimateRegisterPageRoutingModule } from './estimate-register-routing.module';

import { EstimateRegisterPage } from './estimate-register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EstimateRegisterPageRoutingModule
  ],
  declarations: [EstimateRegisterPage]
})
export class EstimateRegisterPageModule {}
