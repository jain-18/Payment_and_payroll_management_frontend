import { Routes } from '@angular/router';
import { LoginComponent } from './login-component/login-component';
import { HomeComponent } from './home-component/home-component';
import { AdminLoginComponent } from './admin-login-component/admin-login-component';
import { EmployeeLogin } from './employee-login/employee-login';
import { AdminDashboardComponent } from './admin/admin-dashboard-component/admin-dashboard-component';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home', component: HomeComponent},
    {path:'organization-login', component: LoginComponent},
    {path:'admin-login', component: AdminLoginComponent},
    {path:'employee-login', component: EmployeeLogin},
    {path:'admin-dashboard', component: AdminDashboardComponent}
];
