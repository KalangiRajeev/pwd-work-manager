import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppComponentService } from '../app-component-service/app-component.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardUserService implements CanActivate{

  constructor(private appComponentService: AppComponentService) { 

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if(this.appComponentService.uid){
      return true;
    }
    throw new Error('Method not implemented.');
  }


}
