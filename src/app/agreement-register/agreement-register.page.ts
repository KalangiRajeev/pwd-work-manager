import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DocumentReference, collection, doc, endBefore, getCountFromServer, getDoc, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore/lite';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Observable, Subject } from 'rxjs';
import { Agency } from '../models/agency';
import { AgreementRegister, Colors, WorkStatus } from '../models/agreement-register';
import { AGREEMENT_REGISTER } from '../models/constants';
import { Office } from '../models/office';
import { AppComponentService } from '../services/app-component-service/app-component.service';


@Component({
  selector: 'app-agreement-register',
  templateUrl: './agreement-register.page.html',
  styleUrls: ['./agreement-register.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AgreementRegisterPage implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator?: MatPaginator;
  @ViewChild('htmlData') htmlData!: ElementRef;

  isLoading: boolean = false;
  isDisabled: boolean = false;

  firestore: Firestore = inject(Firestore);
  agreementRegister$?: Observable<AgreementRegister[]>;
  agtRecords?: AgreementRegister[];

  lastItem?: AgreementRegister;
  searchString?: string;
  selectedTab: string = 'All';

  existingOffice?: Office;
  existingAgency?: Agency;

  officeId?: string;
  agencyId?: string;

  title?: string;
  // pageLimit: number = 2;

  recordsCount$: Subject<number> = new Subject();
  pageSize: number = 10;
  pageIndex: number = 0;

  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageEvent$: Subject<PageEvent> = new Subject();



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

  isRenderedInMobile: boolean = false;
  isDarkThemeEnabled: boolean = false;

  constructor(private toastController: ToastController,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private matPaginatorIntl: MatPaginatorIntl,
    public appComponentService: AppComponentService,
  ) {

    this.isRenderedInMobile = this.appComponentService.isRenderedInMobile;
    this.appComponentService.isDarkThemeEnabled.subscribe(theme => {
      this.isDarkThemeEnabled = theme;
    });

  }

  ngOnInit() {

    this.matPaginatorIntl.itemsPerPageLabel = 'items';

    this.searchFormGroup.get('searchFormControl')?.valueChanges.subscribe(searchString => {
      this.paginator?.firstPage();
      this.searchString = searchString;
      this.loadAgtRegisterCollection();
    });

    this.activatedRoute.params.subscribe(params => {
      this.paginator?.firstPage();
      this.officeId = params['officeId'];
      this.agencyId = params['agencyId'];
      this.loadAgtRegisterCollection();
    });

  }

  ionViewWillEnter() {
    if (this.appComponentService.agtRegPageSize) {
      this.pageSize = this.appComponentService.agtRegPageSize;
      console.log(this.pageSize);
    }
    if (this.appComponentService.agtRegPageIndex) {
      this.pageIndex = this.appComponentService.agtRegPageIndex;
      console.log(this.pageIndex);
    }
    if (this.appComponentService.agtRegRecordsCount) {
      this.recordsCount$.next(this.appComponentService.agtRegRecordsCount);
    }
    if (this.appComponentService.currentAgtRegRecords) {
      this.agtRecords = [...this.appComponentService.currentAgtRegRecords];
      console.log(this.agtRecords);
      this.agreementRegister$ = new Observable(sub => {
        sub.next(this.agtRecords);
      })
    }
  }

  ngOnDestroy() {
    this.appComponentService.currentAgtRegRecords = undefined
  }

  matTabSelectedChange(changeEvent: MatTabChangeEvent) {
    this.paginator?.firstPage();
    this.pageIndex = 0;
    this.selectedTab = changeEvent.tab.textLabel;
    this.loadAgtRegisterCollection();
  }

  async loadAgtRegisterCollection(currentPageIndex?: number, isNext?: boolean) {
    // this.paginator?.firstPage();
    this.isLoading = true;
    this.isDisabled = true;

    const agtRegCollection = collection(this.firestore, AGREEMENT_REGISTER);
    var q = query(agtRegCollection);

    if (this.officeId) {
      q = query(q, where('associatedOffice.id', '==', this.officeId));
    }

    if (this.agencyId) {
      q = query(q, where('agency.id', '==', this.agencyId));
    }

    if (this.selectedTab !== 'All') {
      q = query(q, where('workStatus', '==', this.selectedTab));
    }

    if (this.searchString) {
      console.log(this.searchString);
      q = query(q, where('agreementNumber', '>=', this.searchString), where('agreementNumber', '<=', this.searchString + '\uf8ff'));
    }

    getCountFromServer(q).then(snapShot => {
      const recordsCount = snapShot.data().count;
      this.recordsCount$.next(recordsCount);
    });

    if (currentPageIndex && this.agtRecords) {
      if (isNext) {
        const docSnap = await getDoc(doc(agtRegCollection, this.agtRecords[this.agtRecords?.length - 1].id));
        q = query(q,
          startAfter(docSnap),
          limit(this.pageSize));
      } else {
        const docSnap = await getDoc(doc(agtRegCollection, this.agtRecords[0].id));
        q = query(q,
          endBefore(docSnap),
          limitToLast(this.pageSize));
      }
      this.appComponentService.agtRegPageIndex = currentPageIndex;

    } else if (this.searchString) {
      q = query(q, limit(this.pageSize));
    } else {
      q = query(q, orderBy('dateOfAgreement', 'desc'), limit(this.pageSize));

    }

    this.agreementRegister$ = collectionData(q, { idField: 'id' }) as Observable<AgreementRegister[]>;
    this.agreementRegister$?.subscribe(agtRegRec => {
      this.agtRecords = [...agtRegRec];
      this.appComponentService.currentAgtRegRecords = [...this.agtRecords];
      this.isLoading = false;
      this.isDisabled = false;
    });
  }

  handlePageEvent(event: PageEvent) {
    this.appComponentService.agtRegPageSize = event.pageSize;
    console.log(this.appComponentService.agtRegPageIndex);

    if (this.pageSize !== event.pageSize) {
      this.pageIndex = 0;
      this.pageSize = event.pageSize;
      this.paginator?.firstPage();
      this.loadAgtRegisterCollection(this.pageIndex);
    } else {
      var isNext = true;
      this.pageIndex = event.pageIndex;
      if (this.pageIndex > event.pageIndex) {
        isNext = false
      }
      this.loadAgtRegisterCollection(event.pageIndex, isNext);
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

  selectedAgtRegRecord(agtReg: AgreementRegister) {
    this.appComponentService.selectedAgreementRegister = agtReg;
  }

  exportAsPDF() {
    const data = document.getElementById('htmlData');
    html2canvas(data!).then((canvas: any) => {
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      heightLeft -= pageHeight;
      const doc = new jsPDF('p', 'mm');
      doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }
      doc.save(new Date() + '.pdf');
    });
  }
}
