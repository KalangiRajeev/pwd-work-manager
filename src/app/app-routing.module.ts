import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UserOfficeComponent } from './users-list/user-office/user-office.component';
import { AuthGuardUserService } from './services/auth-guard-service/auth-guard-user.service';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuardUserService],
    children: [
      {
        path: '',
        redirectTo: 'folder',
        pathMatch: 'full',
      },
      {
        path: 'folder',
        loadChildren: () => import('./folder/folder.module').then(m => m.FolderPageModule),
      },
      {
        path: 'agreement-register',
        loadChildren: () => import('./agreement-register/agreement-register.module').then(m => m.AgreementRegisterPageModule),
      },
      {
        path: 'bill-register',
        loadChildren: () => import('./bill-register/bill-register.module').then(m => m.BillRegisterPageModule),
      },
      {
        path: 'estimate-register',
        loadChildren: () => import('./estimate-register/estimate-register.module').then(m =>m.EstimateRegisterPageModule),
      },
      {
        path: 'mb-register',
        loadChildren: () => import('./pwd-offices/pwd-offices.module').then(m => m.PwdOfficesPageModule),
      },
      {
        path: 'mb-movement-register',
        loadChildren: () => import('./mb-movement-register/mb-movement-register.module').then(m => m.MbMovementRegisterPageModule),
      },
      {
        path: 'pwd-offices',
        loadChildren: () => import('./pwd-offices/pwd-offices.module').then(m => m.PwdOfficesPageModule),
      },
      {
        path: 'pwd-agencies',
        loadChildren: () => import('./pwd-agencies/pwd-agencies.module').then(m => m.PwdAgenciesPageModule),
      },
      {
        path: 'users-list',
        component: UsersListComponent,
      },
      {
        path: 'user-office/:uid',
        component: UserOfficeComponent,
      },
    ]
  },
  {
    path: 'estimate-register',
    loadChildren: () => import('./estimate-register/estimate-register.module').then( m => m.EstimateRegisterPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
