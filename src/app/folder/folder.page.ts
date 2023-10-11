import { Component, inject, OnInit } from '@angular/core';
import { collectionData, docSnapshots, Firestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Office } from '../models/office';
import { FormControl, FormGroup } from '@angular/forms';
import { collection, doc, endAt, orderBy, query, startAt } from 'firebase/firestore';
import { getFinancialYears, OFFICES, USERS } from '../models/constants';
import { AppComponentService } from '../services/app-component-service/app-component.service';
import { User } from '../models/user';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  firestore: Firestore = inject(Firestore);
  $offices?: Observable<Office[]>;
  searchString: string = '';
  subOffices: Office[] = [];
  associatedOffice?: Office;

  loggedInUser?: User;

  


  constructor(private appComponentService: AppComponentService, private alertController: AlertController, private activatedRoute: ActivatedRoute) {
    this.loggedInUser = this.appComponentService._user;

    this.activatedRoute.params.subscribe(params => {
      const documentRef = doc(this.firestore, `${USERS}/${params['uid']}`);
      docSnapshots(documentRef).subscribe(docSnap => {
        this.loggedInUser = docSnap.data() as User;
        this.loggedInUser.id = docSnap.id;
        if (this.loggedInUser.associatedOffice) {
          this.associatedOffice = this.loggedInUser.associatedOffice;
          const docRef = doc(this.firestore, `${OFFICES}/${this.associatedOffice?.id}`);
          docSnapshots(docRef).subscribe(assoOffSnap => {
            this.associatedOffice = assoOffSnap.data() as Office;
            this.associatedOffice.id = assoOffSnap.id;
          });
        } 
      });
    });

    

  }

  ngOnInit() {
    
  }

  async showAlert () {
    const alert = await this.alertController.create({
      header: 'Alert!',
      subHeader: 'Not associated with any office!',
      message: 'Associate your account with respective Office. Check with Admin',
      buttons: ['OK'],
    });
    await alert.present();
  }
}

