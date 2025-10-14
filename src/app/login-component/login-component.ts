import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { orgLoginService } from '../services/org-login-service';
import { LoginViewModel } from '../model/loginViewModel';
import { LoginResponseViewModel } from '../model/loginResponseViewModel';
import { Router, RouterLink } from '@angular/router';
import { LoginNavbar } from '../login-navbar/login-navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, LoginNavbar, CommonModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent implements OnInit {
  svc = inject(orgLoginService);
  loginForm!: FormGroup;
  loginModel!: LoginViewModel;
  loginResponse!: LoginResponseViewModel;
  loginError: string = '';
  isLoading: boolean = false;

  constructor(private route: Router) { }

  ngOnInit(): void {
    // Check if there are stored credentials
    const savedUsername = localStorage.getItem('rememberedUsername');
    
    this.loginForm = new FormGroup({
      username: new FormControl(savedUsername || '', [
        Validators.required
      ]),
      rememberMe: new FormControl(!!savedUsername),
      password: new FormControl('', [
        Validators.required
      ])
    });
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(form: FormGroup) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loginError = '';
    this.isLoading = true;

    // Handle remember me functionality
    const rememberMe = form.get('rememberMe')?.value;
    const username = form.get('username')?.value;
    
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    this.loginModel = {
      username: username,
      password: form.get('password')?.value
    };

    this.svc.loginUser(this.loginModel).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        this.loginResponse = response;
        if (response) {
          this.svc.saveToken(this.loginResponse);
          this.route.navigate(['/org-dashboard']);
        } else {
          this.loginError = 'Login failed. Please try again.';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loginError = 'Invalid username or password. Please try again.';
        this.loginForm.get('password')?.reset();
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        console.log('Login attempt completed');
      }
    });

  }
}