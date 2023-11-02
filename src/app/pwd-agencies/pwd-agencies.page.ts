import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Agency } from '../models/agency';
import { FormControl, FormGroup } from '@angular/forms';
import { collection, endAt, orderBy, query, startAt } from 'firebase/firestore';
import { AGENCIES } from '../models/constants';
import { AppComponentService } from '../services/app-component-service/app-component.service';

@Component({
  selector: 'app-pwd-agencies',
  templateUrl: './pwd-agencies.page.html',
  styleUrls: ['./pwd-agencies.page.scss'],
})
export class PwdAgenciesPage implements OnInit {

  firestore: Firestore = inject(Firestore);
  $agencies: Observable<Agency[]>; 
  searchString: string = '';
  agencies: Agency[] = [];
  filteredAgencies: Agency[] = [];

  searchFormGroup: FormGroup = new FormGroup({
    searchFormControl: new FormControl('')
  });

  constructor(public appComponentService: AppComponentService) { 
    const agenciesCollection = collection(this.firestore, AGENCIES);
    const q = query(agenciesCollection, orderBy('name'), startAt(this.searchString), endAt(this.searchString + '~'));
    this.$agencies = collectionData(q, { idField: 'id' }) as Observable<Agency[]>;
    this.$agencies.subscribe(o => {
      this.agencies = o;
      this.filteredAgencies = o;
    });
  }

  ngOnInit() {
    this.searchFormGroup.get('searchFormControl')?.valueChanges.subscribe(queryText => {
      this.filteredAgencies = this.agencies.filter(agency => agency.name.toLocaleLowerCase().includes(queryText.toLocaleLowerCase()));
    });
  }

}
