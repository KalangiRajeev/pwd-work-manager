import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { addDoc, collection, doc, endAt, getCountFromServer, orderBy, query, setDoc, startAt, where } from 'firebase/firestore';
import { Observable, Subject, map, startWith } from 'rxjs';
import { AGREEMENT_REGISTER, MB_RECORDS, MEASUREMENTS, OFFICES } from 'src/app/models/constants';
import { MbRecord } from 'src/app/models/mbrecord';
import { Measurement, MeasurementType } from 'src/app/models/mesaurement';
import { DateAdapter } from '@angular/material/core';
import { Office } from 'src/app/models/office';
import { AlertController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-add-measurements',
  templateUrl: './add-measurements.component.html',
  styleUrls: ['./add-measurements.component.scss']

})
export class AddMeasurementsComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  isEditMsmt: boolean = false;

  $mbRecords?: Observable<MbRecord[] | undefined>;
  $officesMsd?: Observable<Office[] | undefined>;
  $officesCkMsd?: Observable<Office[] | undefined>;

  mbRecords?: MbRecord[];
  officesMsd?: Office[];
  officesCkMsd?: Office[];

  $recordCount: Subject<number> = new Subject();
  agtRegId?: string;
  officeId?: string;
  msmtId?: string;
  agtNo?: string;

  measurement?: Measurement;
  $measurement: Subject<Measurement> = new Subject();

  mbFC: FormControl = new FormControl(null, Validators.required);
  measurementTypeFC: FormControl = new FormControl(MeasurementType.PART, Validators.required);
  dateOfMeasurementsFC: FormControl = new FormControl(null, Validators.required);
  measuredByOffice: FormControl = new FormControl(null, Validators.required);
  dateOfCheckMeasurementsFC: FormControl = new FormControl(null, Validators.required);
  checkMeasuredByOffice: FormControl = new FormControl(null, Validators.required);

  measurementsFormGroup: FormGroup = new FormGroup({
    mbFC: this.mbFC,
    measurementTypeFC: this.measurementTypeFC,
    fromPg: new FormControl(null, Validators.required),
    toPg: new FormControl(null, Validators.required),
    dateOfMeasurementsFC: this.dateOfMeasurementsFC,
    measuredByOffice: this.measuredByOffice,
    dateOfCheckMeasurementsFC: this.dateOfCheckMeasurementsFC,
    checkMeasuredByOffice: this.checkMeasuredByOffice,
  });

  measurementTypes: string[] = Object.values(MeasurementType);

  constructor(private activatedRoute: ActivatedRoute,
    private dateAdapter: DateAdapter<Date>,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController) {

    this.dateAdapter.setLocale('en-IN');

    this.activatedRoute.params.subscribe(params => {
      this.agtRegId = params['agtRegId'];
      this.officeId = params['officeId'];
      this.msmtId = params['msmtId'];
      this.agtNo = params['agtNo'];

      console.log(this.officeId, this.agtRegId);

      const mbRecordsCollection = collection(this.firestore, MB_RECORDS);
      const qry = query(mbRecordsCollection, where('issuedToOffice.id', '==', this.officeId));
      this.$mbRecords = collectionData(qry, { idField: 'id' }) as Observable<MbRecord[]>;
      this.$mbRecords?.subscribe(mbRecords => this.mbRecords = mbRecords);

      const collectionDataOffices = collection(this.firestore, OFFICES);
      const queryNonFocalOfficesCollection = query(collectionDataOffices, where('isFocal', '==', false));
      this.$officesMsd = collectionData(queryNonFocalOfficesCollection, { idField: 'id' }) as Observable<Office[]>;
      this.$officesMsd.subscribe(offices => this.officesMsd = offices);

      const queryOffices = query(collectionDataOffices);
      this.$officesCkMsd = collectionData(queryOffices, { idField: 'id' }) as Observable<Office[]>;
      this.$officesCkMsd.subscribe(offices => this.officesCkMsd = offices);


      getCountFromServer(qry).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.$recordCount.next(recordsCount);
      });


      if (this.msmtId) {
        this.isEditMsmt = true;
        const msmtDocRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${MEASUREMENTS}/${this.msmtId}`);
        docSnapshots(msmtDocRef).subscribe(msmtSnap => {
          this.measurement = msmtSnap.data() as Measurement;
          this.measurement.id = msmtSnap.id;

          this.$measurement.next(this.measurement);
        });
      }

    });


  }

  ngOnInit() {
    this.$mbRecords = this.mbFC.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterMbRecords(name as string, this.mbRecords) : this.mbRecords?.slice();
      })
    );

    this.$officesMsd = this.measuredByOffice.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterOffices(name as string, this.officesMsd) : this.officesMsd?.slice();
      }),
    );

    this.$officesCkMsd = this.checkMeasuredByOffice.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterOffices(name as string, this.officesCkMsd) : this.officesCkMsd?.slice();
      }),
    );

    this.$measurement.subscribe(m => {
      this.measurementsFormGroup.patchValue({
        fromPg: m.fromPg,
        toPg: m.toPg
      });

      this.mbFC.setValue(m.mb);
      this.measurementTypeFC.setValue(m.measurementType);
      this.dateOfMeasurementsFC.setValue(new Date(m.dateOfMeasurement));
      this.measuredByOffice.setValue(m.measuredByOffice);
      if (m.dateOfCheckMeasurement)
        this.dateOfCheckMeasurementsFC.setValue(new Date(m.dateOfCheckMeasurement)); 
      if(m.checkMeasurementOffice)
        this.checkMeasuredByOffice.setValue(m.checkMeasurementOffice);
    })

  }

  displayFnMbRecord(item: MbRecord): string {
    return item && item.mbNumber ? item.mbNumber : '';
  }

  displayFnOffice(item: Office): string {
    return item && item.name ? item.name : '';
  }

  private _filterMbRecords(value: string, items?: MbRecord[]) {
    const filterValue = value.toLowerCase();
    return items?.filter(option => option.mbNumber.toLowerCase().includes(filterValue));
  }

  private _filterOffices(value: string, items?: Office[]) {
    const filterValue = value.toLowerCase();
    return items?.filter(option => option.name.toLowerCase().includes(filterValue));
  }


  async saveMeasurements() {
    if (this.measurementsFormGroup.valid && this.agtRegId) {
      const measurement: Measurement = {
        agtRegId: this.agtRegId,
        agtNo:this.agtNo,
        mb: this.mbFC.value,
        measurementType: this.measurementTypeFC.value,
        fromPg: this.measurementsFormGroup.get('fromPg')?.value,
        toPg: this.measurementsFormGroup.get('toPg')?.value,
        dateOfMeasurement: new Date(this.dateOfMeasurementsFC.value).getTime(),
        measuredByOffice: this.measuredByOffice.value,
        dateOfCheckMeasurement: new Date(this.dateOfCheckMeasurementsFC.value).getTime(),
        checkMeasurementOffice: this.checkMeasuredByOffice.value,
        lastModififedOn: new Date().getTime()
      }
      console.log(this.dateOfMeasurementsFC.value);
      console.log(this.dateOfCheckMeasurementsFC.value);
      console.log(measurement);

      if (this.msmtId) {
        const msmtDocRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${MEASUREMENTS}/${this.msmtId}`);
        setDoc(msmtDocRef, measurement)
          .then(() => {
            const toast = this.toastController.create({
              message: `Updated Measurements!`,
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
        const collectionAgreementRegister = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${MEASUREMENTS}`);
        addDoc(collectionAgreementRegister, measurement)
          .then(msmt => {
            const toast = this.toastController.create({
              message: `Saved Measurements!`,
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
      if (this.agtRegId) {
        this.navController.navigateBack(`/main/agreement-register/details/${this.agtRegId}`)
      } else {
        this.navController.navigateBack('/main/agreement-register');
      }

    } else {
      const alert = await this.alertController.create({
        header: 'Alert!',
        subHeader: 'Measurement Details Form',
        message: 'This is not an valid form!',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

}
