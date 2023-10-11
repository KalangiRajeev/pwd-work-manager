import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { collectionGroup, doc, getCountFromServer, query, where } from 'firebase/firestore';
import { Observable, Subject } from 'rxjs';
import { Bill } from 'src/app/models/bill';
import { BILLS, MB_RECORDS, MEASUREMENTS } from 'src/app/models/constants';
import { MbRecord } from 'src/app/models/mbrecord';
import { Measurement } from 'src/app/models/mesaurement';

@Component({
  selector: 'app-details-mb-record',
  templateUrl: './details-mb-record.component.html',
  styleUrls: ['./details-mb-record.component.scss'],
})
export class DetailsMbRecordComponent implements OnInit {

  firestore: Firestore = inject(Firestore)

  mbRecordId?: string;
  $measurements?: Observable<Measurement[]>;
  $msmtsCount: Subject<number> = new Subject();
  $bills?: Observable<Bill[]>;
  $billsCount: Subject<number> = new Subject();

  mbRecord?: MbRecord;

  title? :string;

  constructor(private activatedRoute: ActivatedRoute, private navController: NavController) {
    this.activatedRoute.params.subscribe(params => {
      this.mbRecordId = params['mbId'];

      const documentRef = doc(this.firestore, `${MB_RECORDS}/${params['mbId']}`);
        docSnapshots(documentRef).subscribe(docSnap => {
          this.mbRecord = docSnap.data() as MbRecord;
          this.mbRecord.id = docSnap.id;
        });

      const msmtsCollection = collectionGroup(this.firestore, `${MEASUREMENTS}`);
      const qm = query(msmtsCollection, where('mb.id', '==', this.mbRecordId));
      this.$measurements = collectionData(qm, { idField: 'id' }) as Observable<Measurement[]>;
      getCountFromServer(qm).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.$msmtsCount.next(recordsCount);
      });

      const billsCollection = collectionGroup(this.firestore, `${BILLS}`);
      const qb = query(billsCollection, where('mb.id', '==', this.mbRecordId));
      this.$bills = collectionData(qb, { idField: 'id' }) as Observable<Bill[]>;
      getCountFromServer(qb).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.$billsCount.next(recordsCount);
      });

    });

  }

  ngOnInit() { }

  navigateToEditPage() {
    this.navController.navigateForward('/main/mb-movement-register/edit/' + this.mbRecordId);
  }

}
