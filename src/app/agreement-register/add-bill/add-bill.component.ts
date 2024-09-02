import { Component, OnInit, inject } from '@angular/core';
import {
  Firestore,
  collectionData,
  docSnapshots,
} from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AlertController,
  NavController,
  ToastController,
} from '@ionic/angular';
import {
  addDoc,
  collection,
  doc,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { Observable, Subject, map, startWith } from 'rxjs';
import { AgreementRegister } from 'src/app/models/agreement-register';
import { Bill, BillType } from 'src/app/models/bill';
import {
  AGREEMENT_REGISTER,
  BILLS,
  MB_RECORDS,
  OFFICES,
} from 'src/app/models/constants';
import { MbRecord } from 'src/app/models/mbrecord';
import { Office } from 'src/app/models/office';

@Component({
  selector: 'app-add-bill',
  templateUrl: './add-bill.component.html',
  styleUrls: ['./add-bill.component.scss'],
})
export class AddBillComponent implements OnInit {
  firestore: Firestore = inject(Firestore);

  isEditBill: boolean = false;
  agtRegId?: string;
  officeId?: string;
  billId?: string;
  agtNo?: string;

  $mbRecords?: Observable<MbRecord[] | undefined>;
  $officesMsd?: Observable<Office[] | undefined>;
  $recordCount: Subject<number> = new Subject();

  mbRecords?: MbRecord[];
  officesMsd?: Office[];
  bill?: Bill;
  $bill: Subject<Bill> = new Subject();

  billTypes: string[] = Object.values(BillType);

  mbFC: FormControl = new FormControl(null, Validators.required);
  billTypeFC: FormControl = new FormControl(BillType.PART, Validators.required);
  dateOfRecomendation: FormControl = new FormControl(null, Validators.required);
  officeRecommended: FormControl = new FormControl(null, Validators.required);

  billFormGroup: FormGroup = new FormGroup({
    mbFC: this.mbFC,
    billTypeFC: this.billTypeFC,
    fromPg: new FormControl(null, Validators.required),
    toPg: new FormControl(null, Validators.required),
    dateOfRecomendation: this.dateOfRecomendation,
    officeRecommended: this.officeRecommended,
    uptoDateBillAmount: new FormControl(null, Validators.required),
    currentBillAmount: new FormControl(null, Validators.required),
  });
  

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private navController: NavController,
    private alertController: AlertController
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.agtRegId = params['agtRegId'];
      this.officeId = params['officeId'];
      this.billId = params['billId'];
      this.agtNo = params['agtNo'];

      const mbRecordsCollection = collection(this.firestore, MB_RECORDS);
      const qry = query(
        mbRecordsCollection,
        where('issuedToOffice.id', '==', this.officeId)
      );
      this.$mbRecords = collectionData(qry, { idField: 'id' }) as Observable<
        MbRecord[]
      >;
      this.$mbRecords?.subscribe((mbRecords) => (this.mbRecords = mbRecords));

      const collectionDataOffices = collection(this.firestore, OFFICES);
      const queryNonFocalOfficesCollection = query(
        collectionDataOffices,
        where('isFocal', '==', false)
      );
      this.$officesMsd = collectionData(queryNonFocalOfficesCollection, {
        idField: 'id',
      }) as Observable<Office[]>;
      this.$officesMsd.subscribe((offices) => (this.officesMsd = offices));

      if (this.billId) {
        this.isEditBill = true;
        const msmtDocRef = doc(
          this.firestore,
          `${AGREEMENT_REGISTER}/${this.agtRegId}/${BILLS}/${this.billId}`
        );
        docSnapshots(msmtDocRef).subscribe((msmtSnap) => {
          this.bill = msmtSnap.data() as Bill;
          this.bill.id = msmtSnap.id;

          this.$bill.next(this.bill);
        });
      }
      
    });
  }

  ngOnInit() {
    this.$mbRecords = this.mbFC.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filterMbRecords(name as string, this.mbRecords)
          : this.mbRecords?.slice();
      })
    );

    this.$officesMsd = this.officeRecommended.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name
          ? this._filterOffices(name as string, this.officesMsd)
          : this.officesMsd?.slice();
      })
    );

    this.$bill.subscribe((m) => {
      this.billFormGroup.patchValue({
        fromPg: m.fromPg,
        toPg: m.toPg,
        uptoDateBillAmount: m.uptoDateBillAmount,
        currentBillAmount: m.currentBillAmount,
      });

      this.mbFC.setValue(m.mb);
      this.billTypeFC.setValue(m.billType);
      this.dateOfRecomendation.setValue(new Date(m.dateOfRecommendation));
      this.officeRecommended.setValue(m.officeRecommended);
    });
  }

  displayFnMbRecord(item: MbRecord): string {
    return item && item.mbNumber ? item.mbNumber : '';
  }

  displayFnOffice(item: Office): string {
    return item && item.name ? item.name : '';
  }

  private _filterMbRecords(value: string, items?: MbRecord[]) {
    const filterValue = value.toLowerCase();
    return items?.filter((option) =>
      option.mbNumber.toLowerCase().includes(filterValue)
    );
  }

  private _filterOffices(value: string, items?: Office[]) {
    const filterValue = value.toLowerCase();
    return items?.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  async saveBill() {
    if (this.billFormGroup.valid && this.agtRegId) {
      const bill: Bill = {
        agtRegId: this.agtRegId,
        agtNo: this.agtNo,
        mb: this.mbFC.value,
        billType: this.billTypeFC.value,
        fromPg: this.billFormGroup.get('fromPg')?.value,
        toPg: this.billFormGroup.get('toPg')?.value,
        dateOfRecommendation: new Date(
          this.dateOfRecomendation.value
        ).getTime(),
        officeRecommended: this.officeRecommended.value,
        uptoDateBillAmount: this.billFormGroup.get('uptoDateBillAmount')?.value,
        currentBillAmount: this.billFormGroup.get('currentBillAmount')?.value,
        lastModifiedOn: new Date().getTime(),
      };
      console.log(bill);

      if (this.billId) {
        const msmtDocRef = doc(
          this.firestore,
          `${AGREEMENT_REGISTER}/${this.agtRegId}/${BILLS}/${this.billId}`
        );
        setDoc(msmtDocRef, bill)
          .then(() => {
            const toast = this.toastController.create({
              message: `Updated Bill!`,
              duration: 1500,
              position: 'bottom',
            });
            return toast;
          })
          .then((toast) => {
            toast.present();
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        const collectionAgreementRegister = collection(
          this.firestore,
          `${AGREEMENT_REGISTER}/${this.agtRegId}/${BILLS}`
        );
        addDoc(collectionAgreementRegister, bill)
          .then((msmt) => {
            const toast = this.toastController.create({
              message: `Saved Bill!`,
              duration: 1500,
              position: 'bottom',
            });
            console.log(msmt);
            return toast;
          })
          .then((toast) => {
            toast.present();
          })
          .catch((error) => {
            console.log(error);
          });
      }
      if (this.agtRegId) {
        this.updateBillAmountInAgreementRegister();
        this.navController.navigateBack(`/main/agreement-register/details/${this.agtRegId}`);
      } else {
        this.navController.navigateBack('/main/agreement-register');
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Alert!',
        subHeader: 'Bill Details Form',
        message: 'This is not an valid form!',
        buttons: ['OK'],
      });
      await alert.present();
    }

  }

  private updateBillAmountInAgreementRegister() {
    const agtRefDoc = doc(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}`);
    docSnapshots(agtRefDoc).subscribe((agtSnap) => {
      let agreementRegister = agtSnap.data() as AgreementRegister;
      agreementRegister.id = agtSnap.id;
      agreementRegister.uptoDateBillAmount = this.billFormGroup.get('uptoDateBillAmount')?.value;
      setDoc(agtRefDoc, agreementRegister);
    });
  }
}
