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
import { AdminSingleRequestComponent } from './admin/admin-single-request-component/admin-single-request-component';
import { ManageEmployeeComponent } from './organization/manage-employee-component/manage-employee-component';
import { EditEmployeeComponent } from './organization/edit-employee-component/edit-employee-component';
import { CreateVendorComponent } from './organization/create-vendor-component/create-vendor-component';
import { ManageVendorComponent } from './organization/manage-vendor-component/manage-vendor-component';
import { EditVendorComponent } from './organization/edit-vendor-component/edit-vendor-component';
import { UpdateInfo } from './organization/update-info/update-info';
import { EmployeeDashboard } from './employee/component/employee-dashboard/employee-dashboard';
import { EmployeeSalarySlipComponent } from './employee/component/employee-salary-slip-component/employee-salary-slip-component';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home', component: HomeComponent},
    {path:'organization-login', component: LoginComponent},
    {path:'admin-login', component: AdminLoginComponent},
    {path:'employee-login', component: EmployeeLogin},
    {path:'admin/admin-dashboard', component: AdminDashboardComponent},
    {path:'admin/admin-orgainzation', component: AdminOrgainzationComponent},
    {path:'admin/organizations/:id', component: ViewOrganizationComponent, data: {prerender: false}},
    {path:'admin/all-request', component: AdminRequestComponent},
    {path:'admin/request/:id', component: AdminSingleRequestComponent, data: {prerender: false}},
    {path:'org-dashboard', component: OrgDashboardComponent},
    {path:'org-register', component: OrgRegisterComponent},
    {path:'org-dashboard/create-employee', component: CreateEmployeeComponent},
    {path:'org-dashboard/manage-employee', component: ManageEmployeeComponent},
    {path:'org-dashboard/edit-employee/:id', component: EditEmployeeComponent, data: {prerender: false}},
    {path:'org-dashboard/create-vendor', component: CreateVendorComponent},
    {path:'org-dashboard/manage-vendor', component: ManageVendorComponent},
    {path:'org-dashboard/edit-vendor/:id', component: EditVendorComponent},
    {path:'org-dashboard/update-info', component: UpdateInfo},
    {path:'org-dashboard/edit-vendor/:id', component: EditVendorComponent, data: {prerender: false}},
    {path:'employee/employee-dashboard', component:EmployeeDashboard},
    {path:'employee/salary-slips', component: EmployeeSalarySlipComponent}
];
