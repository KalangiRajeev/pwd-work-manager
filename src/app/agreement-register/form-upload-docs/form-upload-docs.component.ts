import { Component, OnInit, inject } from '@angular/core';
import { Firestore, docSnapshots } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addDoc, collection, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { Subject } from 'rxjs';
import { AgreementRegister } from 'src/app/models/agreement-register';
import { AGREEMENT_REGISTER, STORAGE_UPLOADS } from 'src/app/models/constants';
import { UploadDoc } from 'src/app/models/upload-doc';
import { AppComponentService } from 'src/app/services/app-component-service/app-component.service';

@Component({
  selector: 'app-form-upload-docs',
  templateUrl: './form-upload-docs.component.html',
  styleUrls: ['./form-upload-docs.component.scss'],
})
export class FormUploadDocsComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  storage: Storage = inject(Storage);
  progress?: number;

  $agreementRegister: Subject<AgreementRegister> = new Subject();
  agreementRegister?: AgreementRegister;
  agtRegId?: string;

  upFormGroup: FormGroup = new FormGroup({
    fileName: new FormControl(null, Validators.required)
  });

  constructor(private activatedRoute: ActivatedRoute, 
    private appComponentService: AppComponentService,
    private toastController: ToastController,
    private navController: NavController,
    private alertController: AlertController) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(p => {
      if (p['agtRegId']) {
        this.agtRegId = p['agtRegId'];
        const documentRef = doc(this.firestore, `${AGREEMENT_REGISTER}/${p['agtRegId']}`);
        docSnapshots(documentRef).subscribe(docSnap => {
          this.agreementRegister = docSnap.data() as AgreementRegister;
          this.agreementRegister.id = docSnap.id;
          this.$agreementRegister.next(this.agreementRegister);
        });
      }
    });
  }

  async uploadDocument(input: HTMLInputElement) {
    if (input.files && input.files?.length > 0 && this.upFormGroup.valid) {
      const file = input.files[0];
      if (file) {
        const storageRef = ref(this.storage, this.agreementRegister?.id + '_' + this.upFormGroup.get('fileName')?.value + '.pdf')
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed',
          snapshot => {
            this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + this.progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          error => {
            console.log(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              const collectionAgreementRegister = collection(this.firestore, `${AGREEMENT_REGISTER}/${this.agtRegId}/${STORAGE_UPLOADS}`);
              const uploadDoc: UploadDoc = {
                agtRegId: this.agtRegId!,
                nameOfFile: this.upFormGroup.get('fileName')?.value + '.pdf',
                uploadedUrl: downloadURL,
                uploadedBy: this.appComponentService.loggedInUser?.email,
                uploadedOn: new Date().getTime()
              }
              addDoc(collectionAgreementRegister, uploadDoc)
              .then(msmt => {
                const toast = this.toastController.create({
                  message: `Uploaded!`,
                  duration: 1500,
                  position: 'bottom',
                });
                console.log(msmt);
                return toast;
              })
              .then(toast => toast.present())
              .catch(error => {
                console.log(error);
              });
              console.log('File available at', downloadURL);
            });
            this.navController.navigateBack(`/main/agreement-register/details/${this.agtRegId}`);
          }
        );
      }
    } else {
        const alert = await this.alertController.create({
          header: 'Alert!',
          subHeader: 'Upload Form',
          message: 'This is not an valid form!',
          buttons: ['OK'],
        });
        await alert.present();
    }
  }


}
