import { Component, OnInit, inject } from '@angular/core';
import { Auth, UserCredential } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { NavController, ToastController } from '@ionic/angular';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { USERS } from '../models/constants';
import { Role, User } from '../models/user';
import { AppComponentService } from '../services/app-component-service/app-component.service';
import { BehaviorSubject } from 'rxjs';



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
  $isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);


  constructor(private toastController: ToastController,
    private navController: NavController,
    private appComponentService: AppComponentService) {

  }

  ngOnInit() {

  }

  byGoogle() {
    this.$isLoading.next(true);
    this.appComponentService.signInwithGoogle().then(user => {
      if (user) {
        this.$isLoading.next(false);
        sessionStorage.setItem('uid', user.uid);
        this.saveUpdateUser(user)
          .then(user => {
            this.appComponentService.$loggedInUser.next(user);
            this.navController.navigateForward(['main', 'folder', 'office', sessionStorage.getItem('uid')]);
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
      if (this.existingUser.role === Role.ADMIN) {
        user.role = Role.ADMIN;
      } else {
        user.role = Role.USER
      }
    }
    setDoc(agtRefDoc, user);
    return user;
  }

}
