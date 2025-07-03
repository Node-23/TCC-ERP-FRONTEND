import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import { MatIconModule } from '@angular/material/icon';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {AuthService} from '../../auth.service';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DatePipe,
    CurrencyPipe,
    CommonModule,
    MatIconModule,
    HttpClientModule,
    MatSnackBarModule
  ],
  templateUrl: './sales-table.component.html',
  styleUrl: './sales-table.component.scss'
})
export class SalesTableComponent {
  @Input() data: any[] = [];
  @Output() onDeleteSale = new EventEmitter<string>();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  private readonly invoiceUrl = 'http://localhost:8080/api/sales/pdf';
  deleteSale(salesId: string): void {
    this.onDeleteSale.emit(salesId);
  }

  getInvoice(sale: any): void {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      return;
    }

    this.http.get(`${this.invoiceUrl}/${sale.id}`, { headers: headers, responseType: 'blob', withCredentials: true }).subscribe({
      next: (response) => {
        const file = new Blob([response], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
        this.snackBar.open("Nota Fiscal gerada com sucesso!", 'Fechar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.snackBar.open('Erro ao gerar a nota fiscal. Tente novamente.', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
