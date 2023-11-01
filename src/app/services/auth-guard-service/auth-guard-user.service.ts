import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppComponentService } from '../app-component-service/app-component.service';
import { NavController } from '@ionic/angular';
import { Firestore, docSnapshots } from '@angular/fire/firestore';
import { doc } from 'firebase/firestore';
import { USERS } from 'src/app/models/constants';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardUserService implements CanActivate {

  firestore: Firestore = inject(Firestore);

  constructor(private navController: NavController, private appComponentService: AppComponentService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (sessionStorage.getItem('uid')) {
      const agtRefDoc = doc(this.firestore, `${USERS}/${sessionStorage.getItem('uid')}`);
      docSnapshots(agtRefDoc).subscribe(docSnap => {
        const loggedInUser = docSnap.data() as User;
        this.appComponentService.$loggedInUser.next(loggedInUser);
      });
      return true;
    }
    this.navController.navigateBack(['login']);
    return false;
  }


}
