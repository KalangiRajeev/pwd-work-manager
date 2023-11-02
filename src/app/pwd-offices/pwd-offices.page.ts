import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, doc, endAt, orderBy, query, startAt } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { OFFICES, USERS } from '../models/constants';
import { Office } from '../models/office';
import { NavController } from '@ionic/angular';
import { AppComponentService } from '../services/app-component-service/app-component.service';
import { User } from '../models/user';

@Component({
  selector: 'app-pwd-offices',
  templateUrl: './pwd-offices.page.html',
  styleUrls: ['./pwd-offices.page.scss'],
})
export class PwdOfficesPage implements OnInit {

  firestore: Firestore = inject(Firestore);
  $offices?: Observable<Office[]>;
  searchString: string = '';
  offices?: Office[];
  filteredOffices?: Office[];

  existingOffice?: Office;
  loggedInUser?: User;
  associatedOffice?: Office;

  officeId?: string;

  searchFormGroup: FormGroup = new FormGroup({
    searchFormControl: new FormControl('')
  });


  constructor(private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private router: Router,
    public appComponentService: AppComponentService) {

    this.activatedRoute.params.subscribe(params => {
      this.officeId = params['officeId'];
      if (this.officeId) {
        const documentRef = doc(this.firestore, `${OFFICES}/${params['officeId']}`);
        docSnapshots(documentRef).subscribe(docSnap => {
          this.existingOffice = docSnap.data() as Office;
          this.existingOffice.id = this.officeId;
          this.offices = this.existingOffice.subOffices;
          this.filteredOffices = this.offices;
        });
      } else {
        const officesCollection = collection(this.firestore, OFFICES);
        const q = query(officesCollection, orderBy('name'), startAt(this.searchString), endAt(this.searchString + '~'));
        this.$offices = collectionData(q, { idField: 'id' }) as Observable<Office[]>;
        this.$offices.subscribe(o => {
          this.offices = o;
          this.filteredOffices = o;
        });
      }
    });

  }

  ngOnInit() {
    this.searchFormGroup.get('searchFormControl')?.valueChanges.subscribe(queryText => {
      this.filteredOffices = this.offices?.filter(office => office.name.toLocaleLowerCase().includes(queryText.toLocaleLowerCase()));
    });

  }

  deleteOffice(office: Office) {

  }

  navigateToPage(office: Office) {

    const url = this.router.routerState.snapshot.url;

    console.log(office, url);
    if (url.includes('/mb-register')) {
      if (office.subOffices?.length && office.subOffices.length > 0) {
        this.navController.navigateForward(`/main/pwd-offices/mb-register/${office.id}`)
      } else {
        this.navController.navigateForward(`/main/mb-movement-register/${office.id}`)
      }
    } else {
      if (office.subOffices?.length && office.subOffices.length > 0) {
        this.navController.navigateForward(`/main/pwd-offices/office/${office.id}`)
      } else {
        this.navController.navigateForward(`/main/agreement-register/office/${office.id}`)
      } 
    }
  }
}
