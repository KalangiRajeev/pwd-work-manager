import { Component, OnInit, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, UserCredential, signInWithPopup } from '@angular/fire/auth';
import { Firestore, docSnapshots } from '@angular/fire/firestore';
import { NavController, ToastController } from '@ionic/angular';
import { USERS } from '../models/constants';
import { User } from '../models/user';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { AppComponentService } from '../services/app-component-service/app-component.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  firestore: Firestore = inject(Firestore);
  existingUser?: User;

  _auth: Auth = inject(Auth);
  _userCredential?: UserCredential;
  _user?: User;


  constructor(private toastController: ToastController,
    private navController: NavController,
    private appComponentService: AppComponentService) {

  }

  ngOnInit() {

  }

  byGoogle() {
    this.appComponentService.signInwithGoogle().then(user => {
      if (user) {
        sessionStorage.setItem('uid', user.uid);
        this.saveUpdateUser(user)
          .then(user => {
            const agtRefDoc = doc(this.firestore, USERS, user.uid);
            this.navController.navigateForward(['main', 'folder', sessionStorage.getItem('uid')]);
          });
      }
    })
  }

  async saveUpdateUser(user: User): Promise<User> {
    const agtRefDoc = doc(this.firestore, USERS, user.uid);
    const docSnap = await getDoc(agtRefDoc); 
    if (docSnap.data()) {
      this.existingUser = docSnap.data() as User;
      this.existingUser.uid = docSnap.id;
      user.associatedOffice = this.existingUser.associatedOffice;
    }
    setDoc(agtRefDoc, user);
    return user;
  }
  
}
