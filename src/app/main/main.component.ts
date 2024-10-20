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
    { title: 'Works Register', url: `/main/folder/office/${sessionStorage.getItem('uid')}`, icon: 'home' },
    // { title: 'Estimate Register', url: `/main/estimate-register/${sessionStorage.getItem('uid')}`, icon: 'paper' },
    { title: 'MB Register', url: `/main/folder/mb-register/${sessionStorage.getItem('uid')}`, icon: 'book' }
  ];
  
  public adminPages = [
    { title: 'Offices', url: '/main/pwd-offices', icon: 'business' },
    { title: 'Agencies', url: '/main/pwd-agencies', icon: 'person' },
    { title: 'MB Register', url: '/main/mb-register', icon: 'book' }, 
    { title: 'Users', url: '/main/users-list', icon: 'people'}
  ];

  constructor(public appComponentService: AppComponentService, private navConroller: NavController) {

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
