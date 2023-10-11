import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addDoc, collection, doc, query, setDoc, where } from 'firebase/firestore';
import { Observable, Subject, map, startWith } from 'rxjs';
import { Agency } from 'src/app/models/agency';
import { AgreementRegister, TenderQuote, WorkStatus } from 'src/app/models/agreement-register';
import { AGENCIES, AGREEMENT_REGISTER, OFFICES } from 'src/app/models/constants';
import { Office } from 'src/app/models/office';
import { AppComponentService } from 'src/app/services/app-component-service/app-component.service';

@Component({
  selector: 'app-form-agt-register',
  templateUrl: './form-agt-register.component.html',
  styleUrls: ['./form-agt-register.component.scss'],
})
export class FormAgtRegisterComponent implements OnInit {

  isEditMode: boolean = false;

  agencies$: Observable<Agency[] | undefined>;
  focalOffices$: Observable<Office[] | undefined>;
  nonFocalOffices$: Observable<Office[] | undefined>;
  agencies?: Agency[];
  focalOffices?: Office[];
  nonFocalOffices?: Office[];

  fireStore: Firestore = inject(Firestore);
  associatedOffice?: Office;
  associatedOffice$: Subject<Office> = new Subject();

  $agreementRegister: Subject<AgreementRegister> = new Subject();
  workStatuses: string[] = Object.values(WorkStatus);
  selectedWorkStatus: string = WorkStatus.NOT_YET_STARTED;

  associatedOfficeFC: FormControl = new FormControl(null, Validators.required);
  officeFC: FormControl = new FormControl(null, Validators.required);
  agencyFC: FormControl = new FormControl(null, Validators.required);

  dueDateOfCompletion: FormControl = new FormControl(null, Validators.required);
  dateOfAgreement: FormControl = new FormControl(null, Validators.required);

  agreementRegisterForm: FormGroup = new FormGroup({
    nameOfWork: new FormControl(null, Validators.required),
    agreementNumber: new FormControl(null, Validators.required),
    dateOfAgreement: this.dateOfAgreement,
    estimateContractValue: new FormControl(null, Validators.required),
    tenderPercentage: new FormControl(null, Validators.required),
    tenderQuote: new FormControl(TenderQuote.LESS, Validators.required),
    dueDateOfCompletion: this.dueDateOfCompletion,
    agencyFc: this.agencyFC,
    officeFc: this.officeFC,
    technicalSanctionReference: new FormControl(null, Validators.required),
    administrativeSanctionReference: new FormControl(null, Validators.required),
    associatedOffice: this.associatedOfficeFC,
    workStatus: new FormControl(WorkStatus.NOT_YET_STARTED, Validators.required)
  });

  agreementRegister?: AgreementRegister;
  agtRegId?: string;

  constructor(private alertController: AlertController,
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    public appComponentService: AppComponentService,
    private dateAdapter: DateAdapter<Date>) {

    this.dateAdapter.setLocale('en-IN');

    const collectionDataAgencies = collection(this.fireStore, AGENCIES);
    const collectionDataOffices = collection(this.fireStore, OFFICES);

    this.agencies$ = collectionData(collectionDataAgencies, { idField: 'id' }) as Observable<Agency[]>;
    this.agencies$.subscribe(agencies => this.agencies = agencies);

    const queryFocalOfficesCollection = query(collectionDataOffices, where('isFocal', '==', true))
    this.focalOffices$ = collectionData(queryFocalOfficesCollection, { idField: 'id' }) as Observable<Office[]>;
    this.focalOffices$.subscribe(offices => this.focalOffices = offices);

    const queryNonFocalOfficesCollection = query(collectionDataOffices, where('isFocal', '!=', true))
    this.nonFocalOffices$ = collectionData(queryNonFocalOfficesCollection, { idField: 'id' }) as Observable<Office[]>;
    this.nonFocalOffices$.subscribe(offices => this.nonFocalOffices = offices);

    this.activatedRoute.params.subscribe(p => {
      if (p['id']) {
        this.isEditMode = true;
        this.agtRegId = p['id'];
        const documentRef = doc(this.fireStore, `${AGREEMENT_REGISTER}/${p['id']}`);

        docSnapshots(documentRef).subscribe(docSnap => {
          this.agreementRegister = docSnap.data() as AgreementRegister;
          this.agreementRegister.id = docSnap.id;
          this.$agreementRegister.next(this.agreementRegister);
        });

      }
    });

    this.appComponentService.$selectedOffice.subscribe(office => {
      this.associatedOffice = office;
      console.log(office);
    });
  }

