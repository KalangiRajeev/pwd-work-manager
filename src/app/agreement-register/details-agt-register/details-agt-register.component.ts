import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { collection, doc, getCountFromServer, query } from 'firebase/firestore';
import { Observable, Subject } from 'rxjs';
import { Agency } from 'src/app/models/agency';
import { AgreementRegister } from 'src/app/models/agreement-register';
import { Bill } from 'src/app/models/bill';
import { AGENCIES, AGREEMENT_REGISTER, BILLS, MEASUREMENTS, OFFICES } from 'src/app/models/constants';
import { Measurement } from 'src/app/models/mesaurement';
import { Office } from 'src/app/models/office';

@Component({
  selector: 'app-details-agt-register',
  templateUrl: './details-agt-register.component.html',
  styleUrls: ['./details-agt-register.component.scss'],
})
export class DetailsAgtRegisterComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  agreementRegister?: AgreementRegister;
  agency?: Agency;
  office?: Office;
  agtRegId?: string;

  $measurements?: Observable<Measurement[] | undefined>;
  $msmtsCount: Subject<number> = new Subject();

  $bills?: Observable<Bill[] | undefined>;
  $billsCount: Subject<number> = new Subject();

  constructor(private activitedRoute: ActivatedRoute, private navController: NavController) {
    this.activitedRoute.params.subscribe(paramMap => {
      const documentRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${paramMap['id']}`);
      
      docSnapshots(documentRef).subscribe(docSnap => {
        this.agtRegId = paramMap['id'];
        this.agreementRegister = docSnap.data() as AgreementRegister;
        this.agreementRegister.id = docSnap.id;
        console.log(this.agreementRegister);
        const agencyRef = doc(this.firestore, `${AGENCIES}/${this.agreementRegister.agency.id}`);
        const officeRef = doc(this.firestore, `${OFFICES}/${this.agreementRegister.office.id}`);

        docSnapshots(agencyRef).subscribe(agencySnap => {
          this.agency = agencySnap.data() as Agency;
          this.agency.id = agencySnap.id;
        });

        docSnapshots(officeRef).subscribe(officeSnap => {
          this.office = officeSnap.data() as Office;
          this.office.id = officeSnap.id;
        });
         
        const msmtsCollection = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${MEASUREMENTS}`);
        const qm = query(msmtsCollection);
        this.$measurements = collectionData(qm, {idField : 'id'}) as Observable<Measurement[]>;
        getCountFromServer(qm).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.$msmtsCount.next(recordsCount);
        });

        const billsCollection = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${BILLS}`);
        const qb = query(billsCollection);
        this.$bills = collectionData(qb, {idField : 'id'}) as Observable<Bill[]>;
        getCountFromServer(qb).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.$billsCount.next(recordsCount);
        });
      })

    });
  }

  ngOnInit() {

  }


  navigateToEditPage() {
    this.navController.navigateForward('/main/agreement-register/edit/' + this.agtRegId)
  }


  deleteMeasurement(msmt: Measurement) {

  }

  deleteBill(bill: Bill) {
    
  }

}
