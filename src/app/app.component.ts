import { Component, inject } from '@angular/core';
import { AppComponentService } from './services/app-component-service/app-component.service';
import { Auth } from '@angular/fire/auth';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  auth: Auth = inject(Auth);

  constructor(private navController: NavController) {}

  ngOnInit() {
    if(sessionStorage.getItem('uid')) {
      // this.navController.navigateForward(['main']);
    }
  }

  
}
