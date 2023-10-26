import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AlertController, InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { DocumentReference, collection, doc, endAt, getCountFromServer, getDoc, limit, orderBy, query, startAfter, startAt, where } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore/lite';
import { Observable, Subject, forkJoin, merge, mergeMap } from 'rxjs';
import { AgreementRegister, Colors, WorkStatus } from '../models/agreement-register';
import { AGENCIES, AGREEMENT_REGISTER, OFFICES } from '../models/constants';
import { ActivatedRoute } from '@angular/router';
import { Office } from '../models/office';
import { Agency } from '../models/agency';
import { AppComponentService } from '../services/app-component-service/app-component.service';


@Component({
  selector: 'app-agreement-register',
  templateUrl: './agreement-register.page.html',
  styleUrls: ['./agreement-register.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AgreementRegisterPage implements OnInit {
  firestore: Firestore = inject(Firestore);
  agreementRegister$: Observable<AgreementRegister[]>;
  lastItem?: AgreementRegister;
  searchString: string = "";
  selectedTab?: string;

  existingOffice?: Office;
  existingAgency?: Agency;

  officeId?: string;
  agencyId?: string;

  title?: string;
  // pageLimit: number = 2;

  recordsCount$: Subject<number> = new Subject();

  status: string[] = Object.keys(WorkStatus);
  workStatuses: string[] = ['All', ...Object.values(WorkStatus)];


  searchFormGroup: FormGroup = new FormGroup({
    searchFormControl: new FormControl(''),
  });


  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Alert canceled');
      },
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        console.log('Alert confirmed');
      },
    },
  ];

  constructor(private toastController: ToastController,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private appComponentService: AppComponentService) {
    const agtRegCollection = collection(this.firestore, AGREEMENT_REGISTER);
    const q = query(agtRegCollection, orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
    this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
    getCountFromServer(q).then(snapShot => {
      const recordsCount = snapShot.data().count;
      this.recordsCount$.next(recordsCount);
    });

    this.activatedRoute.params.subscribe(params => {
      this.officeId = params['officeId'];
      this.agencyId = params['agencyId']
      const agtRegCollection = collection(this.firestore, AGREEMENT_REGISTER);
      if (this.officeId) {
        var q = query(agtRegCollection, where('associatedOffice.id', '==', this.officeId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        if (this.selectedTab && this.selectedTab !== 'All') {
          q = query(agtRegCollection, where('associatedOffice.id', '==', this.officeId), where('workStatus', '==', this.selectedTab), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        }
        this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
        getCountFromServer(q).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.recordsCount$.next(recordsCount);
        });

        const documentRef = doc(this.firestore, `${OFFICES}/${params['officeId']}`);
        docSnapshots(documentRef).subscribe(docSnap => {
          this.existingOffice = docSnap.data() as Office;
          this.existingOffice.id = this.officeId;
          this.title = this.existingOffice.name
        });
      }
      if (this.agencyId) {
        var q = query(agtRegCollection, where('agency.id', '==', this.agencyId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        if (this.selectedTab) {
          q = query(agtRegCollection, where('agency.id', '==', this.agencyId), where('workStatus', '==', this.selectedTab), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        }
        this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
        getCountFromServer(q).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.recordsCount$.next(recordsCount);
        });

        const documentRef = doc(this.firestore, `${AGENCIES}/${params['agencyId']}`);
        docSnapshots(documentRef).subscribe(docSnap => {
          this.existingAgency = docSnap.data() as Office;
          this.existingAgency.id = this.officeId;
          this.title = this.existingAgency.name
        });
      }

    });



  }

  ngOnInit() {
    this.searchFormGroup.get('searchFormControl')?.valueChanges.subscribe(searchString => {
      this.searchString = searchString;
      const agtRegCollection = collection(this.firestore, AGREEMENT_REGISTER);
      var q = query(agtRegCollection, orderBy('agreementNumber'), startAt(searchString), endAt(searchString + '~'));
      if (this.selectedTab) {
        q = query(agtRegCollection, where('workStatus', '==', this.selectedTab), where('associatedOffice.id', '==', this.officeId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
      }
      this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
      getCountFromServer(q).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.recordsCount$.next(recordsCount);
      });

      if (this.officeId) {
        var q = query(agtRegCollection, where('associatedOffice.id', '==', this.officeId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        if (this.selectedTab) {
         q = query(agtRegCollection, where('associatedOffice.id', '==', this.officeId), where('workStatus', '==', this.selectedTab), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        }
        this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
        getCountFromServer(q).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.recordsCount$.next(recordsCount);
        });
      }
      if (this.agencyId) {
        var q = query(agtRegCollection, where('agency.id', '==', this.agencyId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        if (this.selectedTab) {
          var q = query(agtRegCollection, where('agency.id', '==', this.agencyId), where('workStatus', '==', this.selectedTab), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        }
        this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
        getCountFromServer(q).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.recordsCount$.next(recordsCount);
        });
      }
    });

  }

  loadWhenAllIsSelected() {
    const agtRegCollection = collection(this.firestore, AGREEMENT_REGISTER);
    const q = query(agtRegCollection, orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
    this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
    getCountFromServer(q).then(snapShot => {
      const recordsCount = snapShot.data().count;
      this.recordsCount$.next(recordsCount);
    });

    if (this.officeId) {
      const q = query(agtRegCollection, where('associatedOffice.id', '==', this.officeId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
      this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
      getCountFromServer(q).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.recordsCount$.next(recordsCount);
      });
    }
    if (this.agencyId) {
      const q = query(agtRegCollection, where('agency.id', '==', this.agencyId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
      this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
      getCountFromServer(q).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.recordsCount$.next(recordsCount);
      });
    }
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

  async deleteRecord(agtReg: AgreementRegister) {
    if (agtReg.id) {
      const docRef: DocumentReference = doc(this.firestore, `${AGREEMENT_REGISTER}/${agtReg.id}`);
      const alert = await this.alertController.create({
        header: 'Alert!',
        subHeader: 'Are you sure?',
        message: 'Record will be deleted!',
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'OK',
            handler: async () => {
              await deleteDoc(docRef)
                .then(() => {
                  const toast = this.toastController.create({
                    message: `Deleted Agreement Details!`,
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
            }
          }
        ]
      });
      alert.present();
    }
    console.log("delete clicked");
  }


  tabSelectedTabChange(changeEvent: MatTabChangeEvent) {
    this.selectedTab = changeEvent.tab.textLabel;

    if (changeEvent.tab.textLabel !== 'All') {
      const agtRegCollection = collection(this.firestore, AGREEMENT_REGISTER);
      const q = query(agtRegCollection, where('workStatus', '==', changeEvent.tab.textLabel), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
      this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
      getCountFromServer(q).then(snapShot => {
        const recordsCount = snapShot.data().count;
        this.recordsCount$.next(recordsCount);
      });

      if (this.officeId) {
        const q = query(agtRegCollection, where('workStatus', '==', changeEvent.tab.textLabel), where('associatedOffice.id', '==', this.officeId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
        getCountFromServer(q).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.recordsCount$.next(recordsCount);
        });
      }
      if (this.agencyId) {
        const q = query(agtRegCollection, where('workStatus', '==', changeEvent.tab.textLabel), where('agency.id', '==', this.agencyId), orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'));
        this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
        getCountFromServer(q).then(snapShot => {
          const recordsCount = snapShot.data().count;
          this.recordsCount$.next(recordsCount);
        });
      }

    } else {
      this.loadWhenAllIsSelected();
    }
  }

  // async loadMore(event: any) {
  //   setTimeout(async () => {
  //     // await this.page.more();
  //     console.log(this.lastItem);

  //     const agtRegCollection = collection(this.firestore, AGREEMENT_REGISTER);
  //     // let q = query(agtRegCollection, orderBy('agreementNumber'), startAt(this.searchString), endAt(this.searchString + '\uf8ff'), limit(this.pageLimit));
  //     if (this.lastItem) {
  //       const docRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${this.lastItem.id}`)
  //       const docSnap = await getDoc(docRef);
  //       const q = query(agtRegCollection, startAfter(docSnap), limit(this.pageLimit));
  //       this.agreementRegister$ = merge(this.agreementRegister$, collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>);

  //       getCountFromServer(q).then(snapShot => {
  //         const recordsCount = snapShot.data().count;
  //         this.recordsCount$.next(recordsCount);
  //       });
  //     }

  //     (event as InfiniteScrollCustomEvent).target.complete();
  //   }, 500);
  // }

}
