import { Component, OnInit, inject } from '@angular/core';
import { MbRecord, MbStatus } from '../models/mbrecord';
import { Colors } from '../models/agreement-register';
import { Observable, Subject } from 'rxjs';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { collection, doc, endAt, getCountFromServer, orderBy, query, startAt, where } from 'firebase/firestore';
import { MB_RECORDS, USERS } from '../models/constants';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-mb-movement-register',
  templateUrl: './mb-movement-register.page.html',
  styleUrls: ['./mb-movement-register.page.scss'],
})
export class MbMovementRegisterPage implements OnInit {

  isLoading: boolean = false;

  firestore: Firestore = inject(Firestore);
  searchString: string = '';
  $mbRegister?: Observable<MbRecord[]>;
  $recordCount: Subject<number> = new Subject();
  _uid?: string;
  _officeId?: string;
  existingUser?: User;

  searchFormGroup: FormGroup = new FormGroup({
    searchFormControl: new FormControl('')
  });

  constructor(private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private router: Router) {

  }

  ngOnInit() {
    this.searchFormGroup.get('searchFormControl')?.valueChanges.subscribe(searchString => {
      this.isLoading = true;
      this.searchString = searchString;
      const mbRecords = collection(this.firestore, MB_RECORDS);
      const q = query(mbRecords, where('issuedToOffice.id', '==', this._officeId), orderBy('mbNumber'), startAt(searchString), endAt(searchString + '\uf8ff'));
      this.$mbRegister = collectionData(q, { idField: 'id' }) as Observable<MbRecord[]>;
      getCountFromServer(q).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.$recordCount.next(recordsCount);
        this.isLoading = false;
      });
    });

    this.activatedRoute.params.subscribe(params => {
      this.isLoading = true;
      this._officeId = params['officeId'];
      if (this._officeId) {
        const mbRecords = collection(this.firestore, MB_RECORDS);
        const q = query(mbRecords, where('issuedToOffice.id', '==', this._officeId), orderBy('mbNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        this.$mbRegister = collectionData(q, { idField: 'id' }) as Observable<MbRecord[]>;
        getCountFromServer(q).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.$recordCount.next(recordsCount);
          this.isLoading = false;
        });
      }
    });

  }

  getKeyByValue(value: string): string {
    if (value === MbStatus.CLOSED) {
      return Colors.NOT_YET_STARTED;
    } else if (value === MbStatus.OPEN) {
      return Colors.COMPLETED
    } else {
      return Colors.ALL
    }
  }

  loadWhenAllIsSelected() {
    const mbRecords = collection(this.firestore, MB_RECORDS);
    const q = query(mbRecords, where('issuedToOffice.id', '==', this._officeId), orderBy('mbNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
    this.$mbRegister = collectionData(q, { idField: 'id' }) as Observable<MbRecord[]>;
    getCountFromServer(q).then(snapShot => {
      const recordsCount = snapShot.data().count;
      this.$recordCount.next(recordsCount);
    });
  }

  loadWhenOpenIsSelected() {
    const mbRecords = collection(this.firestore, MB_RECORDS);
    const q = query(mbRecords, where('issuedToOffice.id', '==', this._officeId), where('mbStatus', '==', MbStatus.OPEN), orderBy('mbNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
    this.$mbRegister = collectionData(q, { idField: 'id' }) as Observable<MbRecord[]>;
    getCountFromServer(q).then(snapShot => {
      const recordsCount = snapShot.data().count;
      this.$recordCount.next(recordsCount);
    });
  }

  loadWhenClosedIsSelected() {
    const mbRecords = collection(this.firestore, MB_RECORDS);
    const q = query(mbRecords, where('issuedToOffice.id', '==', this._officeId), where('mbStatus', '==', MbStatus.CLOSED), orderBy('mbNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
    this.$mbRegister = collectionData(q, { idField: 'id' }) as Observable<MbRecord[]>;
    getCountFromServer(q).then(snapShot => {
      const recordsCount = snapShot.data().count;
      this.$recordCount.next(recordsCount);
    });
  }

  navigateToCreate() {
    this.navController.navigateForward(['main', 'mb-movement-register', 'create', 'mb']);
    console.log('navigate to create MB..', this.router.routerState.snapshot.url);
  }

}
