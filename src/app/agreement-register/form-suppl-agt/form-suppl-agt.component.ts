import { Component, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Office } from 'src/app/models/office';

@Component({
  selector: 'app-form-suppl-agt',
  templateUrl: './form-suppl-agt.component.html',
  styleUrls: ['./form-suppl-agt.component.scss'],
})
export class FormSupplAgtComponent  implements OnInit {

  isEditMode: boolean =false;
  agtRegId?: string;
  focalOffices$?: Observable<Office[]>

  officeFC: FormControl = new FormControl('', Validators.required);
  dateOfAgreement: FormControl = new FormControl(new Date(), Validators.required);

  saFormGroup: FormGroup = new FormGroup({
    technicalApprovalReference: new FormControl('', Validators.required),
    office: this.officeFC,
    supplAgtNumber: new FormControl('', Validators.required),
    dateOfAgreement: this.dateOfAgreement,
    supplAgtAmount: new FormControl('', Validators.required)
  });

  constructor() { }

  ngOnInit() {}


  displayFn(office: Office): string {
    return office && office.name ? office.name : '';
  }

  saveSupplAgtDetails(){

  }

}
