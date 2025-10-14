import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginNavbar } from '../login-navbar/login-navbar';

@Component({
  selector: 'app-admin-login-component',
  imports: [RouterLink,LoginNavbar],
  templateUrl: './admin-login-component.html',
  styleUrl: './admin-login-component.css'
})
export class AdminLoginComponent {

}
