import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BillRegisterPageRoutingModule } from './bill-register-routing.module';

import { BillRegisterPage } from './bill-register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BillRegisterPageRoutingModule
  ],
  declarations: [BillRegisterPage]
})
export class BillRegisterPageModule {}
