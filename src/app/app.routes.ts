import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './auth.guard'; // Importando o AuthGuard

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) }, // Lazy load da Home
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) }, // Lazy load do Login
  { path: 'signin', loadComponent: () => import('./pages/signin/signin.component').then(m => m.SigninComponent) }, // Lazy load do Signin

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'sales',
        loadComponent: () => import('./pages/sales/sales.component').then(m => m.SalesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'clients',
        loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'finances',
        loadComponent: () => import('./pages/finances/finances.component').then(m => m.FinancesComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'help',
        loadComponent: () => import('./pages/help/help.component').then(m => m.HelpComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];


