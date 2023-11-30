import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { collection, deleteDoc, doc, getCountFromServer, orderBy, query } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Agency } from 'src/app/models/agency';
import { AgreementRegister, Colors, WorkStatus } from 'src/app/models/agreement-register';
import { Bill } from 'src/app/models/bill';
import { AGENCIES, AGREEMENT_REGISTER, BILLS, MEASUREMENTS, OFFICES, STORAGE_UPLOADS, SUPPL_AGT_DETAILS } from 'src/app/models/constants';
import { Measurement } from 'src/app/models/mesaurement';
import { Office } from 'src/app/models/office';
import { SupplAgtDetails } from 'src/app/models/suppl-agt-details';
import { UploadDoc } from 'src/app/models/upload-doc';
import { AppComponentService } from 'src/app/services/app-component-service/app-component.service';

@Component({
  selector: 'app-details-agt-register',
  templateUrl: './details-agt-register.component.html',
  styleUrls: ['./details-agt-register.component.scss'],
})
export class DetailsAgtRegisterComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  firestore: Firestore = inject(Firestore);
  storage: Storage = inject(Storage);


  agreementRegister?: AgreementRegister;
  agency?: Agency;
  office?: Office;
  agtRegId?: string;

  $measurements?: Observable<Measurement[] | undefined>;
  $uploads?: Observable<UploadDoc[] | undefined>;
  
  $bills?: Observable<Bill[] | undefined>;
  
  $supplAgtDetails?: Observable<SupplAgtDetails[] | undefined>;
  
  $supplAgtCount?: Subject<number> = new Subject();
  $uploadsCount?: Subject<number> = new Subject();
  $msmtsCount?: Subject<number> = new Subject();
  $billsCount?: Subject<number> = new Subject();
  
  constructor(private activitedRoute: ActivatedRoute,
    private navController: NavController,
    private toastController: ToastController,
    public appComponentService: AppComponentService) {

    this.isLoading$.next(true);

    this.activitedRoute.params.subscribe(paramMap => {
      const documentRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${paramMap['id']}`);

      docSnapshots(documentRef).subscribe(docSnap => {

        this.agtRegId = paramMap['id'];
        this.agreementRegister = docSnap.data() as AgreementRegister;
        this.agreementRegister.id = docSnap.id;

        const agencyRef = doc(this.firestore, `${AGENCIES}/${this.agreementRegister?.agency.id}`);
        const officeRef = doc(this.firestore, `${OFFICES}/${this.agreementRegister?.office.id}`);

        docSnapshots(agencyRef).subscribe(agencySnap => {
          this.agency = agencySnap.data() as Agency;
          this.agency.id = agencySnap.id;
        });

        docSnapshots(officeRef).subscribe(officeSnap => {
          this.office = officeSnap.data() as Office;
          this.office.id = officeSnap.id;
        });

        const supplAgtsCollection = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${SUPPL_AGT_DETAILS}`);
        const qs = query(supplAgtsCollection, orderBy('dateOfSupplAgt', 'desc'));
        this.$supplAgtDetails = collectionData(qs, { idField: 'id' }) as Observable<SupplAgtDetails[]>;
        getCountFromServer(qs).then(snapShot => {
          this.$supplAgtCount?.next(snapShot.data().count);
          this.isLoading$.next(false);
        });

        const msmtsCollection = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${MEASUREMENTS}`);
        const qm = query(msmtsCollection, orderBy('dateOfMeasurement', 'desc'));
        this.$measurements = collectionData(qm, { idField: 'id' }) as Observable<Measurement[]>;
        getCountFromServer(qm).then(snapShot => {
          this.$msmtsCount?.next(snapShot.data().count);
          this.isLoading$.next(false);
        });

        const billsCollection = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${BILLS}`);
        const qb = query(billsCollection, orderBy('dateOfRecommendation', 'desc'));
        this.$bills = collectionData(qb, { idField: 'id' }) as Observable<Bill[]>;
        getCountFromServer(qb).then(snapShot => {
          this.$billsCount?.next(snapShot.data().count);
          this.isLoading$.next(false);
        });

        const uploadsCollection = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${STORAGE_UPLOADS}`);
        const qu = query(uploadsCollection, orderBy('uploadedOn', 'desc'));
        this.$uploads = collectionData(qu, { idField: 'id' }) as Observable<UploadDoc[]>;
        getCountFromServer(qu).then(snapShot => {
          this.$uploadsCount?.next(snapShot.data().count);
          this.isLoading$.next(false);
        });
      })

    });
  }

  ngOnInit() {
    console.log(this.appComponentService.loggedInUser);
  }


  navigateToEditPage() {
    this.navController.navigateForward('/main/agreement-register/edit/' + this.agtRegId)
  }

  editSupplAgtDetails(supplAgt: SupplAgtDetails) {
    this.navController.navigateForward(['/main/agreement-register/', this.agtRegId, 'suppl-agt', 'edit', supplAgt.id]);
  }

  editMeasurement(msmt: Measurement) {
    this.navController.navigateForward(['/main/agreement-register/', this.agreementRegister?.associatedOffice?.id, 'add-measurements', this.agtRegId, this.agreementRegister?.agreementNumber, 'edit', msmt.id]);
  }

  editBill(bill: Bill) {
    this.navController.navigateForward(['/main/agreement-register/', this.agreementRegister?.associatedOffice?.id, 'add-bill', this.agtRegId, this.agreementRegister?.agreementNumber, 'edit', bill.id]);
  }

  deleteUploads(uploadDoc: UploadDoc) {
    const deleteDocRef = ref(this.storage, uploadDoc.uploadedUrl);
    deleteObject(deleteDocRef).then(() => {
      const fsDeleteDec = doc(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${STORAGE_UPLOADS}/${uploadDoc.id}`);
      deleteDoc(fsDeleteDec).then(() => {
        const toast = this.toastController.create({
          message: `Deleted Uploaded File - ${uploadDoc.nameOfFile}`,
          duration: 1500,
          position: 'bottom',
        });
        return toast;
      }).catch(error => {
        console.log(error);
      })
    })
  }

  downloadFile(uploadDoc: UploadDoc) {
    window.open(uploadDoc.uploadedUrl, "_blank");
  }

  getKeyByValue(value: string): string {
    if (value === WorkStatus.COMPLETED) {
      return Colors.COMPLETED;
    } else if (value === WorkStatus.IN_PROGRESS) {
      return Colors.IN_PROGRESS;
    } else if (value === WorkStatus.NOT_YET_STARTED) {
      return Colors.NOT_YET_STARTED;
    } else if (value === WorkStatus.PENDING) {
      return Colors.PENDING;
    } else {
      return Colors.ALL;
    }
  }

}
