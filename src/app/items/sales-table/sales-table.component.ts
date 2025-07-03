import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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

  private readonly invoiceUrl = 'https://mogzipvuuf.execute-api.us-east-1.amazonaws.com/tcc/invoice';
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  deleteSale(salesId: string): void {
    this.onDeleteSale.emit(salesId);
  }

  getInvoice(sale: any): void {
    this.http.post(this.invoiceUrl, sale, { responseType: 'blob' }).subscribe({
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
