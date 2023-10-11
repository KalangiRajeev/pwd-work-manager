import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { collection, doc, query, setDoc } from 'firebase/firestore';
import { Observable, map, startWith } from 'rxjs';
import { OFFICES, USERS } from 'src/app/models/constants';
import { Office } from 'src/app/models/office';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-office',
  templateUrl: './user-office.component.html',
  styleUrls: ['./user-office.component.scss'],
})
export class UserOfficeComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  subOffices: FormControl = new FormControl('');
  uid?: string;
  existingUser?: User;

  officeFormGroup: FormGroup = new FormGroup({
    subOffices: this.subOffices
  });

  allOffices$: Observable<Office[] | undefined> = new Observable();
  allOffices?: Office[];

  constructor(private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private navController: NavController) {

    const collectionDataOffices = collection(this.firestore, OFFICES);
    const queryOfficesCollection = query(collectionDataOffices);
    this.allOffices$ = collectionData(queryOfficesCollection, { idField: 'id' }) as Observable<Office[]>;

    this.allOffices$.subscribe(offices => {
      this.allOffices = offices;
    });

    this.activatedRoute.params.subscribe(p => {
      this.uid = p['uid'];
      const agtRefDoc = doc(this.firestore, `${USERS}/${this.uid}`);
      docSnapshots(agtRefDoc).subscribe(docSnap => {
        this.existingUser = docSnap.data() as User;
        this.existingUser.uid = docSnap.id;
        console.log(this.existingUser);
      });
    });

  }

  ngOnInit() {
    this.allOffices$ = this.subOffices.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.allOffices) : this.allOffices?.slice();
      }),
    );
  }

  getSelectedValue(value: string) {

  }

  displayFn(office: Office): string {
    return office && office.name ? office.name : '';
  }

  private _filter(value: string, items?: Office[]) {
    const filterValue = value.toLowerCase();
    return items?.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  updateUser() {
    const agtRefDoc = doc(this.firestore, `${USERS}/${this.uid}`);

    if (this.existingUser) {
      this.existingUser.associatedOffice = this.subOffices.value;
      setDoc(agtRefDoc, this.existingUser)
        .then(() => {
          const toast = this.toastController.create({
            message: `Updated User Details!`,
            duration: 1500,
            position: 'bottom',
          });
          return toast;
        })
        .then(toast => {
          toast.present();
          this.navController.navigateBack('/main/users-list');
        })
        .catch(error => {
          console.log(error);
        });
    }

  }

}
