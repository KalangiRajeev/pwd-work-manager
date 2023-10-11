import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { USERS } from '../models/constants';
import { collection, endAt, orderBy, query, startAt } from 'firebase/firestore';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  $users?: Observable<User[]>;

  searchString: string = '';

  searchFormGroup: FormGroup = new FormGroup({
    searchFormControl: new FormControl('')
  });

  constructor() {
    const usersCollection = collection(this.firestore, USERS);
    const q = query(usersCollection, orderBy('name'), startAt(this.searchString), endAt(this.searchString + '~'));
    this.$users = collectionData(q, { idField: 'id' }) as Observable<User[]>;
  }

  ngOnInit() {
    this.searchFormGroup.get('searchFormControl')?.valueChanges.subscribe(queryText => {
      this.searchString = queryText;
      const usersCollection = collection(this.firestore, USERS);
      const q = query(usersCollection, orderBy('name'), startAt(queryText), endAt(queryText + '~'));
      this.$users = collectionData(q, { idField: 'id' }) as Observable<User[]>;
    });
  }

}
