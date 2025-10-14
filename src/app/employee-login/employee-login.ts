import { Component } from '@angular/core';
import { LoginNavbar } from '../login-navbar/login-navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [LoginNavbar, CommonModule, FormsModule],
  templateUrl: './employee-login.html',
  styleUrl: './employee-login.css'
})
export class EmployeeLogin {
  username: string = '';
  password: string = '';

  onSubmit() {
    // TODO: Implement login logic
    console.log('Login attempt:', { username: this.username });
  }

}
