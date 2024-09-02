import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MatPaginator,
  MatPaginatorIntl,
  PageEvent,
} from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import {
  AlertController,
  InfiniteScrollCustomEvent,
  ToastController,
} from '@ionic/angular';
import {
  DocumentReference,
  collection,
  doc,
  endBefore,
  getCountFromServer,
  getDoc,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore/lite';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BehaviorSubject, last, Observable, Subject } from 'rxjs';
import { Agency } from '../models/agency';
import {
  AgreementRegister,
  Colors,
  WorkStatus,
} from '../models/agreement-register';
import { AGREEMENT_REGISTER, BILLS } from '../models/constants';
import { Office } from '../models/office';
import { AppComponentService } from '../services/app-component-service/app-component.service';
import {
  ColDef,
  RowModelType,
  GridReadyEvent,
  ICellRendererParams,
  IDatasource,
  IGetRowsParams,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  SizeColumnsToContentStrategy,
} from 'ag-grid-community';
import { MatTableDataSource } from '@angular/material/table';
import { Bill } from '../models/bill';

@Component({
  selector: 'app-agreement-register',
  templateUrl: './agreement-register.page.html',
  styleUrls: ['./agreement-register.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AgreementRegisterPage implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator?: MatPaginator;
  @ViewChild('htmlData') htmlData!: ElementRef;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDisabled: boolean = false;

  firestore: Firestore = inject(Firestore);
  agreementRegister$?: Observable<AgreementRegister[]>;
  currentLoadedRecords: AgreementRegister[] = [];

  lastItem?: AgreementRegister;
  searchString?: string;
  selectedTab: string = 'All';

  existingOffice?: Office;
  existingAgency?: Agency;

  officeId?: string;
  agencyId?: string;

  title?: string;

  recordsCount$: Subject<number> = new Subject();
  totalRecords?: number;
  pageSize: number = 500;
  pageIndex: number = 0;

  pageSizeOptions: number[] = [100, 500, 1000, 5000];
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

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private matPaginatorIntl: MatPaginatorIntl,
    public appComponentService: AppComponentService
  ) {
    this.isRenderedInMobile = this.appComponentService.isRenderedInMobile;
    this.appComponentService.isDarkThemeEnabled.subscribe((theme) => {
      this.isDarkThemeEnabled = theme;
    });
  }

  ngOnInit() {
    this.matPaginatorIntl.itemsPerPageLabel = 'items';

    this.searchFormGroup
      .get('searchFormControl')
      ?.valueChanges.subscribe((searchString) => {
        this.paginator?.firstPage();
        this.searchString = searchString;
        this.loadAgtRegisterCollection();
      });

    this.activatedRoute.params.subscribe((params) => {
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
    if (this.appComponentService.currentLoadedAgtRecords) {
      this.currentLoadedRecords = [
        ...this.appComponentService.currentLoadedAgtRecords,
      ];
      console.log(this.currentLoadedRecords);
      this.agreementRegister$ = new Observable((sub) => {
        sub.next(this.currentLoadedRecords);
      });
    }
  }

  ngOnDestroy() {
    this.appComponentService.currentLoadedAgtRecords = undefined;
  }

  matTabSelectedChange(changeEvent: MatTabChangeEvent) {
    this.paginator?.firstPage();
    this.pageIndex = 0;
    this.selectedTab = changeEvent.tab.textLabel;
    this.loadAgtRegisterCollection();
  }

  async loadAgtRegisterCollection(currentPageIndex?: number, isNext?: boolean) {
    // this.paginator?.firstPage();
    this.isLoading$.next(true);
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
      q = query(
        q,
        where('agreementNumber', '>=', this.searchString),
        where('agreementNumber', '<=', this.searchString + '\uf8ff')
      );
    }

    getCountFromServer(q).then((snapShot) => {
      const recordsCount = snapShot.data().count;
      this.totalRecords = recordsCount;
      this.recordsCount$.next(recordsCount);
    });

    if (currentPageIndex && this.currentLoadedRecords) {
      if (isNext) {
        const docSnap = await getDoc(
          doc(
            agtRegCollection,
            this.currentLoadedRecords[this.currentLoadedRecords?.length - 1].id
          )
        );
        q = query(
          q,
          orderBy('dateOfAgreement', 'desc'),
          startAfter(docSnap),
          limit(this.pageSize)
        );
      } else {
        const docSnap = await getDoc(
          doc(agtRegCollection, this.currentLoadedRecords[0].id)
        );
        q = query(
          q,
          orderBy('dateOfAgreement', 'desc'),
          endBefore(docSnap),
          limitToLast(this.pageSize)
        );
      }
      this.appComponentService.agtRegPageIndex = currentPageIndex;
    } else if (this.searchString) {
      q = query(q, limit(this.pageSize));
    } else {
      q = query(q, orderBy('dateOfAgreement', 'desc'), limit(this.pageSize));
    }

    this.agreementRegister$ = collectionData(q, {
      idField: 'id',
    }) as Observable<AgreementRegister[]>;

    this.agreementRegister$?.subscribe((agtRegRec) => {
      this.currentLoadedRecords = [...agtRegRec];
      this.appComponentService.currentLoadedAgtRecords = [
        ...this.currentLoadedRecords,
      ];
      this.isLoading$.next(false);
      this.isDisabled = false;
    });
    return this.agreementRegister$;
  }

  handlePageEvent(event: PageEvent) {
    this.appComponentService.agtRegPageSize = event.pageSize;

    if (this.pageSize !== event.pageSize) {
      this.pageIndex = 0;
      this.pageSize = event.pageSize;
      this.paginator?.firstPage();
      this.loadAgtRegisterCollection(this.pageIndex);
    } else {
      var isNext = true;
      this.pageIndex = event.pageIndex;
      if (this.pageIndex > event.pageIndex) {
        isNext = false;
      }
      this.loadAgtRegisterCollection(event.pageIndex, isNext);
    }
  }

  onIonInfinite(event: Event) {
    console.log(event);
    if (
      this.totalRecords &&
      this.totalRecords >= this.pageIndex * this.pageSize
    ) {
      this.loadAgtRegisterCollection(this.pageIndex, true);
      this.pageIndex = this.pageIndex + 1;
    }
    (event as InfiniteScrollCustomEvent).target.complete();
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
      const docRef: DocumentReference = doc(
        this.firestore,
        `${AGREEMENT_REGISTER}/${agtReg.id}`
      );
      const alert = await this.alertController.create({
        header: 'Alert!',
        subHeader: 'Are you sure?',
        message: 'Record will be deleted!',
        buttons: [
          {
            text: 'Cancel',
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
                .then((toast) => {
                  toast.present();
                })
                .catch((error) => {
                  console.log(error);
                });
            },
          },
        ],
      });
      alert.present();
    }
    console.log('delete clicked');
  }

  selectedAgtRegRecord(agtReg: AgreementRegister) {
    this.appComponentService.selectedAgreementRegister = agtReg;
  }

  monthsBetween(date1: number, date2: number): any {
    let d1 = new Date(date1);
    let d2 = new Date(date2);

    if (d2 < d1) {
      [d1, d2] = [d2, d1];
    }
    // Calculate the number of months
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();

    // Calculate the difference in days
    const daysDifference = Math.floor(
      (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysInMonth = new Date(
      d1.getFullYear(),
      d1.getMonth() + 1,
      0
    ).getDate();

    // If the difference is less than a month, return days
    if (daysDifference < daysInMonth) {
      return `${daysDifference} Days`;
    } else {
      return `${months} Months`;
    }
  }

  getUpToDateBillAmount(agtId?: string): number {
    console.log('getUpToDateBillAmount');
    let billAmount = 0;
    // const billsCollection = collection(
    //   this.firestore,
    //   `${AGREEMENT_REGISTER}/${agtId}/${BILLS}`
    // );
    // const qb = query(billsCollection, orderBy('dateOfRecommendation', 'asc'));
    // (collectionData(qb, { idField: 'id' }).pipe(last()) as Observable<Bill>).subscribe(bill => {
    //   console.log(bill);
    //   billAmount = bill.uptoDateBillAmount;
    // });
    return billAmount;
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
        doc.addImage(
          canvas,
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        heightLeft -= pageHeight;
      }
      doc.save(new Date() + '.pdf');
    });
  }
}
