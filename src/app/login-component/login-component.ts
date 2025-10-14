import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginNavbar } from '../login-navbar/login-navbar';

@Component({
  selector: 'app-login-component',
  imports: [LoginNavbar],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {

}
