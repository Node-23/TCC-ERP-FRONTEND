import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import {AuthService} from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HttpClientModule,
    MatButtonModule,
    NgOptimizedImage,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly API_URL = 'http://auth-service/api/auth/login';
  protected readonly GOOGLE_SSO = "http://localhost:8080/api/auth/google-login"

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  onLogin(loginForm: NgForm) {
    if (loginForm.valid) {
      const loginData = {
        email: loginForm.value.email,
        password: loginForm.value.password
      };

      this.http.post(this.API_URL, loginData)
        .subscribe({
          next: (response: any) => {
            this.authService.setToken(response.jwt);
            // this.authService.setToken(response.access_token);
            this.authService.setOwnerId(response.id);
            this.snackBar.open(`Bem-vindo, ${response.name}!`, 'Fechar', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });

            this.router.navigate(['/finances']);
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open('Login falhou. Verifique suas credenciais.', 'Fechar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

}
