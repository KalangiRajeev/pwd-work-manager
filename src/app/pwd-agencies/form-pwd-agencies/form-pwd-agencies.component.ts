import { Component, OnInit, inject } from '@angular/core';
import { Firestore, docSnapshots } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { Agency } from 'src/app/models/agency';
import { AGENCIES } from 'src/app/models/constants';

@Component({
  selector: 'app-form-pwd-agencies',
  templateUrl: './form-pwd-agencies.component.html',
  styleUrls: ['./form-pwd-agencies.component.scss'],
})
export class FormPwdAgenciesComponent  implements OnInit {

  firestore: Firestore = inject(Firestore);

  officeFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
  });

  isEditMode: boolean = false;
  agencyId?: string;
  existingAgency?: Agency
  $existingAgency: Subject<Agency> = new Subject();

  constructor(private alertController: AlertController, 
    private navController: NavController, 
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController) {
    this.activatedRoute.params.subscribe(params => {
      if(params['id']) {
        this.isEditMode = true;
        this.agencyId = params['id'];

        const documentRef = doc(this.firestore, `${AGENCIES}/${this.agencyId}`);

        docSnapshots(documentRef).subscribe(docSnap => {
          this.existingAgency = docSnap.data() as Agency;
          this.existingAgency.id = docSnap.id;
          this.$existingAgency.next(this.existingAgency);
        });
      }
    });
  }

  ngOnInit() {
    this.$existingAgency.subscribe(agency => {
      this.officeFormGroup.patchValue({
         name: agency.name,
         address: agency.address 
      });
    })
  }

 async saveAgency() {
    if(this.officeFormGroup.valid) {
      const agency: Agency = {
        name: this.officeFormGroup.get('name')?.value,
        address: this.officeFormGroup.get('address')?.value
      }
      if (this.isEditMode) {
        const agtRefDoc = doc(this.firestore, `${AGENCIES}/${this.agencyId}`);
        setDoc(agtRefDoc, agency)
          .then(o => {
            console.log(o);
            const toast = this.toastController.create({
              message: `Saved Agency Details!`,
              duration: 1500,
              position: 'bottom',
            });
            return toast;
          })
          .then(toast => {
            toast.present();
            this.navController.navigateBack('/main/pwd-agencies');
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        const collectionAgreementRegister = collection(this.firestore, AGENCIES);
        addDoc(collectionAgreementRegister, agency)
          .then(o => {
            console.log(0);
            const toast = this.toastController.create({
              message: `Saved Agency Details!`,
              duration: 1500,
              position: 'bottom',
            });
            return toast;
          })
          .then(toast => {
            toast.present();
            this.navController.navigateBack('/main/pwd-agencies');
          })
          .catch(error => {
            console.log(error);
          });
      }
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

}
