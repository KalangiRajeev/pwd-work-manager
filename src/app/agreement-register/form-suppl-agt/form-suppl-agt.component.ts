import { Component, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addDoc, collection, doc, query, setDoc, where } from 'firebase/firestore';
import { Observable, Subject, map, startWith } from 'rxjs';
import { Agency } from 'src/app/models/agency';
import { AgreementRegister } from 'src/app/models/agreement-register';
import { AGENCIES, AGREEMENT_REGISTER, OFFICES, SUPPL_AGT_DETAILS } from 'src/app/models/constants';
import { Office } from 'src/app/models/office';
import { SupplAgtDetails } from 'src/app/models/suppl-agt-details';

@Component({
  selector: 'app-form-suppl-agt',
  templateUrl: './form-suppl-agt.component.html',
  styleUrls: ['./form-suppl-agt.component.scss'],
})
export class FormSupplAgtComponent  implements OnInit {

  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);

  isEditMode: boolean =false;
  agtRegId?: string;
  supplAgtId?: string;
  supplAgt?: SupplAgtDetails;
  $supplAgt: Subject<SupplAgtDetails> = new Subject();
  focalOffices$?: Observable<Office[] | undefined>
  agencies$?: Observable<Agency[] | undefined>

  focalOffices?: Office[];
  agencies?: Agency[];

  $agreementRegister: Subject<AgreementRegister> = new Subject();
  agreementRegister?: AgreementRegister;

  officeFC: FormControl = new FormControl('', Validators.required);
  agencyFC: FormControl = new FormControl('', Validators.required);
  dateOfAgreement: FormControl = new FormControl('', Validators.required);

  saFormGroup: FormGroup = new FormGroup({
    supplAgtNumber: new FormControl('', Validators.required),
    technicalApprovalReference: new FormControl('', Validators.required),
    officeFC: this.officeFC,
    agencyFC: this.agencyFC,
    dateOfAgreement: this.dateOfAgreement,
    supplAgtAmount: new FormControl('', Validators.required)
  });
  
  constructor(private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private navController: NavController,
    private alertController: AlertController) { 
    
    const collectionDataAgencies = collection(this.firestore, AGENCIES);
    this.agencies$ = collectionData(collectionDataAgencies, { idField: 'id' }) as Observable<Agency[]>;
    this.agencies$.subscribe(agencies => this.agencies = agencies);
    
    const collectionDataOffices = collection(this.firestore, OFFICES);
    const queryFocalOfficesCollection = query(collectionDataOffices, where('isFocal', '==', true))
    this.focalOffices$ = collectionData(queryFocalOfficesCollection, { idField: 'id' }) as Observable<Office[]>;
    this.focalOffices$.subscribe(offices => this.focalOffices = offices);
  
    this.activatedRoute.params.subscribe(p => {
      if (p['agtRegId']) {
        this.agtRegId = p['agtRegId'];
        const documentRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${p['agtRegId']}`);
        docSnapshots(documentRef).subscribe(docSnap => {
          this.agreementRegister = docSnap.data() as AgreementRegister;
          this.agreementRegister.id = docSnap.id;
          this.$agreementRegister.next(this.agreementRegister);
        });

        if (p['id']) {
          this.isEditMode = true;
          this.supplAgtId = p['id'];
          const msmtDocRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${SUPPL_AGT_DETAILS}/${this.supplAgtId}`);
        docSnapshots(msmtDocRef).subscribe(msmtSnap => {
          this.supplAgt = msmtSnap.data() as SupplAgtDetails;
          this.supplAgt.id = msmtSnap.id;
          this.$supplAgt.next(this.supplAgt);
        });
        }
      }

    });

  }

  ngOnInit() {
    this.agencies$ = this.agencyFC.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.agencies) : this.agencies?.slice();
      }),
    );
    
    this.focalOffices$ = this.officeFC.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.focalOffices) : this.focalOffices?.slice();
      }),
    );

    this.$supplAgt.subscribe(supplAgt => {
      this.officeFC.setValue(supplAgt.conclAtOffice);
      this.agencyFC.setValue(supplAgt.agency);
      this.dateOfAgreement.setValue(new Date(supplAgt.dateOfSupplAgt));
      this.saFormGroup.patchValue({
        supplAgtNumber: supplAgt.supplAgtNumber,
        technicalApprovalReference: supplAgt.techApprovalRef,
        supplAgtAmount: supplAgt.supplAgtAmount
      });
    });
  }

  private _filter(value: string, items?: Office[] | Agency[]) {
    const filterValue = value.toLowerCase();
    return items?.filter(option => option.name.toLowerCase().includes(filterValue));
  }


  displayFn(item: Office | Agency): string {
    return item && item.name ? item.name : '';
  }

  async saveSupplAgtDetails(){
    if (this.saFormGroup.valid && this.agreementRegister) {
      const supplAgtDetails: SupplAgtDetails = {
        agtRegId: this.agreementRegister.id!,
        techApprovalRef: this.saFormGroup.get('technicalApprovalReference')?.value,
        supplAgtNumber: this.saFormGroup.get('supplAgtNumber')?.value,
        dateOfSupplAgt: new Date(this.dateOfAgreement.value).getTime(),
        supplAgtAmount: this.saFormGroup.get('supplAgtAmount')?.value,
        conclAtOffice: this.officeFC.value,
        agency: this.agencyFC.value,
        lastModifiedOn: new Date().getTime(),
        lastModifiedBy: this.auth.currentUser?.email
      } 

      if (this.isEditMode) {
        const msmtDocRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${SUPPL_AGT_DETAILS}/${this.supplAgtId}`);
        setDoc(msmtDocRef, supplAgtDetails)
          .then(() => {
            const toast = this.toastController.create({
              message: `Updated Suppl Agt Details!`,
              duration: 1500,
              position: 'bottom',
            });
            return toast;
          })
          .then(toast => {
            toast.present();
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        const collectionAgreementRegister = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${SUPPL_AGT_DETAILS}`);
        addDoc(collectionAgreementRegister, supplAgtDetails)
          .then(msmt => {
            const toast = this.toastController.create({
              message: `Saved Suppl Agt!`,
              duration: 1500,
              position: 'bottom',
            });
            console.log(msmt);
            return toast;
          })
          .then(toast => {
            toast.present();
          })
          .catch(error => {
            console.log(error);
          });
      }
      
      this.navController.navigateBack(`/main/agreement-register/details/${this.agtRegId}`);
    } else {
      const alert = await this.alertController.create({
        header: 'Alert!',
        subHeader: 'Suppl Agt Details Form',
        message: 'This is not an valid form!',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

}
