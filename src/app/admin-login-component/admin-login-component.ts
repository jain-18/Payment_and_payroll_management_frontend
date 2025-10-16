import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginNavbar } from '../login-navbar/login-navbar';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminLoginService } from '../services/admin-login-service';
import { LoginResponseViewModel } from '../model/loginResponseViewModel';

@Component({
  selector: 'app-admin-login-component',
  imports: [LoginNavbar, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login-component.html',
  styleUrl: './admin-login-component.css'
})
export class AdminLoginComponent {
  loginViewModel !: FormGroup;
  loginError: string = '';
  isLoading: boolean = false;
  loginResponse !:LoginResponseViewModel;

  svc = inject(AdminLoginService);

  constructor(private router: Router) { }

  ngOnInit() {
    this.loginViewModel = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    if (this.loginViewModel.valid) {
      this.isLoading = true;
      this.loginError = '';

      this.svc.loginUser(this.loginViewModel.value).subscribe({
        next: (response) => {
          this.svc.saveToken(response);
          this.isLoading = false;
          this.router.navigate(['/admin/admin-dashboard']); // Navigate to admin dashboard on successful login
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;  // Stop loading state immediately
          this.loginError = 'Invalid Credentials! Please check your username and password.';
          this.loginViewModel.reset(); // Clear the form fields since we're using alert
        }
      });
    } else {
      this.loginError = 'Please fill in all required fields.';
    }
  }

}