  ngOnInit() {

    this.$agreementRegister.subscribe(agreementRegister => {
      console.log(agreementRegister);
      this.associatedOffice = agreementRegister.associatedOffice;
      this.agreementRegisterForm.patchValue({
        nameOfWork: agreementRegister.nameOfWork,
        agreementNumber: agreementRegister.agreementNumber,
        dateOfAgreement: new Date(agreementRegister.dateOfAgreement).toISOString(),
        estimateContractValue: agreementRegister.estimateContractValue,
        tenderPercentage: agreementRegister.tenderPercentage,
        tenderQuote: agreementRegister.tenderQuote,
        dueDateOfCompletion: new Date(agreementRegister.dueDateOfCompletion).toISOString(),
        technicalSanctionReference: agreementRegister.technicalSanctionReference,
        administrativeSanctionReference: agreementRegister.administrativeSanctionReference,
        agencyFc: agreementRegister.agency,
        officeFc: agreementRegister.office,
        associatedOffice: agreementRegister.associatedOffice,
        workStatus: agreementRegister.workStatus
      });

      this.agencyFC.setValue(agreementRegister.agency);
      this.officeFC.setValue(agreementRegister.office);
      this.associatedOfficeFC.setValue(agreementRegister.associatedOffice);
      this.dueDateOfCompletion.setValue(new Date(agreementRegister.dueDateOfCompletion));
      this.dateOfAgreement.setValue(new Date(agreementRegister.dateOfAgreement));
    });


    this.agencies$ = this.agencyFC.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.agencies) : this.agencies?.slice();
      }),
    );

    this.nonFocalOffices$ = this.associatedOfficeFC.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.nonFocalOffices) : this.nonFocalOffices?.slice();
      }),
    );

    this.focalOffices$ = this.officeFC.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.focalOffices) : this.focalOffices?.slice();
      }),
    );


  }

  displayFn(office: Office): string {
    return office && office.name ? office.name : '';
  }

  private _filter(value: string, items?: Office[] | Agency[]) {
    const filterValue = value.toLowerCase();
    return items?.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  async saveAgreementRegister() {
    if (this.agreementRegisterForm.valid) {
      const agreementRegister: AgreementRegister = {
        nameOfWork: this.agreementRegisterForm.get('nameOfWork')?.value,
        agreementNumber: this.agreementRegisterForm.get('agreementNumber')?.value,
        dateOfAgreement: new Date(this.agreementRegisterForm.get('dateOfAgreement')?.value).getTime(),
        estimateContractValue: this.agreementRegisterForm.get('estimateContractValue')?.value,
        tenderPercentage: this.agreementRegisterForm.get('tenderPercentage')?.value,
        tenderQuote: this.agreementRegisterForm.get('tenderQuote')?.value,
        dueDateOfCompletion: new Date(this.agreementRegisterForm.get('dueDateOfCompletion')?.value).getTime(),
        agency: this.agreementRegisterForm.get('agencyFc')?.value,
        office: this.agreementRegisterForm.get('officeFc')?.value,
        technicalSanctionReference: this.agreementRegisterForm.get('technicalSanctionReference')?.value,
        administrativeSanctionReference: this.agreementRegisterForm.get('administrativeSanctionReference')?.value,
        associatedOffice: this.agreementRegisterForm.get('associatedOffice')?.value,
        workStatus: this.agreementRegisterForm.get('workStatus')?.value
      }

      console.log(agreementRegister);

      if (this.isEditMode) {
        const agtRefDoc = doc(this.fireStore, `${AGREEMENT_REGISTER}/${this.agtRegId}`);
        setDoc(agtRefDoc, agreementRegister)
          .then(agtReg => {
            const toast = this.toastController.create({
              message: `Updated Agreement Details!`,
              duration: 1500,
              position: 'bottom',
            });
            console.log(agtReg);
            return toast;
          })
          .then(toast => {
            toast.present();
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        const collectionAgreementRegister = collection(this.fireStore, AGREEMENT_REGISTER);
        addDoc(collectionAgreementRegister, agreementRegister)
          .then(agtReg => {
            const toast = this.toastController.create({
              message: `Saved Agreement Details!`,
              duration: 1500,
              position: 'bottom',
            });
            console.log(agtReg);
            return toast;
          })
          .then(toast => {
            toast.present();
          })
          .catch(error => {
            console.log(error);
          });
      }
      if (this.agtRegId) {
        this.navController.navigateBack(`/main/agreement-register/details/${this.agtRegId}`)
      } else {
        this.navController.navigateBack('/main/agreement-register');
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Alert!',
        subHeader: 'Agreement Register Form',
        message: 'This is not an valid form!',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

}
