import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login-component/login-component';
import { HomeComponent } from './home-component/home-component';
import { LoginNavbar } from './login-navbar/login-navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HomeComponent,LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('payment_frontend');
}
