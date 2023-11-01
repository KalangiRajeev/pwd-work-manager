import { Component, inject } from '@angular/core';
import { AppComponentService } from './services/app-component-service/app-component.service';
import { Auth } from '@angular/fire/auth';
import { NavController } from '@ionic/angular';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  auth: Auth = inject(Auth);

  constructor(private breakpointObserver: BreakpointObserver,
    private appComponentService: AppComponentService) {}

  ngOnInit() {
    
    this.appComponentService.isDarkThemeEnabled.next(window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    this.breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      if (result.matches) {
        this.appComponentService.isRenderedInMobile = true;
      } else {
        this.appComponentService.isRenderedInMobile = false;
      }
    });

  }

  
}
