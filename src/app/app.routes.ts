import { Routes } from '@angular/router';
import { LoginComponent } from './login-component/login-component';
import { HomeComponent } from './home-component/home-component';
import { AdminLoginComponent } from './admin-login-component/admin-login-component';
import { EmployeeLogin } from './employee-login/employee-login';
import { AdminDashboardComponent } from './admin/admin-dashboard-component/admin-dashboard-component';
import { OrgDashboardComponent } from './organization/org-dashboard-component/org-dashboard-component';
import { OrgRegisterComponent } from './org-register-component/org-register-component';
import { CreateEmployeeComponent } from './organization/create-employee-component/create-employee-component';
import { AdminOrgainzationComponent } from './admin/admin-orgainzation-component/admin-orgainzation-component';
import { ViewOrganizationComponent } from './admin/view-organization-component/view-organization-component';
import { AdminRequestComponent } from './admin/admin-request-component/admin-request-component';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home', component: HomeComponent},
    {path:'organization-login', component: LoginComponent},
    {path:'admin-login', component: AdminLoginComponent},
    {path:'employee-login', component: EmployeeLogin},
    {path:'admin/admin-dashboard', component: AdminDashboardComponent},
    {path:'admin/admin-orgainzation', component: AdminOrgainzationComponent},
    {path:'admin/organizations/:id', component: ViewOrganizationComponent},
    {path:'admin/all-request', component: AdminRequestComponent},
    {path:'org-dashboard', component: OrgDashboardComponent},
    {path:'org-register', component: OrgRegisterComponent},
    {path:'org-dashboard/create-employee', component: CreateEmployeeComponent}
];
