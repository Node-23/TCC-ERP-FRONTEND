import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';


  private readonly API_REGISTER_URL = 'http://localhost:8080/api/v1/users/register'; //

  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  onRegister() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.snackBar.open('Por favor, preencha todos os campos.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.snackBar.open('Por favor, informe um e-mail válido.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.snackBar.open('As senhas não coincidem.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const registrationData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.http.post(this.API_REGISTER_URL, registrationData).subscribe({
      next: (response) => {
        this.snackBar.open('Registro realizado com sucesso! Faça login.', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Ocorreu um erro durante o registro.';
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
