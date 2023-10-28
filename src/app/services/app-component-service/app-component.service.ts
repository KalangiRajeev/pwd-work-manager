import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, UserCredential, signInWithPopup } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { AgreementRegister } from 'src/app/models/agreement-register';
import { Office } from 'src/app/models/office';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class AppComponentService {

  firestore: Firestore = inject(Firestore);
  _auth: Auth = inject(Auth);
  _userCredential?: UserCredential; 
  _user?: User;

  $selectedOffice: Subject<Office> = new Subject();
  $offices: Subject<Office[]> = new Subject();

  $loggedInUser: Subject<User> = new Subject();
  loggedInUser?: User; 
  uid?: string | null = sessionStorage.getItem('user');

  agtRegPageSize?: number;
  agtRegPageIndex?: number;
  currentAgtRegRecords?: AgreementRegister[];
  agtRegRecordsCount?: number;

  constructor() { 
    this.$loggedInUser.subscribe(user => {
      this.loggedInUser = user;
      sessionStorage.setItem('uid', user.uid);
    });
  }

  async signInwithGoogle(): Promise<User | void> {

    return await signInWithPopup(this._auth, new GoogleAuthProvider())
      .then(userCredential => {
        this._userCredential = userCredential;
        this._user = {
          uid: userCredential.user.uid,
          name: (userCredential.user.displayName || userCredential.user.email)!,
          email: userCredential.user.email!,
          emailVerified: userCredential.user.emailVerified,
          photoUrl: userCredential.user.photoURL!,
          phone: userCredential.user.phoneNumber!
        }
        console.log(this._userCredential);
        console.log(this._user);
        this.$loggedInUser.next(this._user);
        return this._user;
      })
      .then(user => {
        console.log(user);
        return user;
      })
      .catch(error => {
        console.log(error);
      });
  }

  async signOutFromGoogle(): Promise<void> {
    return await this._auth.signOut();
  }

}
