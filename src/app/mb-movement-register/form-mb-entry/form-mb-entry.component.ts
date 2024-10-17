import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addDoc, collection, doc, query, setDoc, where } from 'firebase/firestore';
import { Observable, Subject, map, startWith } from 'rxjs';
import { MB_RECORDS, OFFICES } from 'src/app/models/constants';
import { MbRecord, MbStatus } from 'src/app/models/mbrecord';
import { Office } from 'src/app/models/office';

@Component({
  selector: 'app-form-mb-entry',
  templateUrl: './form-mb-entry.component.html',
  styleUrls: ['./form-mb-entry.component.scss'],
})
export class FormMbEntryComponent implements OnInit {

  firestore: Firestore = inject(Firestore);

  issuedToOfficeFC: FormControl = new FormControl(null, Validators.required);

  mbFormGroup: FormGroup = new FormGroup({
    mbNumber: new FormControl(null, Validators.required),
    issuedToOffice: this.issuedToOfficeFC,
    mbIssuedDate: new FormControl(null, Validators.required),
    mbStatus: new FormControl(MbStatus.OPEN, Validators.required)
  });

  offices?: Office[]
  nonFocalOffices$: Observable<Office[] | undefined>;
  nonFocalOffices?: Office[];
  selectedOffice?: Office;

  existingMB?: MbRecord;
  $mbRecord: Subject<MbRecord> = new Subject();
  isEditMode: boolean = false;
  mbRecordId?: string;


  constructor(private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    const collectionDataOffices = collection(this.firestore, OFFICES);
    
    const queryNonFocalOfficesCollection = query(collectionDataOffices, where('isFocal', '==', false))
    this.nonFocalOffices$ = collectionData(queryNonFocalOfficesCollection, { idField: 'id' }) as Observable<Office[]>;
    this.nonFocalOffices$.subscribe(offices => this.nonFocalOffices = offices);

    this.activatedRoute.params.subscribe(params => {
      if(params['id']) {
        this.mbRecordId = params['id'];
        const docRef = doc(this.firestore, `${MB_RECORDS}/${params['id']}`);
        docSnapshots(docRef).subscribe(docSnap => {
          this.existingMB = docSnap.data() as MbRecord;
          this.existingMB.id = docSnap.id;
          console.log(this.existingMB);
          this.$mbRecord.next(this.existingMB);
          this.isEditMode = true;
        });
      }
    });
  }

  ngOnInit() {
    console.log(this.router.routerState.snapshot.url);

    this.mbFormGroup.get('issuedToOffice')?.valueChanges.subscribe(value => {
      this.selectedOffice = value;
    });

    this.$mbRecord.subscribe(mbRecord => {
      this.mbFormGroup.patchValue({
        mbNumber: mbRecord.mbNumber,
        issuedToOffice: mbRecord.issuedToOffice,
        mbIssuedDate: new Date(mbRecord.issuedOn).toISOString(),
        mbStatus: mbRecord.mbStatus
      });

      this.issuedToOfficeFC.setValue(mbRecord.issuedToOffice);
    });

    this.nonFocalOffices$ = this.issuedToOfficeFC.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.nonFocalOffices) : this.nonFocalOffices?.slice();
      }),
    );

  }

  displayFn(mb: Office): string {
    return mb && mb.name ? mb.name : '';
  }

  private _filter(value: string, items?: Office[]) {
    const filterValue = value.toLowerCase();
    return items?.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  async saveMB() {
    if (this.mbFormGroup.valid) {
      const mbRecord: MbRecord = {
        mbNumber: this.mbFormGroup.get('mbNumber')?.value,
        issuedToOffice: this.mbFormGroup.get('issuedToOffice')?.value,
        issuedOn: new Date(this.mbFormGroup.get('mbIssuedDate')?.value).getTime(),
        mbStatus: this.mbFormGroup.get('mbStatus')?.value
      }

      console.log(mbRecord);
      if (this.isEditMode) {
        const mbRefDoc = doc(this.firestore, `${MB_RECORDS}/${this.mbRecordId}`);

        setDoc(mbRefDoc, mbRecord)
          .then(mbDoc => {
            const toast = this.toastController.create({
              message: `Updated MB.No${mbRecord.mbNumber} Details!`,
              duration: 1500,
              position: 'bottom',
            });
            return toast;
          })
          .then(toast => toast.present())
          .catch(error => console.log(error));
      } else {
        const collectionAgreementRegister = collection(this.firestore, MB_RECORDS);
        addDoc(collectionAgreementRegister, mbRecord)
        .then(mbDoc => {
          const toast = this.toastController.create({
            message: `MB.No${mbRecord.mbNumber} Registered!`,
            duration: 1500,
            position: 'bottom',
          });
          return toast;
        })
        .then(toast => toast.present())
        .catch(error => console.log(error));
        this.mbFormGroup.reset();
      }

      if (this.mbRecordId) {
        this.navController.navigateBack(`/main/mb-movement-register/details/${this.mbRecordId}`)
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
