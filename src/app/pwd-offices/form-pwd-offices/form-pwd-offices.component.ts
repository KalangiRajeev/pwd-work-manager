import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collectionData, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addDoc, collection, doc, query, setDoc } from 'firebase/firestore';
import { Observable, Subject, map, startWith } from 'rxjs';
import { OFFICES } from 'src/app/models/constants';
import { Office } from 'src/app/models/office';

@Component({
  selector: 'app-form-pwd-offices',
  templateUrl: './form-pwd-offices.component.html',
  styleUrls: ['./form-pwd-offices.component.scss'],
})
export class FormPwdOfficesComponent implements OnInit {

  firestore: Firestore = inject(Firestore);

  subOffices: FormControl = new FormControl('')

  officeFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    isFocal: new FormControl(false, Validators.required),
    subOffices: this.subOffices
  });

  isEditMode: boolean = false;
  officeId: string | undefined;
  existingOffice: Office | undefined;
  $existingOffice: Subject<Office> = new Subject();
  allOffices$: Observable<Office[] | undefined> = new Observable();
  allOffices?: Office[];
  filteredOffices: Set<Office> = new Set();
  subordinateOffices: Set<Office> = new Set();

  constructor(private alertController: AlertController,
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController) {

    this.activatedRoute.params.subscribe(p => {
      if (p['officeId']) {
        this.isEditMode = true;
        this.officeId = p['officeId']
        const documentRef = doc(this.firestore, `${OFFICES}/${p['officeId']}`);

        docSnapshots(documentRef).subscribe(docSnap => {
          this.existingOffice = docSnap.data() as Office;
          this.existingOffice.id = docSnap.id;
          this.$existingOffice.next(this.existingOffice);
        });

      }
    });
  }
  ngOnInit() {
    const collectionDataOffices = collection(this.firestore, OFFICES);
    const queryOfficesCollection = query(collectionDataOffices);
    this.allOffices$ = collectionData(queryOfficesCollection, { idField: 'id' }) as Observable<Office[]>;

    this.allOffices$.subscribe(offices => {
      this.allOffices = offices;
      this.filteredOffices = new Set(this.allOffices?.filter(office => office.name != this.existingOffice?.name));
    });

    this.$existingOffice.subscribe(o => {
      if (this.isEditMode) {
        this.subordinateOffices = new Set(o.subOffices);
        this.subordinateOffices.forEach(o => {
          this.filteredOffices.delete(o);
        })
      }
      this.officeFormGroup.patchValue({
        name: o.name,
        address: o.address,
        isFocal: o.isFocal
      });

    });

    this.allOffices$ = this.subOffices.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string, this.allOffices) : this.allOffices?.slice();
      }),
    );
  }

  getSelectedValue(subOffice: Office) {
    this.subordinateOffices.add(subOffice);
  }

  displayFn(office: Office): string {
    return office && office.name ? office.name : '';
  }


  private _filter(value: string, items?: Office[]) {
    const filterValue = value.toLowerCase();
    return items?.filter(option => option.name.toLowerCase().includes(filterValue));
  }


  async savePwdOffice() {
    if (this.officeFormGroup.valid) {
      const office: Office = {
        name: this.officeFormGroup.get('name')?.value,
        address: this.officeFormGroup.get('address')?.value,
        isFocal: this.officeFormGroup.get('isFocal')?.value,
        subOffices: Array.from(this.subordinateOffices)
      }

      if (this.isEditMode) {
        const agtRefDoc = doc(this.firestore, `${OFFICES}/${this.officeId}`);
        setDoc(agtRefDoc, office)
          .then(() => {
            const toast = this.toastController.create({
              message: `Updated Office Details!`,
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
      } else {
        const collectionAgreementRegister = collection(this.firestore, OFFICES);
        addDoc(collectionAgreementRegister, office)
          .then(o => {
            console.log(o);
            const toast = this.toastController.create({
              message: `Saved Office Details!`,
              duration: 1500,
              position: 'bottom',
            });
            return toast;
          })
          .catch(toast => {
            toast.present();
            // this.navController.navigateBack('/main/pwd-offices');
          })
          .catch(error => {
            console.log(error);
          });
      }
      this.navController.navigateBack('/main/pwd-offices');
    } else {
      const alert = await this.alertController.create({
        header: 'Alert!',
        subHeader: 'Office Details Form',
        message: 'This is not an valid form!',
        buttons: ['OK'],
      });

      await alert.present();
    }
  }

  removeSubordinateOffice(office: Office) {
    this.subordinateOffices.delete(office);
  }

}
