import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, UserCredential, signInWithPopup } from '@angular/fire/auth';
import { Firestore, docSnapshots } from '@angular/fire/firestore';
import { doc } from 'firebase/firestore';
import { BehaviorSubject, Subject } from 'rxjs';
import { AgreementRegister } from 'src/app/models/agreement-register';
import { USERS } from 'src/app/models/constants';
import { Office } from 'src/app/models/office';
import { Role, User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class AppComponentService {

  isRenderedInMobile: boolean = false;
  isDarkThemeEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  firestore: Firestore = inject(Firestore);
  _auth: Auth = inject(Auth);
  _userCredential?: UserCredential;
  _user?: User;

  $selectedOffice: Subject<Office> = new Subject();
  $offices: Subject<Office[]> = new Subject();

  $loggedInUser: Subject<User> = new Subject();

  loggedInUser?: User;
  uid?: string | null;

  agtRegPageSize?: number;
  agtRegPageIndex?: number;
  currentAgtRegRecords?: AgreementRegister[];
  agtRegRecordsCount?: number;
  selectedAgreementRegister?: AgreementRegister;

  constructor(private httpClient: HttpClient) {
    if (sessionStorage.getItem('user')) {
      this.uid = sessionStorage.getItem('user');
      console.log(this.uid);
      const agtRefDoc = doc(this.firestore, `${USERS}/${this.uid}`);
      docSnapshots(agtRefDoc).subscribe(docSnap => {
        this.loggedInUser = docSnap.data() as User;
      });
    }

    this.$loggedInUser.subscribe(user => {
      this.loggedInUser = user;
      sessionStorage.setItem('uid', user.uid);
      const documentRef = doc(this.firestore, `${USERS}/${user.uid}`);
      docSnapshots(documentRef).subscribe(docSnap => {
        this.loggedInUser = docSnap.data() as User;
        this.loggedInUser.id = user.uid;
      });
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
          phone: userCredential.user.phoneNumber!, 
        }
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
