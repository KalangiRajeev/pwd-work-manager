import { Component, OnInit, inject } from '@angular/core';
import { AppComponentService } from '../services/app-component-service/app-component.service';
import { NavController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent  implements OnInit {

  auth: Auth = inject(Auth);

  public appPages = [
    { title: 'Home', url: `/main/folder/${sessionStorage.getItem('uid')}`, icon: 'home' },
    { title: 'MB Register', url: `/main/mb-movement-register/${sessionStorage.getItem('uid')}`, icon: 'book' },
  ];
  
  public adminPages = [
    { title: 'Offices', url: '/main/pwd-offices', icon: 'business' },
    { title: 'Works Register', url: '/main/agreement-register', icon: 'browsers' },
    { title: 'MB Register', url: '/main/mb-movement-register', icon: 'book' }, 
    { title: 'Agencies', url: '/main/pwd-agencies', icon: 'person' },
    { title: 'Users', url: '/main/users-list', icon: 'people'}
  ];

  constructor(private appComponentService: AppComponentService, private navConroller: NavController) {

  }

  ngOnInit(): void {
    if(!sessionStorage.getItem('uid')) {
      this.navConroller.navigateBack('/login');
    }
  }

  logout() {
    this.auth.signOut()
    .then(() => {
      this.navConroller.navigateBack('/login');
    })
  }

}
